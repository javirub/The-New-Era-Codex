---
title: "AI-Powered Analytics & Automated Reporting"
description: "Generate insights and automated reports from data using AI"
sidebar:
  order: 75
  badge:
    text: "Intermediate"
    variant: caution
version: "1.0"
---

# AI-Powered Analytics & Reporting

## Automated Insights Generation

```python
import pandas as pd
from openai import OpenAI

client = OpenAI()

def generate_insights(df):
    # Get data summary
    summary = {
        'shape': df.shape,
        'columns': df.columns.tolist(),
        'describe': df.describe().to_dict(),
        'correlations': df.corr().to_dict()
    }
    
    prompt = f"""Analyze this data and provide 5 key insights:
    
    Data summary: {summary}
    
    Focus on:
    - Trends
    - Anomalies
    - Correlations
    - Actionable findings
    """
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content
```

## Automated Report Generation

```python
def generate_weekly_report(data):
    insights = generate_insights(data)
    
    report_prompt = f"""Create executive summary:
    
    Data period: Last 7 days
    Key metrics:
    - Total sales: ${data['sales'].sum():,.2f}
    - Orders: {len(data)}
    - Avg order: ${data['sales'].mean():.2f}
    
    AI insights: {insights}
    
    Format as:
    # Executive Summary
    ## Highlights
    ## Insights
    ## Recommendations
    """
    
    report = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": report_prompt}]
    )
    
    return report.choices[0].message.content
```

## Dashboard Narrative

```python
def create_dashboard_narrative(metrics):
    prompt = f"""Write dashboard summary:
    
    Metrics:
    - Revenue: ${metrics['revenue']:,.0f} ({metrics['revenue_change']:+.1f}%)
    - Users: {metrics['users']:,} ({metrics['user_change']:+.1f}%)
    - Churn: {metrics['churn']:.1f}% ({metrics['churn_change']:+.1f}%)
    
    Explain what's happening in 2-3 sentences.
    """
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content
```

## Scheduled Reporting with n8n

```json
{
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.schedule",
      "parameters": {
        "rule": {
          "interval": [{"field": "cronExpression", "value": "0 9 * * 1"}]
        }
      }
    },
    {
      "name": "Fetch Data",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT * FROM sales WHERE date >= NOW() - INTERVAL '7 days'"
      }
    },
    {
      "name": "AI Analysis",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "message",
        "text": "Analyze and summarize: {{$json}}"
      }
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "subject": "Weekly Report",
        "body": "={{$json.choices[0].message.content}}"
      }
    }
  ]
}
```

## Best Practices

✅ **Do**:
- Validate AI insights
- Combine with traditional analytics
- Schedule regular reports
- Include data sources
- Version reports

❌ **Don't**:
- Trust AI blindly
- Skip data validation
- Over-automate critical decisions
- Ignore context

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
