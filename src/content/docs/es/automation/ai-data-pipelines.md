---
title: "Pipelines de Datos con IA: ETL con Inteligencia"
description: "Construye pipelines de datos inteligentes que limpian, enriquecen y transforman datos automáticamente"
sidebar:
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---

# Pipelines de Datos con IA

## ETL Tradicional vs Mejorado con IA

**ETL Tradicional**:
```
Extraer → Transformar (reglas) → Cargar
```

**ETL Mejorado con IA**:
```
Extraer → IA Limpia/Clasifica → IA Enriquece → Transformar → Cargar
```

## Limpieza de Datos con IA

```python
def ai_clean_address(raw_address):
    prompt = f"""Clean and standardize this address:
    Input: {raw_address}

    Output format:
    {{
      "street": "...",
      "city": "...",
      "state": "...",
      "zip": "...",
      "country": "..."
    }}"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)
```

## Clasificación de Datos

```python
def classify_text(text, categories):
    prompt = f"""Classify this text into one category:
    Categories: {', '.join(categories)}
    Text: {text}

    Return only the category name."""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()

# Batch processing
def classify_batch(texts, categories):
    results = []
    for i in range(0, len(texts), 20):  # Batch of 20
        batch = texts[i:i+20]
        # Process batch...
        results.extend(batch_results)
    return results
```

## Pipeline de Enriquecimiento de Datos

```python
import pandas as pd

class AIDataEnricher:
    def __init__(self):
        self.client = OpenAI()

    def enrich_company_data(self, df):
        """Enrich company dataframe with AI"""

        # 1. Standardize names
        df['company_clean'] = df['company'].apply(self.clean_company_name)

        # 2. Infer industry
        df['industry'] = df['company_clean'].apply(self.infer_industry)

        # 3. Estimate size
        df['size_estimate'] = df.apply(self.estimate_company_size, axis=1)

        return df

    def clean_company_name(self, name):
        # Remove LLC, Inc, etc.
        prompt = f"Clean company name: {name}"
        return self.call_llm(prompt)

    def infer_industry(self, company):
        prompt = f"What industry is {company} in? One word answer."
        return self.call_llm(prompt)

    def estimate_company_size(self, row):
        prompt = f"""Estimate employee count category:
        Company: {row['company_clean']}
        Industry: {row['industry']}

        Options: 1-10, 11-50, 51-200, 201-500, 500+"""
        return self.call_llm(prompt)
```

## Airflow + Pipeline de IA

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def extract_data(**context):
    # Extract from source
    data = fetch_from_api()
    context['ti'].xcom_push(key='raw_data', value=data)

def ai_clean_data(**context):
    data = context['ti'].xcom_pull(key='raw_data')

    # AI cleaning
    cleaned = []
    for record in data:
        cleaned_record = ai_clean_record(record)
        cleaned.append(cleaned_record)

    context['ti'].xcom_push(key='cleaned_data', value=cleaned)

def ai_enrich_data(**context):
    data = context['ti'].xcom_pull(key='cleaned_data')

    # AI enrichment
    enriched = []
    for record in data:
        enriched_record = ai_enrich_record(record)
        enriched.append(enriched_record)

    context['ti'].xcom_push(key='enriched_data', value=enriched)

def load_data(**context):
    data = context['ti'].xcom_pull(key='enriched_data')
    save_to_database(data)

# DAG definition
dag = DAG(
    'ai_data_pipeline',
    start_date=datetime(2024, 1, 1),
    schedule_interval='@daily'
)

extract = PythonOperator(task_id='extract', python_callable=extract_data, dag=dag)
clean = PythonOperator(task_id='clean', python_callable=ai_clean_data, dag=dag)
enrich = PythonOperator(task_id='enrich', python_callable=ai_enrich_data, dag=dag)
load = PythonOperator(task_id='load', python_callable=load_data, dag=dag)

extract >> clean >> enrich >> load
```

## Pipeline de Streaming en Tiempo Real

```python
from kafka import KafkaConsumer, KafkaProducer
import json

consumer = KafkaConsumer('raw_events', bootstrap_servers=['localhost:9092'])
producer = KafkaProducer(bootstrap_servers=['localhost:9092'])

for message in consumer:
    event = json.loads(message.value)

    # AI processing
    enriched_event = {
        **event,
        'sentiment': analyze_sentiment(event['text']),
        'category': classify_event(event),
        'priority': calculate_priority(event)
    }

    # Publish enriched event
    producer.send('enriched_events', json.dumps(enriched_event).encode())
```

## Optimización de Costos

```python
class SmartCacheETL:
    def __init__(self):
        self.cache = {}

    def process_with_cache(self, data):
        results = []

        for item in data:
            # Check cache
            cache_key = hash(item['key_field'])

            if cache_key in self.cache:
                result = self.cache[cache_key]
            else:
                # AI processing (expensive)
                result = ai_process(item)
                self.cache[cache_key] = result

            results.append(result)

        return results
```

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
