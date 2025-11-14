---
title: "Fine-Tuning LLMs: Customize Models for Your Use Case"
description: "Learn to fine-tune GPT, Llama, and other LLMs for domain-specific tasks with practical examples"
sidebar:
  order: 85
  badge:
    text: "Intermediate"
    variant: caution
version: "1.0"
---

# Fine-Tuning LLMs: Customize Models for Your Use Case

## Overview

Fine-tuning adapts pre-trained LLMs to your specific domain, improving performance on specialized tasks while being more cost-effective than training from scratch.

**What you'll learn**: Fine-tuning techniques, dataset preparation, training, evaluation

**Use cases**: Domain-specific chatbots, specialized classification, custom writing styles

**Time**: 35 minutes

## When to Fine-Tune

### Fine-Tuning vs Prompting

**Use Prompting when**:
- Task is general-purpose
- Limited training data
- Need flexibility
- Quick iteration needed

**Use Fine-Tuning when**:
- Consistent output format required
- Large domain-specific dataset available
- Repeated use justifies investment
- Need to reduce prompt size
- Require better latency/cost

### Cost-Benefit Analysis

```python
# Prompting cost (per request)
prompt_tokens = 1500  # Context + instructions
completion_tokens = 500
cost_per_request = (prompt_tokens * 0.03 + completion_tokens * 0.06) / 1000
# = $0.075 per request

# Fine-tuning cost
training_cost = 100  # One-time
prompt_tokens_after = 100  # Much smaller
cost_per_request_finetuned = (prompt_tokens_after * 0.012 + completion_tokens * 0.016) / 1000
# = $0.0092 per request

# Break-even at ~1,350 requests
```

## Fine-Tuning Platforms

### OpenAI Fine-Tuning

**Models available**: GPT-3.5-turbo, GPT-4o-mini, Davinci

**Pricing**: Training + usage costs

**Process**:
```bash
# Install OpenAI SDK
pip install openai

# Prepare data (JSONL format)
# Upload training file
# Create fine-tuning job
# Deploy fine-tuned model
```

### Open-Source Fine-Tuning

**Popular models**:
- **Llama 2/3**: Meta's open models
- **Mistral**: Efficient, high-performance
- **Falcon**: Strong multilingual
- **Phi**: Small but capable

**Tools**:
- **Hugging Face Transformers**: Full fine-tuning
- **PEFT/LoRA**: Parameter-efficient fine-tuning
- **Axolotl**: Fine-tuning framework
- **LM Studio**: Local model management

## Dataset Preparation

### Data Format

**OpenAI format (JSONL)**:
```json
{"messages": [
  {"role": "system", "content": "You are a medical assistant."},
  {"role": "user", "content": "What are symptoms of flu?"},
  {"role": "assistant", "content": "Common flu symptoms include fever, cough, sore throat, body aches, headache, and fatigue."}
]}
{"messages": [
  {"role": "system", "content": "You are a medical assistant."},
  {"role": "user", "content": "How to treat common cold?"},
  {"role": "assistant", "content": "Rest, fluids, OTC pain relievers, throat lozenges. See doctor if symptoms worsen."}
]}
```

**Hugging Face format**:
```json
{
  "instruction": "Classify the sentiment of this review",
  "input": "This product exceeded my expectations!",
  "output": "Positive"
}
```

### Dataset Requirements

**Minimum size**:
- Classification: 50-100 examples
- Generation: 100-500 examples
- Complex tasks: 500-1000+ examples

**Quality over quantity**:
- Accurate labels
- Diverse examples
- Consistent format
- Balanced distribution

### Data Collection Strategies

**1. Existing data**:
```python
# Convert existing data to training format
import json

def convert_to_training_format(data):
    training_data = []
    for item in data:
        training_data.append({
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": item['input']},
                {"role": "assistant", "content": item['output']}
            ]
        })
    return training_data

# Save as JSONL
with open('training_data.jsonl', 'w') as f:
    for item in training_data:
        f.write(json.dumps(item) + '\n')
```

**2. Synthetic data generation**:
```python
# Use GPT-4 to generate training examples
import openai

def generate_training_examples(topic, num_examples=100):
    prompt = f"""Generate {num_examples} diverse question-answer pairs about {topic}.
    Format as JSON with 'question' and 'answer' keys."""
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

**3. Human annotation**:
- Label Studio
- Prodigy
- Amazon Mechanical Turk

## Fine-Tuning with OpenAI

### Step-by-Step Process

**1. Prepare data**:
```python
import openai
from openai import OpenAI

client = OpenAI()

# Validate training data
def validate_data(file_path):
    with open(file_path, 'r') as f:
        data = [json.loads(line) for line in f]
    
    for item in data:
        assert 'messages' in item
        assert len(item['messages']) >= 2
        assert item['messages'][0]['role'] == 'system'
    
    print(f"✓ Validated {len(data)} examples")

validate_data('training_data.jsonl')
```

**2. Upload file**:
```python
# Upload training file
with open("training_data.jsonl", "rb") as f:
    training_file = client.files.create(
        file=f,
        purpose="fine-tune"
    )

print(f"File ID: {training_file.id}")
```

**3. Create fine-tuning job**:
```python
# Start fine-tuning
job = client.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
    hyperparameters={
        "n_epochs": 3,
        "batch_size": 1,
        "learning_rate_multiplier": 2
    }
)

print(f"Job ID: {job.id}")
```

**4. Monitor progress**:
```python
# Check status
import time

while True:
    job_status = client.fine_tuning.jobs.retrieve(job.id)
    print(f"Status: {job_status.status}")
    
    if job_status.status in ['succeeded', 'failed']:
        break
    
    time.sleep(60)

if job_status.status == 'succeeded':
    fine_tuned_model = job_status.fine_tuned_model
    print(f"Fine-tuned model: {fine_tuned_model}")
```

**5. Use fine-tuned model**:
```python
# Inference with fine-tuned model
response = client.chat.completions.create(
    model=fine_tuned_model,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Your query here"}
    ]
)

print(response.choices[0].message.content)
```

## Fine-Tuning with Hugging Face

### LoRA Fine-Tuning

**Why LoRA?**:
- 10-100x fewer trainable parameters
- Much faster training
- Lower memory requirements
- Easier to share and deploy

**Implementation**:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer
import torch

# Load base model
model_name = "meta-llama/Llama-2-7b-hf"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,
    torch_dtype=torch.float16,
    device_map="auto"
)

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Prepare for training
model = prepare_model_for_kbit_training(model)

# LoRA configuration
lora_config = LoraConfig(
    r=16,  # Rank
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    logging_steps=10,
    save_steps=100,
    evaluation_strategy="steps",
    eval_steps=100,
    warmup_steps=50,
    fp16=True
)

# Load dataset
from datasets import load_dataset
dataset = load_dataset("json", data_files="training_data.json")

# Create trainer
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    tokenizer=tokenizer,
    max_seq_length=512,
    dataset_text_field="text"
)

# Train
trainer.train()

# Save
model.save_pretrained("./lora-model")
tokenizer.save_pretrained("./lora-model")
```

### Full Fine-Tuning

```python
from transformers import AutoModelForCausalLM, Trainer, TrainingArguments

# Load model (full precision)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Training arguments
training_args = TrainingArguments(
    output_dir="./full-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    learning_rate=5e-5,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=10,
    save_steps=500,
    save_total_limit=3,
    evaluation_strategy="steps",
    eval_steps=500,
    load_best_model_at_end=True
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    tokenizer=tokenizer
)

# Train
trainer.train()
```

## Hyperparameter Tuning

### Key Hyperparameters

**Learning rate**:
- Too high: Unstable, diverges
- Too low: Slow convergence
- Typical range: 1e-5 to 1e-4

**Epochs**:
- Too few: Underfitting
- Too many: Overfitting
- Start with 3-5, monitor validation loss

**Batch size**:
- Larger: More stable, faster
- Smaller: Better generalization
- Limited by GPU memory

**LoRA rank (r)**:
- Higher: More capacity, slower
- Lower: Faster, less flexible
- Typical: 8-32

### Grid Search

```python
import itertools

hyperparams = {
    'learning_rate': [1e-5, 5e-5, 1e-4],
    'num_epochs': [3, 5, 7],
    'lora_r': [8, 16, 32]
}

best_loss = float('inf')
best_params = None

for lr, epochs, r in itertools.product(*hyperparams.values()):
    # Train with these params
    model, val_loss = train_model(lr=lr, epochs=epochs, lora_r=r)
    
    if val_loss < best_loss:
        best_loss = val_loss
        best_params = {'lr': lr, 'epochs': epochs, 'r': r}
    
print(f"Best params: {best_params}")
```

## Evaluation

### Metrics

**Classification**:
```python
from sklearn.metrics import accuracy_score, f1_score, classification_report

def evaluate_classification(model, test_data):
    predictions = []
    labels = []
    
    for item in test_data:
        pred = model.predict(item['input'])
        predictions.append(pred)
        labels.append(item['label'])
    
    accuracy = accuracy_score(labels, predictions)
    f1 = f1_score(labels, predictions, average='weighted')
    
    print(f"Accuracy: {accuracy:.3f}")
    print(f"F1 Score: {f1:.3f}")
    print(classification_report(labels, predictions))
```

**Generation**:
```python
# BLEU, ROUGE for generation tasks
from nltk.translate.bleu_score import sentence_bleu
from rouge import Rouge

def evaluate_generation(model, test_data):
    bleu_scores = []
    rouge = Rouge()
    rouge_scores = []
    
    for item in test_data:
        generated = model.generate(item['input'])
        reference = item['output']
        
        # BLEU
        bleu = sentence_bleu([reference.split()], generated.split())
        bleu_scores.append(bleu)
        
        # ROUGE
        scores = rouge.get_scores(generated, reference)[0]
        rouge_scores.append(scores['rouge-l']['f'])
    
    print(f"Avg BLEU: {sum(bleu_scores)/len(bleu_scores):.3f}")
    print(f"Avg ROUGE-L: {sum(rouge_scores)/len(rouge_scores):.3f}")
```

### A/B Testing

```python
def ab_test(base_model, finetuned_model, test_cases):
    results = {'base': [], 'finetuned': []}
    
    for case in test_cases:
        # Get outputs from both models
        base_output = base_model.generate(case['input'])
        ft_output = finetuned_model.generate(case['input'])
        
        # Human evaluation or automatic scoring
        base_score = evaluate_output(base_output, case['expected'])
        ft_score = evaluate_output(ft_output, case['expected'])
        
        results['base'].append(base_score)
        results['finetuned'].append(ft_score)
    
    # Statistical significance test
    from scipy import stats
    t_stat, p_value = stats.ttest_rel(results['finetuned'], results['base'])
    
    print(f"Fine-tuned improvement: {(sum(results['finetuned'])/len(results['finetuned']) - sum(results['base'])/len(results['base'])):.2%}")
    print(f"Statistical significance (p-value): {p_value:.4f}")
```

## Deployment

### Serve LoRA Models

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

def load_lora_model(base_model_name, lora_path):
    # Load base model
    model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    
    # Load LoRA weights
    model = PeftModel.from_pretrained(model, lora_path)
    tokenizer = AutoTokenizer.from_pretrained(lora_path)
    
    return model, tokenizer

# Inference
model, tokenizer = load_lora_model("meta-llama/Llama-2-7b-hf", "./lora-model")

def generate(prompt):
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=256)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)
```

### API Endpoint

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Load model once at startup
model, tokenizer = load_lora_model("base-model", "./lora-weights")

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 256

@app.post("/generate")
def generate_endpoint(request: GenerateRequest):
    output = generate(request.prompt, max_tokens=request.max_tokens)
    return {"output": output}

# Run: uvicorn app:app --host 0.0.0.0 --port 8000
```

## Best Practices

✅ **Do**:
- Start with high-quality data
- Validate data format
- Monitor training metrics
- Use validation set
- Test on real use cases
- Document hyperparameters
- Version control datasets

❌ **Don't**:
- Overtrain on small datasets
- Ignore validation loss
- Skip data quality checks
- Fine-tune without trying prompting first
- Deploy without evaluation
- Forget about costs

## Common Issues

**Overfitting**:
- Reduce epochs
- Increase training data
- Add regularization
- Use early stopping

**Poor performance**:
- Increase dataset size
- Improve data quality
- Adjust hyperparameters
- Try different base model

**Out of memory**:
- Reduce batch size
- Use gradient accumulation
- Enable 8-bit loading
- Use LoRA instead of full fine-tuning

## Resources

- [OpenAI Fine-tuning Guide](https://platform.openai.com/docs/guides/fine-tuning)
- [Hugging Face PEFT](https://huggingface.co/docs/peft)
- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [Axolotl Framework](https://github.com/OpenAccess-AI-Collective/axolotl)

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
