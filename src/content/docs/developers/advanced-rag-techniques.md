---
title: "Advanced RAG Techniques: Hybrid Search, Reranking, Query Expansion"
description: "Implement advanced RAG patterns for improved retrieval quality"
sidebar:
  order: 45
  badge:
    text: "Advanced"
    variant: danger
version: "1.0"
---

# Advanced RAG Techniques

## Hybrid Search

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

def hybrid_search(query, alpha=0.5):
    # Semantic search
    semantic_results = vector_search(query)
    
    # Keyword search
    keyword_results = bm25_search(query)
    
    # Combine with weighted scores
    combined = {}
    for result in semantic_results:
        combined[result.id] = alpha * result.score
    
    for result in keyword_results:
        if result.id in combined:
            combined[result.id] += (1 - alpha) * result.score
        else:
            combined[result.id] = (1 - alpha) * result.score
    
    # Sort by combined score
    ranked = sorted(combined.items(), key=lambda x: x[1], reverse=True)
    return ranked[:10]
```

## Reranking with Cross-Encoder

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def rerank_results(query, documents, top_k=5):
    # Create pairs
    pairs = [[query, doc.text] for doc in documents]
    
    # Score with cross-encoder
    scores = reranker.predict(pairs)
    
    # Rerank
    scored_docs = list(zip(documents, scores))
    scored_docs.sort(key=lambda x: x[1], reverse=True)
    
    return [doc for doc, score in scored_docs[:top_k]]
```

## Query Expansion

```python
def expand_query(original_query):
    expansion_prompt = f"""Generate 3 alternative phrasings of this query:
    
    Original: {original_query}
    
    Alternatives should:
    - Use different keywords
    - Cover different aspects
    - Maintain intent
    
    Return only the alternatives, one per line."""
    
    alternatives = llm.complete(expansion_prompt).split('\n')
    
    # Search with all variants
    all_results = []
    for query_variant in [original_query] + alternatives:
        results = vector_search(query_variant)
        all_results.extend(results)
    
    # Deduplicate and rerank
    unique_results = deduplicate(all_results)
    return rerank_results(original_query, unique_results)
```

## Hypothetical Document Embeddings (HyDE)

```python
def hyde_search(query):
    # Generate hypothetical answer
    hyde_prompt = f"""Write a detailed answer to: {query}"""
    
    hypothetical_doc = llm.complete(hyde_prompt)
    
    # Embed hypothetical doc
    hypo_embedding = get_embedding(hypothetical_doc)
    
    # Search with hypothetical embedding
    results = vector_db.search(hypo_embedding, top_k=10)
    
    return results
```

## Contextual Compression

```python
def compress_context(query, documents):
    compression_prompt = f"""Extract only sentences relevant to: {query}
    
    Documents:
    {documents}
    
    Return only relevant sentences, maintaining source attribution."""
    
    compressed = llm.complete(compression_prompt)
    
    return compressed
```

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
