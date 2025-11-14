---
title: "Análisis y Reportes Automatizados con IA"
description: "Genera insights y reportes automatizados a partir de datos usando IA"
sidebar:
  order: 75
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---

# Análisis y Reportes con IA

## Generación Automatizada de Insights

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

## Generación Automatizada de Reportes

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

## Narrativa de Dashboard

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

## Reportes Programados con n8n

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

## Mejores Prácticas

✅ **Hacer**:
- Validar insights de IA
- Combinar con análisis tradicional
- Programar reportes regulares
- Incluir fuentes de datos
- Versionar reportes

❌ **No hacer**:
- Confiar ciegamente en IA
- Omitir validación de datos
- Sobre-automatizar decisiones críticas
- Ignorar contexto

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
