---
title: "Construyendo tu Primer Sistema RAG con LangChain"
description: "Tutorial paso a paso para crear un sistema RAG básico con embeddings, ChromaDB y OpenAI"
sidebar:
  badge:
    text: "Intermedio"
    variant: note
version: "1.0"
---

# Construyendo tu Primer Sistema RAG con LangChain

## Descripción General

La Generación Aumentada por Recuperación (RAG) es uno de los patrones más poderosos para construir aplicaciones de IA que necesitan trabajar con tus propios datos. En lugar de depender únicamente de los datos de entrenamiento de un modelo de lenguaje, los sistemas RAG recuperan información relevante de tus documentos y la usan para generar respuestas precisas y contextuales.

**Lo que construirás**: Un sistema RAG completo que puede responder preguntas basadas en tus propios documentos usando embeddings, almacenamiento vectorial y recuperación LLM.

**Casos de uso**:
- Bases de conocimiento internas y búsqueda de documentación
- Sistemas de soporte al cliente con información específica de la empresa
- Asistentes de investigación que trabajan con documentos específicos de dominio
- Interfaces de chat para grandes colecciones de documentos

**Tiempo para completar**: 45-60 minutos

## Prerrequisitos

**Conocimientos requeridos**:
- Python 3.9+
- Comprensión básica de APIs y operaciones asíncronas
- Familiaridad con entornos virtuales
- Comprensión básica de cómo funcionan los LLMs

**Cuentas/herramientas requeridas**:
- Clave API de OpenAI ([Obtén una aquí](https://platform.openai.com/api-keys))
- Python 3.9 o superior instalado
- Git y un editor de código (VS Code recomendado)

**Opcional pero útil**:
- Comprensión de embeddings vectoriales
- Experiencia con LangChain (cubriremos lo básico)
- Familiaridad con notebooks de Jupyter para pruebas

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

### Instalación de Dependencias

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
OPENAI_API_KEY=tu-clave-openai-aquí
```

**Nota de seguridad**: Nunca hagas commit de archivos `.env` al control de versiones. Agrégalo a `.gitignore`:

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

### Paso 1: Configuración de la Base

**Objetivo**: Inicializar los componentes principales y cargar las variables de entorno.

Crea un archivo llamado `rag_system.py`:

```python
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, DirectoryLoader, PyPDFLoader
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Load environment variables
load_dotenv()

# Verify API key is loaded
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY not found in environment variables")

print("✅ Environment loaded successfully")
```

**Por qué esto funciona**: Estamos usando `python-dotenv` para cargar de forma segura las claves API desde el archivo `.env`, manteniendo la información sensible fuera de nuestro código.

**Problemas comunes**:
- **Problema**: `ModuleNotFoundError: No module named 'langchain'`
  - **Solución**: Asegúrate de haber activado tu entorno virtual antes de instalar los paquetes

### Paso 2: Cargar y Procesar Documentos

**Objetivo**: Cargar tus documentos y dividirlos en fragmentos adecuados para embedding.

```python
def load_documents(directory_path="./documents"):
    """
    Load documents from a directory.
    Supports: .txt, .pdf, .md files
    """
    # Load text files
    text_loader = DirectoryLoader(
        directory_path,
        glob="**/*.txt",
        loader_cls=TextLoader
    )

    # Load PDF files
    pdf_loader = DirectoryLoader(
        directory_path,
        glob="**/*.pdf",
        loader_cls=PyPDFLoader
    )

    text_docs = text_loader.load()
    pdf_docs = pdf_loader.load()

    all_docs = text_docs + pdf_docs

    print(f"✅ Loaded {len(all_docs)} documents")
    return all_docs


def split_documents(documents):
    """
    Split documents into chunks for processing.
    Chunk size: 1000 characters with 200 character overlap
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    chunks = text_splitter.split_documents(documents)
    print(f"✅ Split into {len(chunks)} chunks")
    return chunks
```

**¿Por qué estos parámetros?**:
- **chunk_size=1000**: Lo suficientemente grande para mantener el contexto pero lo suficientemente pequeño para embedding eficiente
- **chunk_overlap=200**: Asegura que la información importante en los límites de los fragmentos no se pierda
- **RecursiveCharacterTextSplitter**: Intenta dividir primero en párrafos, luego en oraciones, luego en palabras

**Consideraciones de rendimiento**:
- Para documentación técnica, considera fragmentos más grandes (1500-2000 caracteres)
- Para datos conversacionales, fragmentos más pequeños (500-800 caracteres) funcionan mejor

### Paso 3: Creación del Almacén Vectorial

**Objetivo**: Generar embeddings y almacenarlos en ChromaDB para recuperación eficiente.

```python
def create_vector_store(chunks, persist_directory="./chroma_db"):
    """
    Create embeddings and store in ChromaDB.
    Uses OpenAI's text-embedding-3-small model.
    """
    # Initialize embeddings
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small"
    )

    # Create vector store
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_directory
    )

    print(f"✅ Created vector store with {len(chunks)} embeddings")
    return vectorstore


def load_existing_vector_store(persist_directory="./chroma_db"):
    """
    Load an existing vector store from disk.
    """
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small"
    )

    vectorstore = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )

    print("✅ Loaded existing vector store")
    return vectorstore
```

**¿Por qué text-embedding-3-small?**:
- Rentable: ~$0.02 por 1M tokens
- Rápido: Menor latencia que modelos más grandes
- Calidad suficiente para la mayoría de aplicaciones RAG
- Vectores de 1536 dimensiones (buen equilibrio de calidad y almacenamiento)

**Problemas comunes**:
- **Problema**: `chromadb.errors.InvalidDimensionError`
  - **Solución**: Asegúrate de usar el mismo modelo de embedding al cargar un almacén existente

### Paso 4: Construcción de la Cadena RAG

**Objetivo**: Crear el pipeline de recuperación y generación.

```python
def create_rag_chain(vectorstore):
    """
    Create a RetrievalQA chain for question answering.
    """
    # Initialize LLM
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0  # More deterministic responses
    )

    # Create custom prompt template
    prompt_template = """Use the following pieces of context to answer the question at the end.
If you don't know the answer based on the context, just say that you don't know, don't try to make up an answer.
Always cite the source of your information when possible.

Context: {context}

Question: {question}

Answer: """

    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )

    # Create retrieval chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",  # Stuff all retrieved docs into context
        retriever=vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}  # Retrieve top 4 most similar chunks
        ),
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT}
    )

    print("✅ RAG chain created successfully")
    return qa_chain
```

**Explicación de parámetros**:
- **temperature=0**: Hace las respuestas más consistentes y factuales
- **k=4**: Recupera los 4 fragmentos más relevantes (ajusta según tus necesidades)
- **chain_type="stuff"**: Enfoque simple que concatena todos los documentos recuperados
- **return_source_documents=True**: Devuelve los fragmentos fuente para transparencia

**Tipos de cadena alternativos**:
- `"map_reduce"`: Mejor para manejar muchos documentos
- `"refine"`: Refina iterativamente la respuesta usando cada documento
- `"map_rerank"`: Clasifica múltiples respuestas candidatas

### Paso 5: Interfaz de Consulta

**Objetivo**: Crear una interfaz amigable para consultar el sistema RAG.

```python
def query_rag(qa_chain, question):
    """
    Query the RAG system and return formatted results.
    """
    result = qa_chain.invoke({"query": question})

    answer = result["result"]
    sources = result["source_documents"]

    print("\n" + "="*80)
    print(f"Question: {question}")
    print("="*80)
    print(f"\nAnswer:\n{answer}\n")

    if sources:
        print(f"Sources ({len(sources)} documents):")
        for i, doc in enumerate(sources, 1):
            print(f"\n{i}. {doc.metadata.get('source', 'Unknown source')}")
            print(f"   Content preview: {doc.page_content[:200]}...")

    print("="*80 + "\n")

    return result


def interactive_mode(qa_chain):
    """
    Interactive question-answering mode.
    """
    print("\n🤖 RAG System Ready! Type 'exit' to quit.\n")

    while True:
        question = input("You: ").strip()

        if question.lower() in ['exit', 'quit', 'q']:
            print("Goodbye! 👋")
            break

        if not question:
            continue

        query_rag(qa_chain, question)
```

### Paso 6: Flujo de Ejecución Principal

**Objetivo**: Unir todo en una aplicación completa.

```python
def main():
    """
    Main execution flow for the RAG system.
    """
    import os

    # Configuration
    DOCUMENTS_PATH = "./documents"
    VECTOR_STORE_PATH = "./chroma_db"

    # Check if vector store exists
    if os.path.exists(VECTOR_STORE_PATH):
        print("📂 Loading existing vector store...")
        vectorstore = load_existing_vector_store(VECTOR_STORE_PATH)
    else:
        print("📂 Creating new vector store...")

        # Create documents directory if it doesn't exist
        os.makedirs(DOCUMENTS_PATH, exist_ok=True)

        # Load and process documents
        documents = load_documents(DOCUMENTS_PATH)

        if not documents:
            print("❌ No documents found in ./documents/")
            print("Please add .txt or .pdf files to the documents directory")
            return

        chunks = split_documents(documents)
        vectorstore = create_vector_store(chunks, VECTOR_STORE_PATH)

    # Create RAG chain
    qa_chain = create_rag_chain(vectorstore)

    # Example queries
    print("\n🧪 Testing with example queries...")
    query_rag(qa_chain, "What are the main topics covered in these documents?")

    # Start interactive mode
    interactive_mode(qa_chain)


if __name__ == "__main__":
    main()
```

## Pruebas

### Preparar Documentos de Prueba

Crea un directorio `documents/` y agrega algunos archivos de prueba:

```bash
mkdir documents
echo "Artificial Intelligence is transforming software development.
RAG systems combine the power of retrieval and generation to create
more accurate AI applications." > documents/ai_intro.txt

echo "LangChain is a framework for developing applications powered by
language models. It provides tools for document loading, text splitting,
embeddings, and chains." > documents/langchain_intro.txt
```

### Ejecutar el Sistema

```bash
python rag_system.py
```

**Salida esperada**:
```
✅ Environment loaded successfully
📂 Creating new vector store...
✅ Loaded 2 documents
✅ Split into 8 chunks
✅ Created vector store with 8 embeddings
✅ RAG chain created successfully

🧪 Testing with example queries...
================================================================================
Question: What are the main topics covered in these documents?
================================================================================

Answer:
The main topics covered include Artificial Intelligence's impact on software
development, RAG (Retrieval-Augmented Generation) systems, and LangChain as a
framework for building language model applications...

🤖 RAG System Ready! Type 'exit' to quit.
```

### Pruebas Unitarias

Crea un archivo llamado `test_rag.py`:

```python
import pytest
from rag_system import split_documents, create_vector_store
from langchain.schema import Document

def test_document_splitting():
    """Test that documents are split correctly"""
    docs = [Document(page_content="This is a test document. " * 100)]
    chunks = split_documents(docs)

    assert len(chunks) > 1
    assert all(len(chunk.page_content) <= 1200 for chunk in chunks)  # 1000 + overlap


def test_vector_store_creation():
    """Test vector store creation with sample data"""
    test_docs = [
        Document(page_content="RAG systems are powerful"),
        Document(page_content="LangChain simplifies AI development")
    ]

    vectorstore = create_vector_store(test_docs, persist_directory="./test_chroma")

    # Test retrieval
    results = vectorstore.similarity_search("RAG", k=1)
    assert len(results) == 1
    assert "RAG" in results[0].page_content


def test_retrieval_relevance():
    """Test that retrieval returns relevant documents"""
    from rag_system import load_existing_vector_store

    vectorstore = load_existing_vector_store("./chroma_db")

    # Query about a specific topic
    results = vectorstore.similarity_search("What is LangChain?", k=3)

    assert len(results) > 0
    # At least one result should mention LangChain
    assert any("LangChain" in doc.page_content for doc in results)
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
# Batch process large document sets
def batch_embed_documents(chunks, batch_size=100):
    """Process embeddings in batches to avoid rate limits"""
    all_embeddings = []

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        vectorstore = create_vector_store(batch)
        all_embeddings.extend(vectorstore)

        # Small delay to avoid rate limiting
        import time
        time.sleep(1)

    return all_embeddings
```

**Optimización de recuperación**:
```python
# Use MMR (Maximal Marginal Relevance) for diverse results
retriever = vectorstore.as_retriever(
    search_type="mmr",  # More diverse results
    search_kwargs={
        "k": 4,
        "fetch_k": 20,  # Fetch more candidates before MMR
        "lambda_mult": 0.5  # Balance between relevance and diversity
    }
)
```

**Filtrado de metadatos**:
```python
# Add metadata when creating documents
from langchain.schema import Document

docs_with_metadata = [
    Document(
        page_content=content,
        metadata={
            "source": filename,
            "category": "technical",
            "date": "2025-01-15"
        }
    )
    for content, filename in doc_data
]

# Filter during retrieval
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 4,
        "filter": {"category": "technical"}
    }
)
```

### Optimización de Costos

**Costos estimados** (a enero de 2025):
- Embeddings (text-embedding-3-small): $0.02 por 1M tokens (~$0.02 por 5000 páginas)
- Llamadas LLM (gpt-4o-mini): $0.15 por 1M tokens de entrada, $0.60 por 1M tokens de salida
- ChromaDB: Gratis (almacenamiento local)

**Estrategias de ahorro de costos**:

1. **Caché de embeddings** - Solo regenerar cuando los documentos cambien
2. **Usar modelos más baratos para consultas simples**:
```python
# Use gpt-4o-mini for most queries, gpt-4 for complex ones
def get_llm_for_query(query_complexity="simple"):
    if query_complexity == "complex":
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

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for documents and vector store
RUN mkdir -p documents chroma_db

# Run the application
CMD ["python", "rag_system.py"]
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
docker build -t my-rag-system .
docker run --env-file .env -v $(pwd)/documents:/app/documents my-rag-system
```

### Consideraciones de Producción

**Monitoreo**:
```python
import time
from functools import wraps

def log_performance(func):
    """Decorator to log function performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        print(f"{func.__name__} took {duration:.2f} seconds")
        return result
    return wrapper

@log_performance
def query_rag(qa_chain, question):
    # ... existing code
```

**Manejo de errores**:
```python
from openai import RateLimitError, APIError

def query_with_retry(qa_chain, question, max_retries=3):
    """Query with automatic retry on rate limits"""
    for attempt in range(max_retries):
        try:
            return qa_chain.invoke({"query": question})
        except RateLimitError:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"Rate limit hit. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
        except APIError as e:
            print(f"API Error: {e}")
            raise
```

**Lista de verificación de seguridad**:
- [ ] Claves API almacenadas en variables de entorno, nunca en código
- [ ] Validación de entrada para prevenir ataques de inyección
- [ ] Limitación de tasa implementada
- [ ] Autenticación de usuario si se expone como servicio
- [ ] Registro de consultas para auditoría
- [ ] Rotación regular de claves API

## Solución de Problemas

### Errores Comunes

**Error**: `RateLimitError: Rate limit exceeded for text-embedding-3-small`
```python
# Solution: Implement exponential backoff
import time
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def create_embeddings_with_retry(chunks):
    return create_vector_store(chunks)
```

**Error**: `ChromaDB database is locked`
- **Causa**: Múltiples procesos accediendo a la misma base de datos
- **Solución**: Asegúrate de que solo un proceso acceda a ChromaDB a la vez, o usa una configuración cliente-servidor:

```python
import chromadb
from chromadb.config import Settings

# Client-server mode
client = chromadb.Client(Settings(
    chroma_api_impl="rest",
    chroma_server_host="localhost",
    chroma_server_http_port="8000"
))
```

**Error**: `No results returned from retrieval`
- **Causa**: Los términos de consulta no coinciden bien con el contenido del documento
- **Solución**:
  1. Verificar si los documentos fueron realmente embebidos
  2. Intentar términos de consulta más genéricos
  3. Ajustar el umbral de similitud
  4. Usar búsqueda híbrida (semántica + palabra clave)

**Error**: `Out of memory when processing large documents`
- **Solución**: Procesar documentos en lotes y usar streaming:
```python
def process_large_document(file_path, chunk_size=1000):
    """Stream process large documents"""
    with open(file_path, 'r') as f:
        buffer = ""
        for line in f:
            buffer += line
            if len(buffer) >= chunk_size:
                yield buffer
                buffer = ""
        if buffer:
            yield buffer
```

## Próximos Pasos

**Mejoras a considerar**:
- [ ] Agregar memoria de conversación para diálogos multi-turno
- [ ] Implementar búsqueda híbrida (BM25 + semántica)
- [ ] Agregar re-ranking con un modelo cross-encoder
- [ ] Crear una interfaz web con Streamlit o Gradio
- [ ] Agregar soporte para más tipos de documentos (CSV, JSON, HTML)
- [ ] Implementar recopilación de retroalimentación de usuarios para mejorar la recuperación
- [ ] Agregar métricas de evaluación (precisión de recuperación, calidad de respuesta)
- [ ] Configurar observabilidad con LangSmith o Weights & Biases

**Guías relacionadas**:
- [Arquitectura de Agentes IA: Patrones y Mejores Prácticas](/developers/agent-architecture-patterns)
- [Vectorización y Búsqueda Semántica: Guía Completa](/developers/vectorization-semantic-search)
- [Ingeniería de Prompts para Desarrolladores](/developers/prompt-engineering-developers)

## Recursos Adicionales

**Documentación oficial**:
- [Documentación de LangChain](https://python.langchain.com/docs/get_started/introduction)
- [Referencia API de OpenAI](https://platform.openai.com/docs/api-reference)
- [Documentación de ChromaDB](https://docs.trychroma.com/)

**Temas avanzados**:
- [RAG from Scratch](https://github.com/langchain-ai/rag-from-scratch) - Serie de videos de LangChain
- [Técnicas RAG Avanzadas](https://blog.langchain.dev/deconstructing-rag/) - Blog de LangChain
- [Inmersión Profunda en Embeddings](https://platform.openai.com/docs/guides/embeddings) - Guía de OpenAI

**Comunidad**:
- [Discord de LangChain](https://discord.gg/langchain)
- [r/LangChain](https://reddit.com/r/LangChain)
- [Discusiones de GitHub de LangChain](https://github.com/langchain-ai/langchain/discussions)

**Repositorios de ejemplo**:
- [Ejemplos RAG de LangChain](https://github.com/langchain-ai/langchain/tree/master/templates)
- [Plantilla RAG de Producción](https://github.com/langchain-ai/rag-template)

---

**¿Encontraste un problema con esta guía?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues) o envía un PR!
