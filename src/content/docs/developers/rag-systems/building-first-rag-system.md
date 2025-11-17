---
title: "Building Your First RAG System with LangChain"
description: "Step-by-step tutorial for creating a basic RAG system with embeddings, ChromaDB and OpenAI"
sidebar:
  order: 40
  badge:
    text: "Intermediate"
    variant: note
version: "1.0"
---

# Building Your First RAG System with LangChain

## Overview

Retrieval-Augmented Generation (RAG) is one of the most powerful patterns for building AI applications that need to work with your own data. Instead of relying solely on a language model's training data, RAG systems retrieve relevant information from your documents and use it to generate accurate, contextual responses.

**What you'll build**: A complete RAG system that can answer questions based on your own documents using embeddings, vector storage, and LLM retrieval.

**Use cases**:
- Internal knowledge bases and documentation search
- Customer support systems with company-specific information
- Research assistants that work with domain-specific documents
- Chat interfaces for large document collections

**Time to complete**: 45-60 minutes

## Prerequisites

**Required knowledge**:
- Python 3.9+
- Basic understanding of APIs and asynchronous operations
- Familiarity with virtual environments
- Basic understanding of how LLMs work

**Required accounts/tools**:
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Python 3.9 or higher installed
- Git and a code editor (VS Code recommended)

**Optional but helpful**:
- Understanding of vector embeddings
- Experience with LangChain (we'll cover the basics)
- Familiarity with Jupyter notebooks for testing

## Architecture Overview

```
User Query → Embedding Model → Vector Search → Context Retrieval
                                      ↓
                                LLM Generation ← Retrieved Documents
                                      ↓
                                  Response
```

**Key components**:
- **Document Loader**: Ingests and processes your documents
- **Text Splitter**: Breaks documents into manageable chunks
- **Embedding Model**: Converts text into vector representations
- **Vector Store**: Stores and searches embeddings (we'll use ChromaDB)
- **Retrieval Chain**: Orchestrates the RAG workflow
- **LLM**: Generates responses based on retrieved context

## Environment Setup

### Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install langchain langchain-openai langchain-community chromadb tiktoken pypdf python-dotenv
```

### Configuration

Create a `.env` file in your project root:

```text
OPENAI_API_KEY=your-openai-key-here
```

**Security note**: Never commit `.env` files to version control. Add to `.gitignore`:

```text
# .gitignore
.env
venv/
__pycache__/
*.pyc
.DS_Store
chroma_db/
```

## Implementation

### Step 1: Setting Up the Foundation

**Goal**: Initialize the core components and load environment variables.

Create a file named `rag_system.py`:

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

**Why this works**: We're using `python-dotenv` to securely load API keys from the `.env` file, keeping sensitive information out of our code.

**Common issues**:
- **Problem**: `ModuleNotFoundError: No module named 'langchain'`
  - **Solution**: Make sure you activated your virtual environment before installing packages

### Step 2: Loading and Processing Documents

**Goal**: Load your documents and split them into chunks suitable for embedding.

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

**Why these parameters?**:
- **chunk_size=1000**: Large enough to maintain context but small enough for efficient embedding
- **chunk_overlap=200**: Ensures important information at chunk boundaries isn't lost
- **RecursiveCharacterTextSplitter**: Tries to split on paragraphs first, then sentences, then words

**Performance considerations**:
- For technical documentation, consider larger chunks (1500-2000 characters)
- For conversational data, smaller chunks (500-800 characters) work better

### Step 3: Creating the Vector Store

**Goal**: Generate embeddings and store them in ChromaDB for efficient retrieval.

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

**Why text-embedding-3-small?**:
- Cost-effective: ~$0.02 per 1M tokens
- Fast: Lower latency than larger models
- Sufficient quality for most RAG applications
- 1536-dimensional vectors (good balance of quality and storage)

**Common issues**:
- **Problem**: `chromadb.errors.InvalidDimensionError`
  - **Solution**: Ensure you're using the same embedding model when loading an existing store

### Step 4: Building the RAG Chain

**Goal**: Create the retrieval and generation pipeline.

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

**Parameter explanations**:
- **temperature=0**: Makes responses more consistent and factual
- **k=4**: Retrieves 4 most relevant chunks (adjust based on your needs)
- **chain_type="stuff"**: Simple approach that concatenates all retrieved docs
- **return_source_documents=True**: Returns the source chunks for transparency

**Alternative chain types**:
- `"map_reduce"`: Better for handling many documents
- `"refine"`: Iteratively refines answer using each document
- `"map_rerank"`: Ranks multiple candidate answers

### Step 5: Query Interface

**Goal**: Create a user-friendly interface to query the RAG system.

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

### Step 6: Main Execution Flow

**Goal**: Tie everything together into a complete application.

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

## Testing

### Prepare Test Documents

Create a `documents/` directory and add some test files:

```bash
mkdir documents
echo "Artificial Intelligence is transforming software development.
RAG systems combine the power of retrieval and generation to create
more accurate AI applications." > documents/ai_intro.txt

echo "LangChain is a framework for developing applications powered by
language models. It provides tools for document loading, text splitting,
embeddings, and chains." > documents/langchain_intro.txt
```

### Run the System

```bash
python rag_system.py
```

**Expected output**:
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

### Unit Tests

Create a file named `test_rag.py`:

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

Run tests:

```bash
pip install pytest
pytest test_rag.py -v
```

## Optimization

### Performance Tuning

**Embedding optimization**:
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

**Retrieval optimization**:
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

**Metadata filtering**:
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

### Cost Optimization

**Estimated costs** (as of January 2025):
- Embeddings (text-embedding-3-small): $0.02 per 1M tokens (~$0.02 per 5000 pages)
- LLM calls (gpt-4o-mini): $0.15 per 1M input tokens, $0.60 per 1M output tokens
- ChromaDB: Free (local storage)

**Cost-saving strategies**:

1. **Cache embeddings** - Only regenerate when documents change
2. **Use cheaper models for simple queries**:
```python
# Use gpt-4o-mini for most queries, gpt-4 for complex ones
def get_llm_for_query(query_complexity="simple"):
    if query_complexity == "complex":
        return ChatOpenAI(model="gpt-4o", temperature=0)
    return ChatOpenAI(model="gpt-4o-mini", temperature=0)
```

3. **Implement semantic caching**:
```python
from langchain.cache import InMemoryCache
import langchain

langchain.llm_cache = InMemoryCache()
```

## Deployment

### Docker Container

Create a `Dockerfile`:

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

Create `requirements.txt`:
```text
langchain==0.3.15
langchain-openai==0.2.14
langchain-community==0.3.15
chromadb==0.5.23
tiktoken==0.8.0
pypdf==5.1.0
python-dotenv==1.0.1
```

Build and run:
```bash
docker build -t my-rag-system .
docker run --env-file .env -v $(pwd)/documents:/app/documents my-rag-system
```

### Production Considerations

**Monitoring**:
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

**Error handling**:
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

**Security checklist**:
- [ ] API keys stored in environment variables, never in code
- [ ] Input validation to prevent injection attacks
- [ ] Rate limiting implemented
- [ ] User authentication if exposing as a service
- [ ] Logging of queries for audit trails
- [ ] Regular API key rotation

## Troubleshooting

### Common Errors

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
- **Cause**: Multiple processes accessing the same database
- **Solution**: Ensure only one process accesses ChromaDB at a time, or use a client-server setup:

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
- **Cause**: Query terms don't match document content well
- **Solution**:
  1. Check if documents were actually embedded
  2. Try more generic query terms
  3. Adjust similarity threshold
  4. Use hybrid search (semantic + keyword)

**Error**: `Out of memory when processing large documents`
- **Solution**: Process documents in batches and use streaming:
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

## Next Steps

**Enhancements to consider**:
- [ ] Add conversation memory for multi-turn dialogues
- [ ] Implement hybrid search (BM25 + semantic)
- [ ] Add reranking with a cross-encoder model
- [ ] Create a web interface with Streamlit or Gradio
- [ ] Add support for more document types (CSV, JSON, HTML)
- [ ] Implement user feedback collection for improving retrieval
- [ ] Add evaluation metrics (retrieval precision, answer quality)
- [ ] Set up observability with LangSmith or Weights & Biases

**Related guides**:
- [AI Agent Architecture: Patterns and Best Practices](/developers/agent-architecture-patterns)
- [Vectorization and Semantic Search: Complete Guide](/developers/vectorization-semantic-search)
- [Prompt Engineering for Developers](/developers/prompt-engineering-developers)

## Additional Resources

**Official documentation**:
- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [ChromaDB Documentation](https://docs.trychroma.com/)

**Advanced topics**:
- [RAG from Scratch](https://github.com/langchain-ai/rag-from-scratch) - Video series by LangChain
- [Advanced RAG Techniques](https://blog.langchain.dev/deconstructing-rag/) - LangChain blog
- [Embeddings Deep Dive](https://platform.openai.com/docs/guides/embeddings) - OpenAI guide

**Community**:
- [LangChain Discord](https://discord.gg/langchain)
- [r/LangChain](https://reddit.com/r/LangChain)
- [LangChain GitHub Discussions](https://github.com/langchain-ai/langchain/discussions)

**Example repositories**:
- [LangChain RAG Examples](https://github.com/langchain-ai/langchain/tree/master/templates)
- [Production RAG Template](https://github.com/langchain-ai/rag-template)

---

**Found an issue with this guide?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues) or submit a PR!
