---
title: "Construyendo tu Primer Sistema RAG con LangChain"
description: "Tutorial paso a paso para crear un RAG básico con embeddings, ChromaDB y OpenAI"
sidebar:
  order: 40
  badge:
    text: "Intermedio"
    variant: note
version: "1.0"
---

# Construyendo tu Primer Sistema RAG con LangChain

## Descripción General

La Generación Aumentada por Recuperación (RAG, por sus siglas en inglés) es uno de los patrones más potentes para construir aplicaciones de IA que necesitan trabajar con tus propios datos. En lugar de depender únicamente de los datos de entrenamiento de un modelo de lenguaje, los sistemas RAG recuperan información relevante de tus documentos y la utilizan para generar respuestas precisas y contextuales.

**Lo que construirás**: Un sistema RAG completo que puede responder preguntas basándose en tus propios documentos usando embeddings, almacenamiento vectorial y recuperación LLM.

**Casos de uso**:
- Bases de conocimiento internas y búsqueda de documentación
- Sistemas de soporte al cliente con información específica de la empresa
- Asistentes de investigación que trabajan con documentos de dominio específico
- Interfaces de chat para grandes colecciones de documentos

**Tiempo para completar**: 45-60 minutos

## Prerrequisitos

**Conocimientos requeridos**:
- Python 3.9+
- Comprensión básica de APIs y operaciones asíncronas
- Familiaridad con entornos virtuales
- Comprensión básica de cómo funcionan los LLMs

**Cuentas/herramientas requeridas**:
- Clave API de OpenAI ([Consíguelo aquí](https://platform.openai.com/api-keys))
- Python 3.9 o superior instalado
- Git y un editor de código (VS Code recomendado)

**Opcional pero útil**:
- Comprensión de embeddings vectoriales
- Experiencia con LangChain (cubriremos los conceptos básicos)
- Familiaridad con Jupyter notebooks para pruebas

## Descripción de la Arquitectura

```
Consulta del Usuario → Modelo de Embedding → Búsqueda Vectorial → Recuperación de Contexto
                                                    ↓
                                Generación LLM ← Documentos Recuperados
                                                    ↓
                                                Respuesta
```

**Componentes clave**:
- **Cargador de Documentos**: Ingiere y procesa tus documentos
- **Divisor de Texto**: Divide documentos en fragmentos manejables
- **Modelo de Embedding**: Convierte texto en representaciones vectoriales
- **Almacén Vectorial**: Almacena y busca embeddings (usaremos ChromaDB)
- **Cadena de Recuperación**: Orquesta el flujo de trabajo RAG
- **LLM**: Genera respuestas basadas en el contexto recuperado

## Configuración del Entorno

### Instalar Dependencias

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar paquetes requeridos
pip install langchain langchain-openai langchain-community chromadb tiktoken pypdf python-dotenv
```

### Configuración

Crea un archivo `.env` en la raíz de tu proyecto:

```text
OPENAI_API_KEY=tu-clave-openai-aqui
```

**Nota de seguridad**: Nunca subas archivos `.env` al control de versiones. Añade a `.gitignore`:

```text
# .gitignore
.env
venv/
__pycache__/
*.pyc
.DS_Store
chroma_db/
```

## Implementación

### Paso 1: Configurando los Fundamentos

**Objetivo**: Inicializar los componentes principales y cargar variables de entorno.

Crea un archivo llamado `sistema_rag.py`:

```python
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, DirectoryLoader, PyPDFLoader
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Cargar variables de entorno
load_dotenv()

# Verificar que la clave API está cargada
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY no encontrada en las variables de entorno")

print("✅ Entorno cargado exitosamente")
```

**Por qué esto funciona**: Estamos usando `python-dotenv` para cargar de forma segura las claves API desde el archivo `.env`, manteniendo la información sensible fuera de nuestro código.

**Problemas comunes**:
- **Problema**: `ModuleNotFoundError: No module named 'langchain'`
  - **Solución**: Asegúrate de haber activado tu entorno virtual antes de instalar los paquetes

### Paso 2: Cargando y Procesando Documentos

**Objetivo**: Cargar tus documentos y dividirlos en fragmentos adecuados para embedding.

```python
def cargar_documentos(ruta_directorio="./documentos"):
    """
    Cargar documentos desde un directorio.
    Soporta: archivos .txt, .pdf, .md
    """
    # Cargar archivos de texto
    cargador_texto = DirectoryLoader(
        ruta_directorio,
        glob="**/*.txt",
        loader_cls=TextLoader
    )

    # Cargar archivos PDF
    cargador_pdf = DirectoryLoader(
        ruta_directorio,
        glob="**/*.pdf",
        loader_cls=PyPDFLoader
    )

    docs_texto = cargador_texto.load()
    docs_pdf = cargador_pdf.load()

    todos_docs = docs_texto + docs_pdf

    print(f"✅ Cargados {len(todos_docs)} documentos")
    return todos_docs


def dividir_documentos(documentos):
    """
    Dividir documentos en fragmentos para procesamiento.
    Tamaño de fragmento: 1000 caracteres con 200 caracteres de superposición
    """
    divisor_texto = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    fragmentos = divisor_texto.split_documents(documentos)
    print(f"✅ Dividido en {len(fragmentos)} fragmentos")
    return fragmentos
```

**¿Por qué estos parámetros?**:
- **chunk_size=1000**: Lo suficientemente grande para mantener el contexto pero lo suficientemente pequeño para embedding eficiente
- **chunk_overlap=200**: Asegura que la información importante en los límites de los fragmentos no se pierda
- **RecursiveCharacterTextSplitter**: Intenta dividir primero en párrafos, luego en oraciones, luego en palabras

**Consideraciones de rendimiento**:
- Para documentación técnica, considera fragmentos más grandes (1500-2000 caracteres)
- Para datos conversacionales, fragmentos más pequeños (500-800 caracteres) funcionan mejor

### Paso 3: Creando el Almacén Vectorial

**Objetivo**: Generar embeddings y almacenarlos en ChromaDB para recuperación eficiente.

```python
def crear_almacen_vectorial(fragmentos, directorio_persistencia="./chroma_db"):
    """
    Crear embeddings y almacenar en ChromaDB.
    Usa el modelo text-embedding-3-small de OpenAI.
    """
    # Inicializar embeddings
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small"
    )

    # Crear almacén vectorial
    almacen_vectorial = Chroma.from_documents(
        documents=fragmentos,
        embedding=embeddings,
        persist_directory=directorio_persistencia
    )

    print(f"✅ Creado almacén vectorial con {len(fragmentos)} embeddings")
    return almacen_vectorial


def cargar_almacen_vectorial_existente(directorio_persistencia="./chroma_db"):
    """
    Cargar un almacén vectorial existente desde disco.
    """
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small"
    )

    almacen_vectorial = Chroma(
        persist_directory=directorio_persistencia,
        embedding_function=embeddings
    )

    print("✅ Cargado almacén vectorial existente")
    return almacen_vectorial
```

**¿Por qué text-embedding-3-small?**:
- Costo-efectivo: ~$0.02 por 1M tokens
- Rápido: Menor latencia que modelos más grandes
- Calidad suficiente para la mayoría de aplicaciones RAG
- Vectores de 1536 dimensiones (buen equilibrio de calidad y almacenamiento)

**Problemas comunes**:
- **Problema**: `chromadb.errors.InvalidDimensionError`
  - **Solución**: Asegúrate de estar usando el mismo modelo de embedding al cargar un almacén existente

### Paso 4: Construyendo la Cadena RAG

**Objetivo**: Crear el pipeline de recuperación y generación.

```python
def crear_cadena_rag(almacen_vectorial):
    """
    Crear una cadena RetrievalQA para responder preguntas.
    """
    # Inicializar LLM
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0  # Respuestas más determinísticas
    )

    # Crear plantilla de prompt personalizada
    plantilla_prompt = """Usa los siguientes fragmentos de contexto para responder la pregunta al final.
Si no conoces la respuesta basándote en el contexto, simplemente di que no lo sabes, no intentes inventar una respuesta.
Siempre cita la fuente de tu información cuando sea posible.

Contexto: {context}

Pregunta: {question}

Respuesta: """

    PROMPT = PromptTemplate(
        template=plantilla_prompt,
        input_variables=["context", "question"]
    )

    # Crear cadena de recuperación
    cadena_qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",  # Meter todos los docs recuperados en el contexto
        retriever=almacen_vectorial.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}  # Recuperar los 4 fragmentos más similares
        ),
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT}
    )

    print("✅ Cadena RAG creada exitosamente")
    return cadena_qa
```

**Explicaciones de parámetros**:
- **temperature=0**: Hace que las respuestas sean más consistentes y factuales
- **k=4**: Recupera 4 fragmentos más relevantes (ajusta según tus necesidades)
- **chain_type="stuff"**: Enfoque simple que concatena todos los docs recuperados
- **return_source_documents=True**: Devuelve los fragmentos fuente para transparencia

**Tipos de cadena alternativos**:
- `"map_reduce"`: Mejor para manejar muchos documentos
- `"refine"`: Refina iterativamente la respuesta usando cada documento
- `"map_rerank"`: Clasifica múltiples respuestas candidatas

### Paso 5: Interfaz de Consulta

**Objetivo**: Crear una interfaz amigable para consultar el sistema RAG.

```python
def consultar_rag(cadena_qa, pregunta):
    """
    Consultar el sistema RAG y devolver resultados formateados.
    """
    resultado = cadena_qa.invoke({"query": pregunta})

    respuesta = resultado["result"]
    fuentes = resultado["source_documents"]

    print("\n" + "="*80)
    print(f"Pregunta: {pregunta}")
    print("="*80)
    print(f"\nRespuesta:\n{respuesta}\n")

    if fuentes:
        print(f"Fuentes ({len(fuentes)} documentos):")
        for i, doc in enumerate(fuentes, 1):
            print(f"\n{i}. {doc.metadata.get('source', 'Fuente desconocida')}")
            print(f"   Vista previa del contenido: {doc.page_content[:200]}...")

    print("="*80 + "\n")

    return resultado


def modo_interactivo(cadena_qa):
    """
    Modo interactivo de preguntas y respuestas.
    """
    print("\n🤖 ¡Sistema RAG Listo! Escribe 'salir' para terminar.\n")

    while True:
        pregunta = input("Tú: ").strip()

        if pregunta.lower() in ['salir', 'exit', 'quit', 'q']:
            print("¡Adiós! 👋")
            break

        if not pregunta:
            continue

        consultar_rag(cadena_qa, pregunta)
```

### Paso 6: Flujo de Ejecución Principal

**Objetivo**: Unir todo en una aplicación completa.

```python
def main():
    """
    Flujo de ejecución principal para el sistema RAG.
    """
    import os

    # Configuración
    RUTA_DOCUMENTOS = "./documentos"
    RUTA_ALMACEN_VECTORIAL = "./chroma_db"

    # Verificar si existe el almacén vectorial
    if os.path.exists(RUTA_ALMACEN_VECTORIAL):
        print("📂 Cargando almacén vectorial existente...")
        almacen_vectorial = cargar_almacen_vectorial_existente(RUTA_ALMACEN_VECTORIAL)
    else:
        print("📂 Creando nuevo almacén vectorial...")

        # Crear directorio de documentos si no existe
        os.makedirs(RUTA_DOCUMENTOS, exist_ok=True)

        # Cargar y procesar documentos
        documentos = cargar_documentos(RUTA_DOCUMENTOS)

        if not documentos:
            print("❌ No se encontraron documentos en ./documentos/")
            print("Por favor, añade archivos .txt o .pdf al directorio documentos")
            return

        fragmentos = dividir_documentos(documentos)
        almacen_vectorial = crear_almacen_vectorial(fragmentos, RUTA_ALMACEN_VECTORIAL)

    # Crear cadena RAG
    cadena_qa = crear_cadena_rag(almacen_vectorial)

    # Consultas de ejemplo
    print("\n🧪 Probando con consultas de ejemplo...")
    consultar_rag(cadena_qa, "¿Cuáles son los temas principales cubiertos en estos documentos?")

    # Iniciar modo interactivo
    modo_interactivo(cadena_qa)


if __name__ == "__main__":
    main()
```

## Pruebas

### Preparar Documentos de Prueba

Crea un directorio `documentos/` y añade algunos archivos de prueba:

```bash
mkdir documentos
echo "La Inteligencia Artificial está transformando el desarrollo de software.
Los sistemas RAG combinan el poder de la recuperación y generación para crear
aplicaciones de IA más precisas." > documentos/intro_ia.txt

echo "LangChain es un framework para desarrollar aplicaciones impulsadas por
modelos de lenguaje. Proporciona herramientas para carga de documentos, división
de texto, embeddings y cadenas." > documentos/intro_langchain.txt
```

### Ejecutar el Sistema

```bash
python sistema_rag.py
```

**Salida esperada**:
```
✅ Entorno cargado exitosamente
📂 Creando nuevo almacén vectorial...
✅ Cargados 2 documentos
✅ Dividido en 8 fragmentos
✅ Creado almacén vectorial con 8 embeddings
✅ Cadena RAG creada exitosamente

🧪 Probando con consultas de ejemplo...
================================================================================
Pregunta: ¿Cuáles son los temas principales cubiertos en estos documentos?
================================================================================

Respuesta:
Los temas principales cubiertos incluyen el impacto de la Inteligencia Artificial
en el desarrollo de software, los sistemas RAG (Generación Aumentada por Recuperación),
y LangChain como framework para construir aplicaciones de modelos de lenguaje...

🤖 ¡Sistema RAG Listo! Escribe 'salir' para terminar.
```

### Pruebas Unitarias

Crea un archivo llamado `test_rag.py`:

```python
import pytest
from sistema_rag import dividir_documentos, crear_almacen_vectorial
from langchain.schema import Document

def test_division_documentos():
    """Probar que los documentos se dividen correctamente"""
    docs = [Document(page_content="Este es un documento de prueba. " * 100)]
    fragmentos = dividir_documentos(docs)

    assert len(fragmentos) > 1
    assert all(len(fragmento.page_content) <= 1200 for fragmento in fragmentos)  # 1000 + superposición


def test_creacion_almacen_vectorial():
    """Probar creación de almacén vectorial con datos de muestra"""
    docs_prueba = [
        Document(page_content="Los sistemas RAG son potentes"),
        Document(page_content="LangChain simplifica el desarrollo de IA")
    ]

    almacen_vectorial = crear_almacen_vectorial(docs_prueba, persist_directory="./test_chroma")

    # Probar recuperación
    resultados = almacen_vectorial.similarity_search("RAG", k=1)
    assert len(resultados) == 1
    assert "RAG" in resultados[0].page_content


def test_relevancia_recuperacion():
    """Probar que la recuperación devuelve documentos relevantes"""
    from sistema_rag import cargar_almacen_vectorial_existente

    almacen_vectorial = cargar_almacen_vectorial_existente("./chroma_db")

    # Consultar sobre un tema específico
    resultados = almacen_vectorial.similarity_search("¿Qué es LangChain?", k=3)

    assert len(resultados) > 0
    # Al menos un resultado debe mencionar LangChain
    assert any("LangChain" in doc.page_content for doc in resultados)
```

Ejecutar pruebas:

```bash
pip install pytest
pytest test_rag.py -v
```

## Optimización

### Ajuste de Rendimiento

**Optimización de embeddings**:
```python
# Procesar por lotes grandes conjuntos de documentos
def embeddings_por_lotes(fragmentos, tamano_lote=100):
    """Procesar embeddings en lotes para evitar límites de tasa"""
    todos_embeddings = []

    for i in range(0, len(fragmentos), tamano_lote):
        lote = fragmentos[i:i+tamano_lote]
        almacen_vectorial = crear_almacen_vectorial(lote)
        todos_embeddings.extend(almacen_vectorial)

        # Pequeño retraso para evitar límites de tasa
        import time
        time.sleep(1)

    return todos_embeddings
```

**Optimización de recuperación**:
```python
# Usar MMR (Máxima Relevancia Marginal) para resultados diversos
recuperador = almacen_vectorial.as_retriever(
    search_type="mmr",  # Resultados más diversos
    search_kwargs={
        "k": 4,
        "fetch_k": 20,  # Obtener más candidatos antes de MMR
        "lambda_mult": 0.5  # Balance entre relevancia y diversidad
    }
)
```

**Filtrado de metadatos**:
```python
# Añadir metadatos al crear documentos
from langchain.schema import Document

docs_con_metadata = [
    Document(
        page_content=contenido,
        metadata={
            "source": nombre_archivo,
            "category": "tecnico",
            "date": "2025-01-15"
        }
    )
    for contenido, nombre_archivo in datos_docs
]

# Filtrar durante recuperación
recuperador = almacen_vectorial.as_retriever(
    search_kwargs={
        "k": 4,
        "filter": {"category": "tecnico"}
    }
)
```

### Optimización de Costos

**Costos estimados** (a enero de 2025):
- Embeddings (text-embedding-3-small): $0.02 por 1M tokens (~$0.02 por 5000 páginas)
- Llamadas LLM (gpt-4o-mini): $0.15 por 1M tokens de entrada, $0.60 por 1M tokens de salida
- ChromaDB: Gratis (almacenamiento local)

**Estrategias para ahorrar costos**:

1. **Cachear embeddings** - Solo regenerar cuando los documentos cambien
2. **Usar modelos más baratos para consultas simples**:
```python
# Usar gpt-4o-mini para la mayoría de consultas, gpt-4 para complejas
def obtener_llm_para_consulta(complejidad_consulta="simple"):
    if complejidad_consulta == "compleja":
        return ChatOpenAI(model="gpt-4o", temperature=0)
    return ChatOpenAI(model="gpt-4o-mini", temperature=0)
```

3. **Implementar caché semántico**:
```python
from langchain.cache import InMemoryCache
import langchain

langchain.llm_cache = InMemoryCache()
```

## Despliegue

### Contenedor Docker

Crea un `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Crear directorios para documentos y almacén vectorial
RUN mkdir -p documentos chroma_db

# Ejecutar la aplicación
CMD ["python", "sistema_rag.py"]
```

Crea `requirements.txt`:
```text
langchain==0.3.15
langchain-openai==0.2.14
langchain-community==0.3.15
chromadb==0.5.23
tiktoken==0.8.0
pypdf==5.1.0
python-dotenv==1.0.1
```

Construir y ejecutar:
```bash
docker build -t mi-sistema-rag .
docker run --env-file .env -v $(pwd)/documentos:/app/documentos mi-sistema-rag
```

### Consideraciones de Producción

**Monitoreo**:
```python
import time
from functools import wraps

def registrar_rendimiento(func):
    """Decorador para registrar el rendimiento de funciones"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        inicio = time.time()
        resultado = func(*args, **kwargs)
        duracion = time.time() - inicio
        print(f"{func.__name__} tomó {duracion:.2f} segundos")
        return resultado
    return wrapper

@registrar_rendimiento
def consultar_rag(cadena_qa, pregunta):
    # ... código existente
```

**Manejo de errores**:
```python
from openai import RateLimitError, APIError

def consultar_con_reintentos(cadena_qa, pregunta, max_reintentos=3):
    """Consultar con reintento automático en límites de tasa"""
    for intento in range(max_reintentos):
        try:
            return cadena_qa.invoke({"query": pregunta})
        except RateLimitError:
            if intento < max_reintentos - 1:
                tiempo_espera = 2 ** intento
                print(f"Límite de tasa alcanzado. Esperando {tiempo_espera}s...")
                time.sleep(tiempo_espera)
            else:
                raise
        except APIError as e:
            print(f"Error de API: {e}")
            raise
```

**Lista de verificación de seguridad**:
- [ ] Claves API almacenadas en variables de entorno, nunca en el código
- [ ] Validación de entrada para prevenir ataques de inyección
- [ ] Límite de tasa implementado
- [ ] Autenticación de usuario si se expone como servicio
- [ ] Registro de consultas para auditorías
- [ ] Rotación regular de claves API

## Solución de Problemas

### Errores Comunes

**Error**: `RateLimitError: Rate limit exceeded for text-embedding-3-small`
```python
# Solución: Implementar retroceso exponencial
import time
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def crear_embeddings_con_reintentos(fragmentos):
    return crear_almacen_vectorial(fragmentos)
```

**Error**: `ChromaDB database is locked`
- **Causa**: Múltiples procesos accediendo a la misma base de datos
- **Solución**: Asegurar que solo un proceso accede a ChromaDB a la vez, o usar configuración cliente-servidor:

```python
import chromadb
from chromadb.config import Settings

# Modo cliente-servidor
client = chromadb.Client(Settings(
    chroma_api_impl="rest",
    chroma_server_host="localhost",
    chroma_server_http_port="8000"
))
```

**Error**: `No se devuelven resultados de la recuperación`
- **Causa**: Los términos de consulta no coinciden bien con el contenido del documento
- **Solución**:
  1. Verificar si los documentos fueron realmente embebidos
  2. Intentar términos de consulta más genéricos
  3. Ajustar umbral de similitud
  4. Usar búsqueda híbrida (semántica + palabra clave)

**Error**: `Sin memoria al procesar documentos grandes`
- **Solución**: Procesar documentos en lotes y usar streaming:
```python
def procesar_documento_grande(ruta_archivo, tamano_fragmento=1000):
    """Procesar por streaming documentos grandes"""
    with open(ruta_archivo, 'r') as f:
        buffer = ""
        for linea in f:
            buffer += linea
            if len(buffer) >= tamano_fragmento:
                yield buffer
                buffer = ""
        if buffer:
            yield buffer
```

## Próximos Pasos

**Mejoras a considerar**:
- [ ] Añadir memoria de conversación para diálogos multi-turno
- [ ] Implementar búsqueda híbrida (BM25 + semántica)
- [ ] Añadir re-ranking con un modelo cross-encoder
- [ ] Crear una interfaz web con Streamlit o Gradio
- [ ] Añadir soporte para más tipos de documentos (CSV, JSON, HTML)
- [ ] Implementar recopilación de feedback del usuario para mejorar la recuperación
- [ ] Añadir métricas de evaluación (precisión de recuperación, calidad de respuestas)
- [ ] Configurar observabilidad con LangSmith o Weights & Biases

**Guías relacionadas**:
- [Arquitectura de Agentes de IA: Patrones y Mejores Prácticas](/es/developers/arquitectura-agentes-patrones)
- [Vectorización y Búsqueda Semántica: Guía Completa](/es/developers/vectorizacion-busqueda-semantica)
- [Prompt Engineering para Desarrolladores](/es/developers/prompt-engineering-desarrolladores)

## Recursos Adicionales

**Documentación oficial**:
- [Documentación de LangChain](https://python.langchain.com/docs/get_started/introduction)
- [Referencia API de OpenAI](https://platform.openai.com/docs/api-reference)
- [Documentación de ChromaDB](https://docs.trychroma.com/)

**Temas avanzados**:
- [RAG from Scratch](https://github.com/langchain-ai/rag-from-scratch) - Serie de videos de LangChain
- [Técnicas Avanzadas de RAG](https://blog.langchain.dev/deconstructing-rag/) - Blog de LangChain
- [Inmersión Profunda en Embeddings](https://platform.openai.com/docs/guides/embeddings) - Guía de OpenAI

**Comunidad**:
- [Discord de LangChain](https://discord.gg/langchain)
- [r/LangChain](https://reddit.com/r/LangChain)
- [Discusiones de GitHub de LangChain](https://github.com/langchain-ai/langchain/discussions)

**Repositorios de ejemplo**:
- [Ejemplos RAG de LangChain](https://github.com/langchain-ai/langchain/tree/master/templates)
- [Plantilla RAG de Producción](https://github.com/langchain-ai/rag-template)

---

**¿Encontraste un problema con esta guía?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues) o envía un PR!
