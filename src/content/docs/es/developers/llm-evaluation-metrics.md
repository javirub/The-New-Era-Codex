---
title: "Evaluación de Modelos LLM: Métricas y Testing"
description: "BLEU, ROUGE, perplejidad, testing unitario de prompts y CI/CD para IA"
sidebar:
  order: 70
  badge:
    text: "Avanzado"
    variant: caution
version: "1.0"
---
## Descripción General

Evaluar salidas de LLM es crítico para sistemas de IA en producción. A diferencia del testing tradicional, la evaluación de LLM combina métricas cuantitativas con evaluación cualitativa humana.

**Lo que aprenderás**: Evaluación sistemática de salidas LLM usando métricas automatizadas, evaluación humana, regression testing e integración CI/CD.

**Casos de uso**: QA de IA en producción, comparación de modelos, optimización de prompts, detección de regresiones.

**Tiempo**: 50 minutos

## Métricas de Evaluación

### BLEU Score

Mide superposición de n-gramas con texto de referencia.

```python
from nltk.translate.bleu_score import sentence_bleu

def calcular_bleu(referencia: str, candidato: str) -> float:
    """Calcular score BLEU"""
    tokens_ref = [referencia.split()]
    tokens_cand = candidato.split()

    score = sentence_bleu(tokens_ref, tokens_cand)
    return score
```

### ROUGE Score

Mide recall de n-gramas. Común en resúmenes.

```python
from rouge_score import rouge_scorer

def calcular_rouge(referencia: str, candidato: str) -> dict:
    """Calcular scores ROUGE"""
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    scores = scorer.score(referencia, candidato)

    return {
        'rouge1': scores['rouge1'].fmeasure,
        'rouge2': scores['rouge2'].fmeasure,
        'rougeL': scores['rougeL'].fmeasure
    }
```

### Similitud Semántica

```python
from sentence_transformers import SentenceTransformer, util

modelo = SentenceTransformer('all-MiniLM-L6-v2')

def similitud_semantica(texto1: str, texto2: str) -> float:
    emb1 = modelo.encode(texto1)
    emb2 = modelo.encode(texto2)
    return float(util.cos_sim(emb1, emb2))
```

## Testing Unitario de Salidas LLM

```python
import pytest
from openai import OpenAI

client = OpenAI()

class TestSalidasPrompt:
    def test_clasificacion_sentimiento(self):
        """Test consistencia análisis sentimiento"""
        prompt = "Clasifica sentimiento: '¡Este producto es increíble!'"

        respuesta = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        salida = respuesta.choices[0].message.content.lower()
        assert "positivo" in salida

    def test_estructura_json(self):
        """Test formato de salida estructurada"""
        prompt = """Retorna JSON: {"nombre": "Juan", "edad": 30}"""

        respuesta = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        import json
        salida = json.loads(respuesta.choices[0].message.content)
        assert "nombre" in salida
        assert "edad" in salida
```

### Tests Parametrizados

```python
@pytest.mark.parametrize("texto_entrada,categoria_esperada", [
    ("Programa una reunión mañana", "calendario"),
    ("Envía email a Juan", "email"),
    ("¿Cuál es el clima?", "consulta"),
])
def test_clasificacion_intencion(texto_entrada, categoria_esperada):
    prompt = f"Clasifica intención: {texto_entrada}\nRetorna una palabra: calendario, email o consulta"

    respuesta = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    salida = respuesta.choices[0].message.content.strip().lower()
    assert categoria_esperada in salida
```

## Regression Testing

```python
import json
from pathlib import Path

class ProbadorRegresionLLM:
    def __init__(self, archivo_base: str = "lineas_base.json"):
        self.archivo_base = Path(archivo_base)
        self.lineas_base = self.cargar_lineas_base()

    def cargar_lineas_base(self) -> dict:
        if self.archivo_base.exists():
            return json.loads(self.archivo_base.read_text())
        return {}

    def establecer_linea_base(self, nombre_test: str, salida: str, metricas: dict):
        """Establecer línea base para un test"""
        self.lineas_base[nombre_test] = {
            "salida": salida,
            "metricas": metricas
        }
        self.guardar_lineas_base()

    def comparar_con_linea_base(self, nombre_test: str, salida: str, metricas: dict) -> dict:
        """Comparar salida actual con línea base"""
        if nombre_test not in self.lineas_base:
            return {"estado": "sin_linea_base"}

        linea_base = self.lineas_base[nombre_test]

        similitud = similitud_semantica(linea_base["salida"], salida)

        dif_metricas = {}
        for clave in metricas:
            if clave in linea_base["metricas"]:
                dif_metricas[clave] = metricas[clave] - linea_base["metricas"][clave]

        return {
            "estado": "comparado",
            "similitud": similitud,
            "diferencias_metricas": dif_metricas,
            "aprobado": similitud > 0.9
        }
```

## Evaluación Humana

```python
from dataclasses import dataclass

@dataclass
class EvaluacionHumana:
    prompt: str
    salida: str
    calificaciones: dict  # {"relevancia": 1-5, "precision": 1-5, "claridad": 1-5}
    retroalimentacion: str
    evaluador: str

class RecolectorEvaluaciones:
    def recolectar_evaluacion(self, prompt: str, salida: str) -> EvaluacionHumana:
        """Recolección interactiva de evaluación"""
        print(f"\nPrompt: {prompt}")
        print(f"Salida: {salida}\n")

        calificaciones = {}
        for criterio in ["relevancia", "precision", "claridad"]:
            while True:
                try:
                    calif = int(input(f"Califica {criterio} (1-5): "))
                    if 1 <= calif <= 5:
                        calificaciones[criterio] = calif
                        break
                except ValueError:
                    pass

        retroalimentacion = input("Feedback adicional: ")
        evaluador = input("Tu nombre: ")

        return EvaluacionHumana(
            prompt=prompt,
            salida=salida,
            calificaciones=calificaciones,
            retroalimentacion=retroalimentacion,
            evaluador=evaluador
        )
```

## Integración CI/CD

```yaml
# .github/workflows/pruebas-llm.yml
name: Pruebas LLM

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Configurar Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Instalar dependencias
      run: |
        pip install pytest openai sentence-transformers rouge-score

    - name: Ejecutar pruebas LLM
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      run: |
        pytest tests/test_salidas_llm.py -v
```

## Métricas de Rendimiento

### Testing de Latencia

```python
import time
from statistics import mean, median, stdev

class ProbadorRendimiento:
    def __init__(self, cliente):
        self.cliente = cliente

    def probar_latencia(self, prompt: str, n_ejecuciones: int = 10):
        """Probar latencia de prompt"""
        latencias = []

        for _ in range(n_ejecuciones):
            inicio = time.time()

            respuesta = self.cliente.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )

            latencia = time.time() - inicio
            latencias.append(latencia)

        return {
            "media": mean(latencias),
            "mediana": median(latencias),
            "desv_std": stdev(latencias) if len(latencias) > 1 else 0,
            "min": min(latencias),
            "max": max(latencias)
        }
```

## Mejores Prácticas

### 1. Control de Versiones para Prompts

```python
from datetime import datetime

class VersionPrompt:
    def __init__(self, prompt: str, version: str, descripcion: str):
        self.prompt = prompt
        self.version = version
        self.descripcion = descripcion
        self.creado_en = datetime.now()
        self.resultados_test = []

    def agregar_resultado_test(self, resultado: dict):
        self.resultados_test.append({
            **resultado,
            "timestamp": datetime.now().isoformat()
        })

    def obtener_tasa_exito(self) -> float:
        if not self.resultados_test:
            return 0.0
        aprobados = sum(1 for r in self.resultados_test if r.get("aprobado", False))
        return aprobados / len(self.resultados_test)
```

### 2. Monitoreo Continuo

```python
class MonitorProduccion:
    def __init__(self):
        self.metricas = []

    def registrar_inferencia(self, prompt: str, salida: str, latencia: float, costo: float):
        self.metricas.append({
            "timestamp": datetime.now().isoformat(),
            "hash_prompt": hash(prompt),
            "longitud_salida": len(salida),
            "latencia": latencia,
            "costo": costo
        })

    def obtener_resumen_diario(self) -> dict:
        hoy = datetime.now().date()
        metricas_hoy = [
            m for m in self.metricas
            if datetime.fromisoformat(m["timestamp"]).date() == hoy
        ]

        if not metricas_hoy:
            return {}

        return {
            "inferencias_totales": len(metricas_hoy),
            "latencia_promedio": mean(m["latencia"] for m in metricas_hoy),
            "costo_total": sum(m["costo"] for m in metricas_hoy)
        }
```

## Próximos Pasos

**Guías relacionadas**:
- [Prompt Engineering para Desarrolladores](/es/developers/prompt-engineering-desarrolladores)
- [Construyendo tu Primer Sistema RAG](/es/developers/construyendo-primer-sistema-rag)

## Recursos

**Herramientas**:
- [LangSmith](https://www.langchain.com/langsmith)
- [Weights & Biases](https://wandb.ai/)
- [promptfoo](https://github.com/promptfoo/promptfoo)

---

**¿Encontraste un problema?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues) o envía un PR!
