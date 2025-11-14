---
title: "Versionado y Gestión de Prompts: Rastrear, Probar, Desplegar"
description: "Control de versiones de tus prompts, pruebas A/B de variaciones y gestión de despliegues de prompts"
sidebar:
  order: 15
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---

# Versionado y Gestión de Prompts

## ¿Por Qué Versionar Prompts?

- Rastrear rendimiento a lo largo del tiempo
- Pruebas A/B de variaciones
- Revertir cambios problemáticos
- Colaborar en mejoras
- Pista de auditoría para cumplimiento

## Control de Versiones con Git

```yaml
# prompts/customer_support.yaml
version: "2.1.0"
created: "2024-01-15"
last_modified: "2024-03-20"
author: "team@company.com"

system_prompt: |
  You are a helpful customer support agent.
  Guidelines:
  - Be empathetic and professional
  - Offer specific solutions
  - Escalate if needed

variations:
  - id: "v2.1.0"
    description: "Added empathy emphasis"
    performance:
      csat: 4.5
      resolution_rate: 85%

  - id: "v2.0.0"
    description: "Restructured for clarity"
    performance:
      csat: 4.2
      resolution_rate: 82%
```

## Herramientas de Gestión de Prompts

### LangSmith
```python
from langsmith import Client

client = Client()

# Track prompt versions
client.create_prompt(
    prompt_name="customer_support",
    prompt_template="You are a {role}. {instructions}",
    version="2.1.0"
)
```

### Promptfoo
```yaml
# promptfooconfig.yaml
prompts:
  - customer_support_v1.txt
  - customer_support_v2.txt

providers:
  - openai:gpt-4

tests:
  - vars:
      question: "Where is my order?"
    assert:
      - type: contains
        value: "track"
```

## Framework de Pruebas A/B

```python
import random
from datetime import datetime

class PromptABTest:
    def __init__(self, prompt_a, prompt_b, split=0.5):
        self.prompt_a = prompt_a
        self.prompt_b = prompt_b
        self.split = split
        self.results = {'a': [], 'b': []}

    def get_prompt(self, user_id):
        # Consistent assignment per user
        variant = 'a' if hash(user_id) % 100 < self.split * 100 else 'b'
        return getattr(self, f'prompt_{variant}'), variant

    def record_result(self, variant, metrics):
        self.results[variant].append({
            'timestamp': datetime.now(),
            **metrics
        })

    def analyze(self):
        for variant in ['a', 'b']:
            results = self.results[variant]
            avg_score = sum(r['score'] for r in results) / len(results)
            print(f"Variant {variant}: {avg_score:.2f}")

# Usage
test = PromptABTest(
    prompt_a="Be helpful: {query}",
    prompt_b="Be empathetic and helpful: {query}"
)

prompt, variant = test.get_prompt(user_id="user123")
response = llm.complete(prompt)
test.record_result(variant, {'score': user_rating})
```

## Registro de Prompts

```python
class PromptRegistry:
    def __init__(self):
        self.prompts = {}

    def register(self, name, version, template, metadata=None):
        key = f"{name}:{version}"
        self.prompts[key] = {
            'template': template,
            'metadata': metadata or {},
            'created_at': datetime.now()
        }

    def get(self, name, version="latest"):
        if version == "latest":
            # Get highest version
            versions = [k for k in self.prompts if k.startswith(f"{name}:")]
            key = sorted(versions)[-1]
        else:
            key = f"{name}:{version}"

        return self.prompts[key]['template']

    def rollback(self, name, to_version):
        # Promote old version to latest
        old_prompt = self.get(name, to_version)
        new_version = self._increment_version(name)
        self.register(name, new_version, old_prompt)

# Usage
registry = PromptRegistry()
registry.register(
    name="customer_support",
    version="1.0.0",
    template="You are helpful. {query}",
    metadata={'author': 'john@example.com'}
)
```

## Mejores Prácticas

✅ **Hacer**:
- Versionar todos los prompts
- Documentar cambios
- Probar antes de desplegar
- Monitorear rendimiento
- Mantener capacidad de rollback

❌ **No hacer**:
- Desplegar prompts sin probar
- Omitir documentación
- Ignorar métricas
- Eliminar versiones antiguas

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
