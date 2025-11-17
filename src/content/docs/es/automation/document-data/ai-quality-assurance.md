---
title: "Control de Calidad con IA: Pruebas Automatizadas y Detección de Bugs"
description: "Automatiza procesos de QA con pruebas impulsadas por IA, detección de bugs y revisión de código"
sidebar:
  order: 85
  badge:
    text: "Bajo"
    variant: note
version: "1.0"
---

# Automatización de Control de Calidad con IA

## Generación de Pruebas con IA

```python
import openai

def generate_unit_tests(code, framework="pytest"):
    """Generate comprehensive unit tests for code"""

    test_prompt = f"""
    Generate comprehensive unit tests for this code using {framework}.

    Code:
    ```python
    {code}
    ```

    Requirements:
    - Test happy path
    - Test edge cases
    - Test error handling
    - Include fixtures if needed
    - Add docstrings
    - Aim for 90%+ coverage

    Return complete, runnable test code.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": test_prompt}]
    )

    return response.choices[0].message.content

# Example usage
code_to_test = """
def calculate_discount(price, discount_percent, is_member=False):
    if price < 0 or discount_percent < 0 or discount_percent > 100:
        raise ValueError("Invalid input")

    discount = price * (discount_percent / 100)
    if is_member:
        discount += price * 0.05

    return price - discount
"""

tests = generate_unit_tests(code_to_test)
print(tests)
```

## Detección Automatizada de Bugs

```python
def detect_bugs(code_snippet):
    """AI-powered bug detection"""

    bug_analysis_prompt = f"""
    Analyze this code for potential bugs, issues, and vulnerabilities.

    ```python
    {code_snippet}
    ```

    Check for:
    - Logic errors
    - Security vulnerabilities (SQL injection, XSS, etc.)
    - Performance issues
    - Edge cases not handled
    - Race conditions
    - Resource leaks
    - Error handling gaps

    For each issue found, provide:
    - Severity (critical/high/medium/low)
    - Line number
    - Description
    - Suggested fix

    Return as JSON array.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": bug_analysis_prompt}],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)
```

## Automatización de Revisión de Código

```python
from github import Github

class AICodeReviewer:
    def __init__(self, github_token):
        self.github = Github(github_token)

    def review_pull_request(self, repo_name, pr_number):
        """Automated PR review with AI"""

        repo = self.github.get_repo(repo_name)
        pr = repo.get_pull(pr_number)

        # Get all changed files
        files = pr.get_files()

        review_comments = []

        for file in files:
            if not file.filename.endswith(('.py', '.js', '.ts', '.java')):
                continue

            # Analyze the changes
            review = self.analyze_code_changes(file.patch, file.filename)

            for issue in review.get('issues', []):
                review_comments.append({
                    'path': file.filename,
                    'line': issue['line'],
                    'body': f"**{issue['severity'].upper()}**: {issue['description']}\n\n"
                           f"Suggestion: {issue['suggestion']}"
                })

        # Post review
        if review_comments:
            pr.create_review(
                body="AI Code Review Results",
                event="COMMENT",
                comments=review_comments
            )

        return review_comments

    def analyze_code_changes(self, patch, filename):
        """Analyze code changes in a file"""

        analysis_prompt = f"""
        Review these code changes in {filename}:

        ```diff
        {patch}
        ```

        Check for:
        - Code quality issues
        - Best practice violations
        - Security concerns
        - Performance problems
        - Missing tests
        - Documentation needs

        Return as JSON with issues array.
        """

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": analysis_prompt}],
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)
```

## Pruebas de Regresión Visual

```python
from PIL import Image
import base64

def compare_screenshots(baseline_path, current_path):
    """AI-powered visual regression testing"""

    def encode_image(path):
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode('utf-8')

    baseline_b64 = encode_image(baseline_path)
    current_b64 = encode_image(current_path)

    comparison_prompt = """
    Compare these two screenshots and identify any visual differences.

    Report:
    - Layout changes
    - Color differences
    - Missing/added elements
    - Text changes
    - Styling issues

    Rate severity: critical/major/minor
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": comparison_prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{baseline_b64}"}
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{current_b64}"}
                    }
                ]
            }
        ]
    )

    return response.choices[0].message.content
```

## Generación de Datos de Prueba

```python
def generate_test_data(schema, num_records=100):
    """Generate realistic test data based on schema"""

    data_prompt = f"""
    Generate {num_records} realistic test data records based on this schema:

    {json.dumps(schema, indent=2)}

    Requirements:
    - Realistic values (names, emails, addresses, etc.)
    - Follow data type constraints
    - Include edge cases (10% of data)
    - Ensure data variety
    - Valid foreign key relationships

    Return as JSON array.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": data_prompt}],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)

# Example usage
user_schema = {
    "fields": {
        "id": "integer (auto-increment)",
        "name": "string (3-50 chars)",
        "email": "email (valid format)",
        "age": "integer (18-100)",
        "role": "enum (user, admin, moderator)",
        "created_at": "timestamp"
    }
}

test_data = generate_test_data(user_schema, num_records=50)
```

## Análisis de Pruebas de Rendimiento

```python
def analyze_performance_results(test_results):
    """AI analysis of performance test results"""

    analysis_prompt = f"""
    Analyze these performance test results and provide insights:

    {json.dumps(test_results, indent=2)}

    Identify:
    - Performance bottlenecks
    - Unusual patterns
    - Regression from baseline
    - Scalability issues
    - Resource constraints

    Provide:
    - Root cause analysis
    - Optimization recommendations
    - Priority ranking
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": analysis_prompt}]
    )

    return response.choices[0].message.content
```

## Triaje Automatizado de Bugs

```python
def triage_bug_report(bug_description, historical_data=None):
    """Automatically triage and categorize bug reports"""

    triage_prompt = f"""
    Triage this bug report:

    {bug_description}

    Provide:
    - Severity: critical/high/medium/low
    - Priority: P0/P1/P2/P3
    - Category: frontend/backend/database/infrastructure
    - Affected components
    - Suggested team assignment
    - Estimated complexity
    - Similar past issues (if patterns detected)

    Return as JSON.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": triage_prompt}],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)
```

## Integración CI/CD

```python
# GitHub Actions workflow example
"""
name: AI Quality Check

on: [pull_request]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: AI Code Review
        run: |
          python scripts/ai_code_review.py \
            --pr-number ${{ github.event.pull_request.number }}

      - name: Generate Tests
        run: |
          python scripts/generate_tests.py \
            --changed-files ${{ steps.changed-files.outputs.all }}

      - name: Bug Detection
        run: |
          python scripts/detect_bugs.py --severity high

      - name: Comment Results
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🤖 AI Quality Check Results attached'
            })
"""
```

## Flujo de Trabajo QA con n8n

**Pipeline Automatizado de QA**:

1. **Webhook Trigger**: Nuevo PR creado
2. **HTTP Request**: Obtener archivos modificados
3. **OpenAI**: Analizar código en busca de bugs
4. **OpenAI**: Generar casos de prueba
5. **Decision Node**: Verificar severidad
6. **GitHub**: Publicar comentarios de revisión
7. **Slack**: Notificar al equipo de QA si hay problemas críticos
8. **Jira**: Crear tickets para bugs

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
