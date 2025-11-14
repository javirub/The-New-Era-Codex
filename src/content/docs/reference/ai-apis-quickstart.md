---
title: "AI APIs Quick Start: OpenAI, Anthropic, Google"
description: "Quick reference for major AI API authentication, basic usage, and common patterns"
sidebar:
  badge:
    text: "Reference"
    variant: note
version: "1.0"
---

# AI APIs Quick Start

## OpenAI API

### Setup
```python
pip install openai
```

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")
```

### Basic Chat
```python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### Streaming
```python
stream = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Write a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Embeddings
```python
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)

embedding = response.data[0].embedding
```

## Anthropic Claude API

### Setup
```python
pip install anthropic
```

```python
from anthropic import Anthropic

client = Anthropic(api_key="your-api-key")
```

### Basic Usage
```python
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(message.content[0].text)
```

### Streaming
```python
with client.messages.stream(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Tell me a story"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Google Gemini API

### Setup
```python
pip install google-generativeai
```

```python
import google.generativeai as genai

genai.configure(api_key="your-api-key")
model = genai.GenerativeModel('gemini-pro')
```

### Basic Usage
```python
response = model.generate_content("Hello!")
print(response.text)
```

### Chat
```python
chat = model.start_chat(history=[])
response = chat.send_message("Hello!")
print(response.text)
```

## Common Patterns

### Error Handling
```python
from openai import OpenAIError

try:
    response = client.chat.completions.create(...)
except OpenAIError as e:
    print(f"API error: {e}")
```

### Rate Limiting
```python
import time
from tenacity import retry, wait_exponential, stop_after_attempt

@retry(wait=wait_exponential(min=1, max=60), stop=stop_after_attempt(3))
def call_api():
    return client.chat.completions.create(...)
```

### Async Usage (OpenAI)
```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def main():
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)

asyncio.run(main())
```

## Pricing Quick Reference

### OpenAI (per 1M tokens)
- GPT-4o: $2.50 input / $10 output
- GPT-4o-mini: $0.15 input / $0.60 output
- text-embedding-3-small: $0.02

### Anthropic (per 1M tokens)
- Claude 3.5 Sonnet: $3 input / $15 output
- Claude 3 Haiku: $0.25 input / $1.25 output

### Google Gemini (per 1M tokens)
- Gemini 1.5 Pro: $1.25 input / $5 output (128k)
- Gemini 1.5 Flash: $0.075 input / $0.30 output

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
