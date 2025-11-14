---
title: "Automatización de Reuniones con IA: Transcripciones, Resúmenes, Elementos de Acción"
description: "Automatiza flujos de trabajo de reuniones con transcripción de IA, resúmenes inteligentes y seguimiento de acciones"
sidebar:
  badge:
    text: "Bajo"
    variant: note
version: "1.0"
---

# Automatización de Reuniones con IA

## Transcripción de Reuniones en Tiempo Real

```python
import openai
from datetime import datetime
import os

def transcribe_meeting(audio_file_path):
    """Transcribe meeting audio with speaker diarization"""

    with open(audio_file_path, "rb") as audio_file:
        transcript = openai.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )

    return transcript

def format_transcript(transcript):
    """Format transcript with timestamps"""

    formatted = "# Meeting Transcript\n\n"
    formatted += f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"

    for segment in transcript.segments:
        timestamp = format_time(segment.start)
        formatted += f"[{timestamp}] {segment.text}\n"

    return formatted

def format_time(seconds):
    """Convert seconds to MM:SS format"""
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"
```

## Resumen Inteligente de Reuniones

```python
def generate_meeting_summary(transcript_text):
    """Create structured meeting summary"""

    summary_prompt = f"""
    Analyze this meeting transcript and create a comprehensive summary.

    Transcript:
    {transcript_text}

    Provide:
    1. Executive Summary (2-3 sentences)
    2. Key Discussion Points (bullet points)
    3. Decisions Made (if any)
    4. Action Items (with responsible parties if mentioned)
    5. Next Steps
    6. Open Questions/Topics for Follow-up

    Format as markdown.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": summary_prompt}],
        temperature=0.3
    )

    return response.choices[0].message.content
```

## Extracción de Elementos de Acción

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ActionItem:
    task: str
    assignee: Optional[str]
    due_date: Optional[str]
    priority: str
    context: str

def extract_action_items(transcript_text):
    """Extract and structure action items from meeting"""

    action_prompt = f"""
    Extract all action items from this meeting transcript.

    {transcript_text}

    For each action item, identify:
    - task: What needs to be done
    - assignee: Who is responsible (if mentioned)
    - due_date: When it's due (if mentioned)
    - priority: high/medium/low
    - context: Brief context from the discussion

    Return as JSON array.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": action_prompt}],
        response_format={"type": "json_object"}
    )

    data = json.loads(response.choices[0].message.content)

    return [
        ActionItem(**item)
        for item in data.get('action_items', [])
    ]
```

## Auto-Crear Tareas en Gestión de Proyectos

```python
import requests

def create_asana_task(action_item: ActionItem, project_id: str):
    """Create task in Asana from action item"""

    headers = {
        'Authorization': f'Bearer {ASANA_ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }

    # Find assignee
    assignee_gid = find_asana_user(action_item.assignee) if action_item.assignee else None

    task_data = {
        "data": {
            "name": action_item.task,
            "notes": f"Context: {action_item.context}",
            "projects": [project_id],
            "assignee": assignee_gid,
            "due_on": action_item.due_date,
            "custom_fields": {
                "Priority": action_item.priority
            }
        }
    }

    response = requests.post(
        'https://app.asana.com/api/1.0/tasks',
        headers=headers,
        json=task_data
    )

    return response.json()

def sync_action_items_to_asana(action_items, project_id):
    """Sync all action items to Asana"""

    created_tasks = []

    for item in action_items:
        task = create_asana_task(item, project_id)
        created_tasks.append(task)

    return created_tasks
```

## Generador de Actas de Reunión

```python
def generate_meeting_minutes(meeting_data):
    """Generate formal meeting minutes"""

    template_prompt = f"""
    Create formal meeting minutes based on this information:

    Date: {meeting_data['date']}
    Attendees: {', '.join(meeting_data['attendees'])}
    Transcript: {meeting_data['transcript']}

    Format:

    # Meeting Minutes

    **Date**: [date]
    **Attendees**: [list]
    **Absent**: [if mentioned]

    ## Agenda Items
    1. [Item 1]
       - Discussion summary
       - Decision/outcome

    ## Action Items
    - [Task] - [Assignee] - [Due date]

    ## Next Meeting
    - Date: [if mentioned]
    - Topics: [if discussed]

    Use professional, formal language.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": template_prompt}]
    )

    return response.choices[0].message.content
```

## Programador Inteligente de Reuniones

```python
from datetime import datetime, timedelta

def suggest_follow_up_meeting(summary, participant_calendars):
    """Suggest optimal time for follow-up meeting"""

    # Analyze if follow-up needed
    analysis_prompt = f"""
    Based on this meeting summary, determine:
    1. Is a follow-up meeting needed?
    2. How urgent is it?
    3. Suggested duration
    4. Key topics to cover

    Summary: {summary}

    Return as JSON.
    """

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": analysis_prompt}],
        response_format={"type": "json_object"}
    )

    analysis = json.loads(response.choices[0].message.content)

    if not analysis.get('follow_up_needed'):
        return None

    # Find available slots
    available_slots = find_common_availability(
        participant_calendars,
        duration=analysis['duration'],
        urgency=analysis['urgency']
    )

    return {
        'recommended_date': available_slots[0],
        'duration': analysis['duration'],
        'agenda': analysis['topics']
    }
```

## Flujo de Trabajo Completo de Automatización de Reuniones

```python
class MeetingAutomation:
    def __init__(self):
        self.meetings_db = []

    def process_meeting(self, audio_file, meeting_metadata):
        """Complete end-to-end meeting processing"""

        print("📝 Transcribing meeting...")
        transcript = transcribe_meeting(audio_file)

        print("📊 Generating summary...")
        summary = generate_meeting_summary(transcript.text)

        print("✅ Extracting action items...")
        action_items = extract_action_items(transcript.text)

        print("📋 Creating tasks...")
        tasks = sync_action_items_to_asana(
            action_items,
            meeting_metadata['project_id']
        )

        print("📄 Generating meeting minutes...")
        minutes = generate_meeting_minutes({
            'date': meeting_metadata['date'],
            'attendees': meeting_metadata['attendees'],
            'transcript': transcript.text
        })

        # Save everything
        meeting_record = {
            'id': generate_id(),
            'date': meeting_metadata['date'],
            'transcript': transcript.text,
            'summary': summary,
            'action_items': action_items,
            'minutes': minutes,
            'tasks_created': len(tasks)
        }

        self.meetings_db.append(meeting_record)

        # Send to participants
        self.distribute_minutes(meeting_record, meeting_metadata['attendees'])

        return meeting_record

    def distribute_minutes(self, meeting_record, attendees):
        """Send meeting minutes to all participants"""

        email_body = f"""
        Meeting Minutes - {meeting_record['date']}

        {meeting_record['minutes']}

        Full transcript attached.
        {meeting_record['tasks_created']} action items created in Asana.
        """

        for attendee in attendees:
            send_email(attendee, "Meeting Minutes", email_body)
```

## Integración con Zapier

**Flujo de Trabajo Automatizado de Reuniones**:

1. **Trigger**: Grabación de Google Meet/Zoom subida
2. **OpenAI**: Transcribir con Whisper
3. **OpenAI**: Generar resumen + elementos de acción
4. **Asana**: Crear tareas para elementos de acción
5. **Google Docs**: Crear documento de actas de reunión
6. **Gmail**: Enviar actas a los asistentes
7. **Slack**: Publicar resumen en canal del equipo

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
