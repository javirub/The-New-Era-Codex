---
title: "Cost Optimization for LLM Applications"
description: "Reduce AI costs through caching, prompt optimization, model selection, and monitoring"
sidebar:
  order: 95
  badge:
    text: "Intermediate"
    variant: caution
version: "1.0"
---

# Cost Optimization for LLM Applications

## Cost Breakdown

**Typical costs**:
- Input tokens: $0.15-$15 per 1M tokens
- Output tokens: $0.60-$75 per 1M tokens
- Embeddings: $0.02-$0.13 per 1M tokens
- Fine-tuning: $8-$25 per 1M tokens

## Optimization Strategies

### 1. Prompt Compression

**Before** (500 tokens):
```
You are a helpful customer service agent. Please analyze this customer inquiry carefully and provide a detailed, empathetic response that addresses all their concerns. Make sure to be professional and courteous...

Customer: Where is my order?
```

**After** (50 tokens):
```
Customer service: respond professionally.
Customer: Where is my order?
```

**Savings**: 90% fewer input tokens

### 2. Response Caching

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

### 3. Model Tiering

```python
def route_to_model(query, complexity_threshold=0.5):
    complexity = assess_complexity(query)
    
    if complexity < complexity_threshold:
        return "gpt-4o-mini"  # $0.15/$0.60
    else:
        return "gpt-4o"  # $2.50/$10
```

### 4. Streaming with Early Stop

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

### 5. Batch Processing

```python
# Instead of 100 individual calls
for item in items:
    result = call_llm(item)  # 100 API calls

# Batch them
batch_prompt = "\n".join([f"{i}. {item}" for i, item in enumerate(items)])
results = call_llm(f"Process these:\n{batch_prompt}")  # 1 API call
```

### 6. Prompt Optimization

```python
# Reduce verbosity
prompts = [
    "Original: The customer is asking about...",  # Verbose
    "Optimized: Customer asks: delivery status"   # Concise
]

# Use abbreviations
# Specify exact length needed
```

## Cost Monitoring

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

## Model Selection Matrix

| Use Case | Model | Input Cost | Best For |
|----------|-------|------------|----------|
| Simple Q&A | GPT-4o-mini | $0.15/1M | High volume |
| Complex reasoning | GPT-4o | $2.50/1M | Quality critical |
| Long documents | Claude Sonnet | $3/1M | Large context |
| Budget critical | Llama 3 (self-host) | Infrastructure | Cost-sensitive |

## Cost Reduction Checklist

✅ Implement caching (30-50% savings)
✅ Compress prompts (20-40% savings)
✅ Use appropriate model tier (40-60% savings)
✅ Batch requests (10-30% savings)
✅ Set max_tokens (prevent overruns)
✅ Monitor and alert on costs
✅ Use streaming with early stop
✅ Cache embeddings
✅ Implement rate limiting

## Real-World Example

**Before optimization**:
- 10,000 requests/day
- GPT-4o for all
- Avg 1,000 input, 500 output tokens
- Cost: $125/day = $3,750/month

**After optimization**:
- Cache hit rate: 40%
- Prompt compression: 30%
- Model tiering: 60% to mini
- Batching: 20% reduction

**New cost**:
- $37/day = $1,110/month
- **Savings: 70% ($2,640/month)**

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
