---
title: "Técnicas Avanzadas de RAG: Búsqueda Híbrida, Reranking, Expansión de Consultas"
description: "Implementa patrones avanzados de RAG para mejorar la calidad de recuperación"
sidebar:
  badge:
    text: "Avanzado"
    variant: danger
version: "1.0"
---

# Técnicas Avanzadas de RAG

## Búsqueda Híbrida

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

def hybrid_search(query, alpha=0.5):
    # Búsqueda semántica
    semantic_results = vector_search(query)

    # Búsqueda por palabras clave
    keyword_results = bm25_search(query)

    # Combinar con puntajes ponderados
    combined = {}
    for result in semantic_results:
        combined[result.id] = alpha * result.score

    for result in keyword_results:
        if result.id in combined:
            combined[result.id] += (1 - alpha) * result.score
        else:
            combined[result.id] = (1 - alpha) * result.score

    # Ordenar por puntaje combinado
    ranked = sorted(combined.items(), key=lambda x: x[1], reverse=True)
    return ranked[:10]
```

## Reranking con Cross-Encoder

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def rerank_results(query, documents, top_k=5):
    # Crear pares
    pairs = [[query, doc.text] for doc in documents]

    # Puntuar con cross-encoder
    scores = reranker.predict(pairs)

    # Reordenar
    scored_docs = list(zip(documents, scores))
    scored_docs.sort(key=lambda x: x[1], reverse=True)

    return [doc for doc, score in scored_docs[:top_k]]
```

## Expansión de Consultas

```python
def expand_query(original_query):
    expansion_prompt = f"""Genera 3 reformulaciones alternativas de esta consulta:

    Original: {original_query}

    Las alternativas deben:
    - Usar diferentes palabras clave
    - Cubrir diferentes aspectos
    - Mantener la intención

    Retorna solo las alternativas, una por línea."""

    alternatives = llm.complete(expansion_prompt).split('\n')

    # Buscar con todas las variantes
    all_results = []
    for query_variant in [original_query] + alternatives:
        results = vector_search(query_variant)
        all_results.extend(results)

    # Deduplicar y reordenar
    unique_results = deduplicate(all_results)
    return rerank_results(original_query, unique_results)
```

## Embeddings de Documentos Hipotéticos (HyDE)

```python
def hyde_search(query):
    # Generar respuesta hipotética
    hyde_prompt = f"""Escribe una respuesta detallada a: {query}"""

    hypothetical_doc = llm.complete(hyde_prompt)

    # Embeber documento hipotético
    hypo_embedding = get_embedding(hypothetical_doc)

    # Buscar con embedding hipotético
    results = vector_db.search(hypo_embedding, top_k=10)

    return results
```

## Compresión Contextual

```python
def compress_context(query, documents):
    compression_prompt = f"""Extrae solo las oraciones relevantes a: {query}

    Documentos:
    {documents}

    Retorna solo oraciones relevantes, manteniendo la atribución de origen."""

    compressed = llm.complete(compression_prompt)

    return compressed
```

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
