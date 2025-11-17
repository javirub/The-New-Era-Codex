---
title: "Prompt Engineering para Desarrolladores"
description: "Técnicas avanzadas: few-shot, chain-of-thought, function calling y structured outputs para aplicaciones de IA en producción"
sidebar:
  order: 10
  badge:
    text: "Básico"
    variant: tip
version: "1.0"
---
## Descripción General

El prompt engineering es la práctica de diseñar entradas que guían a los modelos de lenguaje para producir salidas deseadas de manera confiable. Para desarrolladores, esto significa tratar los prompts como una interfaz programática: testeable, versionada y optimizada.

**Lo que aprenderás**: Técnicas de prompting para producción: few-shot learning, chain-of-thought, function calling, structured outputs y optimización sistemática.

**Casos de uso**:
- Construir características de IA confiables
- Extraer datos estructurados de texto
- Crear asistentes con comportamiento consistente
- Automatizar tareas de razonamiento complejas
- Integrar LLMs en sistemas existentes

**Tiempo**: 45 minutos

## Principios Fundamentales

### 1. Instrucciones Claras

**Malo**:
```python
prompt = "Háblame de perros"
```

**Bueno**:
```python
prompt = """Eres un experto veterinario. Proporciona un resumen conciso y factual sobre nutrición canina.

Enfócate en:
- Necesidades calóricas diarias por tamaño
- Nutrientes esenciales
- Errores dietéticos comunes

Máximo 200 palabras. Usa viñetas."""
```

### 2. Proporcionar Contexto

```python
def crear_prompt_revision_codigo(codigo: str, lenguaje: str, estandares: str) -> str:
    return f"""Revisa este código {lenguaje} para:
- Adherencia a estándares {estandares}
- Bugs potenciales o casos límite
- Problemas de rendimiento
- Vulnerabilidades de seguridad

Código:
```{lenguaje}
{codigo}
```

Proporciona feedback específico y accionable."""
```

### 3. Especificar Formato de Salida

```python
prompt = """Analiza esta reseña y retorna JSON:

Reseña: "{texto_resena}"

Formato JSON requerido:
{{
  "sentimiento": "positivo|negativo|neutral",
  "temas": ["tema1", "tema2"],
  "puntos_clave": ["punto1", "punto2"],
  "accion_necesaria": boolean
}}"""
```

## Técnicas Avanzadas

### Few-Shot Learning

```python
def extraer_intencion_few_shot(mensaje_usuario: str) -> str:
    """Extraer intención usando ejemplos few-shot"""

    prompt = f"""Clasifica intención en: consulta, comando, queja, elogio

Ejemplos:
Usuario: "¿Cómo reseteo mi contraseña?"
Intención: consulta

Usuario: "Cancela mi suscripción inmediatamente"
Intención: comando

Usuario: "Su servicio es terrible, nada funciona"
Intención: queja

Usuario: "¡Esta función es increíble, justo lo que necesitaba!"
Intención: elogio

Usuario: "{mensaje_usuario}"
Intención:"""

    respuesta = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return respuesta.choices[0].message.content.strip()
```

### Chain-of-Thought

```python
def resolver_problema_matematico(problema: str) -> dict:
    """Resolver problemas con razonamiento paso a paso"""

    prompt = f"""Resuelve este problema paso a paso. Muestra tu trabajo.

Problema: {problema}

Resolvamos paso a paso:
1."""

    respuesta = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return {
        "problema": problema,
        "razonamiento": respuesta.choices[0].message.content
    }
```

## Function Calling

```python
# Definir funciones
herramientas = [
    {
        "type": "function",
        "function": {
            "name": "obtener_clima",
            "description": "Obtener clima actual para una ubicación",
            "parameters": {
                "type": "object",
                "properties": {
                    "ubicacion": {
                        "type": "string",
                        "description": "Nombre de ciudad"
                    },
                    "unidad": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["ubicacion"]
            }
        }
    }
]

def obtener_clima(ubicacion: str, unidad: str = "celsius") -> dict:
    return {"ubicacion": ubicacion, "temperatura": 22, "condicion": "soleado"}

funciones_disponibles = {"obtener_clima": obtener_clima}

def chat_con_herramientas(mensaje_usuario: str) -> str:
    mensajes = [{"role": "user", "content": mensaje_usuario}]

    # Primera llamada API
    respuesta = client.chat.completions.create(
        model="gpt-4o",
        messages=mensajes,
        tools=herramientas,
        tool_choice="auto"
    )

    mensaje_respuesta = respuesta.choices[0].message
    llamadas_herramienta = mensaje_respuesta.tool_calls

    if llamadas_herramienta:
        mensajes.append(mensaje_respuesta)

        for llamada_herramienta in llamadas_herramienta:
            nombre_funcion = llamada_herramienta.function.name
            args_funcion = json.loads(llamada_herramienta.function.arguments)

            # Ejecutar función
            respuesta_funcion = funciones_disponibles[nombre_funcion](**args_funcion)

            mensajes.append({
                "tool_call_id": llamada_herramienta.id,
                "role": "tool",
                "name": nombre_funcion,
                "content": json.dumps(respuesta_funcion)
            })

        # Segunda llamada con resultados
        segunda_respuesta = client.chat.completions.create(
            model="gpt-4o",
            messages=mensajes
        )

        return segunda_respuesta.choices[0].message.content

    return mensaje_respuesta.content
```

## Structured Outputs

```python
from pydantic import BaseModel
from typing import List, Literal

class AnalisisSentimiento(BaseModel):
    sentimiento: Literal["positivo", "negativo", "neutral"]
    confianza: float
    frases_clave: List[str]
    temas: List[str]

def analizar_sentimiento(texto: str) -> AnalisisSentimiento:
    """Analizar sentimiento con estructura garantizada"""

    respuesta = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": "Eres experto en análisis de sentimiento."},
            {"role": "user", "content": f"Analiza este texto:\n\n{texto}"}
        ],
        response_format=AnalisisSentimiento
    )

    return respuesta.choices[0].message.parsed
```

## Optimización de Prompts

### Testing A/B

```python
class ProbadorPrompts:
    def __init__(self, casos_prueba: List[dict]):
        self.casos_prueba = casos_prueba

    def probar_prompt(self, plantilla_prompt: callable) -> dict:
        resultados = {"aprobados": 0, "fallidos": 0, "fallos": []}

        for caso in self.casos_prueba:
            prompt = plantilla_prompt(caso["entrada"])

            respuesta = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )

            salida = respuesta.choices[0].message.content.strip()

            if salida == caso["salida_esperada"]:
                resultados["aprobados"] += 1
            else:
                resultados["fallidos"] += 1
                resultados["fallos"].append({
                    "entrada": caso["entrada"],
                    "esperado": caso["salida_esperada"],
                    "actual": salida
                })

        resultados["tasa_exito"] = resultados["aprobados"] / len(self.casos_prueba)
        return resultados
```

### Optimización de Tokens

```python
import tiktoken

def contar_tokens(texto: str, modelo: str = "gpt-4o") -> int:
    encoding = tiktoken.encoding_for_model(modelo)
    return len(encoding.encode(texto))

def estimar_costo(prompt: str, tokens_respuesta: int, modelo: str = "gpt-4o-mini") -> float:
    """Estimar costo de llamada API"""
    precios = {
        "gpt-4o-mini": {"entrada": 0.15, "salida": 0.60},  # por 1M tokens
        "gpt-4o": {"entrada": 2.50, "salida": 10.00}
    }

    tokens_entrada = contar_tokens(prompt, modelo)
    costo_entrada = (tokens_entrada / 1_000_000) * precios[modelo]["entrada"]
    costo_salida = (tokens_respuesta / 1_000_000) * precios[modelo]["salida"]

    return costo_entrada + costo_salida
```

## Patrones de Producción

### Plantillas de Prompts

```python
from string import Template

class PlantillaPrompt:
    def __init__(self, plantilla: str):
        self.plantilla = Template(plantilla)

    def formatear(self, **kwargs) -> str:
        return self.plantilla.safe_substitute(**kwargs)

PLANTILLA_REVISION = PlantillaPrompt("""
Eres experto en revisión de código $lenguaje.

Revisa este código para:
- Calidad y mejores prácticas
- Bugs potenciales
- Problemas de seguridad

Código:
```$lenguaje
$codigo
```

Estándares: $estandares
""")
```

### Versionado de Prompts

```python
from enum import Enum
from dataclasses import dataclass
from datetime import datetime

class VersionPrompt(Enum):
    V1_0 = "1.0"
    V1_1 = "1.1"
    V2_0 = "2.0"

@dataclass
class PromptVersionado:
    version: VersionPrompt
    plantilla: str
    creado_en: datetime

class RegistroPrompts:
    def __init__(self):
        self.prompts = {}

    def registrar(self, nombre: str, version: VersionPrompt, plantilla: str):
        if nombre not in self.prompts:
            self.prompts[nombre] = {}

        self.prompts[nombre][version] = PromptVersionado(
            version=version,
            plantilla=plantilla,
            creado_en=datetime.now()
        )

    def obtener(self, nombre: str, version: VersionPrompt = None) -> str:
        if version:
            return self.prompts[nombre][version].plantilla

        # Retornar última versión
        ultima = max(self.prompts[nombre].keys(), key=lambda v: v.value)
        return self.prompts[nombre][ultima].plantilla
```

### Manejo de Errores

```python
from tenacity import retry, stop_after_attempt, wait_exponential

class EjecutorPrompt:
    def __init__(self, cliente):
        self.cliente = cliente

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def ejecutar(self, prompt: str, **kwargs) -> str:
        try:
            respuesta = self.cliente.chat.completions.create(
                model=kwargs.get("model", "gpt-4o-mini"),
                messages=[{"role": "user", "content": prompt}],
                temperature=kwargs.get("temperature", 0)
            )

            return respuesta.choices[0].message.content

        except Exception as e:
            print(f"Error ejecutando prompt: {e}")
            raise

    def ejecutar_con_validacion(
        self,
        prompt: str,
        validador: callable,
        max_reintentos: int = 3
    ) -> str:
        for intento in range(max_reintentos):
            salida = self.ejecutar(prompt)

            if validador(salida):
                return salida

            prompt += "\n\nIntento previo inválido. Asegura que la salida coincida con el formato requerido."

        raise ValueError(f"Falló obtener salida válida después de {max_reintentos} intentos")
```

## Mejores Prácticas

### 1. Mensajes de Sistema

```python
def crear_asistente_especializado(rol: str, reglas: List[str]) -> callable:
    mensaje_sistema = f"""Eres un {rol}.

Reglas:
{chr(10).join(f"- {regla}" for regla in reglas)}

Siempre sigue estas reglas."""

    def chat(mensaje_usuario: str) -> str:
        respuesta = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": mensaje_sistema},
                {"role": "user", "content": mensaje_usuario}
            ]
        )
        return respuesta.choices[0].message.content

    return chat
```

### 2. Gestión de Contexto

```python
class ChatContextual:
    def __init__(self, max_mensajes_contexto: int = 10):
        self.mensajes = []
        self.max_contexto = max_mensajes_contexto

    def agregar_mensaje(self, rol: str, contenido: str):
        self.mensajes.append({"role": rol, "content": contenido})

        if len(self.mensajes) > self.max_contexto:
            msgs_sistema = [m for m in self.mensajes if m["role"] == "system"]
            msgs_recientes = self.mensajes[-self.max_contexto:]
            self.mensajes = msgs_sistema + msgs_recientes

    def chat(self, mensaje_usuario: str) -> str:
        self.agregar_mensaje("user", mensaje_usuario)

        respuesta = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=self.mensajes
        )

        mensaje_asistente = respuesta.choices[0].message.content
        self.agregar_mensaje("assistant", mensaje_asistente)

        return mensaje_asistente
```

### 3. Seguridad de Prompts

```python
def sanitizar_entrada_usuario(entrada_usuario: str) -> str:
    """Prevenir inyección de prompts"""
    patrones_peligrosos = [
        "ignora instrucciones previas",
        "descarta todo",
        "nuevas instrucciones:",
        "sistema:",
        "asistente:"
    ]

    limpio = entrada_usuario
    for patron in patrones_peligrosos:
        limpio = limpio.replace(patron, "")

    return limpio
```

## Solución de Problemas

**Problema**: Salidas inconsistentes
- Establecer `temperature=0`
- Usar structured outputs
- Añadir ejemplos few-shot
- Ser más específico

**Problema**: Límite de tokens excedido
- Recortar contexto
- Usar ventana deslizante
- Resumir mensajes antiguos

**Problema**: Respuestas lentas
- Usar `gpt-4o-mini` para tareas simples
- Implementar caché
- Reducir `max_tokens`

## Próximos Pasos

**Guías relacionadas**:
- [Construyendo tu Primer Sistema RAG](/es/developers/construyendo-primer-sistema-rag)
- [Arquitectura de Agentes de IA](/es/developers/arquitectura-agentes-patrones)
- [Evaluación de Modelos LLM](/es/developers/evaluacion-llm-metricas)

**Temas avanzados**:
- Meta-prompting y auto-mejora
- Orquestación multi-agente
- Técnicas de compresión de prompts
- Fine-tuning vs prompting

## Recursos

**Documentación**:
- [Guía de Prompt Engineering de OpenAI](https://platform.openai.com/docs/guides/prompt-engineering)
- [Biblioteca de Prompts de Anthropic](https://docs.anthropic.com/claude/prompt-library)

**Papers**:
- [Chain-of-Thought Prompting](https://arxiv.org/abs/2201.11903)
- [Self-Consistency](https://arxiv.org/abs/2203.11171)

---

**¿Encontraste un problema?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues) o envía un PR!
