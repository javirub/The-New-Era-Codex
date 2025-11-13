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

La búsqueda semántica transforma cómo encontramos información al comprender significado en lugar de solo coincidencias de palabras clave. En su núcleo está la vectorización: convertir texto en representaciones numéricas que capturan significado semántico.

**Lo que aprenderás**: Cómo implementar sistemas de búsqueda semántica usando embeddings y bases de datos vectoriales.

**Casos de uso**:
- Búsqueda de documentos que entiende intención
- Sistemas de recomendación por similitud
- Detección de duplicados
- Sistemas RAG y Q&A
- Búsqueda multiidioma

**Tiempo para completar**: 60-75 minutos

## Prerrequisitos

**Conocimientos requeridos**:
- Python 3.9+
- Vectores y álgebra lineal básica
- APIs y bases de datos
- Funcionamiento de LLMs

**Cuentas requeridas**:
- Clave API de OpenAI
- Opcional: Pinecone, Weaviate o Qdrant

## Entendiendo Embeddings

### ¿Qué son los Embeddings?

Los embeddings son representaciones vectoriales densas que capturan significado semántico.

```python
from openai import OpenAI

client = OpenAI()

def crear_embedding(texto: str, modelo: str = "text-embedding-3-small") -> list[float]:
    """Crear embedding para texto"""
    texto = texto.replace("\n", " ").strip()

    respuesta = client.embeddings.create(
        model=modelo,
        input=texto
    )

    return respuesta.data[0].embedding
```

### Comparación de Modelos

- **text-embedding-3-small**: 1536 dims, $0.02/1M tokens - Uso general, económico
- **text-embedding-3-large**: 3072 dims, $0.13/1M tokens - Mayor calidad
- **text-embedding-ada-002**: 1536 dims, $0.10/1M tokens - Modelo legacy

### Embeddings por Lote

```python
from typing import List
import time

def crear_embeddings_lote(
    textos: List[str],
    modelo: str = "text-embedding-3-small",
    tamano_lote: int = 100
) -> List[List[float]]:
    """Crear embeddings eficientemente en lotes"""
    todos_embeddings = []

    for i in range(0, len(textos), tamano_lote):
        lote = textos[i:i + tamano_lote]
        lote_limpio = [texto.replace("\n", " ").strip() for texto in lote]

        respuesta = client.embeddings.create(
            model=modelo,
            input=lote_limpio
        )

        embeddings_lote = [item.embedding for item in respuesta.data]
        todos_embeddings.extend(embeddings_lote)

        if i + tamano_lote < len(textos):
            time.sleep(0.1)

    return todos_embeddings
```

## Métricas de Similitud

### Similitud de Coseno

```python
import numpy as np
from numpy.linalg import norm

def similitud_coseno(vec1: List[float], vec2: List[float]) -> float:
    """
    Calcular similitud de coseno entre vectores.
    Retorna valor entre -1 y 1:
      1: Máxima similitud
      0: No relacionados
     -1: Opuestos
    """
    vec1_np = np.array(vec1)
    vec2_np = np.array(vec2)

    return np.dot(vec1_np, vec2_np) / (norm(vec1_np) * norm(vec2_np))
```

### Otras Métricas

```python
def distancia_euclidiana(vec1: List[float], vec2: List[float]) -> float:
    """Distancia L2 - valores menores = más similar"""
    return np.linalg.norm(np.array(vec1) - np.array(vec2))

def producto_punto(vec1: List[float], vec2: List[float]) -> float:
    """Producto punto - valores mayores = más similar"""
    return np.dot(vec1, vec2)
```

## Bases de Datos Vectoriales

### Comparación

| Base de Datos | Tipo | Mejor Para | Características Clave |
|--------------|------|-----------|----------------------|
| **ChromaDB** | Embebida | Desarrollo | Fácil de usar, open-source |
| **Pinecone** | Cloud | Producción | Gestionada, escalable |
| **Weaviate** | Híbrido | ML-nativo | GraphQL, búsqueda híbrida |
| **Qdrant** | Híbrido | Alto rendimiento | Rust, filtros ricos |

### Implementación ChromaDB

```python
import chromadb

# Inicializar cliente
client = chromadb.PersistentClient(path="./chroma_db")

# Crear colección
coleccion = client.create_collection(
    name="mis_documentos",
    metadata={"description": "Embeddings de documentos"}
)

# Añadir documentos
documentos = [
    "Python es un lenguaje de programación de alto nivel",
    "El aprendizaje automático es un subconjunto de IA",
    "Las redes neuronales se inspiran en cerebros biológicos"
]

embeddings = [crear_embedding(doc) for doc in documentos]

coleccion.add(
    documents=documentos,
    embeddings=embeddings,
    ids=[f"doc_{i}" for i in range(len(documentos))],
    metadatas=[{"fuente": "manual", "indice": i} for i in range(len(documentos))]
)

# Consultar
consulta = "¿Qué es Python?"
embedding_consulta = crear_embedding(consulta)

resultados = coleccion.query(
    query_embeddings=[embedding_consulta],
    n_results=2
)

print("Resultados principales:")
for doc, dist in zip(resultados['documents'][0], resultados['distances'][0]):
    print(f"- {doc} (distancia: {dist:.4f})")
```

### Implementación Pinecone

```python
from pinecone import Pinecone, ServerlessSpec
import os

# Inicializar
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Crear índice
nombre_indice = "busqueda-semantica"

if nombre_indice not in pc.list_indexes().names():
    pc.create_index(
        name=nombre_indice,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

# Conectar a índice
indice = pc.Index(nombre_indice)

# Preparar vectores
vectores_upsert = [
    {
        "id": f"doc_{i}",
        "values": embedding,
        "metadata": {"texto": doc, "indice": i}
    }
    for i, (doc, embedding) in enumerate(zip(documentos, embeddings))
]

# Insertar
indice.upsert(vectors=vectores_upsert)

# Consultar
resultados = indice.query(
    vector=embedding_consulta,
    top_k=2,
    include_metadata=True
)

for coincidencia in resultados['matches']:
    print(f"Score: {coincidencia['score']:.4f}")
    print(f"Texto: {coincidencia['metadata']['texto']}\n")
```

### Implementación Qdrant

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Inicializar cliente
cliente = QdrantClient(path="./qdrant_db")

nombre_coleccion = "documentos"

# Crear colección
cliente.create_collection(
    collection_name=nombre_coleccion,
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# Preparar puntos
puntos = [
    PointStruct(
        id=i,
        vector=embedding,
        payload={"texto": doc, "indice": i}
    )
    for i, (doc, embedding) in enumerate(zip(documentos, embeddings))
]

# Subir
cliente.upsert(collection_name=nombre_coleccion, points=puntos)

# Buscar
resultado_busqueda = cliente.search(
    collection_name=nombre_coleccion,
    query_vector=embedding_consulta,
    limit=2
)

for hit in resultado_busqueda:
    print(f"Score: {hit.score:.4f}")
    print(f"Texto: {hit.payload['texto']}\n")
```

## Técnicas Avanzadas

### Búsqueda Híbrida (Palabra Clave + Semántica)

```python
from rank_bm25 import BM25Okapi
import numpy as np

class BusquedaHibrida:
    def __init__(self, documentos: List[str], embeddings: List[List[float]]):
        self.documentos = documentos
        self.embeddings = np.array(embeddings)

        # Inicializar BM25
        docs_tokenizados = [doc.lower().split() for doc in documentos]
        self.bm25 = BM25Okapi(docs_tokenizados)

    def buscar(
        self,
        consulta: str,
        embedding_consulta: List[float],
        k: int = 5,
        alpha: float = 0.5
    ):
        """
        Búsqueda híbrida: semántica + palabra clave
        alpha: peso semántico (0=todo palabra clave, 1=todo semántico)
        """
        # Scores semánticos
        query_emb = np.array(embedding_consulta)
        scores_semanticos = np.dot(self.embeddings, query_emb) / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_emb)
        )

        # Scores palabra clave (BM25)
        consulta_tokenizada = consulta.lower().split()
        scores_palabras = self.bm25.get_scores(consulta_tokenizada)

        # Normalizar
        scores_sem_norm = (scores_semanticos - scores_semanticos.min()) / (scores_semanticos.max() - scores_semanticos.min() + 1e-10)
        scores_pal_norm = (scores_palabras - scores_palabras.min()) / (scores_palabras.max() - scores_palabras.min() + 1e-10)

        # Combinar
        scores_combinados = alpha * scores_sem_norm + (1 - alpha) * scores_pal_norm

        # Top k
        indices_top = np.argsort(scores_combinados)[::-1][:k]

        return [
            (idx, scores_combinados[idx], self.documentos[idx])
            for idx in indices_top
        ]
```

### Re-ranking con Cross-Encoders

```python
from sentence_transformers import CrossEncoder

class BusquedaRerankeada:
    def __init__(self, db_vectorial, modelo_reranker: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.db_vectorial = db_vectorial
        self.cross_encoder = CrossEncoder(modelo_reranker)

    def buscar(self, consulta: str, k_inicial: int = 20, k_final: int = 5):
        """
        Búsqueda en dos etapas:
        1. Recuperación rápida de candidatos
        2. Re-ranking con cross-encoder
        """
        # Etapa 1: Recuperación inicial
        resultados_iniciales = self.db_vectorial.query(
            query_embeddings=[embedding_consulta],
            n_results=k_inicial
        )

        documentos = resultados_iniciales['documents'][0]

        # Etapa 2: Re-ranking
        pares = [[consulta, doc] for doc in documentos]
        scores_rerank = self.cross_encoder.predict(pares)

        # Ordenar por scores de rerank
        resultados_rankeados = sorted(
            zip(documentos, scores_rerank),
            key=lambda x: x[1],
            reverse=True
        )[:k_final]

        return resultados_rankeados
```

### Filtrado por Metadatos

```python
# Añadir documentos con metadatos ricos
coleccion.add(
    documents=["Tutorial de programación Python"],
    embeddings=[...],
    ids=["doc1"],
    metadatas=[{"idioma": "python", "nivel": "principiante", "año": 2024}]
)

# Consultar con filtros
resultados = coleccion.query(
    query_embeddings=[embedding_consulta],
    n_results=5,
    where={"idioma": "python"},
    where_document={"$contains": "tutorial"}
)

# Filtros complejos
resultados = coleccion.query(
    query_embeddings=[embedding_consulta],
    n_results=5,
    where={
        "$and": [
            {"idioma": {"$eq": "python"}},
            {"nivel": {"$ne": "avanzado"}},
            {"año": {"$gte": 2024}}
        ]
    }
)
```

## Mejores Prácticas de Producción

### Estrategias de Fragmentación

```python
class FragmentadorDocumentos:
    """Fragmentación inteligente para óptimo rendimiento de búsqueda"""

    @staticmethod
    def fragmentar_por_tokens(
        texto: str,
        max_tokens: int = 512,
        overlap_tokens: int = 50
    ) -> List[str]:
        """Fragmentar por conteo de tokens con superposición"""
        palabras = texto.split()
        max_palabras = int(max_tokens * 0.75)
        overlap_palabras = int(overlap_tokens * 0.75)

        fragmentos = []
        inicio = 0

        while inicio < len(palabras):
            fin = min(inicio + max_palabras, len(palabras))
            fragmento = " ".join(palabras[inicio:fin])
            fragmentos.append(fragmento)

            inicio = fin - overlap_palabras
            if inicio >= len(palabras):
                break

        return fragmentos

    @staticmethod
    def fragmentar_por_oraciones(
        texto: str,
        max_oraciones: int = 5,
        overlap_oraciones: int = 1
    ) -> List[str]:
        """Fragmentar por oraciones para coherencia semántica"""
        import re
        oraciones = re.split(r'(?<=[.!?])\s+', texto)

        fragmentos = []
        inicio = 0

        while inicio < len(oraciones):
            fin = min(inicio + max_oraciones, len(oraciones))
            fragmento = " ".join(oraciones[inicio:fin])
            fragmentos.append(fragmento)

            inicio = fin - overlap_oraciones
            if inicio >= len(oraciones):
                break

        return fragmentos
```

### Caché y Rendimiento

```python
from functools import lru_cache
import hashlib
import pickle
import os

class CacheEmbeddings:
    """Cachear embeddings para reducir llamadas API"""

    def __init__(self, dir_cache: str = "./cache_embeddings"):
        self.dir_cache = dir_cache
        os.makedirs(dir_cache, exist_ok=True)

    def _obtener_clave_cache(self, texto: str, modelo: str) -> str:
        contenido = f"{modelo}:{texto}"
        return hashlib.md5(contenido.encode()).hexdigest()

    def obtener(self, texto: str, modelo: str) -> List[float]:
        clave_cache = self._obtener_clave_cache(texto, modelo)
        archivo_cache = os.path.join(self.dir_cache, f"{clave_cache}.pkl")

        if os.path.exists(archivo_cache):
            with open(archivo_cache, 'rb') as f:
                return pickle.load(f)

        return None

    def establecer(self, texto: str, modelo: str, embedding: List[float]):
        clave_cache = self._obtener_clave_cache(texto, modelo)
        archivo_cache = os.path.join(self.dir_cache, f"{clave_cache}.pkl")

        with open(archivo_cache, 'wb') as f:
            pickle.dump(embedding, f)

    def crear_embedding_cacheado(self, texto: str, modelo: str = "text-embedding-3-small") -> List[float]:
        # Verificar caché primero
        cacheado = self.obtener(texto, modelo)
        if cacheado is not None:
            return cacheado

        # Crear nuevo embedding
        embedding = crear_embedding(texto, modelo)

        # Cachear
        self.establecer(texto, modelo, embedding)

        return embedding
```

### Monitoreo y Métricas

```python
from dataclasses import dataclass
import time

@dataclass
class MetricasBusqueda:
    """Rastrear métricas de rendimiento de búsqueda"""
    conteo_consultas: int = 0
    latencia_total: float = 0.0
    aciertos_cache: int = 0
    fallos_cache: int = 0

    def registrar_consulta(self, latencia: float, acierto_cache: bool = False):
        self.conteo_consultas += 1
        self.latencia_total += latencia

        if acierto_cache:
            self.aciertos_cache += 1
        else:
            self.fallos_cache += 1

    def obtener_latencia_promedio(self) -> float:
        if self.conteo_consultas == 0:
            return 0.0
        return self.latencia_total / self.conteo_consultas

    def obtener_tasa_acierto_cache(self) -> float:
        total = self.aciertos_cache + self.fallos_cache
        if total == 0:
            return 0.0
        return self.aciertos_cache / total

    def reporte(self) -> str:
        return f"""
Métricas de Rendimiento de Búsqueda:
- Consultas Totales: {self.conteo_consultas}
- Latencia Promedio: {self.obtener_latencia_promedio():.3f}s
- Tasa Acierto Caché: {self.obtener_tasa_acierto_cache():.2%}
- Aciertos Caché: {self.aciertos_cache}
- Fallos Caché: {self.fallos_cache}
        """.strip()
```

## Solución de Problemas

### Problemas Comunes

**Problema**: Mala calidad de búsqueda
- Verificar tamaños de fragmentos
- Asegurar mismo modelo para indexación y consulta
- Probar búsqueda híbrida
- Añadir re-ranking
- Revisar calidad de datos

**Problema**: Rendimiento lento
- Usar base de datos vectorial apropiada
- Optimizar parámetros de índice
- Implementar caché
- Usar modelos más pequeños
- Pre-filtrar con metadatos

**Problema**: Costos altos
- Cachear embeddings agresivamente
- Usar text-embedding-3-small
- Operaciones por lotes
- TTL para embeddings raramente accedidos

## Próximos Pasos

**Guías relacionadas**:
- [Construyendo tu Primer Sistema RAG](/es/developers/construyendo-primer-sistema-rag)
- [Arquitectura de Agentes de IA](/es/developers/arquitectura-agentes-patrones)
- [Prompt Engineering para Desarrolladores](/es/developers/prompt-engineering-desarrolladores)

**Temas avanzados**:
- Embeddings multi-modales (texto + imágenes)
- Fine-tuning de modelos de embedding
- Búsqueda híbrida sparse-dense (SPLADE)
- Búsqueda semántica cross-lingual
- Monitoreo de drift de embeddings

## Recursos Adicionales

**Documentación**:
- [Guía de Embeddings de OpenAI](https://platform.openai.com/docs/guides/embeddings)
- [Documentación ChromaDB](https://docs.trychroma.com/)
- [Documentación Pinecone](https://docs.pinecone.io/)
- [Documentación Qdrant](https://qdrant.tech/documentation/)

**Papers**:
- [Sentence-BERT](https://arxiv.org/abs/1908.10084)
- [Algoritmo HNSW](https://arxiv.org/abs/1603.09320)

**Comunidad**:
- [Benchmarks de Bases de Datos Vectoriales](https://github.com/erikbern/ann-benchmarks)
- [Leaderboard de Embeddings](https://huggingface.co/spaces/mteb/leaderboard)

---

**¿Encontraste un problema?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues) o envía un PR!
