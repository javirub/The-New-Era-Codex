---
title: "Inicio Rápido de APIs de IA: OpenAI, Anthropic, Google"
description: "Referencia rápida para autenticación, uso básico y patrones comunes de las principales APIs de IA"
sidebar:
  badge:
    text: "Referencia"
    variant: note
version: "1.0"
---

# Inicio Rápido de APIs de IA

## API de OpenAI

### Configuración
```python
pip install openai
```

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")
```

### Chat Básico
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

### Streaming (Transmisión)
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

### Embeddings (Incrustaciones)
```python
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)

embedding = response.data[0].embedding
```

## API de Anthropic Claude

### Configuración
```python
pip install anthropic
```

```python
from anthropic import Anthropic

client = Anthropic(api_key="your-api-key")
```

### Uso Básico
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

### Streaming (Transmisión)
```python
with client.messages.stream(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Tell me a story"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## API de Google Gemini

### Configuración
```python
pip install google-generativeai
```

```python
import google.generativeai as genai

genai.configure(api_key="your-api-key")
model = genai.GenerativeModel('gemini-pro')
```

### Uso Básico
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

## Patrones Comunes

### Manejo de Errores
```python
from openai import OpenAIError

try:
    response = client.chat.completions.create(...)
except OpenAIError as e:
    print(f"API error: {e}")
```

### Limitación de Tasa
```python
import time
from tenacity import retry, wait_exponential, stop_after_attempt

@retry(wait=wait_exponential(min=1, max=60), stop=stop_after_attempt(3))
def call_api():
    return client.chat.completions.create(...)
```

### Uso Asíncrono (OpenAI)
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

## Referencia Rápida de Precios

### OpenAI (por 1M de tokens)
- GPT-4o: $2.50 entrada / $10 salida
- GPT-4o-mini: $0.15 entrada / $0.60 salida
- text-embedding-3-small: $0.02

### Anthropic (por 1M de tokens)
- Claude 3.5 Sonnet: $3 entrada / $15 salida
- Claude 3 Haiku: $0.25 entrada / $1.25 salida

### Google Gemini (por 1M de tokens)
- Gemini 1.5 Pro: $1.25 entrada / $5 salida (128k)
- Gemini 1.5 Flash: $0.075 entrada / $0.30 salida

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
