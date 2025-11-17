---
title: "Automatización de Video con IA: Auto-Subtítulos, Resúmenes, Clips"
description: "Automatiza el procesamiento de video con transcripción impulsada por IA, subtítulos y extracción de contenido"
sidebar:
  order: 90
  badge:
    text: "Bajo"
    variant: note
version: "1.0"
---

# Automatización de Video con IA

## Auto-Transcripción con Whisper

```python
import openai
from pathlib import Path

def transcribe_video(video_path):
    with open(video_path, "rb") as video_file:
        transcript = openai.audio.transcriptions.create(
            model="whisper-1",
            file=video_file,
            response_format="verbose_json",
            timestamp_granularities=["word"]
        )

    return transcript

# Usage
result = transcribe_video("meeting.mp4")
print(result.text)
```

## Generación Automática de Subtítulos

```python
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip

def add_subtitles(video_path, transcript, output_path):
    video = VideoFileClip(video_path)
    subtitles = []

    for segment in transcript.words:
        txt_clip = TextClip(
            segment.word,
            fontsize=24,
            color='white',
            bg_color='black',
            size=(video.w, None),
            method='caption'
        ).set_position(('center', 'bottom')).set_start(
            segment.start
        ).set_duration(segment.end - segment.start)

        subtitles.append(txt_clip)

    final = CompositeVideoClip([video] + subtitles)
    final.write_videofile(output_path)
```

## Generación de Resumen de Video

```python
def generate_video_summary(transcript_text):
    summary_prompt = f"""
    Create a concise summary of this video transcript:

    {transcript_text}

    Include:
    - Main topics (3-5 bullet points)
    - Key takeaways
    - Action items (if any)

    Keep it under 200 words.
    """

    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": summary_prompt}]
    )

    return response.choices[0].message.content
```

## Extracción Automática de Clips

```python
def extract_highlights(video_path, transcript):
    """Extract key moments from video"""

    # Identify important segments
    analysis_prompt = f"""
    Analyze this transcript and identify the 3 most important segments.
    Return timestamps in format: [start_time, end_time, description]

    Transcript: {transcript.text}
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": analysis_prompt}]
    )

    highlights = parse_highlights(response.choices[0].message.content)

    # Extract clips
    video = VideoFileClip(video_path)
    clips = []

    for i, (start, end, desc) in enumerate(highlights):
        clip = video.subclip(start, end)
        clip.write_videofile(f"highlight_{i+1}.mp4")
        clips.append({"file": f"highlight_{i+1}.mp4", "description": desc})

    return clips
```

## Procesamiento por Lotes de Video

```python
from concurrent.futures import ThreadPoolExecutor

def process_video_library(folder_path):
    video_files = list(Path(folder_path).glob("*.mp4"))

    def process_single(video_path):
        # Transcribe
        transcript = transcribe_video(str(video_path))

        # Generate summary
        summary = generate_video_summary(transcript.text)

        # Add subtitles
        output_path = video_path.with_name(f"{video_path.stem}_subtitled.mp4")
        add_subtitles(str(video_path), transcript, str(output_path))

        # Save metadata
        metadata = {
            "file": video_path.name,
            "transcript": transcript.text,
            "summary": summary,
            "duration": transcript.duration
        }

        return metadata

    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(process_single, video_files))

    return results
```

## Flujo de Trabajo de Video con n8n

```json
{
  "nodes": [
    {
      "name": "Watch Folder",
      "type": "n8n-nodes-base.localFileTrigger",
      "parameters": {
        "path": "/videos/inbox",
        "event": "add"
      }
    },
    {
      "name": "Transcribe with Whisper",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "transcribe",
        "binaryPropertyName": "data"
      }
    },
    {
      "name": "Generate Summary",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "message",
        "text": "Summarize: {{ $json.text }}"
      }
    },
    {
      "name": "Save to Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "videos"
      }
    }
  ]
}
```

## Casos de Uso

- **Grabaciones de reuniones**: Auto-transcribir + resumir
- **Creación de contenido**: Extraer clips destacados
- **Accesibilidad**: Agregar subtítulos a todos los videos
- **Biblioteca de video**: Transcripciones buscables
- **Materiales de formación**: Generar resúmenes

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
