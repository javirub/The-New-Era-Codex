---
title: "LLM Testing and CI/CD: Quality Assurance for AI Apps"
description: "Implement testing, monitoring, and CI/CD pipelines for LLM applications"
sidebar:
  badge:
    text: "Intermediate"
    variant: caution
version: "1.0"
---

# LLM Testing and CI/CD

## Testing Strategies

### Unit Tests for Prompts
```python
import pytest
from openai import OpenAI

client = OpenAI()

def test_classification_prompt():
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "user",
            "content": "Classify sentiment: I love this product!"
        }]
    )
    
    assert "positive" in response.choices[0].message.content.lower()

def test_extraction_format():
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user", 
            "content": "Extract name and email from: John Doe john@example.com"
        }],
        response_format={"type": "json_object"}
    )
    
    import json
    data = json.loads(response.choices[0].message.content)
    assert "name" in data
    assert "email" in data
```

### Integration Tests
```python
def test_rag_pipeline():
    # Test full RAG workflow
    query = "What is the refund policy?"
    
    # 1. Retrieval
    docs = retrieve_documents(query)
    assert len(docs) > 0
    
    # 2. Generation
    response = generate_response(query, docs)
    assert len(response) > 0
    assert "refund" in response.lower()
```

### Evaluation Metrics
```python
def test_response_quality():
    test_cases = [
        {
            "input": "What's 2+2?",
            "expected": "4",
            "eval": lambda r, e: e in r
        }
    ]
    
    for case in test_cases:
        response = get_llm_response(case["input"])
        assert case["eval"](response, case["expected"])
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: LLM App CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Run tests
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          pytest tests/
      
      - name: Evaluate prompts
        run: |
          python scripts/evaluate_prompts.py
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy logic here
```

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
