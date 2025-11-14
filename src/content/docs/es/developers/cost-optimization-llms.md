---
title: "Optimización de Costos para Aplicaciones LLM"
description: "Reduce los costos de IA mediante caching, optimización de prompts, selección de modelos y monitoreo"
sidebar:
  order: 95
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---

# Optimización de Costos para Aplicaciones LLM

## Desglose de Costos

**Costos típicos**:
- Tokens de entrada: $0.15-$15 por 1M tokens
- Tokens de salida: $0.60-$75 por 1M tokens
- Embeddings: $0.02-$0.13 por 1M tokens
- Fine-tuning: $8-$25 por 1M tokens

## Estrategias de Optimización

### 1. Compresión de Prompts

**Antes** (500 tokens):
```
You are a helpful customer service agent. Please analyze this customer inquiry carefully and provide a detailed, empathetic response that addresses all their concerns. Make sure to be professional and courteous...

Customer: Where is my order?
```

**Después** (50 tokens):
```
Customer service: respond professionally.
Customer: Where is my order?
```

**Ahorro**: 90% menos tokens de entrada

### 2. Caching de Respuestas

```python
import redis
import hashlib

redis_client = redis.Redis()

def get_cached_response(prompt, ttl=3600):
    cache_key = hashlib.md5(prompt.encode()).hexdigest()

    # Check cache
    cached = redis_client.get(cache_key)
    if cached:
        return cached.decode()

    # Call LLM
    response = call_llm(prompt)

    # Cache result
    redis_client.setex(cache_key, ttl, response)
    return response
```

### 3. Estratificación de Modelos

```python
def route_to_model(query, complexity_threshold=0.5):
    complexity = assess_complexity(query)

    if complexity < complexity_threshold:
        return "gpt-4o-mini"  # $0.15/$0.60
    else:
        return "gpt-4o"  # $2.50/$10
```

### 4. Streaming con Parada Temprana

```python
def stream_with_stop(prompt, max_cost=0.01):
    tokens_used = 0
    max_tokens = calculate_max_tokens(max_cost)

    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        max_tokens=max_tokens
    )

    for chunk in stream:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="")
            tokens_used += 1
```

### 5. Procesamiento por Lotes

```python
# En lugar de 100 llamadas individuales
for item in items:
    result = call_llm(item)  # 100 API calls

# Agrúpalas en lotes
batch_prompt = "\n".join([f"{i}. {item}" for i, item in enumerate(items)])
results = call_llm(f"Process these:\n{batch_prompt}")  # 1 API call
```

### 6. Optimización de Prompts

```python
# Reduce verbosity
prompts = [
    "Original: The customer is asking about...",  # Verbose
    "Optimized: Customer asks: delivery status"   # Concise
]

# Use abbreviations
# Specify exact length needed
```

## Monitoreo de Costos

```python
import logging
from datetime import datetime

class CostTracker:
    def __init__(self):
        self.costs = []

    def track_call(self, model, input_tokens, output_tokens):
        cost = calculate_cost(model, input_tokens, output_tokens)
        self.costs.append({
            'timestamp': datetime.now(),
            'model': model,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'cost': cost
        })
        logging.info(f"API call cost: ${cost:.4f}")

    def daily_report(self):
        total = sum(c['cost'] for c in self.costs)
        return f"Daily cost: ${total:.2f}"
```

## Matriz de Selección de Modelos

| Caso de Uso | Modelo | Costo de Entrada | Mejor Para |
|----------|-------|------------|----------|
| Q&A Simple | GPT-4o-mini | $0.15/1M | Alto volumen |
| Razonamiento complejo | GPT-4o | $2.50/1M | Calidad crítica |
| Documentos largos | Claude Sonnet | $3/1M | Contexto grande |
| Crítico en presupuesto | Llama 3 (auto-alojado) | Infraestructura | Sensible al costo |

## Lista de Verificación de Reducción de Costos

✅ Implementa caching (ahorro 30-50%)
✅ Comprime prompts (ahorro 20-40%)
✅ Usa el nivel de modelo apropiado (ahorro 40-60%)
✅ Agrupa solicitudes en lotes (ahorro 10-30%)
✅ Establece max_tokens (previene sobrecostos)
✅ Monitorea y alerta sobre costos
✅ Usa streaming con parada temprana
✅ Cachea embeddings
✅ Implementa limitación de tasa

## Ejemplo del Mundo Real

**Antes de la optimización**:
- 10,000 solicitudes/día
- GPT-4o para todas
- Prom. 1,000 entrada, 500 salida tokens
- Costo: $125/día = $3,750/mes

**Después de la optimización**:
- Tasa de aciertos de caché: 40%
- Compresión de prompts: 30%
- Estratificación de modelos: 60% a mini
- Agrupación por lotes: 20% de reducción

**Nuevo costo**:
- $37/día = $1,110/mes
- **Ahorro: 70% ($2,640/mes)**

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
