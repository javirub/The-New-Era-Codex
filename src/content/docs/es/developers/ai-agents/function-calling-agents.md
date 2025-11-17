---
title: "Function Calling: Construcción de Agentes de IA que Usan Herramientas"
description: "Permite a los LLMs llamar funciones, APIs y herramientas para agentes dinámicos orientados a acciones"
sidebar:
  order: 25
  badge:
    text: "Intermedio"
    variant: caution
version: "1.0"
---
## Descripción General

El function calling permite a los LLMs interactuar con herramientas externas, APIs y bases de datos, transformándolos de generadores de texto en agentes que toman acciones.

**Tiempo**: 25 minutos

## Cómo Funciona el Function Calling

1. Definir funciones disponibles
2. El LLM decide qué función llamar
3. Ejecutar función con argumentos proporcionados por el LLM
4. Devolver resultados al LLM
5. El LLM genera respuesta final

## Function Calling de OpenAI

```python
from openai import OpenAI
import json

client = OpenAI()

# Define functions
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"]
                }
            },
            "required": ["location"]
        }
    }
}]

# Call with functions
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools,
    tool_choice="auto"
)

# Check if function was called
tool_calls = response.choices[0].message.tool_calls

if tool_calls:
    for tool_call in tool_calls:
        function_name = tool_call.function.name
        function_args = json.loads(tool_call.function.arguments)

        # Execute function
        if function_name == "get_weather":
            result = get_weather(**function_args)

            # Send result back to LLM
            second_response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "user", "content": "What's the weather in Paris?"},
                    response.choices[0].message,
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": str(result)
                    }
                ]
            )

            print(second_response.choices[0].message.content)
```

## Agente Multi-Herramienta

```python
def create_agent_with_tools():
    tools = [
        {
            "type": "function",
            "function": {
                "name": "search_database",
                "description": "Search customer database",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "limit": {"type": "integer"}
                    },
                    "required": ["query"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "send_email",
                "description": "Send email to customer",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "to": {"type": "string"},
                        "subject": {"type": "string"},
                        "body": {"type": "string"}
                    },
                    "required": ["to", "subject", "body"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "calculate",
                "description": "Perform mathematical calculations",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {"type": "string"}
                    },
                    "required": ["expression"]
                }
            }
        }
    ]

    return tools

# Agent loop
def run_agent(user_message, max_iterations=5):
    messages = [{"role": "user", "content": user_message}]
    tools = create_agent_with_tools()

    for i in range(max_iterations):
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            tools=tools
        )

        message = response.choices[0].message
        messages.append(message)

        # If no tool calls, we're done
        if not message.tool_calls:
            return message.content

        # Execute each tool call
        for tool_call in message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)

            # Route to appropriate function
            result = execute_function(function_name, function_args)

            # Add result to messages
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })

    return "Max iterations reached"
```

## Herramientas de LangChain

```python
from langchain.agents import Tool, AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_community.tools import DuckDuckGoSearchRun

# Define tools
search = DuckDuckGoSearchRun()

tools = [
    Tool(
        name="Search",
        func=search.run,
        description="Search the internet for current information"
    ),
    Tool(
        name="Calculator",
        func=lambda x: eval(x),
        description="Perform calculations"
    )
]

# Create agent
llm = ChatOpenAI(model="gpt-4", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant with access to tools."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run
result = agent_executor.invoke({"input": "What's 25 * 17 and what's trending on tech news?"})
print(result["output"])
```

## Mejores Prácticas

✅ **Hacer**:
- Validar argumentos de funciones
- Manejar errores elegantemente
- Establecer iteraciones máximas
- Registrar llamadas a funciones
- Implementar timeouts

❌ **No hacer**:
- Permitir bucles sin límites
- Ejecutar funciones peligrosas sin confirmación
- Ignorar retornos de error
- Omitir validación de entradas

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
