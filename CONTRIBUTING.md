# Contributing to The New Era Codex

Thank you for your interest in contributing to The New Era Codex! This project aims to democratize AI knowledge across all professions—for everyone, regardless of their role or background.

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) installed (or Node.js 18+)
- Git
- A GitHub account

### Local Development

```bash
# Fork and clone the repository
git clone https://github.com/javirub/The-New-Era-Codex.git
cd The-New-Era-Codex

# Install dependencies
bun install

# Start development server
bun dev
```

The site will be available at `http://localhost:4321`

## Understanding Our Content Structure

The New Era Codex uses an **audience-first organization** strategy. Content is organized by who it's for, not just by topic:

```
src/content/docs/
├── developers/      # AI agents, RAG, LangChain, Python development
├── automation/      # n8n, Zapier, Make.com workflows
├── everyone/        # ChatGPT, prompt engineering, daily AI tools
└── professionals/   # HR, marketing, analytics use cases
```

**This is critical**: When contributing, you must first identify your target audience. A guide about "using AI" will be completely different if written for developers vs. HR professionals.

## How to Contribute

### For Content Contributors

1. **Choose Your Audience**
   - Are you writing for developers? → Use technical depth, code examples
   - For automation enthusiasts? → Focus on visual workflows, no-code
   - For everyone? → Use accessible language, avoid jargon
   - For professionals? → Focus on ROI, business impact, role-specific use cases

2. **Use the Right Template**
   We provide templates for each audience type in `/src/content/docs/community/templates/`

3. **Follow Our Comprehensive Guide**
   Visit our detailed contribution guide: [Contributing Guide](https://your-site-url/community/contributing/)

   This guide includes:
   - Detailed guidelines for each audience
   - Content examples and tone guidance
   - Style guide and best practices
   - Submission process

### For Code Contributors

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test locally: `bun dev` and `bun build`
4. Ensure TypeScript checks pass: `bun astro check`
5. Submit a pull request

## Contribution Types

We welcome:

- **New Guides**: Share your AI knowledge for any audience
- **Translations**: Help us expand to more languages (currently Spanish/English)
- **Bug Fixes**: Improve the platform
- **Design Improvements**: Enhance user experience
- **Code Examples**: Add practical demonstrations
- **Template Improvements**: Make it easier for others to contribute

## Content Guidelines

### General Principles

- **Audience-Appropriate**: Match your tone and depth to your target audience
- **Practical**: Include real-world examples and actionable advice
- **Accurate**: Test code, verify information, cite sources
- **Accessible**: Make content understandable at appropriate skill levels
- **Well-Structured**: Use clear headings, lists, and formatting

### Audience-Specific Guidelines

- **Developers**: Code-heavy, assumes technical knowledge, GitHub patterns
- **Automation**: Visual guides, screenshots, step-by-step instructions
- **Everyone**: Jargon-free, relatable scenarios, copy-paste prompts
- **Professionals**: ROI-focused, role-specific terminology, business impact

See our [Style Guide](https://your-site-url/community/style-guide/) for detailed guidelines.

## Translation and Versioning Policy

### Language Hierarchy

- **English is the source language**: All content must first exist in `src/content/docs/` (English version) in its corresponding directory before translations can be created.
- **No direct translations**: New entries cannot be created directly in translation folders without an English original.
- All content changes must originate in English to maintain consistency and quality.

### Versioning System

We use a simplified semantic versioning (X.Y) for all documentation:

- **Major version (X)**: Significant content changes
  - Complete restructuring of the guide
  - Major new sections or fundamental changes in approach
  - Substantial content additions that change the guide's scope
  - Example: 1.5 → 2.0

- **Minor version (Y)**: Small to moderate content updates
  - Additional clarifications or examples
  - Small corrections to technical content
  - New subsections that complement existing content
  - Technical updates (e.g., API changes, tool updates)
  - Example: 1.2 → 1.3

- **Version reset**: When incrementing major version, minor resets to 0
  - Example: 1.9 → 2.0 (not 2.9)

- **Starting version**: All new English content starts at version **1.0**

### Translation Rules

1. **Translation corrections don't change version**:
   - Fixing typos, grammar errors, or improving translation quality doesn't require a version bump
   - Correcting mistranslations or unclear wording in translations keeps the same version
   - These are considered maintenance, not content changes

2. **Content changes must be done in English first**:
   - To modify a guide's actual content, make the change in the English version first
   - Update the version number in the English file according to the versioning system
   - Then update translations to match

3. **Translation version matches source**:
   - When creating or updating a translation, use the same version number as the English document you're translating from
   - Example: If translating English v2.0, the Spanish translation should be v2.0

4. **Out-of-date translations**:
   - If a translation hasn't been updated to match the latest English version, it should clearly indicate which version it corresponds to
   - Consider adding a note: "⚠️ This translation corresponds to version X.Y. The English version is at X.Z"

### Example Workflow

Here's a practical example of how this works:

1. **Initial creation**:
   - Create guide in English: `docs/developers/ai-agents.md` → version 1.0
   - Create Spanish translation: `docs/es/developers/ai-agents.md` → version 1.0

2. **Translation correction**:
   - Fix typo in Spanish translation → stays version 1.0
   - Improve Spanish wording → stays version 1.0

3. **Minor content update**:
   - Add example to English version → becomes version 1.1
   - Update Spanish translation with same example → becomes version 1.1

4. **Major content update**:
   - Restructure English guide significantly → becomes version 2.0
   - Update Spanish translation with restructure → becomes version 2.0

5. **Translation lag**:
   - English is at 2.0, Spanish is at 1.5
   - Spanish translation should indicate: "Translation of version 1.5 (English version: 2.0)"

### Version Declaration

All content files must include their version in the frontmatter:

```yaml
---
title: "Your Guide Title"
version: "1.0"
---
```

For translations, optionally include the source version if different:

```yaml
---
title: "Tu Título de Guía"
version: "1.5"
sourceVersion: "2.0"  # Optional: if translation is behind
---
```

## Pull Request Process

1. **Fork the repository** and create your branch from `main`
2. **Add your content** to the appropriate audience directory
3. **Test locally** to ensure it renders correctly
4. **Write a clear PR description**:
   - What audience is this for?
   - What topic does it cover?
   - Why is this valuable?
5. **Link to related issues** if applicable
6. **Be responsive to feedback** during review

### PR Title Format

Use clear, descriptive titles:
- `[Developers] Add guide on building RAG systems (v1.0)`
- `[Everyone] Add ChatGPT prompt engineering basics (v1.0)`
- `[Developers] Update RAG guide with new examples (v1.0 → v1.1)`
- `[Everyone] Major restructure of prompt engineering guide (v1.5 → v2.0)`
- `[Translation] Add Spanish version of AI agents guide (v1.0)`
- `[Translation] Update Spanish translation to match v2.0`
- `[Fix] Correct typo in automation workflow guide (no version change)`

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Publishing others' private information
- Spam or promotional content unrelated to AI education
- Any conduct that creates an unwelcoming environment

## Project Structure

```
ia-website/
├── public/              # Static assets
├── src/
│   ├── assets/          # Optimized images
│   ├── content/
│   │   └── docs/        # All documentation
│   │       ├── developers/
│   │       ├── automation/
│   │       ├── everyone/
│   │       ├── professionals/
│   │       └── community/  # Contribution guides
│   └── styles/          # Global styles
├── astro.config.mjs     # Astro + Starlight configuration
├── CONTRIBUTING.md      # This file
└── README.md            # Project overview
```

## Need Help?

- **Detailed Docs**: Visit our [Contributing Guide](https://your-site-url/community/contributing/)
- **Questions**: Open a [Discussion](https://github.com/javirub/The-New-Era-Codex/discussions)
- **Bugs**: Report [Issues](https://github.com/javirub/The-New-Era-Codex/issues)
- **Chat**: Join our Discord (coming soon)

## License

By contributing, you agree that your contributions will be licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License (CC-BY-SA-4.0)](https://creativecommons.org/licenses/by-sa/4.0/).

## Recognition

All contributors are recognized in our project. Your contributions help democratize AI knowledge for everyone!

---

**Ready to contribute?** Check out our [comprehensive contributor guide](https://your-site-url/community/contributing/) or browse our [content templates](https://your-site-url/community/templates/) to get started!
