---
title: "Your First AI Workflow with n8n"
description: "Visual guide to connect OpenAI to n8n and create simple AI-powered automation flows"
sidebar:
  badge:
    text: "Basic"
    variant: tip
version: "1.0"
---

# Your First AI Workflow with n8n

## Overview

n8n is a powerful workflow automation tool that lets you connect AI models like OpenAI's GPT to hundreds of apps without code. Build smart automations visually with a drag-and-drop interface.

**What you'll build**: An AI-powered content moderation workflow that automatically analyzes user submissions and routes them based on sentiment.

**Use cases**: Content moderation, email auto-responses, data enrichment, customer support triage.

**Time**: 30 minutes

## Prerequisites

- n8n account (free at [n8n.cloud](https://n8n.cloud)) or self-hosted installation
- OpenAI API key
- Basic understanding of automation concepts

## Setting Up n8n

### Option 1: Cloud (Easiest)

1. Go to [n8n.cloud](https://n8n.cloud)
2. Create free account
3. Access your workflow editor

### Option 2: Self-Hosted (Docker)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Access at `http://localhost:5678`

## Connecting OpenAI to n8n

### Step 1: Add OpenAI Credentials

1. Click **Settings** > **Credentials**
2. Click **Add Credential**
3. Search "OpenAI"
4. Enter your API key
5. Test connection
6. Save

### Step 2: Create Your First Workflow

**Workflow: AI Content Analyzer**

**Components**:
1. **Webhook** - Receives content submissions
2. **OpenAI** - Analyzes sentiment
3. **IF** - Routes based on result
4. **HTTP Request** - Sends to appropriate endpoint

### Building the Workflow

**1. Add Webhook Trigger**

- Drag "Webhook" node to canvas
- Set path: `/analyze-content`
- Method: POST
- Click "Listen for test event"

**2. Add OpenAI Node**

- Search "OpenAI" and add node
- Connect to webhook
- Select credential
- Operation: "Message a Model"
- Model: `gpt-4o-mini`
- Prompt:
```
Analyze this content for sentiment and toxicity:

Content: {{$json.body.content}}

Return JSON with format:
{
  "sentiment": "positive|negative|neutral",
  "toxic": boolean,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}
```

**3. Add IF Node**

- Connect to OpenAI node
- Condition: `{{$json.toxic}} === true`
- True branch: Flag for review
- False branch: Approve

**4. Add Action Nodes**

For True (toxic content):
- HTTP Request node
- URL: Your moderation endpoint
- Method: POST
- Body: `{{$json}}`

For False (clean content):
- HTTP Request node
- URL: Your approval endpoint
- Method: POST
- Body: `{{$json}}`

### Testing the Workflow

1. Click **Execute Workflow**
2. Send test data via webhook:

```bash
curl -X POST http://localhost:5678/webhook/analyze-content \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a great product!"}'
```

3. Check execution log
4. Verify correct routing

## Common n8n + AI Patterns

### Pattern 1: Email Auto-Responder

```
Gmail Trigger → OpenAI (Draft Response) → IF (Confident?) → Gmail (Send)
```

### Pattern 2: Data Enrichment

```
Database Trigger → OpenAI (Analyze) → Update Record → Slack Notify
```

### Pattern 3: Content Generation

```
Scheduler → OpenAI (Generate) → Format → Post to CMS
```

## Best Practices

### 1. Error Handling

Add "Error Trigger" node:
- Catches workflow failures
- Logs to monitoring system
- Sends alerts

### 2. Rate Limiting

Use "Wait" node between API calls to avoid rate limits.

### 3. Cost Control

Monitor OpenAI usage:
- Set max tokens
- Use cheaper models for simple tasks
- Cache frequent requests

### 4. Testing

- Test with sample data first
- Use n8n's test execution mode
- Monitor costs during testing

## Example Workflows

### Email Sentiment Analysis

```
Gmail Trigger
  ↓
OpenAI (Analyze Sentiment)
  ↓
IF (Urgent + Negative?)
  ↓ Yes          ↓ No
Slack Alert   Label Email
```

### Social Media Monitor

```
Twitter Trigger (New Mentions)
  ↓
OpenAI (Classify Intent)
  ↓
Switch (Intent Type)
  ↓ Question    ↓ Complaint    ↓ Praise
  OpenAI Reply  Alert Team    Thank User
```

## Troubleshooting

**Issue**: OpenAI timeout
- Increase timeout in HTTP Request settings
- Use shorter prompts
- Check API status

**Issue**: Webhook not receiving data
- Verify webhook URL is correct
- Check firewall settings
- Test with curl first

**Issue**: High costs
- Use `gpt-4o-mini` instead of `gpt-4o`
- Add caching layer
- Limit workflow triggers

## Next Steps

**Learn more**:
- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Workflows](https://n8n.io/workflows/)
- [OpenAI Best Practices](/developers/prompt-engineering-developers)

**Advanced workflows**:
- Multi-step AI reasoning chains
- Custom function nodes
- Sub-workflows for reusability

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
