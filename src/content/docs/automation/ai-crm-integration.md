---
title: "AI CRM Integration: Automate Contact Management & Follow-ups"
description: "Integrate AI with Salesforce, HubSpot, and Pipedrive for intelligent CRM automation"
sidebar:
  badge:
    text: "Intermediate"
    variant: caution
version: "1.0"
---

# AI CRM Integration

## Use Cases

1. **Lead enrichment**: Auto-fill contact data
2. **Email generation**: Personalized outreach
3. **Meeting summaries**: Auto-update CRM
4. **Next best action**: AI recommendations
5. **Sentiment analysis**: Prioritize hot leads

## HubSpot + AI

### Zapier Workflow
```
Trigger: New contact in HubSpot
→ ChatGPT: Generate personalized email
→ HubSpot: Create email task
→ Slack: Notify sales rep
```

### API Integration
```python
import requests
from openai import OpenAI

HUBSPOT_API_KEY = "your-key"
client = OpenAI()

def enrich_contact(contact_id):
    # Get contact from HubSpot
    contact = get_hubspot_contact(contact_id)
    
    # AI enrichment
    prompt = f"""Based on this info, suggest:
    - Industry
    - Company size
    - Pain points
    - Best approach
    
    Contact: {contact['company']}, {contact['title']}
    """
    
    suggestions = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content
    
    # Update HubSpot
    update_hubspot_contact(contact_id, {"notes": suggestions})
```

## Salesforce + AI

### Einstein Integration
- Built-in AI features
- Lead scoring
- Opportunity insights

### Custom AI
```python
from simple_salesforce import Salesforce

sf = Salesforce(username='...', password='...', security_token='...')

def ai_lead_scoring(lead_id):
    lead = sf.Lead.get(lead_id)
    
    score_prompt = f"""Score this lead (0-100):
    Company: {lead['Company']}
    Industry: {lead['Industry']}
    Title: {lead['Title']}
    Engagement: {lead['Email_Opens__c']} opens
    """
    
    score = get_ai_score(score_prompt)
    
    # Update Salesforce
    sf.Lead.update(lead_id, {'AI_Score__c': score})
```

## Pipedrive + AI

### n8n Workflow
```json
{
  "nodes": [
    {
      "name": "Pipedrive Trigger",
      "type": "n8n-nodes-base.pipedriveTrigger",
      "webhookId": "new_deal"
    },
    {
      "name": "AI Analysis",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "message",
        "text": "Analyze this deal and suggest next steps: {{$json.title}}"
      }
    },
    {
      "name": "Update Pipedrive",
      "type": "n8n-nodes-base.pipedrive",
      "parameters": {
        "operation": "update",
        "resource": "deal",
        "notes": "={{$json.choices[0].message.content}}"
      }
    }
  ]
}
```

## Meeting Transcription → CRM

```python
def meeting_to_crm(audio_file, deal_id):
    # Transcribe
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file
    )
    
    # Extract action items
    analysis = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"""Extract from meeting:
            - Key discussion points
            - Action items (who, what, when)
            - Next meeting date
            - Deal stage recommendation
            
            Transcript: {transcript.text}"""
        }]
    )
    
    # Update CRM
    update_deal(deal_id, analysis.choices[0].message.content)
```

## Smart Follow-ups

```python
def generate_followup(contact_id, last_interaction):
    context = get_contact_history(contact_id)
    
    email = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"""Write follow-up email:
            Contact: {context['name']} at {context['company']}
            Last interaction: {last_interaction}
            Their interest: {context['notes']}
            Our product: {product_description}
            
            Goal: Move to next stage
            Tone: Professional, helpful
            Length: <150 words"""
        }]
    )
    
    return email.choices[0].message.content
```

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
