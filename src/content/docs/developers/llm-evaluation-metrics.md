---
title: "LLM Model Evaluation: Metrics and Testing"
description: "BLEU, ROUGE, perplexity, unit testing prompts, and CI/CD for AI applications"
sidebar:
  order: 70
  badge:
    text: "Advanced"
    variant: caution
version: "1.0"
---

# LLM Model Evaluation: Metrics and Testing

## Overview

Evaluating LLM outputs is critical for production AI systems. Unlike traditional software testing, LLM evaluation combines quantitative metrics with qualitative human assessment to ensure reliability, safety, and performance.

**What you'll learn**: Systematic evaluation of LLM outputs using automated metrics, human evaluation, regression testing, and CI/CD integration.

**Use cases**: Production AI quality assurance, model comparison, prompt optimization, detecting regressions.

**Time**: 50 minutes

## Evaluation Metrics

### BLEU Score (Bilingual Evaluation Understudy)

Measures n-gram overlap with reference text. Common in translation.

```python
from nltk.translate.bleu_score import sentence_bleu, corpus_bleu

def calculate_bleu(reference: str, candidate: str) -> float:
    """Calculate BLEU score"""
    reference_tokens = [reference.split()]
    candidate_tokens = candidate.split()

    score = sentence_bleu(reference_tokens, candidate_tokens)
    return score

# Example
ref = "the cat sat on the mat"
cand = "the cat is on the mat"
print(f"BLEU: {calculate_bleu(ref, cand):.3f}")  # ~0.75
```

### ROUGE Score (Recall-Oriented Understudy for Gisting Evaluation)

Measures recall of n-grams. Common in summarization.

```python
from rouge_score import rouge_scorer

def calculate_rouge(reference: str, candidate: str) -> dict:
    """Calculate ROUGE scores"""
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    scores = scorer.score(reference, candidate)

    return {
        'rouge1': scores['rouge1'].fmeasure,
        'rouge2': scores['rouge2'].fmeasure,
        'rougeL': scores['rougeL'].fmeasure
    }
```

### Semantic Similarity

```python
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

def semantic_similarity(text1: str, text2: str) -> float:
    """Calculate semantic similarity"""
    emb1 = model.encode(text1)
    emb2 = model.encode(text2)
    return float(util.cos_sim(emb1, emb2))
```

### Custom Evaluation Functions

```python
import re

def evaluate_json_format(output: str) -> dict:
    """Check if output is valid JSON"""
    try:
        import json
        json.loads(output)
        return {"valid": True, "score": 1.0}
    except:
        return {"valid": False, "score": 0.0}

def evaluate_code_syntax(code: str, language: str) -> dict:
    """Check code syntax"""
    if language == "python":
        try:
            compile(code, '<string>', 'exec')
            return {"valid": True, "score": 1.0}
        except SyntaxError as e:
            return {"valid": False, "score": 0.0, "error": str(e)}
```

## Unit Testing LLM Outputs

### Basic Test Suite

```python
import pytest
from openai import OpenAI

client = OpenAI()

class TestPromptOutputs:
    """Test suite for LLM prompts"""

    def test_sentiment_classification(self):
        """Test sentiment analysis consistency"""
        prompt = "Classify sentiment: 'This product is amazing!'"

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        output = response.choices[0].message.content.lower()
        assert "positive" in output

    def test_json_output_structure(self):
        """Test structured output format"""
        prompt = """Return JSON: {"name": "John", "age": 30}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        import json
        output = json.loads(response.choices[0].message.content)
        assert "name" in output
        assert "age" in output

    def test_output_length(self):
        """Test output length constraints"""
        prompt = "Describe Python in exactly 3 words."

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=10
        )

        words = response.choices[0].message.content.split()
        assert len(words) <= 5  # Allow some flexibility
```

### Parameterized Tests

```python
@pytest.mark.parametrize("input_text,expected_category", [
    ("Schedule a meeting tomorrow", "calendar"),
    ("Send email to John", "email"),
    ("What's the weather?", "query"),
])
def test_intent_classification(input_text, expected_category):
    """Test intent classification across multiple inputs"""
    prompt = f"Classify intent: {input_text}\nReturn one word: calendar, email, or query"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    output = response.choices[0].message.content.strip().lower()
    assert expected_category in output
```

## Regression Testing

### Baseline Comparison

```python
import json
from pathlib import Path

class LLMRegressionTester:
    def __init__(self, baseline_file: str = "baselines.json"):
        self.baseline_file = Path(baseline_file)
        self.baselines = self.load_baselines()

    def load_baselines(self) -> dict:
        if self.baseline_file.exists():
            return json.loads(self.baseline_file.read_text())
        return {}

    def save_baselines(self):
        self.baseline_file.write_text(json.dumps(self.baselines, indent=2))

    def set_baseline(self, test_name: str, output: str, metrics: dict):
        """Set baseline for a test"""
        self.baselines[test_name] = {
            "output": output,
            "metrics": metrics
        }
        self.save_baselines()

    def compare_to_baseline(self, test_name: str, output: str, metrics: dict) -> dict:
        """Compare current output to baseline"""
        if test_name not in self.baselines:
            return {"status": "no_baseline", "message": "No baseline set"}

        baseline = self.baselines[test_name]

        # Compare semantic similarity
        similarity = semantic_similarity(baseline["output"], output)

        # Compare metrics
        metric_diffs = {}
        for key in metrics:
            if key in baseline["metrics"]:
                metric_diffs[key] = metrics[key] - baseline["metrics"][key]

        return {
            "status": "compared",
            "similarity": similarity,
            "metric_differences": metric_diffs,
            "passed": similarity > 0.9  # 90% similarity threshold
        }

# Usage
tester = LLMRegressionTester()

# Set baseline
output = "Python is a high-level programming language."
metrics = {"length": len(output), "bleu": 1.0}
tester.set_baseline("describe_python", output, metrics)

# Later, compare new output
new_output = "Python is a high-level language for programming."
new_metrics = {"length": len(new_output), "bleu": 0.95}
result = tester.compare_to_baseline("describe_python", new_output, new_metrics)
print(result)
```

## Human Evaluation

### Evaluation Interface

```python
from dataclasses import dataclass
from typing import List
import json

@dataclass
class HumanEvaluation:
    prompt: str
    output: str
    ratings: dict  # {"relevance": 1-5, "accuracy": 1-5, "clarity": 1-5}
    feedback: str
    evaluator: str

class EvaluationCollector:
    def __init__(self, output_file: str = "evaluations.jsonl"):
        self.output_file = output_file

    def collect_evaluation(self, prompt: str, output: str) -> HumanEvaluation:
        """Interactive evaluation collection"""
        print(f"\nPrompt: {prompt}")
        print(f"Output: {output}\n")

        ratings = {}
        for criterion in ["relevance", "accuracy", "clarity"]:
            while True:
                try:
                    rating = int(input(f"Rate {criterion} (1-5): "))
                    if 1 <= rating <= 5:
                        ratings[criterion] = rating
                        break
                except ValueError:
                    pass

        feedback = input("Additional feedback: ")
        evaluator = input("Your name: ")

        evaluation = HumanEvaluation(
            prompt=prompt,
            output=output,
            ratings=ratings,
            feedback=feedback,
            evaluator=evaluator
        )

        # Save to file
        with open(self.output_file, 'a') as f:
            f.write(json.dumps(evaluation.__dict__) + '\n')

        return evaluation

    def load_evaluations(self) -> List[HumanEvaluation]:
        """Load all evaluations"""
        evaluations = []
        try:
            with open(self.output_file, 'r') as f:
                for line in f:
                    data = json.loads(line)
                    evaluations.append(HumanEvaluation(**data))
        except FileNotFoundError:
            pass
        return evaluations

    def get_average_ratings(self) -> dict:
        """Calculate average ratings"""
        evaluations = self.load_evaluations()
        if not evaluations:
            return {}

        totals = {"relevance": 0, "accuracy": 0, "clarity": 0}
        for eval in evaluations:
            for key in totals:
                totals[key] += eval.ratings[key]

        return {key: totals[key] / len(evaluations) for key in totals}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/llm-tests.yml
name: LLM Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        pip install pytest openai sentence-transformers rouge-score

    - name: Run LLM tests
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      run: |
        pytest tests/test_llm_outputs.py -v

    - name: Run regression tests
      run: |
        python scripts/regression_tests.py

    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: test-results/
```

### Test Configuration

```python
# conftest.py
import pytest
from openai import OpenAI

@pytest.fixture(scope="session")
def llm_client():
    """Provide OpenAI client"""
    return OpenAI()

@pytest.fixture
def test_config():
    """Test configuration"""
    return {
        "model": "gpt-4o-mini",
        "temperature": 0,
        "max_retries": 3
    }
```

## Performance Metrics

### Latency Testing

```python
import time
from statistics import mean, median, stdev

class PerformanceTester:
    def __init__(self, client):
        self.client = client
        self.results = []

    def test_latency(self, prompt: str, n_runs: int = 10):
        """Test prompt latency"""
        latencies = []

        for _ in range(n_runs):
            start = time.time()

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )

            latency = time.time() - start
            latencies.append(latency)

        return {
            "mean": mean(latencies),
            "median": median(latencies),
            "stdev": stdev(latencies) if len(latencies) > 1 else 0,
            "min": min(latencies),
            "max": max(latencies)
        }

# Usage
tester = PerformanceTester(client)
stats = tester.test_latency("What is 2+2?", n_runs=10)
print(f"Mean latency: {stats['mean']:.3f}s")
```

### Cost Tracking

```python
import tiktoken

def estimate_test_costs(test_suite: List[dict], model: str = "gpt-4o-mini") -> dict:
    """Estimate cost of running test suite"""
    pricing = {
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
        "gpt-4o": {"input": 2.50, "output": 10.00}
    }

    encoding = tiktoken.encoding_for_model(model)

    total_input_tokens = 0
    estimated_output_tokens = 0

    for test in test_suite:
        prompt_tokens = len(encoding.encode(test["prompt"]))
        total_input_tokens += prompt_tokens
        estimated_output_tokens += test.get("expected_output_tokens", 100)

    input_cost = (total_input_tokens / 1_000_000) * pricing[model]["input"]
    output_cost = (estimated_output_tokens / 1_000_000) * pricing[model]["output"]

    return {
        "total_tests": len(test_suite),
        "total_input_tokens": total_input_tokens,
        "estimated_output_tokens": estimated_output_tokens,
        "estimated_cost": input_cost + output_cost,
        "cost_per_test": (input_cost + output_cost) / len(test_suite)
    }
```

## Best Practices

### 1. Version Control for Prompts

```python
from datetime import datetime

class PromptVersion:
    def __init__(self, prompt: str, version: str, description: str):
        self.prompt = prompt
        self.version = version
        self.description = description
        self.created_at = datetime.now()
        self.test_results = []

    def add_test_result(self, result: dict):
        self.test_results.append({
            **result,
            "timestamp": datetime.now().isoformat()
        })

    def get_success_rate(self) -> float:
        if not self.test_results:
            return 0.0
        passed = sum(1 for r in self.test_results if r.get("passed", False))
        return passed / len(self.test_results)
```

### 2. Continuous Monitoring

```python
class ProductionMonitor:
    def __init__(self):
        self.metrics = []

    def log_inference(self, prompt: str, output: str, latency: float, cost: float):
        """Log production inference"""
        self.metrics.append({
            "timestamp": datetime.now().isoformat(),
            "prompt_hash": hash(prompt),
            "output_length": len(output),
            "latency": latency,
            "cost": cost
        })

    def get_daily_summary(self) -> dict:
        """Get daily metrics summary"""
        today = datetime.now().date()
        today_metrics = [
            m for m in self.metrics
            if datetime.fromisoformat(m["timestamp"]).date() == today
        ]

        if not today_metrics:
            return {}

        return {
            "total_inferences": len(today_metrics),
            "avg_latency": mean(m["latency"] for m in today_metrics),
            "total_cost": sum(m["cost"] for m in today_metrics),
            "avg_output_length": mean(m["output_length"] for m in today_metrics)
        }
```

## Next Steps

**Related guides**:
- [Prompt Engineering for Developers](/developers/prompt-engineering-developers)
- [Building Your First RAG System](/developers/building-first-rag-system)
- [AI Agent Architecture](/developers/agent-architecture-patterns)

## Resources

**Tools**:
- [LangSmith](https://www.langchain.com/langsmith) - LLM observability
- [Weights & Biases](https://wandb.ai/) - Experiment tracking
- [promptfoo](https://github.com/promptfoo/promptfoo) - Test harness

**Papers**:
- [BLEU Paper](https://aclanthology.org/P02-1040/)
- [ROUGE Paper](https://aclanthology.org/W04-1013/)

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues) or submit a PR!
