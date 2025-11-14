#!/usr/bin/env python3
"""
Translation Status Badge Generator

This script analyzes translation status and updates README.md with dynamic badges.
It tracks:
- Percentage of translated documents
- Percentage of outdated translations
- Percentage of untranslated documents
"""

import os
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

# Mapping of files with translated names
TRANSLATED_FILENAMES = {
    # Automation
    'automation/email-automation-zapier.md': 'automation/automatizacion-email-zapier.md',
    'automation/first-ai-workflow-n8n.md': 'automation/primer-workflow-ia-n8n.md',
    'automation/workflow-template-library.md': 'automation/biblioteca-plantillas-workflows.md',
    'automation/web-data-extraction-make.md': 'automation/extraccion-datos-web-make.md',
    'automation/virtual-assistant-voiceflow.md': 'automation/asistente-virtual-voiceflow.md',

    # Community templates
    'community/templates/automation-guide-template.md': 'community/templates/plantilla-guia-automatizacion.md',
    'community/templates/developer-guide-template.md': 'community/templates/plantilla-guia-desarrollador.md',
    'community/templates/professional-guide-template.md': 'community/templates/plantilla-guia-profesional.md',
    'community/templates/everyone-guide-template.md': 'community/templates/plantilla-guia-todos.md',

    # Developers
    'developers/agent-architecture-patterns.md': 'developers/arquitectura-agentes-patrones.md',
    'developers/building-first-rag-system.md': 'developers/construyendo-primer-sistema-rag.md',
    'developers/llm-evaluation-metrics.md': 'developers/evaluacion-llm-metricas.md',
    'developers/vectorization-semantic-search.md': 'developers/vectorizacion-busqueda-semantica.md',
    'developers/prompt-engineering-developers.md': 'developers/prompt-engineering-desarrolladores.md',

    # Everyone
    'everyone/ai-for-studying.md': 'everyone/ia-para-estudiar.md',
    'everyone/ai-image-generation-guide.md': 'everyone/guia-generacion-imagenes-ia.md',
    'everyone/chatgpt-beginners-guide.md': 'everyone/guia-chatgpt-principiantes.md',
    'everyone/detecting-ai-content.md': 'everyone/detectar-contenido-ia.md',
    'everyone/magic-prompt-templates.md': 'everyone/plantillas-prompts-magicos.md',

    # Professionals
    'professionals/ai-for-data-analysis.md': 'professionals/ia-analisis-datos.md',
    'professionals/ai-and-compliance.md': 'professionals/ia-cumplimiento-normativo.md',
    'professionals/ai-for-marketing.md': 'professionals/ia-para-marketing.md',
    'professionals/ai-for-recruitment.md': 'professionals/ia-para-reclutamiento.md',
    'professionals/ai-for-customer-service.md': 'professionals/ia-servicio-cliente.md',
}


def get_all_files(directory: Path, exclude_path: str = None) -> List[str]:
    """Get all .md and .mdx files in a directory"""
    files = []
    for root, dirs, filenames in os.walk(directory):
        if exclude_path and exclude_path in root:
            continue
        for filename in filenames:
            if filename.endswith(('.md', '.mdx')):
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, directory)
                files.append(rel_path)
    return sorted(files)


def get_file_version(file_path: Path) -> str:
    """Extract version from frontmatter"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'^---\s*\n(.*?)\n---', content, re.DOTALL | re.MULTILINE)
            if match:
                frontmatter = match.group(1)
                version_match = re.search(r'version:\s*[\'"]?([^\'"]+)[\'"]?', frontmatter)
                if version_match:
                    return version_match.group(1)
    except Exception:
        pass
    return "1.0"


def get_file_mtime(file_path: Path) -> float:
    """Get file modification time"""
    try:
        return os.path.getmtime(file_path)
    except Exception:
        return 0


def analyze_translations() -> Tuple[int, int, int, int]:
    """
    Analyze translation status and return counts:
    (total_docs, translated, outdated, untranslated)
    """
    base_dir = Path('src/content/docs')
    spanish_dir = base_dir / 'es'

    # Get English files
    english_files = get_all_files(base_dir, 'es')

    # Get Spanish files
    spanish_files = get_all_files(spanish_dir)
    spanish_file_set = set(spanish_files)

    total_docs = len(english_files)
    translated = 0
    outdated = 0
    untranslated = 0

    for en_file in english_files:
        es_file = None

        # Try exact match
        if en_file in spanish_file_set:
            es_file = en_file
        # Try translated filename
        elif en_file in TRANSLATED_FILENAMES:
            if TRANSLATED_FILENAMES[en_file] in spanish_file_set:
                es_file = TRANSLATED_FILENAMES[en_file]

        if es_file:
            # Check if outdated by comparing modification times
            en_path = base_dir / en_file
            es_path = spanish_dir / es_file

            en_mtime = get_file_mtime(en_path)
            es_mtime = get_file_mtime(es_path)

            # If English file was modified more recently, translation is outdated
            # Allow 60 seconds tolerance for race conditions
            if en_mtime > es_mtime + 60:
                outdated += 1
            else:
                translated += 1
        else:
            untranslated += 1

    return total_docs, translated, outdated, untranslated


def generate_badge_url(label: str, message: str, color: str) -> str:
    """Generate shields.io badge URL"""
    label_encoded = label.replace(' ', '%20')
    message_encoded = message.replace(' ', '%20')
    return f"https://img.shields.io/badge/{label_encoded}-{message_encoded}-{color}?style=flat-square"


def get_color_for_percentage(percentage: float) -> str:
    """Get badge color based on percentage"""
    if percentage >= 95:
        return "brightgreen"
    elif percentage >= 80:
        return "green"
    elif percentage >= 60:
        return "yellowgreen"
    elif percentage >= 40:
        return "yellow"
    elif percentage >= 20:
        return "orange"
    else:
        return "red"


def generate_badges(translated: int, outdated: int, untranslated: int, total: int) -> str:
    """Generate badge markdown for all translation statuses"""
    if total == 0:
        return ""

    # Calculate percentages
    translated_pct = (translated / total) * 100
    outdated_pct = (outdated / total) * 100
    untranslated_pct = (untranslated / total) * 100

    # Generate badges
    badges = []

    # Translated badge
    translated_color = get_color_for_percentage(translated_pct)
    translated_badge = f"![Translated](https://img.shields.io/badge/ES_Translated-{translated_pct:.1f}%25-{translated_color}?style=flat-square)"
    badges.append(translated_badge)

    # Outdated badge (only show if > 0%)
    if outdated > 0:
        outdated_color = "orange"
        outdated_badge = f"![Outdated](https://img.shields.io/badge/ES_Outdated-{outdated_pct:.1f}%25-{outdated_color}?style=flat-square)"
        badges.append(outdated_badge)

    # Untranslated badge (only show if > 0%)
    if untranslated > 0:
        untranslated_color = "lightgrey"
        untranslated_badge = f"![Untranslated](https://img.shields.io/badge/ES_Untranslated-{untranslated_pct:.1f}%25-{untranslated_color}?style=flat-square)"
        badges.append(untranslated_badge)

    return '\n'.join(badges)


def update_readme(badges: str) -> bool:
    """Update README.md with new translation badges"""
    readme_path = Path('README.md')

    if not readme_path.exists():
        print("❌ README.md not found")
        return False

    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define markers for translation status section
    start_marker = "<!-- TRANSLATION_STATUS_START -->"
    end_marker = "<!-- TRANSLATION_STATUS_END -->"

    # Create the new section
    new_section = f"{start_marker}\n{badges}\n{end_marker}"

    # Check if markers exist
    if start_marker in content and end_marker in content:
        # Replace existing section
        pattern = re.compile(
            re.escape(start_marker) + r'.*?' + re.escape(end_marker),
            re.DOTALL
        )
        new_content = pattern.sub(new_section, content)
    else:
        # Add new section after the Languages badge
        languages_badge_pattern = r'(\[\!\[Languages\].*?\]\(#\))'
        match = re.search(languages_badge_pattern, content)

        if match:
            # Insert after Languages badge
            insert_pos = match.end()
            new_content = (
                content[:insert_pos] +
                '\n' + new_section +
                content[insert_pos:]
            )
        else:
            print("⚠️  Could not find Languages badge to insert translation status")
            return False

    # Write updated content
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True


def main():
    """Main execution"""
    print("=" * 80)
    print("TRANSLATION STATUS BADGE GENERATOR")
    print("=" * 80)

    # Analyze translations
    print("\n📊 Analyzing translations...")
    total, translated, outdated, untranslated = analyze_translations()

    print(f"\n📈 Results:")
    print(f"  Total documents: {total}")
    print(f"  ✅ Translated: {translated} ({translated/total*100:.1f}%)")
    print(f"  ⚠️  Outdated: {outdated} ({outdated/total*100:.1f}%)")
    print(f"  ❌ Untranslated: {untranslated} ({untranslated/total*100:.1f}%)")

    # Generate badges
    print("\n🎨 Generating badges...")
    badges = generate_badges(translated, outdated, untranslated, total)
    print(f"\n{badges}")

    # Update README
    print("\n📝 Updating README.md...")
    if update_readme(badges):
        print("✅ README.md updated successfully!")
    else:
        print("❌ Failed to update README.md")
        return 1

    print("\n" + "=" * 80)
    print("✨ Badge generation complete!")
    print("=" * 80)

    return 0


if __name__ == "__main__":
    exit(main())
