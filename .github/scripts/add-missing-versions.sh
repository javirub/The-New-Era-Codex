#!/bin/bash

# Script to add version: "1.0" to content files that don't have it
# Only processes English content files (not translations)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking for content files without version..."

files_modified=0

# Find all English content files (exclude /es/ translations)
content_files=$(find src/content/docs -type f \( -name "*.md" -o -name "*.mdx" \) ! -path "*/es/*")

for file in $content_files; do
    # Check if file has frontmatter
    if ! grep -q "^---$" "$file"; then
        echo -e "${YELLOW}⚠️  Skipping $file - no frontmatter found${NC}"
        continue
    fi

    # Check if version field exists in frontmatter
    has_version=$(sed -n '/^---$/,/^---$/p' "$file" | grep -c "^version:" || true)

    if [ "$has_version" -eq 0 ]; then
        echo "  📝 Adding version to: $file"

        # Create temp file
        temp_file=$(mktemp)

        # Process the file
        awk '
        BEGIN { in_frontmatter=0; frontmatter_ended=0; version_added=0 }
        /^---$/ {
            if (in_frontmatter == 0) {
                in_frontmatter = 1
                print $0
                next
            } else if (in_frontmatter == 1 && frontmatter_ended == 0) {
                # End of frontmatter, add version before closing
                print "version: \"1.0\""
                version_added = 1
                frontmatter_ended = 1
                print $0
                next
            }
        }
        { print $0 }
        ' "$file" > "$temp_file"

        # Replace original file
        mv "$temp_file" "$file"
        files_modified=$((files_modified + 1))
    fi
done

echo ""
if [ "$files_modified" -gt 0 ]; then
    echo -e "${GREEN}✅ Added version to $files_modified file(s)${NC}"
    exit 0
else
    echo -e "${GREEN}✅ All files already have version field${NC}"
    exit 0
fi
