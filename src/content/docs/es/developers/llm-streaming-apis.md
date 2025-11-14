---
title: "APIs de Streaming de LLM: Generación de Respuestas en Tiempo Real"
description: "Implementa respuestas en streaming para mejor UX con OpenAI, Anthropic y LLMs open-source"
sidebar:
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---

# APIs de Streaming de LLM: Generación de Respuestas en Tiempo Real

## Descripción General

El streaming permite que las respuestas de LLM aparezcan progresivamente, mejorando el rendimiento percibido y la experiencia del usuario. Esencial para aplicaciones en producción.

**Tiempo**: 20 minutos

## ¿Por Qué Streaming?

**Beneficios**:
- Mejor UX (retroalimentación inmediata)
- Menor latencia percibida
- Capacidad de detener generación temprano
- Procesamiento en tiempo real de salida

**Casos de uso**:
- Chatbots
- Generación de contenido
- Asistentes de código
- Respuestas de formato largo

## Streaming de OpenAI

```python
from openai import OpenAI

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Write a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## Server-Sent Events (SSE)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

async def generate_stream(prompt: str):
    stream = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )

    for chunk in stream:
        if chunk.choices[0].delta.content:
            yield f"data: {chunk.choices[0].delta.content}\n\n"
            await asyncio.sleep(0)

@app.get("/stream")
async def stream_endpoint(prompt: str):
    return StreamingResponse(
        generate_stream(prompt),
        media_type="text/event-stream"
    )
```

## Integración Frontend

```javascript
async function streamChat(prompt) {
  const response = await fetch('/stream?prompt=' + encodeURIComponent(prompt));
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const content = line.slice(6);
        displayToken(content);
      }
    }
  }
}
```

## Streaming con WebSocket

```python
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    while True:
        prompt = await websocket.receive_text()

        stream = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )

        for chunk in stream:
            if chunk.choices[0].delta.content:
                await websocket.send_text(chunk.choices[0].delta.content)
```

## Manejo de Errores

```python
async def safe_stream(prompt: str):
    try:
        stream = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            timeout=30
        )

        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    except Exception as e:
        yield f"\n[Error: {str(e)}]"
```

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
