---
title: "LangChain Avanzado: Chains, Memory y Agents"
description: "Domina las características avanzadas de LangChain para aplicaciones de IA en producción"
sidebar:
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---

# Patrones Avanzados de LangChain

## Chains Personalizadas

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# Sequential chain
from langchain.chains import SequentialChain

chain1 = LLMChain(
    llm=ChatOpenAI(),
    prompt=PromptTemplate.from_template("Summarize: {text}"),
    output_key="summary"
)

chain2 = LLMChain(
    llm=ChatOpenAI(),
    prompt=PromptTemplate.from_template("Translate to Spanish: {summary}"),
    output_key="translation"
)

overall_chain = SequentialChain(
    chains=[chain1, chain2],
    input_variables=["text"],
    output_variables=["summary", "translation"]
)
```

## Tipos de Memoria

```python
# Conversation buffer memory
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
memory.save_context({"input": "hi"}, {"output": "Hello!"})

# Conversation summary memory
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=ChatOpenAI())

# Vector store memory
from langchain.memory import VectorStoreRetrieverMemory

memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
)
```

## Agentes Personalizados

```python
from langchain.agents import Tool, AgentExecutor, create_react_agent

tools = [
    Tool(
        name="Search",
        func=search.run,
        description="Search for information"
    )
]

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
