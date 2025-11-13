---
title: "Automation Guide Template"
description: "Template for creating no-code/low-code workflow guides for n8n, Zapier, and Make.com"
sidebar:
  badge:
    text: "Template"
    variant: tip
---

# [Workflow Name - Be Descriptive and Action-Oriented]

<!-- Example: "Create an AI-Powered Email Classifier in n8n" -->

## What You'll Build

By the end of this guide, your workflow will automatically:
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]
- [End result]

**Time to complete**: [Realistic estimate, e.g., "15-20 minutes"]

**Difficulty**: [Beginner/Intermediate/Advanced]

**Platform**: [n8n/Zapier/Make.com]

<!-- Include a screenshot or diagram of the final workflow -->
<!-- ![Final workflow diagram](../../assets/workflow-final.png) -->
**[Add a screenshot of your completed workflow here]**

## Before You Start

You'll need:
- [ ] [Platform name] account ([Link to sign up - mention free tier if available])
- [ ] [Service 1] account (e.g., Gmail)
- [ ] [Service 2] API key (e.g., OpenAI - [link to get API key])
- [ ] [Optional tool or account]

**Cost estimate**: [e.g., "Free tier works fine. OpenAI costs ~$0.10 per 100 emails processed"]

## How It Works

**The workflow in plain English**:

1. [Platform] checks for [trigger event, e.g., "new email"]
2. It sends the [data] to [AI service]
3. The AI [does something, e.g., "classifies the email"]
4. Based on the result, it [takes action, e.g., "applies a label"]
5. Finally, it [optional step, e.g., "sends a Slack notification"]

**Why this is useful**: [Real-world benefit, e.g., "Save 2 hours per day on email triage"]

## Step 1: Create a New Workflow

1. Log in to [platform name]
2. Click **"New Workflow"** in the top right corner
3. Give it a name: `[Suggested workflow name]`

<!-- Screenshot showing where to click, with numbered annotations -->
<!-- ![Create new workflow](../../assets/step-1-create.png) -->
**[Add screenshot showing where to click]**

## Step 2: Add the Trigger

**What we're doing**: Setting up [what triggers the workflow]

1. Click anywhere on the canvas to add your first node
2. In the search box, type **"[Trigger name]"** (e.g., "Gmail Trigger")
3. Select **"[Exact node name]"** from the results

<!-- Screenshot with arrows pointing to exact UI elements -->
<!-- ![Add trigger node](../../assets/step-2-trigger.png) -->
**[Add screenshot with arrows pointing to UI elements]**

### Configure the Trigger

1. Click **"Sign in with [Service]"** to connect your account
2. In the **Event** dropdown, select **"[Event type]"** (e.g., "Message Received")
3. Set **[Setting name]** to **"[Value]"** (e.g., "Poll Times" to "Every 5 minutes")
4. Click **"Execute Node"** to test the connection

<!-- Screenshot of configuration panel with important fields highlighted -->
<!-- ![Configure trigger](../../assets/step-2-config.png) -->
**[Add screenshot of configuration panel]**

**What this does**: [Explain in plain language what this trigger monitors and when it fires]

**Troubleshooting**:
- **Can't connect account?** Make sure you're logged into [Service] in another tab
- **No test data appearing?** Send yourself a test email and click "Execute Node" again

## Step 3: Add [Next Node]

**What we're doing**: [Explain the purpose of this node]

1. Click the **+** button on the right side of your trigger node
2. Search for **"[Node name]"**
3. Select **"[Full node name]"**

<!-- Visual showing where the + button is -->
<!-- ![Add next node](../../assets/step-3-add.png) -->
**[Add screenshot showing the + button location]**

### Configure [Node Name]

Fill in these fields:

| Field | Value | What it does |
|-------|-------|--------------|
| **[Field 1]** | `[Value or variable]` | [Explanation] |
| **[Field 2]** | `[Value]` | [Explanation] |
| **[Field 3]** | Click "Add Field" → Select "[Option]" | [Explanation] |

**Using data from previous steps**:

To use the email subject from Step 2:
1. Click in the **[Field name]** box
2. Click the **variable icon** (looks like a tag)
3. Navigate to: **[Path to variable]** → **[Variable name]**
4. Select it to insert: `{{ $json.subject }}`

<!-- Screenshot showing the variable picker -->
<!-- ![Select variable](../../assets/step-3-variable.png) -->
**[Add screenshot of variable picker]**

**Example configuration**:
```
Prompt: Classify this email into one of these categories: Urgent, Important, Marketing, or Spam.

Email subject: {{ $json.subject }}
Email body: {{ $json.body }}

Return only the category name.
```

### Test This Node

1. Click **"Execute Node"**
2. You should see output like: `"Important"`

<!-- Screenshot of successful test output -->
<!-- ![Test output](../../assets/step-3-test.png) -->
**[Add screenshot of successful test output]**

**Troubleshooting**:
- **Error: "Missing API key"?** Check that you added your API key in Step 2
- **Getting weird results?** Make sure your prompt is clear and specific

## Step 4: [Continue with Additional Steps]

<!-- Repeat the pattern above for each node in your workflow:
- What we're doing
- How to add the node
- Configuration details with visuals
- Testing instructions
- Troubleshooting common issues
-->

## Step 5: Add Decision Logic (If/Else)

**What we're doing**: Taking different actions based on the AI's classification

1. Add an **"IF"** node after your [previous node]
2. Click **"Add Condition"**
3. Configure like this:
   - **Value 1**: `{{ $json.category }}` (from previous node)
   - **Operation**: `Equal`
   - **Value 2**: `Urgent`

<!-- Diagram showing the IF node branching -->
<!-- ![IF node configuration](../../assets/step-5-if.png) -->
**[Add screenshot of IF node configuration]**

### True Branch: Handle Urgent Emails

If the condition is TRUE (email is Urgent):

1. Click the **"true"** output and add a **"[Action Node]"** (e.g., "Gmail")
2. Configure the action:
   - **Operation**: "Add Label"
   - **Label**: "URGENT"
   - **Message ID**: `{{ $json.messageId }}`

### False Branch: Handle Other Emails

If the condition is FALSE:

1. Click the **"false"** output and add a **"[Different Action]"**
2. Configure for normal processing

<!-- Visual showing both branches -->
<!-- ![Complete branching](../../assets/step-5-branches.png) -->
**[Add screenshot showing both branches]**

## Step 6: Activate Your Workflow

**Almost done!** Let's turn it on.

1. Click the toggle switch in the top right to **"Active"**
2. The switch should turn green

<!-- Screenshot showing the active toggle -->
<!-- ![Activate workflow](../../assets/step-6-activate.png) -->
**[Add screenshot showing the active toggle]**

**What happens now**: [Explain when the workflow runs and what triggers it]

## Testing Your Workflow

### Manual Test

1. [Trigger action, e.g., "Send yourself a test email"]
2. Wait [time interval]
3. Check that [expected result happened]

### Check Execution History

1. Go to **Executions** in the left sidebar
2. You should see your workflow runs
3. Click on any execution to see details

<!-- Screenshot of execution history -->
<!-- ![Execution history](../../assets/test-executions.png) -->
**[Add screenshot of execution history]**

**Green checkmark** = Success!
**Red X** = Error (click to see details)

## Customizing Your Workflow

**Ideas to make it better**:

- **Add more categories**: Update your AI prompt with categories like "Newsletter", "Meeting Request"
- **Send notifications**: Add a Slack or Discord node to alert you about urgent emails
- **Add filtering**: Use an IF node at the start to only process emails from specific senders
- **Schedule reports**: Add a Cron trigger to send a daily summary

## Troubleshooting

### Workflow isn't running

**Check**:
- [ ] Is the workflow active? (Toggle in top right should be green)
- [ ] Is the trigger configured correctly? (Click "Execute Node" to test)
- [ ] Check execution history for errors

### AI returning unexpected results

**Fix**:
- Make your prompt more specific
- Add examples to the prompt: "For example: 'Meeting tomorrow' = Urgent"
- Test with the "Execute Node" button to iterate quickly

### Node showing an error

Common fixes:
- **Authentication errors**: Reconnect your account in the credentials panel
- **Missing data**: Check that previous nodes ran successfully
- **Rate limits**: Add a delay between nodes or reduce polling frequency

**Still stuck?**
- Check [platform name]'s [community forum link]
- Search their [documentation link]
- [Platform Discord/Slack if available]

## What You've Learned

- ✅ How to set up a trigger in [platform]
- ✅ How to connect [service 1] and [service 2]
- ✅ How to use AI for [task]
- ✅ How to add conditional logic with IF nodes
- ✅ How to test and activate workflows

## Download This Workflow

**Want to skip the setup?** Download the complete workflow:

<!-- [Download workflow.json](../../assets/workflow-export.json) -->
**[Add link to your workflow export file here]**

**To import**:
1. Click **"Import from File"** in [platform]
2. Select the downloaded file
3. Update credentials with your API keys
4. Activate!

## Next Steps

**Build on this workflow**:
- [Related workflow idea 1]
- [Related workflow idea 2]

**Related guides**:
- [Link to similar automation guide]
- [Link to related topic]

**Join the community**:
- [[Platform] Community Forum](link)
- [[Platform] Discord](link)
- [Share your workflow in the community]

---

**Questions about this guide?** [Open a discussion](https://github.com/javirub/The-New-Era-Codex/discussions)

**Found an issue?** [Report it here](https://github.com/javirub/The-New-Era-Codex/issues)
