---
title: "Construcción de Sistemas de Búsqueda con Embeddings en Producción"
description: "Despliega búsqueda semántica escalable con bases de datos vectoriales, caching y monitoreo"
sidebar:
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---

# Construcción de Sistemas de Búsqueda con Embeddings en Producción

## Descripción General

Pasa de prototipo a búsqueda semántica lista para producción con arquitectura adecuada, caching, monitoreo y escalado.

**Tiempo**: 30 minutos

## Componentes de la Arquitectura

### 1. Generación de Embeddings
- Selección de modelo (OpenAI, Cohere, open-source)
- Procesamiento por lotes
- Estrategia de caching
- Limitación de tasa

### 2. Base de Datos Vectorial
- Pinecone, Qdrant, Weaviate o Milvus
- Configuración de índice
- Filtrado de metadatos
- Búsqueda híbrida

### 3. Pipeline de Consultas
- Preprocesamiento de consultas
- Caching de embeddings
- Reordenamiento de resultados
- Formateo de respuestas

### 4. Monitoreo
- Rastreo de latencia
- Métricas de calidad de búsqueda
- Monitoreo de costos
- Alertas de errores

## Implementación de Producción

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import redis
import hashlib
from prometheus_client import Counter, Histogram
import logging

app = FastAPI()

# Metrics
search_requests = Counter('search_requests_total', 'Total search requests')
search_latency = Histogram('search_latency_seconds', 'Search latency')

# Initialize clients
qdrant = QdrantClient(host="localhost", port=6333)
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Collection setup
COLLECTION_NAME = "documents"

def create_collection():
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
    )

# Caching layer
def get_embedding_cached(text: str):
    """Get embedding with Redis caching"""
    cache_key = f"emb:{hashlib.md5(text.encode()).hexdigest()}"

    # Check cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Generate embedding
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    embedding = response.data[0].embedding

    # Cache for 24 hours
    redis_client.setex(cache_key, 86400, json.dumps(embedding))

    return embedding

# Search with reranking
def search_with_reranking(query: str, limit: int = 10):
    # Get query embedding
    query_embedding = get_embedding_cached(query)

    # Search vector database (get 3x results for reranking)
    results = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        limit=limit * 3
    )

    # Rerank with cross-encoder
    from sentence_transformers import CrossEncoder
    reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    pairs = [[query, hit.payload['text']] for hit in results]
    scores = reranker.predict(pairs)

    # Sort by reranking scores
    reranked = sorted(zip(results, scores), key=lambda x: x[1], reverse=True)

    return [hit for hit, score in reranked[:limit]]

class SearchRequest(BaseModel):
    query: str
    limit: int = 5
    filters: dict = None

@app.post("/search")
@search_latency.time()
def search_endpoint(request: SearchRequest):
    search_requests.inc()

    try:
        results = search_with_reranking(
            query=request.query,
            limit=request.limit
        )

        return {
            "results": [
                {
                    "id": r.id,
                    "score": r.score,
                    "text": r.payload.get('text'),
                    "metadata": r.payload.get('metadata')
                }
                for r in results
            ]
        }
    except Exception as e:
        logging.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
def health():
    return {"status": "healthy"}
```

## Estrategias de Escalado

### Escalado Horizontal
```yaml
# Docker Compose for scaled deployment
version: '3.8'
services:
  api:
    image: search-api:latest
    replicas: 3
    environment:
      - QDRANT_HOST=qdrant
      - REDIS_HOST=redis

  qdrant:
    image: qdrant/qdrant
    volumes:
      - qdrant_data:/qdrant/storage

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx
    ports:
      - "80:80"
    depends_on:
      - api
```

### Estrategia de Caching
- Caché de embeddings (Redis)
- Caché de resultados de consultas
- TTL basado en frecuencia de actualización
- Precalentamiento de caché para consultas populares

## Dashboard de Monitoreo

```python
# Add Prometheus metrics
from prometheus_client import make_asgi_app

# Mount metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Custom metrics
embedding_cache_hits = Counter('embedding_cache_hits', 'Cache hits')
embedding_cache_misses = Counter('embedding_cache_misses', 'Cache misses')
search_quality = Histogram('search_quality_score', 'User feedback scores')
```

## Optimización de Costos

### Generación de Embeddings por Lotes
```python
def batch_embed_documents(documents: List[str], batch_size=100):
    """Process documents in batches to reduce API calls"""
    embeddings = []

    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]

        response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=batch
        )

        embeddings.extend([d.embedding for d in response.data])

    return embeddings
```

### Selección de Modelo
- **text-embedding-3-small**: $0.02/1M tokens
- **text-embedding-3-large**: $0.13/1M tokens
- **Open-source** (local): Gratis pero costo de infraestructura

## Mejores Prácticas

✅ **Hacer**:
- Implementar caching
- Monitorear latencia y costos
- Usar búsqueda híbrida cuando sea necesario
- Reordenar los mejores resultados
- Manejar errores elegantemente
- Versionar tus embeddings

❌ **No hacer**:
- Omitir capa de caching
- Ignorar monitoreo
- Usar procesamiento síncrono para lotes grandes
- Olvidar los límites de tasa

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
