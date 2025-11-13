#!/bin/bash

# Script to validate version increments in content files
# Only validates English content files (not translations)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating content versions..."

has_errors=0

# Function to extract version from frontmatter
get_version() {
    local file=$1
    # Extract version field from YAML frontmatter
    version=$(sed -n '/^---$/,/^---$/p' "$file" | grep '^version:' | sed 's/version:[[:space:]]*["'\'']\?\([0-9]\+\.[0-9]\+\)["'\'']\?/\1/')
    echo "$version"
}

# Function to validate version format (must be X.Y)
validate_format() {
    local version=$1
    if [[ ! $version =~ ^[0-9]+\.[0-9]+$ ]]; then
        return 1
    fi
    return 0
}

# Function to validate version increment
validate_increment() {
    local old_version=$1
    local new_version=$2

    # Parse versions
    IFS='.' read -r old_major old_minor <<< "$old_version"
    IFS='.' read -r new_major new_minor <<< "$new_version"

    # Check if major version increased
    if [ "$new_major" -gt "$old_major" ]; then
        # Major increased: must be +1 and minor must be 0
        if [ "$new_major" -eq $((old_major + 1)) ] && [ "$new_minor" -eq 0 ]; then
            return 0
        else
            return 1
        fi
    # Check if major version is the same
    elif [ "$new_major" -eq "$old_major" ]; then
        # Major same: minor must be +1
        if [ "$new_minor" -eq $((old_minor + 1)) ]; then
            return 0
        else
            return 1
        fi
    else
        # Major decreased or other invalid change
        return 1
    fi
}

# Get list of modified content files (English only, not translations)
modified_files=$(git diff --name-only --diff-filter=M origin/${GITHUB_BASE_REF:-main} HEAD | grep '^src/content/docs/' | grep -E '\.(md|mdx)$' | grep -v '^src/content/docs/es/')

# Get list of new content files (English only, not translations)
new_files=$(git diff --name-only --diff-filter=A origin/${GITHUB_BASE_REF:-main} HEAD | grep '^src/content/docs/' | grep -E '\.(md|mdx)$' | grep -v '^src/content/docs/es/')

echo ""
echo "📝 Modified English content files: $(echo "$modified_files" | grep -c . || echo 0)"
echo "🆕 New English content files: $(echo "$new_files" | grep -c . || echo 0)"
echo ""

# Validate new files
if [ -n "$new_files" ]; then
    echo "Validating new files..."
    while IFS= read -r file; do
        if [ -z "$file" ]; then continue; fi

        echo -n "  Checking $file... "

        new_version=$(get_version "$file")

        if [ -z "$new_version" ]; then
            echo -e "${RED}❌ FAIL${NC}"
            echo "    Error: Missing 'version' field in frontmatter"
            has_errors=1
            continue
        fi

        if ! validate_format "$new_version"; then
            echo -e "${RED}❌ FAIL${NC}"
            echo "    Error: Invalid version format '$new_version' (must be X.Y)"
            has_errors=1
            continue
        fi

        if [ "$new_version" != "1.0" ]; then
            echo -e "${RED}❌ FAIL${NC}"
            echo "    Error: New files must have version '1.0', found '$new_version'"
            has_errors=1
            continue
        fi

        echo -e "${GREEN}✅ OK${NC} (v$new_version)"
    done <<< "$new_files"
    echo ""
fi

# Validate modified files
if [ -n "$modified_files" ]; then
    echo "Validating modified files..."
    while IFS= read -r file; do
        if [ -z "$file" ]; then continue; fi

        echo -n "  Checking $file... "

        # Get old version from base branch
        old_version=$(git show origin/${GITHUB_BASE_REF:-main}:"$file" 2>/dev/null | sed -n '/^---$/,/^---$/p' | grep '^version:' | sed 's/version:[[:space:]]*["'\'']\?\([0-9]\+\.[0-9]\+\)["'\'']\?/\1/')

        # Get new version from current branch
        new_version=$(get_version "$file")

        # Check if version field exists in new file
        if [ -z "$new_version" ]; then
            echo -e "${RED}❌ FAIL${NC}"
            echo "    Error: Missing 'version' field in frontmatter"
            has_errors=1
            continue
        fi

        # Validate format
        if ! validate_format "$new_version"; then
            echo -e "${RED}❌ FAIL${NC}"
            echo "    Error: Invalid version format '$new_version' (must be X.Y)"
            has_errors=1
            continue
        fi

        # If old version doesn't exist, treat as new file requiring 1.0
        if [ -z "$old_version" ]; then
            if [ "$new_version" != "1.0" ]; then
                echo -e "${RED}❌ FAIL${NC}"
                echo "    Error: File had no version before, must start with '1.0', found '$new_version'"
                has_errors=1
                continue
            fi
            echo -e "${GREEN}✅ OK${NC} (v$new_version - version added)"
            continue
        fi

        # Check if version changed
        if [ "$old_version" == "$new_version" ]; then
            echo -e "${RED}❌ FAIL${NC}"
            echo "    Error: File modified but version not updated (still $old_version)"
            has_errors=1
            continue
        fi

        # Validate increment
        if ! validate_increment "$old_version" "$new_version"; then
            echo -e "${RED}❌ FAIL${NC}"
            echo "    Error: Invalid version increment $old_version → $new_version"
            echo "    Rules:"
            echo "      - Major +1: next minor must be 0 (e.g., 1.5 → 2.0)"
            echo "      - Minor +1: major stays same (e.g., 1.5 → 1.6)"
            echo "      - Only increment by 1"
            has_errors=1
            continue
        fi

        echo -e "${GREEN}✅ OK${NC} ($old_version → $new_version)"
    done <<< "$modified_files"
    echo ""
fi

# Summary
if [ "$has_errors" -eq 0 ]; then
    echo -e "${GREEN}✅ All version checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Version validation failed. Please fix the errors above.${NC}"
    echo ""
    echo "Version rules:"
    echo "  • New files must have version: \"1.0\""
    echo "  • Modified files must increment version"
    echo "  • Format must be X.Y (e.g., 1.0, 1.1, 2.0)"
    echo "  • Major +1: minor must reset to 0 (e.g., 1.5 → 2.0)"
    echo "  • Minor +1: major stays same (e.g., 1.5 → 1.6)"
    echo "  • Only increment by 1 at a time"
    echo ""
    echo "Translations in /es/ are exempt from version validation."
    exit 1
fi
