---
title: "Workflow Template Library: Ready-to-Use AI Automations"
description: "10+ exportable workflows for CRM automation, data enrichment, content moderation and more"
sidebar:
  order: 100
  badge:
    text: "Basic"
    variant: tip
version: "1.1"---
## Overview

Collection of production-ready workflow templates you can import and customize for common AI automation use cases.

**What you'll get**: 10+ tested workflows for various platforms (n8n, Zapier, Make.com) ready to import and use.

**Use cases**: CRM automation, content moderation, data enrichment, lead scoring, customer support.

**Time**: 5-10 minutes per template

## Template Categories

### CRM & Sales (3 templates)
### Content & Marketing (3 templates)
### Customer Support (2 templates)
### Data Processing (2 templates)

## Template 1: AI Lead Scorer

**Platform**: n8n or Zapier

**Use case**: Automatically score leads based on profile data

**Flow**:
```
Webhook/CRM Trigger → OpenAI Analysis → Score Calculation → CRM Update → Slack Notify
```

**Setup**:
1. Import JSON template
2. Add your OpenAI API key
3. Connect your CRM
4. Configure scoring criteria

**OpenAI Prompt**:
```
Score this lead 0-100 based on:

Company: {{company}}
Industry: {{industry}}
Size: {{company_size}}
Role: {{job_title}}
Engagement: {{email_opens}}, {{link_clicks}}

Scoring criteria:
- Industry fit (0-30): Tech/SaaS higher
- Company size (0-25): 50-500 employees ideal
- Role (0-25): Director+ higher
- Engagement (0-20): High engagement higher

Return JSON:
{
  "score": 0-100,
  "category": "hot|warm|cold",
  "reasoning": "brief explanation",
  "next_action": "suggested next step"
}
```

**Export**: [Download n8n JSON](#) | [Download Zapier Template](#)

## Template 2: Content Moderation Pipeline

**Platform**: Make.com or n8n

**Use case**: Automatically moderate user-generated content

**Flow**:
```
New Content → OpenAI Toxicity Check → Filter → If Toxic: Flag + Notify | If Clean: Approve + Publish
```

**OpenAI Prompt**:
```
Analyze this content for:
1. Toxicity/harassment
2. Spam/promotional
3. Off-topic
4. Quality issues

Content: {{user_content}}

Return JSON:
{
  "toxic": boolean,
  "spam": boolean,
  "off_topic": boolean,
  "low_quality": boolean,
  "confidence": 0.0-1.0,
  "action": "approve|review|reject"
}
```

**Customization**: Adjust toxicity threshold, add custom rules, integrate with your platform

## Template 3: Email Newsletter Personalizer

**Platform**: Zapier

**Use case**: Generate personalized email content based on user data

**Flow**:
```
Schedule → Get Subscriber List → For Each: OpenAI Personalize → Email Service Send
```

**OpenAI Prompt**:
```
Personalize this newsletter for:

User: {{name}}
Interests: {{interests}}
Past engagement: {{topics_clicked}}
Industry: {{industry}}

Newsletter template:
{{base_newsletter}}

Instructions:
- Adjust intro to mention relevant interest
- Highlight most relevant section
- Add personalized call-to-action
- Keep same structure and length
```

## Template 4: Customer Support Triage

**Platform**: n8n

**Use case**: Classify and route support tickets

**Flow**:
```
New Ticket → OpenAI Classify → Route by Category → Assign to Team → Set Priority
```

**Categories**: Technical, Billing, Feature Request, Bug Report, General

**OpenAI Prompt**:
```
Classify this support ticket:

Subject: {{subject}}
Message: {{message}}
Customer tier: {{tier}}

Classify into:
- technical: Technical issues
- billing: Payment/subscription
- feature: Feature requests
- bug: Bug reports
- general: General questions

Also determine:
- Urgency: high|medium|low
- Sentiment: positive|negative|neutral

Return JSON with category, urgency, sentiment, suggested_response_time
```

## Template 5: Social Media Response Generator

**Platform**: Make.com

**Use case**: Generate contextual responses to social mentions

**Flow**:
```
New Mention → Fetch Context → OpenAI Generate Response → Review Queue → Post
```

**OpenAI Prompt**:
```
Generate response to this social media mention:

Mention: {{mention_text}}
User: {{username}}
Platform: {{platform}}
Our brand voice: Professional, helpful, friendly

Context:
- Previous interactions: {{history}}
- Mention type: {{type}} (question/complaint/praise)

Generate appropriate response that:
- Matches our voice
- Addresses their point
- Includes call-to-action if appropriate
- Under 280 characters for Twitter
```

## Template 6: Data Enrichment Pipeline

**Platform**: n8n

**Use case**: Enrich contact records with AI-generated insights

**Flow**:
```
New Contact → LinkedIn Lookup → OpenAI Analysis → Calculate Fit Score → Update CRM
```

**OpenAI Prompt**:
```
Analyze this profile and provide insights:

Profile data:
- Company: {{company}}
- Role: {{title}}
- Industry: {{industry}}
- Description: {{bio}}

Provide:
1. Seniority level (junior/mid/senior/executive)
2. Decision-making authority (low/medium/high)
3. Likely pain points (list 3)
4. Best approach (email/call/social)
5. Fit score for our product (0-100)

Return structured JSON
```

## Template 7: Meeting Notes Summarizer

**Platform**: Zapier

**Use case**: Auto-generate meeting summaries and action items

**Flow**:
```
Calendar Event Ends → Fetch Recording/Transcript → OpenAI Summarize → Send Email → Update CRM
```

**OpenAI Prompt**:
```
Summarize this meeting:

Transcript: {{transcript}}
Attendees: {{attendees}}
Duration: {{duration}}

Create:
1. Executive summary (3 sentences)
2. Key decisions made
3. Action items with owners
4. Follow-up needed
5. Next meeting date/topic

Format as professional meeting notes
```

## Template 8: Product Review Analyzer

**Platform**: Make.com

**Use case**: Aggregate and analyze product reviews

**Flow**:
```
Schedule → Fetch Reviews → For Each: OpenAI Analyze → Aggregate → Generate Report → Email Team
```

**OpenAI Prompt**:
```
Analyze this product review:

Review: {{review_text}}
Rating: {{stars}}

Extract:
- Sentiment: positive/negative/neutral
- Key themes: list top 3
- Feature mentions: specific features mentioned
- Issue type: bug/feature/usability/performance
- Actionable: boolean (requires follow-up?)

Return structured data
```

## Template 9: Content Calendar Generator

**Platform**: n8n

**Use case**: Generate content ideas and schedule

**Flow**:
```
Schedule Weekly → OpenAI Generate Ideas → Review Filter → Add to Calendar → Notify Team
```

**OpenAI Prompt**:
```
Generate 5 content ideas for next week:

Industry: {{industry}}
Target audience: {{audience}}
Recent trends: {{trends}}
Past top performers: {{top_content}}

For each idea provide:
- Title
- Brief description
- Target keyword
- Format (blog/video/infographic)
- Est. engagement potential (high/medium/low)

Return as JSON array
```

## Template 10: Invoice Data Extractor

**Platform**: Make.com

**Use case**: Extract data from invoice PDFs/images

**Flow**:
```
New Email with Attachment → Download PDF → OpenAI Extract Data → Validate → Add to Spreadsheet
```

**OpenAI Prompt** (with Vision):
```
Extract invoice data from this image:

[Invoice image]

Extract:
- Invoice number
- Date
- Vendor name
- Total amount
- Currency
- Line items (description, quantity, price)
- Payment terms

Return as structured JSON
```

## How to Use Templates

### Step 1: Choose Template

Select template matching your use case

### Step 2: Import

**n8n**: Import JSON via workflow settings
**Zapier**: Use template URL
**Make.com**: Import blueprint

### Step 3: Configure

1. Add API keys (OpenAI, services)
2. Connect your tools
3. Customize prompts
4. Set schedule/triggers

### Step 4: Test

Run with sample data before production

### Step 5: Deploy

Activate and monitor

## Customization Tips

### Adjust Prompts

Modify AI prompts for your:
- Brand voice
- Industry terminology
- Specific requirements
- Language/locale

### Add Logic

Enhance with:
- Additional filters
- Conditional branches
- Error handling
- Notifications

### Scale Up

For production:
- Add monitoring
- Implement error alerts
- Set up logging
- Configure rate limits

## Template Maintenance

### Regular Updates

- Review AI outputs weekly
- Adjust prompts based on results
- Update filters and rules
- Test with new scenarios

### Version Control

- Export updated versions
- Document changes
- Keep changelog
- Share improvements

## Community Templates

Share your templates:
- GitHub repository
- Community forums
- Template marketplaces

## Next Steps

**Start with**:
1. Pick simplest template for your need
2. Test in sandbox environment
3. Gradually customize
4. Roll out to production

**Learn more**:
- [n8n Workflow Guide](/automation/first-ai-workflow-n8n)
- [Zapier Automation](/automation/email-automation-zapier)
- [Make.com Scraping](/automation/web-data-extraction-make)

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
