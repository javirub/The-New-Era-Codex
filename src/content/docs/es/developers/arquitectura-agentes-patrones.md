---
title: "Arquitectura de Agentes de IA: Patrones y Mejores Prácticas"
description: "Diseño de agentes autónomos, patterns (ReAct, Chain-of-Thought), herramientas y estrategias de orquestación"
sidebar:
  badge:
    text: "Avanzado"
    variant: caution
version: "1.0"
---

# Arquitectura de Agentes de IA: Patrones y Mejores Prácticas

## Descripción General

Los agentes de IA son sistemas autónomos que pueden percibir su entorno, tomar decisiones y ejecutar acciones para alcanzar objetivos específicos. A diferencia de sistemas simples de prompt-respuesta, los agentes pueden descomponer tareas complejas, usar herramientas y adaptar su comportamiento basándose en retroalimentación.

**Lo que aprenderás**: Cómo diseñar, implementar y orquestar agentes de IA autónomos usando patrones y frameworks modernos.

**Casos de uso**:
- Soporte al cliente automatizado que puede consultar bases de datos y tomar acciones
- Asistentes de investigación que pueden buscar, analizar y sintetizar información
- Agentes DevOps que pueden monitorear sistemas y resolver problemas
- Asistentes de productividad personal que manejan múltiples herramientas

**Tiempo para completar**: 60-90 minutos

## Prerrequisitos

**Conocimientos requeridos**:
- Python 3.9+
- Comprensión de LLMs y sus capacidades
- Patrones básicos de async/await
- Conceptos de APIs RESTful

**Cuentas/herramientas requeridas**:
- Clave API de OpenAI o Anthropic
- Entorno Python con pip
- Familiaridad con LangChain (útil pero no requerido)

**Opcional pero útil**:
- Experiencia con diseño de sistemas
- Comprensión de máquinas de estado
- Conocimiento de sistemas multi-agente

## Fundamentos de Arquitectura de Agentes

### ¿Qué Hace que un Sistema sea un "Agente"?

Un agente de IA típicamente tiene estas características:

1. **Autonomía**: Puede operar independientemente sin intervención humana constante
2. **Reactividad**: Responde a cambios en su entorno
3. **Proactividad**: Toma iniciativa para alcanzar objetivos
4. **Uso de Herramientas**: Puede interactuar con sistemas externos y APIs
5. **Memoria**: Mantiene estado a través de interacciones
6. **Razonamiento**: Puede planificar y tomar decisiones

### Agente vs. Cadena vs. Flujo de Trabajo

```
Cadena Simple:        Entrada → LLM → Salida
                      (determinista, ruta única)

Agente:               Entrada → [Ciclo de Razonamiento] → Salida
                               ↓           ↑
                         Herramientas ←→ Memoria
                      (no determinista, adaptativo)

Sistema Multi-Agente: Entrada → Agente 1 ⇄ Agente 2 ⇄ Agente 3 → Salida
                               ↓         ↓         ↓
                          Herramientas Herramientas Herramientas
                      (colaborativo, especializado)
```

## Patrones Principales de Agentes

### 1. ReAct (Razonamiento + Actuación)

El patrón ReAct alterna entre razonar sobre qué hacer y tomar acciones.

**Estructura del Patrón**:
```
Pensamiento: Necesito encontrar el clima actual
Acción: buscar_clima(ubicacion="San Francisco")
Observación: La temperatura es 18°C, parcialmente nublado
Pensamiento: Ahora tengo la información del clima
Acción: Respuesta Final: Está a 18°C y parcialmente nublado en San Francisco
```

**Implementación**:

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain import hub

# Definir herramientas
def obtener_clima(ubicacion: str) -> str:
    """Obtener clima actual para una ubicación"""
    # En producción, llamar API de clima real
    return f"El clima en {ubicacion} es 22°C y soleado"

def calcular(expresion: str) -> str:
    """Evaluar expresiones matemáticas de forma segura"""
    try:
        return str(eval(expresion, {"__builtins__": {}}))
    except Exception as e:
        return f"Error: {str(e)}"

herramientas = [
    Tool(
        name="obtener_clima",
        func=obtener_clima,
        description="Obtener clima actual para una ubicación específica. La entrada debe ser el nombre de una ciudad."
    ),
    Tool(
        name="calculadora",
        func=calcular,
        description="Realizar cálculos matemáticos. La entrada debe ser una expresión matemática válida."
    )
]

# Crear agente ReAct
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# Obtener plantilla de prompt ReAct
prompt = hub.pull("hwchase17/react")

# Crear agente
agente = create_react_agent(
    llm=llm,
    tools=herramientas,
    prompt=prompt
)

# Crear ejecutor
ejecutor_agente = AgentExecutor(
    agent=agente,
    tools=herramientas,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=5  # Prevenir bucles infinitos
)

# Ejecutar agente
resultado = ejecutor_agente.invoke({
    "input": "¿Cuál es el clima en San Francisco y cuánto es 25 * 4?"
})

print(resultado["output"])
```

**Por qué funciona ReAct**:
- Las trazas de razonamiento explícitas hacen el comportamiento del agente interpretable
- Auto-corrección a través de retroalimentación de observaciones
- Integración natural de herramientas y razonamiento
- Maneja efectivamente tareas complejas de múltiples pasos

**Mejores prácticas**:
- Establecer `max_iterations` para prevenir bucles de razonamiento infinitos
- Usar `handle_parsing_errors=True` para robustez
- Mantener descripciones de herramientas claras y específicas
- Registrar trazas de razonamiento para depuración

### 2. Chain-of-Thought (CoT)

Chain-of-Thought solicita al LLM que descomponga el razonamiento complejo en pasos.

**Zero-Shot CoT**:
```python
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain

llm = ChatOpenAI(model="gpt-4o", temperature=0)

prompt_cot = PromptTemplate(
    input_variables=["pregunta"],
    template="""Responde la siguiente pregunta pensándola paso a paso.

Pregunta: {pregunta}

Pensemos paso a paso:
"""
)

cadena = LLMChain(llm=llm, prompt=prompt_cot)

resultado = cadena.run(
    pregunta="Si una tienda tiene 15 manzanas y vende el 40% de ellas, luego recibe un envío de 8 manzanas más, ¿cuántas manzanas tiene?"
)

print(resultado)
```

**Few-Shot CoT**:
```python
prompt_few_shot = PromptTemplate(
    input_variables=["pregunta"],
    template="""Responde preguntas mostrando tu razonamiento paso a paso.

Ejemplo 1:
Pregunta: Si Juan tiene 5 manzanas y le da 2 a María, ¿cuántas le quedan?
Razonamiento:
1. Juan comienza con 5 manzanas
2. Regala 2 manzanas
3. 5 - 2 = 3
Respuesta: A Juan le quedan 3 manzanas.

Ejemplo 2:
Pregunta: Un tren viaja 60 millas en 1 hora. ¿Qué tan lejos viaja en 2.5 horas?
Razonamiento:
1. Velocidad = 60 millas/hora
2. Tiempo = 2.5 horas
3. Distancia = Velocidad × Tiempo
4. Distancia = 60 × 2.5 = 150 millas
Respuesta: El tren viaja 150 millas.

Ahora responde esta pregunta:
Pregunta: {pregunta}
Razonamiento:
"""
)

cadena = LLMChain(llm=llm, prompt=prompt_few_shot)
```

**Cuándo usar CoT**:
- Problemas matemáticos o lógicos complejos
- Tareas de razonamiento de múltiples pasos
- Cuando la transparencia del razonamiento es importante
- Aplicaciones educativas

### 3. Planificar-y-Ejecutar

Separa la planificación de la ejecución para tareas complejas.

**Arquitectura**:
```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from typing import List, Dict

class AgentePlanificarEjecutar:
    def __init__(self, llm, herramientas):
        self.llm = llm
        self.herramientas = {h.name: h for h in herramientas}
        self.planificador = self._crear_planificador()
        self.ejecutor = self._crear_ejecutor()

    def _crear_planificador(self):
        """Crear cadena de planificación"""
        prompt = PromptTemplate(
            input_variables=["objetivo", "herramientas"],
            template="""Eres un agente de planificación. Crea un plan paso a paso para alcanzar el objetivo.

Herramientas disponibles:
{herramientas}

Objetivo: {objetivo}

Crea un plan numerado con pasos específicos. Cada paso debe usar una de las herramientas disponibles.

Plan:
"""
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _crear_ejecutor(self):
        """Crear cadena de ejecución"""
        prompt = PromptTemplate(
            input_variables=["paso", "contexto"],
            template="""Ejecuta este paso basándote en el contexto de pasos anteriores.

Contexto previo: {contexto}

Paso actual: {paso}

Resultado:
"""
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def ejecutar(self, objetivo: str) -> Dict:
        """Ejecutar bucle de planificar-y-ejecutar"""
        # Paso 1: Crear plan
        descripcion_herramientas = "\n".join([
            f"- {nombre}: {h.description}"
            for nombre, h in self.herramientas.items()
        ])

        plan = self.planificador.run(
            objetivo=objetivo,
            herramientas=descripcion_herramientas
        )

        print(f"📋 Plan:\n{plan}\n")

        # Paso 2: Ejecutar plan
        pasos = [p.strip() for p in plan.split("\n") if p.strip() and p[0].isdigit()]
        contexto = []

        for i, paso in enumerate(pasos, 1):
            print(f"\n🔧 Ejecutando paso {i}: {paso}")

            resultado = self.ejecutor.run(
                paso=paso,
                contexto="\n".join(contexto)
            )

            contexto.append(f"Resultado paso {i}: {resultado}")
            print(f"✅ Resultado: {resultado}")

        return {
            "plan": plan,
            "pasos": pasos,
            "resultados": contexto
        }


# Uso
from langchain.tools import Tool

herramientas = [
    Tool(
        name="buscar",
        func=lambda x: f"Resultados de búsqueda para: {x}",
        description="Buscar información en internet"
    ),
    Tool(
        name="calcular",
        func=lambda x: eval(x),
        description="Realizar cálculos matemáticos"
    )
]

llm = ChatOpenAI(model="gpt-4o", temperature=0)
agente = AgentePlanificarEjecutar(llm=llm, herramientas=herramientas)

resultado = agente.ejecutar(
    objetivo="Encontrar el precio actual de Bitcoin y calcular el 10% de ese valor"
)
```

**Ventajas**:
- Mejor manejo de tareas complejas de múltiples pasos
- Separación más clara de responsabilidades
- Más fácil de depurar y modificar planes
- Puede replanificar si falla la ejecución

**Compromisos**:
- Más llamadas LLM (mayor costo)
- Más lento que la ejecución directa
- Puede crear planes innecesariamente complejos para tareas simples

### 4. ReWOO (Razonamiento Sin Observación)

ReWOO desacopla el razonamiento de las observaciones para reducir el uso de tokens.

**Intuición clave**: Planificar todas las llamadas a herramientas por adelantado, ejecutar en paralelo, luego razonar sobre los resultados.

**Patrón**:
```python
from typing import List, Tuple
import asyncio

class AgenteReWOO:
    def __init__(self, llm, herramientas):
        self.llm = llm
        self.herramientas = {h.name: h for h in herramientas}

    async def planificar(self, tarea: str) -> List[Tuple[str, str]]:
        """Generar plan sin ejecutar"""
        prompt = f"""Crea un plan para resolver esta tarea. Lista cada llamada a herramienta necesaria.

Herramientas disponibles: {list(self.herramientas.keys())}

Tarea: {tarea}

Plan (formato como "nombre_herramienta: parámetros"):
"""
        texto_plan = await self.llm.apredict(prompt)

        # Parsear plan en tuplas (nombre_herramienta, params)
        plan = []
        for linea in texto_plan.split("\n"):
            if ":" in linea:
                herramienta, params = linea.split(":", 1)
                plan.append((herramienta.strip(), params.strip()))

        return plan

    async def ejecutar_plan(self, plan: List[Tuple[str, str]]) -> List[str]:
        """Ejecutar todas las llamadas a herramientas en paralelo"""
        async def ejecutar_herramienta(nombre_herramienta: str, params: str):
            herramienta = self.herramientas.get(nombre_herramienta)
            if herramienta:
                return await asyncio.to_thread(herramienta.func, params)
            return f"Herramienta {nombre_herramienta} no encontrada"

        tareas = [ejecutar_herramienta(h, p) for h, p in plan]
        resultados = await asyncio.gather(*tareas)
        return resultados

    async def resolver(self, tarea: str) -> str:
        """Resolver tarea usando patrón ReWOO"""
        # 1. Planificar
        plan = await self.planificar(tarea)
        print(f"📋 Plan: {plan}")

        # 2. Ejecutar (paralelo)
        resultados = await self.ejecutar_plan(plan)
        print(f"✅ Resultados: {resultados}")

        # 3. Sintetizar
        prompt_sintesis = f"""Dada esta información, responde la tarea original.

Tarea: {tarea}

Resultados de herramientas:
{chr(10).join([f"{i+1}. {r}" for i, r in enumerate(resultados)])}

Respuesta final:
"""
        respuesta = await self.llm.apredict(prompt_sintesis)
        return respuesta


# Uso
async def main():
    from langchain_openai import ChatOpenAI
    from langchain.tools import Tool

    herramientas = [
        Tool(
            name="buscar",
            func=lambda x: f"Resultados para {x}: [Datos simulados]",
            description="Buscar en la web"
        ),
        Tool(
            name="calcular",
            func=lambda x: str(eval(x)),
            description="Calcular expresiones matemáticas"
        )
    ]

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    agente = AgenteReWOO(llm=llm, herramientas=herramientas)

    resultado = await agente.resolver(
        "¿Cuál es la población de Tokio y cuánto es el 10% de ese número?"
    )
    print(f"\n🎯 Resultado final: {resultado}")

# Ejecutar
asyncio.run(main())
```

**Beneficios**:
- Uso reducido de tokens (no enviar observaciones de vuelta al LLM después de cada paso)
- Ejecución paralela de herramientas (más rápido)
- Separación más limpia entre planificación y ejecución

**Limitaciones**:
- No puede adaptar el plan basándose en resultados intermedios
- Requiere conocer todas las herramientas necesarias por adelantado
- Menos flexible que ReAct para escenarios dinámicos

## Integración de Herramientas

### Diseñando Herramientas Efectivas

**Anatomía de una herramienta**:
```python
from langchain.tools import Tool, StructuredTool
from pydantic import BaseModel, Field

# Herramienta simple
herramienta_simple = Tool(
    name="clima",  # Nombre claro y descriptivo
    func=obtener_clima,  # La función a llamar
    description="Obtener clima para una ubicación. Entrada: nombre de ciudad"  # Instrucciones claras de uso
)

# Herramienta estructurada (con seguridad de tipos)
class EntradaClima(BaseModel):
    ubicacion: str = Field(description="Nombre de ciudad")
    unidades: str = Field(description="Unidades de temperatura: 'celsius' o 'fahrenheit'", default="fahrenheit")

def obtener_clima_estructurado(ubicacion: str, unidades: str = "fahrenheit") -> str:
    """Obtener clima con unidades especificadas"""
    return f"Clima en {ubicacion}: 22°{unidades[0].upper()}"

herramienta_estructurada = StructuredTool.from_function(
    func=obtener_clima_estructurado,
    name="clima",
    description="Obtener clima actual para una ubicación con unidades especificadas"
)
```

**Mejores prácticas de diseño de herramientas**:

1. **Descripciones claras**: Ser específico sobre entradas y salidas
2. **Manejo de errores**: Devolver mensajes de error útiles
3. **Validación**: Validar entradas antes de procesar
4. **Idempotencia**: La misma entrada debe dar la misma salida
5. **Timeouts**: Establecer timeouts razonables para APIs externas

**Ejemplo: Herramienta lista para producción**:
```python
import requests
from typing import Optional
from functools import lru_cache
import time

class HerramientaClima:
    def __init__(self, api_key: str, timeout: int = 5):
        self.api_key = api_key
        self.timeout = timeout
        self.tiempo_ultima_llamada = {}

    def _limitar_tasa(self, clave: str, intervalo_min: float = 1.0):
        """Limitación de tasa simple"""
        ahora = time.time()
        if clave in self.tiempo_ultima_llamada:
            transcurrido = ahora - self.tiempo_ultima_llamada[clave]
            if transcurrido < intervalo_min:
                time.sleep(intervalo_min - transcurrido)
        self.tiempo_ultima_llamada[clave] = time.time()

    @lru_cache(maxsize=100)
    def obtener_clima(self, ubicacion: str) -> str:
        """
        Obtener clima actual para una ubicación.

        Args:
            ubicacion: Nombre de ciudad (ej., "San Francisco" o "Londres,UK")

        Returns:
            Cadena de descripción del clima o mensaje de error

        Ejemplos:
            >>> obtener_clima("San Francisco")
            "22°C, Parcialmente Nublado, Humedad: 65%"
        """
        # Validación de entrada
        if not ubicacion or not isinstance(ubicacion, str):
            return "Error: La ubicación debe ser una cadena no vacía"

        if len(ubicacion) > 100:
            return "Error: Nombre de ubicación demasiado largo"

        # Limitación de tasa
        self._limitar_tasa(f"clima_{ubicacion}")

        try:
            # Llamar API de clima
            respuesta = requests.get(
                f"https://api.openweathermap.org/data/2.5/weather",
                params={
                    "q": ubicacion,
                    "appid": self.api_key,
                    "units": "metric"
                },
                timeout=self.timeout
            )

            respuesta.raise_for_status()
            datos = respuesta.json()

            # Formatear respuesta
            temp = datos["main"]["temp"]
            descripcion = datos["weather"][0]["description"]
            humedad = datos["main"]["humidity"]

            return f"{temp}°C, {descripcion.title()}, Humedad: {humedad}%"

        except requests.Timeout:
            return f"Error: Timeout en API de clima para {ubicacion}"
        except requests.RequestException as e:
            return f"Error: Fallo al obtener clima - {str(e)}"
        except (KeyError, ValueError) as e:
            return f"Error: Formato de respuesta inválido - {str(e)}"

# Crear herramienta desde clase
herramienta_clima = Tool(
    name="obtener_clima",
    func=HerramientaClima(api_key="tu-clave-api").obtener_clima,
    description="""Obtener clima actual para cualquier ciudad.

Entrada: Nombre de ciudad (ej., "San Francisco" o "Tokio,JP")
Salida: Temperatura, condiciones y humedad

Ejemplos:
- "San Francisco" → "22°C, Parcialmente Nublado, Humedad: 65%"
- "Ciudad Inválida" → Mensaje de error
"""
)
```

### Composición de Herramientas

**Encadenar herramientas**:
```python
class CadenaHerramientas:
    """Componer múltiples herramientas en un pipeline"""

    def __init__(self, herramientas: List[Tool]):
        self.herramientas = {h.name: h for h in herramientas}

    def crear_pipeline(self, *nombres_herramientas: str) -> Tool:
        """Crear un pipeline de herramientas"""

        def pipeline(datos_entrada: str) -> str:
            resultado = datos_entrada
            for nombre_herramienta in nombres_herramientas:
                herramienta = self.herramientas.get(nombre_herramienta)
                if not herramienta:
                    return f"Error: Herramienta '{nombre_herramienta}' no encontrada"
                resultado = herramienta.func(resultado)
            return resultado

        return Tool(
            name=f"pipeline_{'_'.join(nombres_herramientas)}",
            func=pipeline,
            description=f"Pipeline: {' → '.join(nombres_herramientas)}"
        )


# Uso de ejemplo
herramienta_buscar = Tool(name="buscar", func=buscar_simulada, description="Buscar web")
herramienta_resumir = Tool(name="resumir", func=resumir_simulada, description="Resumir texto")

cadena = CadenaHerramientas([herramienta_buscar, herramienta_resumir])
herramienta_investigar = cadena.crear_pipeline("buscar", "resumir")

resultado = herramienta_investigar.func("Últimos desarrollos en IA")
```

## Gestión de Memoria y Estado

### Memoria de Conversación

```python
from langchain.memory import ConversationBufferMemory, ConversationSummaryMemory
from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI

# Memoria de buffer (almacena todos los mensajes)
memoria_buffer = ConversationBufferMemory(
    memory_key="historial_chat",
    return_messages=True
)

# Memoria de resumen (resume mensajes antiguos para ahorrar tokens)
memoria_resumen = ConversationSummaryMemory(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    memory_key="historial_chat",
    return_messages=True
)

# Agente con memoria
agente_con_memoria = AgentExecutor(
    agent=create_react_agent(llm, herramientas, prompt),
    tools=herramientas,
    memory=memoria_buffer,  # o memoria_resumen
    verbose=True
)

# Conversación con contexto
agente_con_memoria.invoke({"input": "Mi nombre es Alicia"})
agente_con_memoria.invoke({"input": "¿Cuál es mi nombre?"})  # Recordará "Alicia"
```

### Memoria a Largo Plazo

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# Crear almacén vectorial para memoria
embeddings = OpenAIEmbeddings()
almacen_vectorial = Chroma(embedding_function=embeddings, persist_directory="./memoria_agente")

# Crear memoria con recuperador
memoria_recuperador = VectorStoreRetrieverMemory(
    retriever=almacen_vectorial.as_retriever(search_kwargs={"k": 3}),
    memory_key="historial_relevante"
)

# Guardar memorias
memoria_recuperador.save_context(
    {"input": "Usuario prefiere comunicación formal"},
    {"output": "Notado: tono formal preferido"}
)

memoria_recuperador.save_context(
    {"input": "Usuario está interesado en aprendizaje automático"},
    {"output": "Notado: interés en ML"}
)

# Recuperar memorias relevantes
relevante = memoria_recuperador.load_memory_variables(
    {"input": "¿Cuáles son mis preferencias?"}
)
print(relevante)
```

### Máquinas de Estado

```python
from enum import Enum
from typing import Dict, Callable

class EstadoAgente(Enum):
    INACTIVO = "inactivo"
    PLANIFICANDO = "planificando"
    EJECUTANDO = "ejecutando"
    ESPERANDO = "esperando"
    COMPLETADO = "completado"
    ERROR = "error"

class AgenteConEstado:
    def __init__(self):
        self.estado = EstadoAgente.INACTIVO
        self.contexto = {}
        self.transiciones: Dict[EstadoAgente, Dict[EstadoAgente, Callable]] = {
            EstadoAgente.INACTIVO: {
                EstadoAgente.PLANIFICANDO: self._iniciar_planificacion
            },
            EstadoAgente.PLANIFICANDO: {
                EstadoAgente.EJECUTANDO: self._iniciar_ejecucion,
                EstadoAgente.ERROR: self._manejar_error
            },
            EstadoAgente.EJECUTANDO: {
                EstadoAgente.ESPERANDO: self._esperar_resultado,
                EstadoAgente.COMPLETADO: self._completar,
                EstadoAgente.ERROR: self._manejar_error
            },
            EstadoAgente.ESPERANDO: {
                EstadoAgente.EJECUTANDO: self._continuar_ejecucion,
                EstadoAgente.COMPLETADO: self._completar
            }
        }

    def transicionar(self, nuevo_estado: EstadoAgente):
        """Transicionar a nuevo estado con validación"""
        if nuevo_estado not in self.transiciones.get(self.estado, {}):
            raise ValueError(f"Transición inválida desde {self.estado} a {nuevo_estado}")

        func_transicion = self.transiciones[self.estado][nuevo_estado]
        func_transicion()
        self.estado = nuevo_estado
        print(f"Estado: {self.estado.value}")

    def _iniciar_planificacion(self):
        print("Iniciando fase de planificación...")

    def _iniciar_ejecucion(self):
        print("Iniciando ejecución...")

    def _esperar_resultado(self):
        print("Esperando resultados...")

    def _continuar_ejecucion(self):
        print("Continuando ejecución...")

    def _completar(self):
        print("¡Tarea completada!")

    def _manejar_error(self):
        print("Manejando error...")

# Uso
agente = AgenteConEstado()
agente.transicionar(EstadoAgente.PLANIFICANDO)
agente.transicionar(EstadoAgente.EJECUTANDO)
agente.transicionar(EstadoAgente.COMPLETADO)
```

## Sistemas Multi-Agente

### Agentes Colaborativos

```python
from typing import List
from dataclasses import dataclass

@dataclass
class MensajeAgente:
    emisor: str
    receptor: str
    contenido: str
    tipo_mensaje: str  # "solicitud", "respuesta", "difusion"

class AgenteColaborativo:
    def __init__(self, nombre: str, rol: str, llm, herramientas):
        self.nombre = nombre
        self.rol = rol
        self.llm = llm
        self.herramientas = herramientas
        self.bandeja_entrada: List[MensajeAgente] = []

    def enviar_mensaje(self, receptor: str, contenido: str, tipo_mensaje: str = "solicitud"):
        """Enviar mensaje a otro agente"""
        return MensajeAgente(
            emisor=self.nombre,
            receptor=receptor,
            contenido=contenido,
            tipo_mensaje=tipo_mensaje
        )

    def recibir_mensaje(self, mensaje: MensajeAgente):
        """Recibir mensaje de otro agente"""
        self.bandeja_entrada.append(mensaje)

    def procesar_mensajes(self) -> List[MensajeAgente]:
        """Procesar bandeja de entrada y generar respuestas"""
        respuestas = []

        for mensaje in self.bandeja_entrada:
            if mensaje.tipo_mensaje == "solicitud":
                # Procesar solicitud y generar respuesta
                contenido_respuesta = self._manejar_solicitud(mensaje.contenido)
                respuestas.append(
                    self.enviar_mensaje(
                        mensaje.emisor,
                        contenido_respuesta,
                        "respuesta"
                    )
                )

        self.bandeja_entrada.clear()
        return respuestas

    def _manejar_solicitud(self, contenido: str) -> str:
        """Manejar solicitud entrante"""
        prompt = f"""Eres {self.nombre}, un agente {self.rol}.
Procesa esta solicitud y proporciona una respuesta:

Solicitud: {contenido}

Respuesta:
"""
        return self.llm.predict(prompt)


class OrquestadorAgentes:
    def __init__(self):
        self.agentes: Dict[str, AgenteColaborativo] = {}

    def registrar_agente(self, agente: AgenteColaborativo):
        """Registrar un agente"""
        self.agentes[agente.nombre] = agente

    def enrutar_mensaje(self, mensaje: MensajeAgente):
        """Enrutar mensaje al agente apropiado"""
        receptor = self.agentes.get(mensaje.receptor)
        if receptor:
            receptor.recibir_mensaje(mensaje)
        else:
            print(f"Advertencia: Agente '{mensaje.receptor}' no encontrado")

    def ejecutar_ronda(self):
        """Procesar una ronda de mensajes"""
        todos_mensajes = []

        # Cada agente procesa su bandeja de entrada
        for agente in self.agentes.values():
            respuestas = agente.procesar_mensajes()
            todos_mensajes.extend(respuestas)

        # Enrutar todas las respuestas
        for mensaje in todos_mensajes:
            if mensaje.receptor == "difusion":
                for agente in self.agentes.values():
                    if agente.nombre != mensaje.emisor:
                        agente.recibir_mensaje(mensaje)
            else:
                self.enrutar_mensaje(mensaje)

        return len(todos_mensajes) > 0  # Continuar si hay mensajes


# Uso de ejemplo
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")

investigador = AgenteColaborativo(
    nombre="Investigador",
    rol="recopilador de información",
    llm=llm,
    herramientas=[]
)

analista = AgenteColaborativo(
    nombre="Analista",
    rol="analizador de datos",
    llm=llm,
    herramientas=[]
)

escritor = AgenteColaborativo(
    nombre="Escritor",
    rol="creador de contenido",
    llm=llm,
    herramientas=[]
)

# Orquestar
orquestador = OrquestadorAgentes()
orquestador.registrar_agente(investigador)
orquestador.registrar_agente(analista)
orquestador.registrar_agente(escritor)

# Iniciar colaboración
mensaje_inicial = MensajeAgente(
    emisor="Usuario",
    receptor="Investigador",
    contenido="Investiga las últimas tendencias en agentes de IA",
    tipo_mensaje="solicitud"
)

orquestador.enrutar_mensaje(mensaje_inicial)

# Ejecutar rondas de colaboración
for _ in range(3):
    tiene_mensajes = orquestador.ejecutar_ronda()
    if not tiene_mensajes:
        break
```

## Manejo de Errores y Robustez

### Estrategias de Reintento

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
from openai import RateLimitError, APIError

class AgenteRobusto:
    def __init__(self, ejecutor_agente):
        self.ejecutor_agente = ejecutor_agente

    @retry(
        retry=retry_if_exception_type((RateLimitError, APIError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def ejecutar_con_reintentos(self, texto_entrada: str):
        """Ejecutar agente con reintento automático en fallos"""
        try:
            return self.ejecutor_agente.invoke({"input": texto_entrada})
        except Exception as e:
            print(f"Intento fallido: {e}")
            raise

    def ejecutar_con_respaldo(self, texto_entrada: str, respuesta_respaldo: str = None):
        """Ejecutar agente con respuesta de respaldo"""
        try:
            return self.ejecutar_con_reintentos(texto_entrada)
        except Exception as e:
            print(f"Todos los reintentos fallaron: {e}")
            if respuesta_respaldo:
                return {"output": respuesta_respaldo}
            return {"output": "Lo siento, pero no puedo procesar tu solicitud en este momento."}


# Uso
agente_robusto = AgenteRobusto(ejecutor_agente)

resultado = agente_robusto.ejecutar_con_respaldo(
    "Consulta compleja que podría fallar",
    respuesta_respaldo="Permíteme intentar un enfoque diferente..."
)
```

### Degradación Elegante

```python
class AgenteDegradable:
    def __init__(self, llm_primario, llm_respaldo, herramientas):
        self.llm_primario = llm_primario  # ej., GPT-4
        self.llm_respaldo = llm_respaldo  # ej., GPT-3.5
        self.herramientas = herramientas
        self.usar_respaldo = False

    def ejecutar(self, texto_entrada: str):
        """Ejecutar con degradación automática a modelo más simple"""
        llm = self.llm_respaldo if self.usar_respaldo else self.llm_primario

        try:
            agente = create_react_agent(llm, self.herramientas, prompt)
            ejecutor = AgentExecutor(agent=agente, tools=self.herramientas)
            resultado = ejecutor.invoke({"input": texto_entrada})

            # Resetear a primario si el respaldo tuvo éxito
            if self.usar_respaldo:
                self.usar_respaldo = False

            return resultado

        except RateLimitError:
            if not self.usar_respaldo:
                print("Límite de tasa en modelo primario, degradando a respaldo")
                self.usar_respaldo = True
                return self.ejecutar(texto_entrada)  # Reintentar con respaldo
            raise
```

## Observabilidad y Monitoreo

### Registro y Trazado

```python
import logging
from datetime import datetime
from typing import Any, Dict
import json

class RegistradorAgente:
    def __init__(self, nombre_agente: str):
        self.nombre_agente = nombre_agente
        self.registrador = logging.getLogger(nombre_agente)
        self.registrador.setLevel(logging.INFO)

        # Manejador de consola
        manejador_consola = logging.StreamHandler()
        manejador_consola.setLevel(logging.INFO)

        # Manejador de archivo para registros detallados
        manejador_archivo = logging.FileHandler(f"{nombre_agente}_traza.log")
        manejador_archivo.setLevel(logging.DEBUG)

        # Formato
        formateador = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        manejador_consola.setFormatter(formateador)
        manejador_archivo.setFormatter(formateador)

        self.registrador.addHandler(manejador_consola)
        self.registrador.addHandler(manejador_archivo)

    def registrar_interaccion(self, tipo_interaccion: str, datos: Dict[str, Any]):
        """Registrar interacción del agente"""
        entrada_registro = {
            "marca_tiempo": datetime.now().isoformat(),
            "agente": self.nombre_agente,
            "tipo": tipo_interaccion,
            "datos": datos
        }
        self.registrador.info(json.dumps(entrada_registro))

    def registrar_llamada_herramienta(self, nombre_herramienta: str, datos_entrada: Any, datos_salida: Any, duracion: float):
        """Registrar uso de herramienta"""
        self.registrar_interaccion("llamada_herramienta", {
            "herramienta": nombre_herramienta,
            "entrada": str(datos_entrada)[:200],  # Truncar entradas largas
            "salida": str(datos_salida)[:200],
            "duracion_ms": duracion * 1000
        })

    def registrar_error(self, error: Exception, contexto: Dict[str, Any] = None):
        """Registrar errores con contexto"""
        self.registrador.error(f"Error: {error}", extra={
            "contexto": contexto,
            "tipo_error": type(error).__name__
        })


# Uso con agente
registrador = RegistradorAgente("MiAgente")

class AgenteRegistrado:
    def __init__(self, ejecutor_agente, registrador):
        self.ejecutor_agente = ejecutor_agente
        self.registrador = registrador

    def ejecutar(self, texto_entrada: str):
        """Ejecutar agente con registro"""
        self.registrador.registrar_interaccion("entrada", {"consulta": texto_entrada})

        try:
            tiempo_inicio = datetime.now()
            resultado = self.ejecutor_agente.invoke({"input": texto_entrada})
            duracion = (datetime.now() - tiempo_inicio).total_seconds()

            self.registrador.registrar_interaccion("salida", {
                "respuesta": resultado["output"],
                "duracion_s": duracion
            })

            return resultado

        except Exception as e:
            self.registrador.registrar_error(e, {"entrada": texto_entrada})
            raise
```

### Métricas de Rendimiento

```python
from dataclasses import dataclass, field
from typing import List
import time

@dataclass
class MetricasAgente:
    ejecuciones_totales: int = 0
    ejecuciones_exitosas: int = 0
    ejecuciones_fallidas: int = 0
    tokens_totales: int = 0
    costo_total: float = 0.0
    latencia_promedio: float = 0.0
    uso_herramientas: Dict[str, int] = field(default_factory=dict)
    latencias: List[float] = field(default_factory=list)

    def agregar_ejecucion(self, exito: bool, tokens: int, costo: float, latencia: float, herramientas_usadas: List[str]):
        """Registrar una ejecución"""
        self.ejecuciones_totales += 1
        if exito:
            self.ejecuciones_exitosas += 1
        else:
            self.ejecuciones_fallidas += 1

        self.tokens_totales += tokens
        self.costo_total += costo
        self.latencias.append(latencia)
        self.latencia_promedio = sum(self.latencias) / len(self.latencias)

        for herramienta in herramientas_usadas:
            self.uso_herramientas[herramienta] = self.uso_herramientas.get(herramienta, 0) + 1

    def obtener_tasa_exito(self) -> float:
        """Calcular tasa de éxito"""
        if self.ejecuciones_totales == 0:
            return 0.0
        return self.ejecuciones_exitosas / self.ejecuciones_totales

    def obtener_reporte(self) -> str:
        """Generar reporte de métricas"""
        return f"""
Métricas de Rendimiento del Agente:
- Ejecuciones Totales: {self.ejecuciones_totales}
- Tasa de Éxito: {self.obtener_tasa_exito():.2%}
- Latencia Promedio: {self.latencia_promedio:.2f}s
- Tokens Totales: {self.tokens_totales:,}
- Costo Total: ${self.costo_total:.4f}
- Uso de Herramientas: {self.uso_herramientas}
        """.strip()


# Uso
metricas = MetricasAgente()

def ejecutar_agente_con_metricas(agente, texto_entrada: str):
    """Ejecutar agente y rastrear métricas"""
    inicio = time.time()
    herramientas_usadas = []

    try:
        resultado = agente.invoke({"input": texto_entrada})
        latencia = time.time() - inicio

        # Extraer métricas (simplificado)
        tokens = 500  # Se obtendría del callback del LLM
        costo = 0.01  # Se calcularía basado en modelo y tokens

        metricas.agregar_ejecucion(
            exito=True,
            tokens=tokens,
            costo=costo,
            latencia=latencia,
            herramientas_usadas=herramientas_usadas
        )

        return resultado

    except Exception as e:
        latencia = time.time() - inicio
        metricas.agregar_ejecucion(
            exito=False,
            tokens=0,
            costo=0,
            latencia=latencia,
            herramientas_usadas=[]
        )
        raise


# Después de múltiples ejecuciones
print(metricas.obtener_reporte())
```

## Mejores Prácticas de Producción

### Consideraciones de Seguridad

```python
import re
from typing import Any

class AgenteSeguro:
    """Agente con controles de seguridad"""

    PATRONES_PELIGROSOS = [
        r"rm\s+-rf",  # Operaciones de archivo peligrosas
        r"DROP\s+TABLE",  # Inyección SQL
        r"eval\(",  # Inyección de código
        r"__import__",  # Importaciones Python
        r"exec\(",  # Ejecución de código
    ]

    def __init__(self, ejecutor_agente):
        self.ejecutor_agente = ejecutor_agente

    def _validar_entrada(self, texto_entrada: str) -> bool:
        """Validar entrada para amenazas de seguridad"""
        for patron in self.PATRONES_PELIGROSOS:
            if re.search(patron, texto_entrada, re.IGNORECASE):
                raise ValueError(f"Entrada potencialmente peligrosa detectada: {patron}")
        return True

    def _sanitizar_salida(self, salida: Any) -> str:
        """Sanitizar salida para prevenir fuga de información"""
        cadena_salida = str(salida)

        # Eliminar claves API potenciales
        cadena_salida = re.sub(
            r'(api[_-]?key|token)["\']?\s*[:=]\s*["\']?[\w-]+',
            r'\1=***',
            cadena_salida,
            flags=re.IGNORECASE
        )

        # Eliminar rutas de archivo
        cadena_salida = re.sub(
            r'(/[a-zA-Z0-9_-]+)+/[\w.-]+',
            '[RUTA]',
            cadena_salida
        )

        return cadena_salida

    def ejecutar(self, texto_entrada: str, id_usuario: str = None):
        """Ejecutar agente con controles de seguridad"""
        # Validar entrada
        self._validar_entrada(texto_entrada)

        # Registrar para auditoría
        print(f"Usuario {id_usuario} consulta: {texto_entrada[:100]}...")

        # Ejecutar agente
        resultado = self.ejecutor_agente.invoke({"input": texto_entrada})

        # Sanitizar salida
        resultado["output"] = self._sanitizar_salida(resultado["output"])

        return resultado
```

### Limitación de Tasa

```python
from collections import defaultdict
from datetime import datetime, timedelta
import time

class LimitadorTasa:
    def __init__(self, max_solicitudes: int, ventana_segundos: int):
        self.max_solicitudes = max_solicitudes
        self.ventana_segundos = ventana_segundos
        self.solicitudes: Dict[str, List[datetime]] = defaultdict(list)

    def permitir_solicitud(self, id_usuario: str) -> bool:
        """Verificar si la solicitud está permitida bajo el límite de tasa"""
        ahora = datetime.now()
        inicio_ventana = ahora - timedelta(seconds=self.ventana_segundos)

        # Eliminar solicitudes antiguas
        self.solicitudes[id_usuario] = [
            tiempo_sol for tiempo_sol in self.solicitudes[id_usuario]
            if tiempo_sol > inicio_ventana
        ]

        # Verificar límite
        if len(self.solicitudes[id_usuario]) >= self.max_solicitudes:
            return False

        # Registrar solicitud
        self.solicitudes[id_usuario].append(ahora)
        return True

    def esperar_si_necesario(self, id_usuario: str):
        """Esperar hasta que la solicitud esté permitida"""
        while not self.permitir_solicitud(id_usuario):
            time.sleep(1)


# Uso
limitador_tasa = LimitadorTasa(max_solicitudes=10, ventana_segundos=60)

def ejecutar_con_limite_tasa(agente, texto_entrada: str, id_usuario: str):
    """Ejecutar agente con limitación de tasa"""
    if not limitador_tasa.permitir_solicitud(id_usuario):
        raise Exception("Límite de tasa excedido. Por favor, intenta de nuevo más tarde.")

    return agente.invoke({"input": texto_entrada})
```

## Probando Agentes

### Pruebas Unitarias

```python
import pytest
from unittest.mock import Mock, patch

def test_consulta_basica_agente():
    """Probar que el agente puede manejar consulta básica"""
    llm_simulado = Mock()
    llm_simulado.predict.return_value = "París"

    agente = AgenteSimple(llm=llm_simulado, tools=[])
    resultado = agente.ejecutar("¿Cuál es la capital de Francia?")

    assert "París" in resultado["output"]


def test_uso_herramientas_agente():
    """Probar que el agente usa herramientas correctamente"""
    def clima_simulado(ubicacion: str) -> str:
        return f"Clima en {ubicacion}: Soleado"

    herramienta_clima = Tool(
        name="clima",
        func=clima_simulado,
        description="Obtener clima"
    )

    agente = create_react_agent(llm, [herramienta_clima], prompt)
    ejecutor = AgentExecutor(agent=agente, tools=[herramienta_clima])

    resultado = ejecutor.invoke({"input": "¿Cuál es el clima en Tokio?"})

    assert "Tokio" in resultado["output"]
    assert "Soleado" in resultado["output"]


def test_manejo_errores_agente():
    """Probar que el agente maneja errores con elegancia"""
    def herramienta_fallida(x):
        raise ValueError("Error de herramienta")

    herramienta = Tool(name="fallar", func=herramienta_fallida, description="Falla")

    agente = create_react_agent(llm, [herramienta], prompt)
    ejecutor = AgentExecutor(
        agent=agente,
        tools=[herramienta],
        handle_parsing_errors=True
    )

    # No debería lanzar, sino manejar con elegancia
    resultado = ejecutor.invoke({"input": "Usa la herramienta fallar"})
    assert resultado is not None
```

### Pruebas de Integración

```python
@pytest.mark.integration
def test_agente_con_apis_reales():
    """Probar agente con llamadas API reales"""
    agente = crear_agente_produccion()

    resultado = agente.ejecutar("¿Cuál es el clima actual en San Francisco?")

    # Verificar estructura
    assert "output" in resultado
    assert len(resultado["output"]) > 0

    # Verificar que usó herramientas
    assert hasattr(resultado, "intermediate_steps")
    assert len(resultado.intermediate_steps) > 0


@pytest.mark.integration
def test_memoria_conversacion_agente():
    """Probar que el agente mantiene contexto de conversación"""
    agente_con_memoria = crear_agente_con_memoria()

    # Primera interacción
    resultado1 = agente_con_memoria.ejecutar("Mi color favorito es azul")
    assert resultado1 is not None

    # Segunda interacción - debería recordar
    resultado2 = agente_con_memoria.ejecutar("¿Cuál es mi color favorito?")
    assert "azul" in resultado2["output"].lower()
```

## Solución de Problemas

### Problemas Comunes

**Problema**: El agente se queda atascado en bucles
```python
# Solución: Establecer max_iterations y agregar detección de bucles
ejecutor_agente = AgentExecutor(
    agent=agente,
    tools=herramientas,
    max_iterations=5,  # Prevenir bucles infinitos
    early_stopping_method="generate"  # Generar respuesta final si se alcanza max
)
```

**Problema**: El agente hace demasiadas llamadas a herramientas
```python
# Solución: Implementar presupuesto de llamadas a herramientas
class EjecutorAgentePresupuestado:
    def __init__(self, ejecutor_agente, max_llamadas_herramienta: int = 10):
        self.ejecutor_agente = ejecutor_agente
        self.max_llamadas_herramienta = max_llamadas_herramienta
        self.contador_llamadas_herramienta = 0

    def ejecutar(self, texto_entrada: str):
        self.contador_llamadas_herramienta = 0

        def herramienta_rastreada(func_original):
            def envoltura(*args, **kwargs):
                self.contador_llamadas_herramienta += 1
                if self.contador_llamadas_herramienta > self.max_llamadas_herramienta:
                    raise Exception("Presupuesto de llamadas a herramientas excedido")
                return func_original(*args, **kwargs)
            return envoltura

        # Envolver herramientas
        # ... implementación

        return self.ejecutor_agente.invoke({"input": texto_entrada})
```

**Problema**: Comportamiento inconsistente del agente
```python
# Solución: Establecer temperature=0 para respuestas determinísticas
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# También considerar caché
from langchain.cache import InMemoryCache
import langchain
langchain.llm_cache = InMemoryCache()
```

## Próximos Pasos

**Guías relacionadas**:
- [Construyendo tu Primer Sistema RAG](/es/developers/construyendo-primer-sistema-rag)
- [Prompt Engineering para Desarrolladores](/es/developers/prompt-engineering-desarrolladores)
- [Evaluación de Modelos LLM: Métricas y Testing](/es/developers/evaluacion-llm-metricas)

**Temas avanzados para explorar**:
- LangGraph para orquestación compleja de agentes
- Patrones AutoGPT y BabyAGI
- Agentes con memoria externa (Mem0, Zep)
- Evaluación sistemática del rendimiento de agentes
- Despliegue de agentes a escala

## Recursos Adicionales

**Documentación**:
- [Guía de Agentes LangChain](https://python.langchain.com/docs/modules/agents/)
- [Paper ReAct](https://arxiv.org/abs/2210.03629)
- [Documentación LangGraph](https://langchain-ai.github.io/langgraph/)

**Repositorios de ejemplo**:
- [Ejemplos de Agentes LangChain](https://github.com/langchain-ai/langchain/tree/master/templates)
- [Agent Protocols](https://github.com/AI-Engineer-Foundation/agent-protocol)

**Comunidad**:
- [Discord de LangChain](https://discord.gg/langchain)
- [r/LangChain](https://reddit.com/r/LangChain)

---

**¿Encontraste un problema?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues) o envía un PR!
