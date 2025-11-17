---
title: "Fine-Tuning de LLMs: Personaliza Modelos para tu Caso de Uso"
description: "Aprende a hacer fine-tuning de GPT, Llama y otros LLMs para tareas específicas de dominio con ejemplos prácticos"
sidebar:
  order: 85
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---
## Descripción General

El fine-tuning adapta LLMs pre-entrenados a tu dominio específico, mejorando el rendimiento en tareas especializadas mientras es más rentable que entrenar desde cero.

**Lo que aprenderás**: Técnicas de fine-tuning, preparación de conjuntos de datos, entrenamiento, evaluación

**Casos de uso**: Chatbots específicos de dominio, clasificación especializada, estilos de escritura personalizados

**Tiempo**: 35 minutos

## Cuándo Hacer Fine-Tuning

### Fine-Tuning vs Prompting

**Usa Prompting cuando**:
- La tarea es de propósito general
- Datos de entrenamiento limitados
- Necesitas flexibilidad
- Se necesita iteración rápida

**Usa Fine-Tuning cuando**:
- Se requiere formato de salida consistente
- Gran conjunto de datos específico de dominio disponible
- El uso repetido justifica la inversión
- Necesitas reducir el tamaño del prompt
- Requieres mejor latencia/costo

### Análisis Costo-Beneficio

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

## Plataformas de Fine-Tuning

### Fine-Tuning de OpenAI

**Modelos disponibles**: GPT-3.5-turbo, GPT-4o-mini, Davinci

**Precios**: Costos de entrenamiento + uso

**Proceso**:
```bash
# Install OpenAI SDK
pip install openai

# Prepare data (JSONL format)
# Upload training file
# Create fine-tuning job
# Deploy fine-tuned model
```

### Fine-Tuning Open-Source

**Modelos populares**:
- **Llama 2/3**: Modelos abiertos de Meta
- **Mistral**: Eficiente, alto rendimiento
- **Falcon**: Fuerte multilingüe
- **Phi**: Pequeño pero capaz

**Herramientas**:
- **Hugging Face Transformers**: Fine-tuning completo
- **PEFT/LoRA**: Fine-tuning eficiente en parámetros
- **Axolotl**: Framework de fine-tuning
- **LM Studio**: Gestión local de modelos

## Preparación del Conjunto de Datos

### Formato de Datos

**Formato OpenAI (JSONL)**:
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

**Formato Hugging Face**:
```json
{
  "instruction": "Classify the sentiment of this review",
  "input": "This product exceeded my expectations!",
  "output": "Positive"
}
```

### Requisitos del Conjunto de Datos

**Tamaño mínimo**:
- Clasificación: 50-100 ejemplos
- Generación: 100-500 ejemplos
- Tareas complejas: 500-1000+ ejemplos

**Calidad sobre cantidad**:
- Etiquetas precisas
- Ejemplos diversos
- Formato consistente
- Distribución equilibrada

### Estrategias de Recopilación de Datos

**1. Datos existentes**:
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

**2. Generación de datos sintéticos**:
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

**3. Anotación humana**:
- Label Studio
- Prodigy
- Amazon Mechanical Turk

## Fine-Tuning con OpenAI

### Proceso Paso a Paso

**1. Preparar datos**:
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

**2. Subir archivo**:
```python
# Upload training file
with open("training_data.jsonl", "rb") as f:
    training_file = client.files.create(
        file=f,
        purpose="fine-tune"
    )

print(f"File ID: {training_file.id}")
```

**3. Crear trabajo de fine-tuning**:
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

**4. Monitorear progreso**:
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

**5. Usar modelo fine-tuned**:
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

## Fine-Tuning con Hugging Face

### Fine-Tuning con LoRA

**¿Por qué LoRA?**:
- 10-100x menos parámetros entrenables
- Entrenamiento mucho más rápido
- Menores requisitos de memoria
- Más fácil de compartir y desplegar

**Implementación**:
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

### Fine-Tuning Completo

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

## Ajuste de Hiperparámetros

### Hiperparámetros Clave

**Tasa de aprendizaje**:
- Muy alta: Inestable, diverge
- Muy baja: Convergencia lenta
- Rango típico: 1e-5 a 1e-4

**Épocas**:
- Muy pocas: Underfitting
- Demasiadas: Overfitting
- Comienza con 3-5, monitorea la pérdida de validación

**Tamaño de lote**:
- Mayor: Más estable, más rápido
- Menor: Mejor generalización
- Limitado por memoria GPU

**Rango LoRA (r)**:
- Mayor: Más capacidad, más lento
- Menor: Más rápido, menos flexible
- Típico: 8-32

### Búsqueda en Cuadrícula

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

## Evaluación

### Métricas

**Clasificación**:
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

**Generación**:
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

### Pruebas A/B

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

## Despliegue

### Servir Modelos LoRA

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

### Endpoint de API

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

## Mejores Prácticas

✅ **Hacer**:
- Comenzar con datos de alta calidad
- Validar formato de datos
- Monitorear métricas de entrenamiento
- Usar conjunto de validación
- Probar en casos de uso reales
- Documentar hiperparámetros
- Control de versiones de conjuntos de datos

❌ **No hacer**:
- Sobreentrenar en conjuntos de datos pequeños
- Ignorar pérdida de validación
- Omitir verificaciones de calidad de datos
- Hacer fine-tuning sin intentar prompting primero
- Desplegar sin evaluación
- Olvidar los costos

## Problemas Comunes

**Overfitting**:
- Reducir épocas
- Aumentar datos de entrenamiento
- Añadir regularización
- Usar early stopping

**Rendimiento pobre**:
- Aumentar tamaño del conjunto de datos
- Mejorar calidad de datos
- Ajustar hiperparámetros
- Probar modelo base diferente

**Sin memoria**:
- Reducir tamaño de lote
- Usar acumulación de gradientes
- Habilitar carga de 8 bits
- Usar LoRA en lugar de fine-tuning completo

## Recursos

- [OpenAI Fine-tuning Guide](https://platform.openai.com/docs/guides/fine-tuning)
- [Hugging Face PEFT](https://huggingface.co/docs/peft)
- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [Axolotl Framework](https://github.com/OpenAccess-AI-Collective/axolotl)

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
