---
title: "Getting Started with AI Automation"
description: "Learn the basics of no-code AI automation with n8n, Zapier, and Make.com"
sidebar:
  order: 5
  badge:
    text: "Start Here"
    variant: tip
version: "1.1"---

import { Card, CardGrid, LinkCard, Aside } from '@astrojs/starlight/components';

Welcome to AI automation! If you're new to connecting AI with your workflows, start here. These guides will teach you the fundamentals using popular no-code platforms—no programming required.

## What is No-Code AI Automation?

No-code automation platforms let you build powerful AI workflows by connecting apps visually, like building with LEGO blocks. You can:

- Connect AI models (like ChatGPT) to your favorite apps
- Automate repetitive tasks with intelligent decision-making
- Process data, send emails, update databases—all triggered by AI
- Build complex workflows without writing a single line of code

<Aside type="tip" title="No Coding Required">
These platforms use visual interfaces with drag-and-drop nodes. If you can use a spreadsheet, you can build AI automations.
</Aside>

## Popular Platforms

<CardGrid>
  <Card title="n8n" icon="puzzle">
    **Best for**: Complex workflows, self-hosting, developer-friendly

    **Free tier**: Unlimited workflows (self-hosted)

    Open-source and highly flexible. Great for connecting multiple apps with conditional logic.
  </Card>

  <Card title="Zapier" icon="rocket">
    **Best for**: Beginners, quick setup, huge app library

    **Free tier**: 100 tasks/month

    Easiest to learn. 5,000+ app integrations. Perfect for simple automations.
  </Card>

  <Card title="Make (Integromat)" icon="star">
    **Best for**: Visual workflows, data transformation

    **Free tier**: 1,000 operations/month

    Beautiful visual editor. Powerful data mapping. Great for complex scenarios.
  </Card>
</CardGrid>

## Learning Path

<CardGrid>
  <LinkCard
    title="1. Your First AI Workflow with n8n"
    href="/automation/getting-started/first-ai-workflow-n8n"
    description="Build your first AI automation: Connect OpenAI to n8n and create a simple workflow"
  />

  <LinkCard
    title="2. Email Automation with Zapier"
    href="/automation/getting-started/email-automation-zapier"
    description="Automate email responses and classification using AI and Zapier"
  />

  <LinkCard
    title="3. Web Data Extraction with Make"
    href="/automation/getting-started/web-data-extraction-make"
    description="Extract data from websites and process it with AI using Make.com"
  />
</CardGrid>

## Which Platform Should I Choose?

**Choose n8n if you**:
- Want full control and flexibility
- Plan to self-host
- Need complex conditional logic
- Have technical background (helpful but not required)

**Choose Zapier if you**:
- Are completely new to automation
- Want the fastest setup
- Need a specific app integration
- Prefer simplicity over complexity

**Choose Make if you**:
- Love visual interfaces
- Work with lots of data transformation
- Want a balance between power and usability
- Need advanced filtering and routing

<Aside type="note">
You can use multiple platforms! Many professionals use Zapier for simple tasks and n8n for complex workflows.
</Aside>

## What You'll Learn

By completing these getting-started guides, you'll be able to:

- ✅ Connect AI models to automation platforms
- ✅ Build multi-step workflows
- ✅ Handle errors and edge cases
- ✅ Test and debug automations
- ✅ Deploy workflows to production
- ✅ Monitor and maintain automations

## Prerequisites

All you need is:
- A computer with internet access
- Email address (for platform signup)
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- 30-60 minutes per tutorial

## Next Steps

After mastering the basics, explore:

<CardGrid>
  <LinkCard
    title="Chatbots & Assistants"
    href="/automation/chatbots-assistants"
    description="Build conversational AI bots for customer support"
  />

  <LinkCard
    title="Business Automation"
    href="/automation/business-automation"
    description="Automate CRM, calendar, meetings, and more"
  />

  <LinkCard
    title="Document & Data Processing"
    href="/automation/document-data"
    description="Process invoices, documents, and data pipelines"
  />
</CardGrid>

---

**Ready to start?** Begin with [Your First AI Workflow with n8n](/automation/getting-started/first-ai-workflow-n8n) for a gentle introduction.

**Need help?** [Join the community discussions](https://github.com/javirub/The-New-Era-Codex/discussions) or check the [contribution guide](/community/contributing).
