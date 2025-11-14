---
title: "Vectorización y Búsqueda Semántica: Guía Completa"
description: "Embeddings, bases de datos vectoriales (Pinecone, Weaviate, ChromaDB), técnicas de búsqueda por similitud y mejores prácticas"
sidebar:
  badge:
    text: "Intermedio"
    variant: note
version: "1.0"
---

# Vectorización y Búsqueda Semántica: Guía Completa

## Descripción General

La búsqueda semántica transforma cómo encontramos información al entender el significado en lugar de solo coincidir palabras clave. En su núcleo está la vectorización—convertir texto en representaciones numéricas que capturan el significado semántico, permitiendo que las máquinas entiendan contexto, similitud y relaciones entre piezas de información.

**Lo que aprenderás**: Cómo implementar sistemas de búsqueda semántica usando embeddings y bases de datos vectoriales, desde conceptos básicos hasta implementaciones listas para producción.

**Casos de uso**:
- Búsqueda de documentos que entiende la intención del usuario
- Sistemas de recomendación basados en similitud de contenido
- Detección de duplicados y deduplicación de contenido
- Respuesta a preguntas y sistemas RAG
- Búsqueda multiidioma sin traducción

**Tiempo para completar**: 60-75 minutos

## Prerrequisitos

**Conocimientos requeridos**:
- Python 3.9+
- Comprensión básica de vectores y álgebra lineal
- Familiaridad con APIs y bases de datos
- Comprensión de cómo funcionan los LLMs

**Cuentas/herramientas requeridas**:
- Clave API de OpenAI (para embeddings)
- Opcional: Cuenta de Pinecone, Weaviate o Qdrant para bases de datos vectoriales en la nube
- Entorno Python con pip

**Opcional pero útil**:
- Comprensión de similitud coseno
- Experiencia con NumPy
- Conocimiento de sistemas de bases de datos

## Entendiendo los Embeddings

### ¿Qué son los Embeddings?

Los embeddings son representaciones vectoriales densas de datos que capturan el significado semántico. Los conceptos similares tienen vectores similares.

```python
# Example: Words with similar meanings have similar vectors
"king" → [0.2, 0.5, 0.8, ...] (1536 dimensions)
"queen" → [0.25, 0.48, 0.82, ...]  # Very similar!
"car" → [-0.3, 0.1, -0.2, ...]  # Very different

# Vector arithmetic captures relationships
king - man + woman ≈ queen
paris - france + italy ≈ rome
```

### Por Qué Importan los Embeddings

**Búsqueda tradicional por palabras clave**:
```
Query: "How do I fix a leaky faucet?"
Matches: Documents containing "fix", "leaky", "faucet"
Misses: "Repairing a dripping tap" (different words, same meaning)
```

**Búsqueda semántica con embeddings**:
```
Query embedding: [0.3, 0.7, ...]
Similar documents:
  - "Repairing a dripping tap" (similarity: 0.92)
  - "Fix leaky faucet guide" (similarity: 0.95)
  - "Plumbing maintenance tips" (similarity: 0.78)
```

### Creando Embeddings

```python
from openai import OpenAI
import numpy as np

client = OpenAI()

def create_embedding(text: str, model: str = "text-embedding-3-small") -> list[float]:
    """
    Create an embedding for text using OpenAI's API.

    Args:
        text: Input text to embed
        model: Embedding model to use

    Returns:
        List of floats representing the embedding vector
    """
    # Clean text
    text = text.replace("\n", " ").strip()

    # Create embedding
    response = client.embeddings.create(
        model=model,
        input=text
    )

    return response.data[0].embedding


# Example usage
text = "How do I build a semantic search system?"
embedding = create_embedding(text)

print(f"Embedding dimension: {len(embedding)}")
print(f"First 5 values: {embedding[:5]}")

# Output:
# Embedding dimension: 1536
# First 5 values: [0.0034, -0.0182, 0.0093, -0.0067, 0.0156]
```

### Comparación de Modelos de Embedding

```python
from typing import Dict

EMBEDDING_MODELS = {
    "text-embedding-3-small": {
        "dimension": 1536,
        "cost_per_1m_tokens": 0.02,
        "max_tokens": 8191,
        "use_case": "General purpose, cost-effective"
    },
    "text-embedding-3-large": {
        "dimension": 3072,
        "cost_per_1m_tokens": 0.13,
        "max_tokens": 8191,
        "use_case": "Higher quality, more expensive"
    },
    "text-embedding-ada-002": {
        "dimension": 1536,
        "cost_per_1m_tokens": 0.10,
        "max_tokens": 8191,
        "use_case": "Legacy model, being phased out"
    }
}

def choose_embedding_model(
    quality_priority: str = "balanced",  # "cost", "balanced", "quality"
    volume: str = "medium"  # "low", "medium", "high"
) -> str:
    """Choose appropriate embedding model based on requirements"""

    if quality_priority == "cost" or volume == "high":
        return "text-embedding-3-small"
    elif quality_priority == "quality":
        return "text-embedding-3-large"
    else:
        return "text-embedding-3-small"  # Default: best balance


# Usage
model = choose_embedding_model(quality_priority="cost", volume="high")
print(f"Recommended model: {model}")
print(f"Specs: {EMBEDDING_MODELS[model]}")
```

### Embedding por Lotes para Eficiencia

```python
from typing import List
import time

def create_embeddings_batch(
    texts: List[str],
    model: str = "text-embedding-3-small",
    batch_size: int = 100
) -> List[List[float]]:
    """
    Create embeddings for multiple texts efficiently.

    Args:
        texts: List of texts to embed
        model: Embedding model to use
        batch_size: Number of texts to embed per API call

    Returns:
        List of embedding vectors
    """
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]

        # Clean texts
        cleaned_batch = [text.replace("\n", " ").strip() for text in batch]

        # Create embeddings
        response = client.embeddings.create(
            model=model,
            input=cleaned_batch
        )

        # Extract embeddings
        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)

        # Rate limiting (if needed)
        if i + batch_size < len(texts):
            time.sleep(0.1)

    return all_embeddings


# Example: Embed 1000 documents efficiently
documents = [f"Document {i} about various topics" for i in range(1000)]

start_time = time.time()
embeddings = create_embeddings_batch(documents, batch_size=100)
elapsed = time.time() - start_time

print(f"Embedded {len(documents)} documents in {elapsed:.2f}s")
print(f"Rate: {len(documents)/elapsed:.1f} docs/sec")
```

## Métricas de Similitud

### Similitud Coseno

Métrica más común para comparar embeddings. Mide el ángulo entre vectores.

```python
import numpy as np
from numpy.linalg import norm

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.

    Returns value between -1 and 1:
      1: Identical direction (most similar)
      0: Orthogonal (unrelated)
     -1: Opposite direction (most dissimilar)
    """
    vec1_np = np.array(vec1)
    vec2_np = np.array(vec2)

    return np.dot(vec1_np, vec2_np) / (norm(vec1_np) * norm(vec2_np))


# Example
text1 = "I love programming in Python"
text2 = "Python is my favorite programming language"
text3 = "I enjoy cooking Italian food"

emb1 = create_embedding(text1)
emb2 = create_embedding(text2)
emb3 = create_embedding(text3)

sim_1_2 = cosine_similarity(emb1, emb2)
sim_1_3 = cosine_similarity(emb1, emb3)

print(f"Similarity (text1, text2): {sim_1_2:.4f}")  # High (~0.85)
print(f"Similarity (text1, text3): {sim_1_3:.4f}")  # Low (~0.30)
```

### Otras Métricas de Distancia

```python
def euclidean_distance(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate Euclidean (L2) distance.
    Lower values = more similar.
    """
    vec1_np = np.array(vec1)
    vec2_np = np.array(vec2)
    return np.linalg.norm(vec1_np - vec2_np)


def dot_product_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate dot product similarity.
    Higher values = more similar.
    """
    return np.dot(vec1, vec2)


def manhattan_distance(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate Manhattan (L1) distance.
    Lower values = more similar.
    """
    vec1_np = np.array(vec1)
    vec2_np = np.array(vec2)
    return np.sum(np.abs(vec1_np - vec2_np))


# Comparison
metrics = {
    "Cosine Similarity": cosine_similarity(emb1, emb2),
    "Euclidean Distance": euclidean_distance(emb1, emb2),
    "Dot Product": dot_product_similarity(emb1, emb2),
    "Manhattan Distance": manhattan_distance(emb1, emb2)
}

for metric, value in metrics.items():
    print(f"{metric}: {value:.4f}")
```

**Cuándo usar cada métrica**:
- **Similitud Coseno**: Mejor para la mayoría de aplicaciones de texto (la dirección importa más que la magnitud)
- **Distancia Euclidiana**: Cuando la magnitud importa (ej., embeddings de imágenes)
- **Producto Punto**: Aproximación rápida cuando los vectores están normalizados
- **Distancia Manhattan**: Robusta a valores atípicos, interpretable

## Bases de Datos Vectoriales

### ¿Por Qué Usar Bases de Datos Vectoriales?

**Búsqueda ingenua** (calculando similitud para todos los vectores):
```python
def naive_search(query_embedding: List[float], all_embeddings: List[List[float]], k: int = 5):
    """O(n) complexity - slow for large datasets"""
    similarities = []
    for i, emb in enumerate(all_embeddings):
        sim = cosine_similarity(query_embedding, emb)
        similarities.append((i, sim))

    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:k]

# For 1M vectors: ~seconds per query ❌
```

**Base de datos vectorial** (usando algoritmos de vecinos más cercanos aproximados):
```python
# Same query on vector DB: ~milliseconds per query ✅
# Uses HNSW, IVF, or similar algorithms for fast search
```

### Bases de Datos Vectoriales Populares

| Base de Datos | Tipo | Mejor Para | Características Clave |
|----------|------|----------|--------------|
| **ChromaDB** | Embebida | Desarrollo, conjuntos de datos pequeños-medianos | Fácil de usar, embebida, código abierto |
| **Pinecone** | Nube | Producción, solución administrada | Completamente administrada, escalable, API simple |
| **Weaviate** | Auto-hospedada/Nube | Aplicaciones nativas de ML | GraphQL, búsqueda híbrida, modular |
| **Qdrant** | Auto-hospedada/Nube | Alto rendimiento, filtrado | Basado en Rust, rápido, filtros ricos |
| **Milvus** | Auto-hospedada | Gran escala, empresarial | Altamente escalable, multi-nube |
| **FAISS** | Biblioteca | Investigación, soluciones personalizadas | Biblioteca de Facebook, muy rápida |

### Implementación con ChromaDB

```python
import chromadb
from chromadb.config import Settings

# Initialize client
client = chromadb.PersistentClient(path="./chroma_db")

# Create collection
collection = client.create_collection(
    name="my_documents",
    metadata={"description": "Document embeddings for semantic search"}
)

# Add documents
documents = [
    "Python is a high-level programming language",
    "Machine learning is a subset of artificial intelligence",
    "Neural networks are inspired by biological brains",
    "Data science combines statistics and programming"
]

# ChromaDB can auto-generate embeddings (using default model)
# or you can provide your own
from openai import OpenAI
openai_client = OpenAI()

embeddings = []
for doc in documents:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=doc
    )
    embeddings.append(response.data[0].embedding)

# Add to collection
collection.add(
    documents=documents,
    embeddings=embeddings,
    ids=[f"doc_{i}" for i in range(len(documents))],
    metadatas=[{"source": "manual", "index": i} for i in range(len(documents))]
)

# Query
query = "What is Python used for?"
query_embedding = openai_client.embeddings.create(
    model="text-embedding-3-small",
    input=query
).data[0].embedding

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=2
)

print("Query:", query)
print("\nTop results:")
for i, (doc, distance) in enumerate(zip(results['documents'][0], results['distances'][0])):
    print(f"{i+1}. {doc}")
    print(f"   Distance: {distance:.4f}\n")
```

### Implementación con Pinecone

```python
from pinecone import Pinecone, ServerlessSpec
import os

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Create index
index_name = "semantic-search-demo"

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # text-embedding-3-small dimension
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

# Connect to index
index = pc.Index(index_name)

# Prepare vectors for upsert
vectors_to_upsert = [
    {
        "id": f"doc_{i}",
        "values": embedding,
        "metadata": {
            "text": doc,
            "source": "manual",
            "index": i
        }
    }
    for i, (doc, embedding) in enumerate(zip(documents, embeddings))
]

# Upsert vectors
index.upsert(vectors=vectors_to_upsert)

# Query
query_embedding = openai_client.embeddings.create(
    model="text-embedding-3-small",
    input="What is Python used for?"
).data[0].embedding

results = index.query(
    vector=query_embedding,
    top_k=2,
    include_metadata=True
)

print("Top results from Pinecone:")
for match in results['matches']:
    print(f"Score: {match['score']:.4f}")
    print(f"Text: {match['metadata']['text']}\n")
```

### Implementación con Qdrant

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Initialize client (local)
client = QdrantClient(path="./qdrant_db")

# Or cloud
# client = QdrantClient(
#     url="https://your-cluster.qdrant.io",
#     api_key=os.getenv("QDRANT_API_KEY")
# )

collection_name = "documents"

# Create collection
client.create_collection(
    collection_name=collection_name,
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# Prepare points
points = [
    PointStruct(
        id=i,
        vector=embedding,
        payload={
            "text": doc,
            "source": "manual",
            "index": i
        }
    )
    for i, (doc, embedding) in enumerate(zip(documents, embeddings))
]

# Upload points
client.upsert(
    collection_name=collection_name,
    points=points
)

# Search
search_result = client.search(
    collection_name=collection_name,
    query_vector=query_embedding,
    limit=2
)

print("Top results from Qdrant:")
for hit in search_result:
    print(f"Score: {hit.score:.4f}")
    print(f"Text: {hit.payload['text']}\n")
```

## Técnicas de Búsqueda Avanzadas

### Búsqueda Híbrida (Palabra Clave + Semántica)

Combina búsqueda tradicional por palabras clave con búsqueda semántica para mejores resultados.

```python
from rank_bm25 import BM25Okapi
import numpy as np

class HybridSearch:
    def __init__(self, documents: List[str], embeddings: List[List[float]]):
        self.documents = documents
        self.embeddings = np.array(embeddings)

        # Initialize BM25 for keyword search
        tokenized_docs = [doc.lower().split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized_docs)

    def search(
        self,
        query: str,
        query_embedding: List[float],
        k: int = 5,
        alpha: float = 0.5  # Weight for semantic vs keyword (0=all keyword, 1=all semantic)
    ):
        """
        Perform hybrid search combining semantic and keyword search.

        Args:
            query: Search query text
            query_embedding: Embedding of the query
            k: Number of results to return
            alpha: Balance between semantic (1.0) and keyword (0.0) search

        Returns:
            List of (index, score, document) tuples
        """
        # Semantic search scores
        query_emb = np.array(query_embedding)
        semantic_scores = np.dot(self.embeddings, query_emb) / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_emb)
        )

        # Keyword search scores (BM25)
        tokenized_query = query.lower().split()
        keyword_scores = self.bm25.get_scores(tokenized_query)

        # Normalize scores to 0-1 range
        semantic_scores_norm = (semantic_scores - semantic_scores.min()) / (semantic_scores.max() - semantic_scores.min() + 1e-10)
        keyword_scores_norm = (keyword_scores - keyword_scores.min()) / (keyword_scores.max() - keyword_scores.min() + 1e-10)

        # Combine scores
        combined_scores = alpha * semantic_scores_norm + (1 - alpha) * keyword_scores_norm

        # Get top k
        top_indices = np.argsort(combined_scores)[::-1][:k]

        results = [
            (idx, combined_scores[idx], self.documents[idx])
            for idx in top_indices
        ]

        return results


# Usage
hybrid_searcher = HybridSearch(documents, embeddings)

results = hybrid_searcher.search(
    query="programming Python",
    query_embedding=query_embedding,
    k=3,
    alpha=0.7  # 70% semantic, 30% keyword
)

print("Hybrid search results:")
for idx, score, doc in results:
    print(f"Score: {score:.4f} - {doc}")
```

### Re-ranking con Cross-Encoders

Primero recupera candidatos con bi-encoder rápido (embeddings), luego re-clasifica con cross-encoder más lento pero más preciso.

```python
from sentence_transformers import CrossEncoder

class RerankedSearch:
    def __init__(self, vector_db, reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.vector_db = vector_db
        self.cross_encoder = CrossEncoder(reranker_model)

    def search(self, query: str, initial_k: int = 20, final_k: int = 5):
        """
        Two-stage search with re-ranking.

        Stage 1: Fast retrieval of initial_k candidates
        Stage 2: Re-rank with cross-encoder to get final_k results
        """
        # Stage 1: Initial retrieval
        initial_results = self.vector_db.query(
            query_embeddings=[query_embedding],
            n_results=initial_k
        )

        documents = initial_results['documents'][0]

        # Stage 2: Re-rank with cross-encoder
        pairs = [[query, doc] for doc in documents]
        rerank_scores = self.cross_encoder.predict(pairs)

        # Sort by rerank scores
        ranked_results = sorted(
            zip(documents, rerank_scores),
            key=lambda x: x[1],
            reverse=True
        )[:final_k]

        return ranked_results


# Usage
reranked_searcher = RerankedSearch(collection)
results = reranked_searcher.search(
    query="How to build machine learning models?",
    initial_k=20,
    final_k=5
)

print("Re-ranked results:")
for doc, score in results:
    print(f"Score: {score:.4f} - {doc}")
```

### Filtrado de Metadatos

Filtrar resultados basados en metadatos antes o después de la búsqueda por similitud.

```python
# Add documents with rich metadata
collection.add(
    documents=[
        "Python programming tutorial",
        "Advanced Python techniques",
        "JavaScript basics for beginners"
    ],
    embeddings=[...],  # embeddings
    ids=["doc1", "doc2", "doc3"],
    metadatas=[
        {"language": "python", "level": "beginner", "year": 2024},
        {"language": "python", "level": "advanced", "year": 2024},
        {"language": "javascript", "level": "beginner", "year": 2023}
    ]
)

# Query with filters
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=5,
    where={"language": "python"},  # Only Python documents
    where_document={"$contains": "tutorial"}  # Must contain "tutorial"
)

# Complex filters
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=5,
    where={
        "$and": [
            {"language": {"$eq": "python"}},
            {"level": {"$ne": "advanced"}},
            {"year": {"$gte": 2024}}
        ]
    }
)
```

### Búsqueda Multi-Vector

Buscar en múltiples espacios de embedding para diferentes aspectos.

```python
class MultiVectorSearch:
    def __init__(self):
        self.collections = {
            "content": chromadb.create_collection("content_embeddings"),
            "title": chromadb.create_collection("title_embeddings"),
            "summary": chromadb.create_collection("summary_embeddings")
        }

    def add_document(self, doc_id: str, content: str, title: str, summary: str):
        """Add document with multiple embeddings"""
        content_emb = create_embedding(content)
        title_emb = create_embedding(title)
        summary_emb = create_embedding(summary)

        self.collections["content"].add(ids=[doc_id], embeddings=[content_emb], documents=[content])
        self.collections["title"].add(ids=[doc_id], embeddings=[title_emb], documents=[title])
        self.collections["summary"].add(ids=[doc_id], embeddings=[summary_emb], documents=[summary])

    def search(self, query: str, weights: dict = None):
        """
        Search across multiple embedding spaces with weights.

        Args:
            query: Search query
            weights: Dict of weights for each embedding space
                     e.g., {"content": 0.5, "title": 0.3, "summary": 0.2}
        """
        if weights is None:
            weights = {"content": 0.6, "title": 0.3, "summary": 0.1}

        query_emb = create_embedding(query)

        all_scores = {}
        for space, weight in weights.items():
            results = self.collections[space].query(
                query_embeddings=[query_emb],
                n_results=10
            )

            for doc_id, distance in zip(results['ids'][0], results['distances'][0]):
                if doc_id not in all_scores:
                    all_scores[doc_id] = 0
                # Convert distance to similarity and weight
                similarity = 1 - distance  # Assuming distance metric
                all_scores[doc_id] += similarity * weight

        # Sort by combined score
        ranked = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)
        return ranked[:5]
```

## Mejores Prácticas de Producción

### Estrategias de Fragmentación

```python
from typing import List, Dict

class DocumentChunker:
    """Smart document chunking for optimal search performance"""

    @staticmethod
    def chunk_by_tokens(
        text: str,
        max_tokens: int = 512,
        overlap_tokens: int = 50
    ) -> List[str]:
        """Chunk text by token count with overlap"""
        # Simple word-based approximation (1 token ≈ 0.75 words)
        words = text.split()
        max_words = int(max_tokens * 0.75)
        overlap_words = int(overlap_tokens * 0.75)

        chunks = []
        start = 0

        while start < len(words):
            end = min(start + max_words, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)

            start = end - overlap_words
            if start >= len(words):
                break

        return chunks

    @staticmethod
    def chunk_by_sentences(
        text: str,
        max_sentences: int = 5,
        overlap_sentences: int = 1
    ) -> List[str]:
        """Chunk text by sentences for better semantic coherence"""
        import re

        # Simple sentence splitting
        sentences = re.split(r'(?<=[.!?])\s+', text)

        chunks = []
        start = 0

        while start < len(sentences):
            end = min(start + max_sentences, len(sentences))
            chunk = " ".join(sentences[start:end])
            chunks.append(chunk)

            start = end - overlap_sentences
            if start >= len(sentences):
                break

        return chunks

    @staticmethod
    def chunk_semantic(
        text: str,
        max_chunk_size: int = 1000
    ) -> List[str]:
        """Chunk by semantic boundaries (paragraphs, sections)"""
        # Split by double newlines (paragraphs)
        paragraphs = text.split("\n\n")

        chunks = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk) + len(para) <= max_chunk_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks


# Usage
text = """Your long document here..."""

chunker = DocumentChunker()

# Method 1: Token-based (most common)
chunks_tokens = chunker.chunk_by_tokens(text, max_tokens=512, overlap_tokens=50)

# Method 2: Sentence-based (better semantic coherence)
chunks_sentences = chunker.chunk_by_sentences(text, max_sentences=5)

# Method 3: Semantic boundaries (best for structured docs)
chunks_semantic = chunker.chunk_semantic(text, max_chunk_size=1000)

print(f"Token-based: {len(chunks_tokens)} chunks")
print(f"Sentence-based: {len(chunks_sentences)} chunks")
print(f"Semantic: {len(chunks_semantic)} chunks")
```

### Caché y Rendimiento

```python
from functools import lru_cache
import hashlib
import pickle
import os

class EmbeddingCache:
    """Cache embeddings to reduce API calls"""

    def __init__(self, cache_dir: str = "./embedding_cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)

    def _get_cache_key(self, text: str, model: str) -> str:
        """Generate cache key from text and model"""
        content = f"{model}:{text}"
        return hashlib.md5(content.encode()).hexdigest()

    def get(self, text: str, model: str) -> List[float]:
        """Get embedding from cache"""
        cache_key = self._get_cache_key(text, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.pkl")

        if os.path.exists(cache_file):
            with open(cache_file, 'rb') as f:
                return pickle.load(f)

        return None

    def set(self, text: str, model: str, embedding: List[float]):
        """Store embedding in cache"""
        cache_key = self._get_cache_key(text, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.pkl")

        with open(cache_file, 'wb') as f:
            pickle.dump(embedding, f)

    def create_embedding_cached(self, text: str, model: str = "text-embedding-3-small") -> List[float]:
        """Create embedding with caching"""
        # Check cache first
        cached = self.get(text, model)
        if cached is not None:
            return cached

        # Create new embedding
        embedding = create_embedding(text, model)

        # Cache it
        self.set(text, model, embedding)

        return embedding


# Usage
cache = EmbeddingCache()

# First call: hits API
emb1 = cache.create_embedding_cached("Hello world")

# Second call: uses cache (instant!)
emb2 = cache.create_embedding_cached("Hello world")

print("Embeddings identical:", emb1 == emb2)  # True
```

### Monitoreo y Métricas

```python
from dataclasses import dataclass
from typing import List
import time

@dataclass
class SearchMetrics:
    """Track search performance metrics"""
    query_count: int = 0
    total_latency: float = 0.0
    cache_hits: int = 0
    cache_misses: int = 0

    def record_query(self, latency: float, cache_hit: bool = False):
        """Record a search query"""
        self.query_count += 1
        self.total_latency += latency

        if cache_hit:
            self.cache_hits += 1
        else:
            self.cache_misses += 1

    def get_avg_latency(self) -> float:
        """Get average query latency"""
        if self.query_count == 0:
            return 0.0
        return self.total_latency / self.query_count

    def get_cache_hit_rate(self) -> float:
        """Get cache hit rate"""
        total = self.cache_hits + self.cache_misses
        if total == 0:
            return 0.0
        return self.cache_hits / total

    def report(self) -> str:
        """Generate metrics report"""
        return f"""
Search Performance Metrics:
- Total Queries: {self.query_count}
- Average Latency: {self.get_avg_latency():.3f}s
- Cache Hit Rate: {self.get_cache_hit_rate():.2%}
- Cache Hits: {self.cache_hits}
- Cache Misses: {self.cache_misses}
        """.strip()


# Usage
metrics = SearchMetrics()

def search_with_metrics(query: str, collection) -> dict:
    """Search with performance tracking"""
    start = time.time()

    # Check cache
    cache_key = f"query:{query}"
    cached_result = cache.get(cache_key, "results")

    if cached_result:
        metrics.record_query(time.time() - start, cache_hit=True)
        return cached_result

    # Perform search
    query_emb = create_embedding(query)
    results = collection.query(query_embeddings=[query_emb], n_results=5)

    # Cache results
    cache.set(cache_key, "results", results)

    metrics.record_query(time.time() - start, cache_hit=False)

    return results


# After many queries
print(metrics.report())
```

## Solución de Problemas

### Problemas Comunes

**Problema**: Mala calidad de búsqueda
```python
# Soluciones:
# 1. Verificar tamaños de fragmentos - ¿demasiado grandes o pequeños?
# 2. Asegurar que los embeddings coincidan (mismo modelo para indexación y consulta)
# 3. Probar búsqueda híbrida (semántica + palabra clave)
# 4. Agregar re-ranking
# 5. Revisar la calidad de tus datos
```

**Problema**: Rendimiento de búsqueda lento
```python
# Soluciones:
# 1. Usar base de datos vectorial adecuada (no búsqueda ingenua)
# 2. Optimizar parámetros de índice (parámetros HNSW, clusters IVF)
# 3. Implementar caché
# 4. Usar modelos de embedding más pequeños
# 5. Pre-filtrar con metadatos antes de búsqueda por similitud
```

**Problema**: Costos altos
```python
# Soluciones:
# 1. Caché de embeddings agresivo
# 2. Usar text-embedding-3-small en lugar de large
# 3. Operaciones de embedding por lotes
# 4. Implementar TTL para embeddings poco accedidos
```

## Próximos Pasos

**Guías relacionadas**:
- [Construyendo tu Primer Sistema RAG](/developers/building-first-rag-system)
- [Arquitectura de Agentes IA](/developers/agent-architecture-patterns)
- [Ingeniería de Prompts para Desarrolladores](/developers/prompt-engineering-developers)

**Temas avanzados**:
- Embeddings multi-modales (texto + imágenes)
- Ajuste fino de modelos de embedding
- Búsqueda híbrida sparse-dense (SPLADE)
- Búsqueda semántica cross-lingual
- Monitoreo de drift de embeddings

## Recursos Adicionales

**Documentación**:
- [Guía de Embeddings de OpenAI](https://platform.openai.com/docs/guides/embeddings)
- [Documentación de ChromaDB](https://docs.trychroma.com/)
- [Documentación de Pinecone](https://docs.pinecone.io/)
- [Documentación de Qdrant](https://qdrant.tech/documentation/)

**Papers**:
- [Sentence-BERT](https://arxiv.org/abs/1908.10084)
- [Algoritmo HNSW](https://arxiv.org/abs/1603.09320)

**Comunidad**:
- [Benchmarks de Bases de Datos Vectoriales](https://github.com/erikbern/ann-benchmarks)
- [Tabla de Clasificación de Embeddings](https://huggingface.co/spaces/mteb/leaderboard)

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues) o envía un PR!
