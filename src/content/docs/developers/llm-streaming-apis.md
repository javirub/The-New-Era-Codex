---
title: "LLM Streaming APIs: Real-Time Response Generation"
description: "Implement streaming responses for better UX with OpenAI, Anthropic, and open-source LLMs"
sidebar:
  order: 66
  badge:
    text: "LLM Ops"
    variant: caution
version: "1.0"
---

# LLM Streaming APIs: Real-Time Response Generation

## Overview

Streaming allows LLM responses to appear progressively, improving perceived performance and user experience. Essential for production applications.

**Time**: 20 minutes

## Why Streaming?

**Benefits**:
- Better UX (immediate feedback)
- Lower perceived latency
- Ability to stop generation early
- Real-time processing of output

**Use cases**:
- Chatbots
- Content generation
- Code assistants
- Long-form responses

## OpenAI Streaming

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

## Frontend Integration

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

## WebSocket Streaming

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

## Error Handling

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

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
