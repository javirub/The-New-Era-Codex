---
title: "Building Multimodal AI Applications: Text, Image, Audio"
description: "Create apps that process multiple data types with GPT-4o, Claude, and Gemini"
sidebar:
  order: 90
  badge:
    text: "Advanced"
    variant: danger
version: "1.0"
---

# Building Multimodal AI Applications

## Overview

Multimodal AI processes multiple types of input (text, images, audio, video) to create richer applications.

**Time**: 25 minutes

## Vision: Image Understanding

### GPT-4o Vision

```python
from openai import OpenAI
import base64

client = OpenAI()

def analyze_image(image_path, question):
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode()
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": question},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }]
    )
    
    return response.choices[0].message.content

# Use cases
analyze_image("receipt.jpg", "Extract all items and prices as JSON")
analyze_image("chart.png", "What trends do you see?")
analyze_image("diagram.jpg", "Explain this architecture")
```

### Claude Vision

```python
import anthropic
import base64

client = anthropic.Anthropic()

def analyze_with_claude(image_path, prompt):
    with open(image_path, "rb") as image_file:
        image_data = base64.standard_b64encode(image_file.read()).decode()
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_data,
                    }
                },
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        }]
    )
    
    return message.content[0].text
```

## Audio: Speech Recognition & Generation

### Whisper (Speech-to-Text)

```python
def transcribe_audio(audio_path):
    with open(audio_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en"
        )
    return transcript.text

# With timestamps
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    response_format="verbose_json",
    timestamp_granularities=["word"]
)
```

### Text-to-Speech

```python
def generate_speech(text, voice="alloy"):
    response = client.audio.speech.create(
        model="tts-1",
        voice=voice,  # alloy, echo, fable, onyx, nova, shimmer
        input=text
    )
    
    response.stream_to_file("output.mp3")
```

## Complete Multimodal Pipeline

```python
class MultimodalAssistant:
    def __init__(self):
        self.client = OpenAI()
    
    def process_voice_query_with_image(self, audio_path, image_path):
        # 1. Transcribe audio
        transcript = self.transcribe_audio(audio_path)
        print(f"User said: {transcript}")
        
        # 2. Analyze image with text query
        response = self.analyze_image(image_path, transcript)
        print(f"Analysis: {response}")
        
        # 3. Generate audio response
        self.generate_speech(response)
        
        return response
    
    def transcribe_audio(self, audio_path):
        with open(audio_path, "rb") as f:
            return self.client.audio.transcriptions.create(
                model="whisper-1",
                file=f
            ).text
    
    def analyze_image(self, image_path, question):
        with open(image_path, "rb") as f:
            base64_image = base64.b64encode(f.read()).decode()
        
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    }
                ]
            }]
        )
        return response.choices[0].message.content
    
    def generate_speech(self, text):
        response = self.client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=text
        )
        response.stream_to_file("response.mp3")

# Usage
assistant = MultimodalAssistant()
assistant.process_voice_query_with_image("question.mp3", "chart.png")
```

## Use Cases

### Document Analysis
```python
def analyze_document(image_path):
    return analyze_image(
        image_path,
        """Extract from this document:
        - Document type
        - Key information
        - Action items
        Return as JSON"""
    )
```

### Accessibility
```python
def describe_for_blind_user(image_path):
    description = analyze_image(
        image_path,
        "Describe this image in detail for a visually impaired person"
    )
    generate_speech(description)
```

### Visual Q&A
```python
def visual_qa_bot(image_path, question):
    answer = analyze_image(image_path, question)
    return answer
```

## Best Practices

✅ **Do**:
- Optimize image size (max 20MB)
- Use appropriate quality settings
- Handle errors gracefully
- Cache results when possible
- Consider privacy implications

❌ **Don't**:
- Send sensitive images without consent
- Assume 100% accuracy
- Skip input validation
- Ignore rate limits

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
