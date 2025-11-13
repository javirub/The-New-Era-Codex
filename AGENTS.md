# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The New Era Codex** is a multilingual AI documentation platform built with Astro + Starlight. It democratizes AI knowledge across professions with content organized by **target audience** (developers, automation enthusiasts, general users, professionals), not by topic.

**Tech Stack**: Astro v5, Starlight v0.36, Tailwind CSS v4, TypeScript, Bun/Node.js 18+

## Essential Commands

### Development
```bash
bun install          # Install dependencies
bun dev              # Start dev server at localhost:4321 (hot reload)
bun build            # Production build to ./dist
bun preview          # Preview production build locally
bun astro check      # Run TypeScript checks
```

### Deployment
```bash
bun run deploy       # Build + deploy to Cloudflare Pages via Wrangler
```

### Testing
- No dedicated test runner; validation happens via:
    - `bun build` - Ensures build succeeds
    - `bun astro check` - TypeScript validation
    - GitHub Actions workflows on push/PR

## Architecture

### Content Organization (Audience-First)

Content is organized by **who it's for**, not by topic:

```
src/content/docs/
├── developers/         # Code-heavy, assumes technical knowledge
├── automation/         # Visual guides, no-code tools (n8n, Zapier)
├── everyone/          # Jargon-free, ChatGPT, prompt engineering
├── professionals/     # Business-focused, ROI-oriented (HR, Marketing)
├── community/         # Contribution guides and templates
└── es/               # Spanish translations (mirrors structure above)
```

**Critical**: When adding content, always:
1. Identify the target audience first
2. Use the appropriate tone/depth for that audience
3. Place content in the correct directory
4. Use templates from `community/templates/` as starting points

### Versioning System

All content files MUST have semantic versioning (X.Y) in frontmatter:

```yaml
---
title: "Your Title"
description: "Brief description"
version: "1.0"
---
```

**Version Rules**:
- **New files**: Always start at `1.0`
- **Minor updates** (examples, clarifications, small fixes): `1.0` → `1.1`
- **Major updates** (restructures, significant additions): `1.5` → `2.0` (minor resets to 0)
- **Translation corrections** (typos, grammar): No version change
- **Content changes**: MUST happen in English first, then propagate to translations

**CI/CD Enforcement**:
- `.github/workflows/validate-versions.yml` - Validates English content only, ensures proper version increments
- `.github/workflows/add-versions.yml` - Auto-adds `version: "1.0"` to files missing it
- Only English files under `src/content/docs/` (not `es/`) are validated for version increments

### Translation System

**Language Hierarchy**:
- **English** (`src/content/docs/`) is the source of truth
- **Spanish** (`src/content/docs/es/`) mirrors the structure
- New content CANNOT be created directly in translation folders

**Translation Workflow**:
1. Content written in English at version `1.0`
2. Spanish translation created at version `1.0` (matching English)
3. English content updated → version increments (e.g., `1.1` or `2.0`)
4. Spanish translation updated to match new version
5. If Spanish lags behind, optionally add `sourceVersion: "2.0"` to frontmatter

**Key Point**: Translation quality fixes (typos, better wording) don't require version changes. Only content changes trigger version updates.

## Configuration Files

### astro.config.mjs
Central configuration for:
- **Site URL**: `https://codex.javirub.pro`
- **Locales**: English (root), Spanish (`es`)
- **Starlight setup**: Sidebar structure with 4 audience sections + Community
- **Integrations**: Sitemap, Tailwind CSS v4

**Sidebar Auto-Generation**: Starlight automatically generates sidebar items from directory structure. Manual items only exist in the `community/` section.

### src/content.config.ts
Defines content collections using Starlight's loaders:
```typescript
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema()
  }),
};
```

## Development Workflow

### Adding New Content

1. **Choose audience directory**: `/developers/`, `/automation/`, `/everyone/`, or `/professionals/`
2. **Use appropriate template** from `src/content/docs/community/templates/`
3. **Create `.md` or `.mdx` file** with required frontmatter:
   ```yaml
   ---
   title: "Guide Title"
   description: "Brief description"
   version: "1.0"
   ---
   ```
4. **Test locally**: `bun dev` and verify at `localhost:4321`
5. **Submit PR** with format: `[Audience] Brief description (v1.0)`

### Updating Existing Content

1. **Read the file first** to understand current version
2. **Determine update type**:
    - Minor (examples, clarifications) → increment Y: `1.2` → `1.3`
    - Major (restructure, new sections) → increment X, reset Y: `1.5` → `2.0`
3. **Update version in frontmatter**
4. **Make content changes**
5. **Submit PR** with format: `[Audience] Brief description (v1.2 → v1.3)`

**Important**: CI will reject PRs that skip versions or increment incorrectly (e.g., `1.2` → `1.4` is invalid).

### Adding Translations

1. **Ensure English version exists** in `src/content/docs/`
2. **Create parallel file** in `src/content/docs/es/` with same path
3. **Match version number** from English source
4. **Submit PR** with format: `[Translation] Add Spanish version of X (v1.0)`

**Translation Corrections**: For typo fixes or wording improvements in existing translations, don't change the version. Use PR format: `[Fix] Correct typo in Spanish translation (no version change)`

## CI/CD Pipelines

Three GitHub Actions workflows run automatically:

1. **build-check.yml** (on all PRs/pushes to main/develop)
    - Installs dependencies
    - Runs `bun build`
    - Fails PR if build fails

2. **validate-versions.yml** (on PRs/pushes with content changes)
    - Validates version format (`X.Y`)
    - Ensures new files have `version: "1.0"`
    - Ensures modified files increment by exactly 1
    - **Only validates English content** (skips `es/` directory)
    - Provides detailed error messages with suggestions

3. **add-versions.yml** (on successful pushes to main)
    - Auto-adds `version: "1.0"` to files missing it
    - Commits with `[skip ci]` tag
    - Applies to all files (English and translations)

## Important Constraints

### When Editing Content Files
- **Always preserve existing version** if making translation corrections
- **Always increment version** if changing actual content
- **Never skip versions**: `1.0` → `1.2` is invalid, must go through `1.1`
- **Reset minor to 0 on major bump**: `1.9` → `2.0`, not `2.9`

### When Adding New Files
- **Must include frontmatter** with title, description, and version
- **English content required first** before translations
- **Use templates** from `community/templates/` directory

### File Naming
- Use kebab-case: `prompt-engineering-basics.md`
- Be descriptive: `building-rag-systems.md` not `rag.md`
- Match audience context: don't put technical content in `/everyone/`

## Common Patterns

### Creating a New Guide
```bash
# 1. Copy appropriate template
cp src/content/docs/community/templates/developer-guide-template.md \
   src/content/docs/developers/my-new-guide.md

# 2. Edit frontmatter and content
# 3. Test locally
bun dev

# 4. Verify build
bun build
```

### Updating an Existing Guide
```bash
# 1. Read current version
# Suppose current version is 1.2

# 2. Decide update type (minor or major)
# Minor: Add examples → 1.2 → 1.3
# Major: Restructure → 1.2 → 2.0

# 3. Update version in frontmatter
# 4. Make content changes
# 5. Test and build
bun dev
bun build
```

### Adding Spanish Translation
```bash
# 1. Ensure English version exists at, e.g., v1.0
# src/content/docs/developers/ai-agents.md

# 2. Create Spanish version
# src/content/docs/es/developers/ai-agents.md

# 3. Copy frontmatter, update title/description to Spanish
# Keep version: "1.0" (matching English)

# 4. Translate content
# 5. Test both versions
bun dev
# Visit /developers/ai-agents and /es/developers/ai-agents
```

## Deployment

**Primary**: Cloudflare Pages with auto-deploy on push to `main` branch

**Manual Deploy**:
```bash
bun run deploy  # Runs: bun build && bunx wrangler pages deploy ./dist
```

**Build Output**: `./dist` directory contains static HTML/CSS/JS

## Key Files Reference

- `astro.config.mjs` - Astro/Starlight configuration, sidebar structure
- `src/content.config.ts` - Content collection schema
- `src/content/docs/` - All documentation (English)
- `src/content/docs/es/` - Spanish translations
- `.github/workflows/` - CI/CD automation
- `.github/scripts/validate-versions.sh` - Version validation logic
- `CONTRIBUTING.md` - Full contribution guidelines
- `package.json` - Dependencies and scripts

## Content Quality Standards

### Frontmatter Requirements
Every `.md` and `.mdx` file must include:
```yaml
---
title: "Clear, descriptive title"
description: "One-sentence summary (for SEO)"
version: "X.Y"
---
```

### Audience-Specific Tone
- **Developers**: Technical depth, code examples, GitHub patterns, assumes programming knowledge
- **Automation**: Visual guides, step-by-step screenshots, no-code focus
- **Everyone**: Accessible language, no jargon, relatable scenarios, copy-paste prompts
- **Professionals**: ROI-focused, business impact, role-specific terminology

### Writing Style
- Use clear headings (##, ###)
- Include practical examples
- Add code blocks with language tags: ```bash, ```python, ```typescript
- Link to related guides
- Keep paragraphs short and scannable

## Starlight Features Available

### Components (in .mdx files)
```javascript
import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <Card title="Feature 1" icon="rocket">
    Description here
  </Card>
  <Card title="Feature 2" icon="star">
    Description here
  </Card>
</CardGrid>
```

### Automatic Features
- Search (built-in, no config needed)
- Dark/light theme toggle
- Responsive mobile design
- Sidebar navigation from directory structure
- Locale switcher (EN/ES)
- "Edit on GitHub" links
- Previous/next navigation

## Troubleshooting

### Build Fails
1. Check TypeScript errors: `bun astro check`
2. Verify all content files have valid frontmatter
3. Ensure no syntax errors in `.mdx` files
4. Check `astro.config.mjs` for configuration issues

### Version Validation Fails
1. Ensure version format is `X.Y` (e.g., `1.0`, not `v1.0` or `1.0.0`)
2. Check that version increment is exactly +1 (minor or major)
3. For new files, version must be `1.0`
4. For major bumps (X changes), minor (Y) must reset to 0

### Translation Issues
1. Verify English source exists first
2. Check directory structure matches exactly: `docs/developers/guide.md` → `docs/es/developers/guide.md`
3. Ensure version number matches source (unless using `sourceVersion` field)

## Project Philosophy

**Audience-first content organization** is the core principle. Always ask: "Who is this for?" before "What is this about?" This ensures guides match the appropriate technical level, tone, and depth for their intended readers.

**Version tracking enables translation synchronization**. Without versions, translators wouldn't know if content has changed since they last translated it. The system prioritizes English as source of truth while allowing translations to lag gracefully with clear indicators.
