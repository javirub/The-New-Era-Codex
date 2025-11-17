---
title: "AI Agent Architecture: Patterns and Best Practices"
description: "Design autonomous agents, patterns (ReAct, Chain-of-Thought), tools and orchestration strategies"
sidebar:
  order: 50
  badge:
    text: "Advanced"
    variant: caution
version: "1.1"---
## Overview

AI agents are autonomous systems that can perceive their environment, make decisions, and take actions to achieve specific goals. Unlike simple prompt-response systems, agents can break down complex tasks, use tools, and adapt their behavior based on feedback.

**What you'll learn**: How to design, implement, and orchestrate autonomous AI agents using modern patterns and frameworks.

**Use cases**:
- Automated customer support that can query databases and take actions
- Research assistants that can search, analyze, and synthesize information
- DevOps agents that can monitor systems and resolve issues
- Personal productivity assistants that manage multiple tools

**Time to complete**: 60-90 minutes

## Prerequisites

**Required knowledge**:
- Python 3.9+
- Understanding of LLMs and their capabilities
- Basic async/await patterns
- RESTful API concepts

**Required accounts/tools**:
- OpenAI or Anthropic API key
- Python environment with pip
- Familiarity with LangChain (helpful but not required)

**Optional but helpful**:
- Experience with system design
- Understanding of state machines
- Background in multi-agent systems

## Agent Architecture Fundamentals

### What Makes a System an "Agent"?

An AI agent typically has these characteristics:

1. **Autonomy**: Can operate independently without constant human intervention
2. **Reactivity**: Responds to changes in its environment
3. **Proactivity**: Takes initiative to achieve goals
4. **Tool Use**: Can interact with external systems and APIs
5. **Memory**: Maintains state across interactions
6. **Reasoning**: Can plan and make decisions

### Agent vs. Chain vs. Workflow

```
Simple Chain:        Input → LLM → Output
                     (deterministic, single path)

Agent:               Input → [Reasoning Loop] → Output
                             ↓           ↑
                          Tools ←→ Memory
                     (non-deterministic, adaptive)

Multi-Agent System:  Input → Agent 1 ⇄ Agent 2 ⇄ Agent 3 → Output
                             ↓         ↓         ↓
                           Tools     Tools     Tools
                     (collaborative, specialized)
```

## Core Agent Patterns

### 1. ReAct (Reasoning + Acting)

The ReAct pattern alternates between reasoning about what to do and taking actions.

**Pattern Structure**:
```
Thought: I need to find the current weather
Action: search_weather(location="San Francisco")
Observation: Temperature is 65°F, partly cloudy
Thought: Now I have the weather information
Action: Final Answer: It's 65°F and partly cloudy in San Francisco
```

**Implementation**:

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain import hub

# Define tools
def get_weather(location: str) -> str:
    """Get current weather for a location"""
    # In production, call actual weather API
    return f"The weather in {location} is 72°F and sunny"

def calculate(expression: str) -> str:
    """Safely evaluate mathematical expressions"""
    try:
        return str(eval(expression, {"__builtins__": {}}))
    except Exception as e:
        return f"Error: {str(e)}"

tools = [
    Tool(
        name="get_weather",
        func=get_weather,
        description="Get current weather for a specific location. Input should be a city name."
    ),
    Tool(
        name="calculator",
        func=calculate,
        description="Perform mathematical calculations. Input should be a valid mathematical expression."
    )
]

# Create ReAct agent
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# Get the ReAct prompt template
prompt = hub.pull("hwchase17/react")

# Create agent
agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

# Create executor
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=5  # Prevent infinite loops
)

# Run agent
result = agent_executor.invoke({
    "input": "What's the weather in San Francisco and what is 25 * 4?"
})

print(result["output"])
```

**Why ReAct works**:
- Explicit reasoning traces make agent behavior interpretable
- Self-correction through observation feedback
- Natural integration of tools and reasoning
- Handles complex multi-step tasks effectively

**Best practices**:
- Set `max_iterations` to prevent infinite reasoning loops
- Use `handle_parsing_errors=True` for robustness
- Keep tool descriptions clear and specific
- Log reasoning traces for debugging

### 2. Chain-of-Thought (CoT)

Chain-of-Thought prompts the LLM to break down complex reasoning into steps.

**Zero-Shot CoT**:
```python
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain

llm = ChatOpenAI(model="gpt-4o", temperature=0)

cot_prompt = PromptTemplate(
    input_variables=["question"],
    template="""Answer the following question by thinking through it step by step.

Question: {question}

Let's think step by step:
"""
)

chain = LLMChain(llm=llm, prompt=cot_prompt)

result = chain.run(
    question="If a store has 15 apples and sells 40% of them, then receives a shipment of 8 more apples, how many apples does it have?"
)

print(result)
```

**Few-Shot CoT**:
```python
few_shot_prompt = PromptTemplate(
    input_variables=["question"],
    template="""Answer questions by showing your reasoning step by step.

Example 1:
Question: If John has 5 apples and gives 2 to Mary, how many does he have left?
Reasoning:
1. John starts with 5 apples
2. He gives away 2 apples
3. 5 - 2 = 3
Answer: John has 3 apples left.

Example 2:
Question: A train travels 60 miles in 1 hour. How far does it travel in 2.5 hours?
Reasoning:
1. Speed = 60 miles/hour
2. Time = 2.5 hours
3. Distance = Speed × Time
4. Distance = 60 × 2.5 = 150 miles
Answer: The train travels 150 miles.

Now answer this question:
Question: {question}
Reasoning:
"""
)

chain = LLMChain(llm=llm, prompt=few_shot_prompt)
```

**When to use CoT**:
- Complex mathematical or logical problems
- Multi-step reasoning tasks
- When transparency of reasoning is important
- Educational applications

### 3. Plan-and-Execute

Separates planning from execution for complex tasks.

**Architecture**:
```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from typing import List, Dict

class PlanExecuteAgent:
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = {tool.name: tool for tool in tools}
        self.planner = self._create_planner()
        self.executor = self._create_executor()

    def _create_planner(self):
        """Create planning chain"""
        prompt = PromptTemplate(
            input_variables=["objective", "tools"],
            template="""You are a planning agent. Create a step-by-step plan to achieve the objective.

Available tools:
{tools}

Objective: {objective}

Create a numbered plan with specific steps. Each step should use one of the available tools.

Plan:
"""
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_executor(self):
        """Create execution chain"""
        prompt = PromptTemplate(
            input_variables=["step", "context"],
            template="""Execute this step based on the context from previous steps.

Previous context: {context}

Current step: {step}

Result:
"""
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def run(self, objective: str) -> Dict:
        """Execute plan-and-execute loop"""
        # Step 1: Create plan
        tools_description = "\n".join([
            f"- {name}: {tool.description}"
            for name, tool in self.tools.items()
        ])

        plan = self.planner.run(
            objective=objective,
            tools=tools_description
        )

        print(f"📋 Plan:\n{plan}\n")

        # Step 2: Execute plan
        steps = [s.strip() for s in plan.split("\n") if s.strip() and s[0].isdigit()]
        context = []

        for i, step in enumerate(steps, 1):
            print(f"\n🔧 Executing step {i}: {step}")

            # Extract tool name and parameters from step
            # (simplified - in production, use more robust parsing)
            result = self.executor.run(
                step=step,
                context="\n".join(context)
            )

            context.append(f"Step {i} result: {result}")
            print(f"✅ Result: {result}")

        return {
            "plan": plan,
            "steps": steps,
            "results": context
        }


# Usage
from langchain.tools import Tool

tools = [
    Tool(
        name="search",
        func=lambda x: f"Search results for: {x}",
        description="Search for information on the internet"
    ),
    Tool(
        name="calculate",
        func=lambda x: eval(x),
        description="Perform mathematical calculations"
    )
]

llm = ChatOpenAI(model="gpt-4o", temperature=0)
agent = PlanExecuteAgent(llm=llm, tools=tools)

result = agent.run(
    objective="Find the current price of Bitcoin and calculate 10% of that value"
)
```

**Advantages**:
- Better handling of complex, multi-step tasks
- Clearer separation of concerns
- Easier to debug and modify plans
- Can replan if execution fails

**Trade-offs**:
- More LLM calls (higher cost)
- Slower than direct execution
- May create unnecessarily complex plans for simple tasks

### 4. ReWOO (Reasoning WithOut Observation)

ReWOO decouples reasoning from observations to reduce token usage.

**Key insight**: Plan all tool calls upfront, execute in parallel, then reason about results.

**Pattern**:
```python
from typing import List, Tuple
import asyncio

class ReWOOAgent:
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = {tool.name: tool for tool in tools}

    async def plan(self, task: str) -> List[Tuple[str, str]]:
        """Generate plan without executing"""
        prompt = f"""Create a plan to solve this task. List each tool call needed.

Available tools: {list(self.tools.keys())}

Task: {task}

Plan (format as "tool_name: parameters"):
"""
        plan_text = await self.llm.apredict(prompt)

        # Parse plan into (tool_name, params) tuples
        plan = []
        for line in plan_text.split("\n"):
            if ":" in line:
                tool, params = line.split(":", 1)
                plan.append((tool.strip(), params.strip()))

        return plan

    async def execute_plan(self, plan: List[Tuple[str, str]]) -> List[str]:
        """Execute all tool calls in parallel"""
        async def execute_tool(tool_name: str, params: str):
            tool = self.tools.get(tool_name)
            if tool:
                return await asyncio.to_thread(tool.func, params)
            return f"Tool {tool_name} not found"

        tasks = [execute_tool(tool, params) for tool, params in plan]
        results = await asyncio.gather(*tasks)
        return results

    async def solve(self, task: str) -> str:
        """Solve task using ReWOO pattern"""
        # 1. Plan
        plan = await self.plan(task)
        print(f"📋 Plan: {plan}")

        # 2. Execute (parallel)
        results = await self.execute_plan(plan)
        print(f"✅ Results: {results}")

        # 3. Synthesize
        synthesis_prompt = f"""Given these results, answer the original task.

Task: {task}

Tool results:
{chr(10).join([f"{i+1}. {r}" for i, r in enumerate(results)])}

Final answer:
"""
        answer = await self.llm.apredict(synthesis_prompt)
        return answer


# Usage
async def main():
    from langchain_openai import ChatOpenAI
    from langchain.tools import Tool

    tools = [
        Tool(
            name="search",
            func=lambda x: f"Results for {x}: [Mock data]",
            description="Search the web"
        ),
        Tool(
            name="calculate",
            func=lambda x: str(eval(x)),
            description="Calculate math expressions"
        )
    ]

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    agent = ReWOOAgent(llm=llm, tools=tools)

    result = await agent.solve(
        "What is the population of Tokyo and what is 10% of that number?"
    )
    print(f"\n🎯 Final result: {result}")

# Run
asyncio.run(main())
```

**Benefits**:
- Reduced token usage (don't send observations back to LLM after each step)
- Parallel tool execution (faster)
- Cleaner separation between planning and execution

**Limitations**:
- Cannot adapt plan based on intermediate results
- Requires knowing all needed tools upfront
- Less flexible than ReAct for dynamic scenarios

## Tool Integration

### Designing Effective Tools

**Tool anatomy**:
```python
from langchain.tools import Tool, StructuredTool
from pydantic import BaseModel, Field

# Simple tool
simple_tool = Tool(
    name="weather",  # Clear, descriptive name
    func=get_weather,  # The function to call
    description="Get weather for a location. Input: city name"  # Clear usage instructions
)

# Structured tool (with type safety)
class WeatherInput(BaseModel):
    location: str = Field(description="City name")
    units: str = Field(description="Temperature units: 'celsius' or 'fahrenheit'", default="fahrenheit")

def get_weather_structured(location: str, units: str = "fahrenheit") -> str:
    """Get weather with specified units"""
    return f"Weather in {location}: 72°{units[0].upper()}"

structured_tool = StructuredTool.from_function(
    func=get_weather_structured,
    name="weather",
    description="Get current weather for a location with specified units"
)
```

**Tool design best practices**:

1. **Clear descriptions**: Be specific about inputs and outputs
2. **Error handling**: Return useful error messages
3. **Validation**: Validate inputs before processing
4. **Idempotency**: Same input should give same output
5. **Timeouts**: Set reasonable timeouts for external APIs

**Example: Production-ready tool**:
```python
import requests
from typing import Optional
from functools import lru_cache
import time

class WeatherTool:
    def __init__(self, api_key: str, timeout: int = 5):
        self.api_key = api_key
        self.timeout = timeout
        self.last_call_time = {}

    def _rate_limit(self, key: str, min_interval: float = 1.0):
        """Simple rate limiting"""
        now = time.time()
        if key in self.last_call_time:
            elapsed = now - self.last_call_time[key]
            if elapsed < min_interval:
                time.sleep(min_interval - elapsed)
        self.last_call_time[key] = time.time()

    @lru_cache(maxsize=100)
    def get_weather(self, location: str) -> str:
        """
        Get current weather for a location.

        Args:
            location: City name (e.g., "San Francisco" or "London,UK")

        Returns:
            Weather description string or error message

        Examples:
            >>> get_weather("San Francisco")
            "72°F, Partly Cloudy, Humidity: 65%"
        """
        # Input validation
        if not location or not isinstance(location, str):
            return "Error: Location must be a non-empty string"

        if len(location) > 100:
            return "Error: Location name too long"

        # Rate limiting
        self._rate_limit(f"weather_{location}")

        try:
            # Call weather API
            response = requests.get(
                f"https://api.openweathermap.org/data/2.5/weather",
                params={
                    "q": location,
                    "appid": self.api_key,
                    "units": "imperial"
                },
                timeout=self.timeout
            )

            response.raise_for_status()
            data = response.json()

            # Format response
            temp = data["main"]["temp"]
            description = data["weather"][0]["description"]
            humidity = data["main"]["humidity"]

            return f"{temp}°F, {description.title()}, Humidity: {humidity}%"

        except requests.Timeout:
            return f"Error: Weather API timeout for {location}"
        except requests.RequestException as e:
            return f"Error: Failed to fetch weather - {str(e)}"
        except (KeyError, ValueError) as e:
            return f"Error: Invalid response format - {str(e)}"

# Create tool from class
weather_tool = Tool(
    name="get_weather",
    func=WeatherTool(api_key="your-api-key").get_weather,
    description="""Get current weather for any city.

Input: City name (e.g., "San Francisco" or "Tokyo,JP")
Output: Temperature, conditions, and humidity

Examples:
- "San Francisco" → "72°F, Partly Cloudy, Humidity: 65%"
- "Invalid City" → Error message
"""
)
```

### Tool Composition

**Chaining tools**:
```python
class ToolChain:
    """Compose multiple tools into a pipeline"""

    def __init__(self, tools: List[Tool]):
        self.tools = {t.name: t for t in tools}

    def create_pipeline(self, *tool_names: str) -> Tool:
        """Create a pipeline of tools"""

        def pipeline(input_data: str) -> str:
            result = input_data
            for tool_name in tool_names:
                tool = self.tools.get(tool_name)
                if not tool:
                    return f"Error: Tool '{tool_name}' not found"
                result = tool.func(result)
            return result

        return Tool(
            name=f"pipeline_{'_'.join(tool_names)}",
            func=pipeline,
            description=f"Pipeline: {' → '.join(tool_names)}"
        )


# Example usage
search_tool = Tool(name="search", func=mock_search, description="Search web")
summarize_tool = Tool(name="summarize", func=mock_summarize, description="Summarize text")

chain = ToolChain([search_tool, summarize_tool])
research_tool = chain.create_pipeline("search", "summarize")

result = research_tool.func("Latest AI developments")
```

## Memory and State Management

### Conversation Memory

```python
from langchain.memory import ConversationBufferMemory, ConversationSummaryMemory
from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI

# Buffer memory (stores all messages)
buffer_memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# Summary memory (summarizes old messages to save tokens)
summary_memory = ConversationSummaryMemory(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    memory_key="chat_history",
    return_messages=True
)

# Agent with memory
agent_with_memory = AgentExecutor(
    agent=create_react_agent(llm, tools, prompt),
    tools=tools,
    memory=buffer_memory,  # or summary_memory
    verbose=True
)

# Conversation with context
agent_with_memory.invoke({"input": "My name is Alice"})
agent_with_memory.invoke({"input": "What's my name?"})  # Will remember "Alice"
```

### Long-term Memory

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# Create vector store for memory
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(embedding_function=embeddings, persist_directory="./agent_memory")

# Create retriever memory
retriever_memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    memory_key="relevant_history"
)

# Save memories
retriever_memory.save_context(
    {"input": "User prefers formal communication"},
    {"output": "Noted: formal tone preferred"}
)

retriever_memory.save_context(
    {"input": "User is interested in machine learning"},
    {"output": "Noted: ML interest"}
)

# Retrieve relevant memories
relevant = retriever_memory.load_memory_variables(
    {"input": "What are my preferences?"}
)
print(relevant)
```

### State Machines

```python
from enum import Enum
from typing import Dict, Callable

class AgentState(Enum):
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    WAITING = "waiting"
    COMPLETED = "completed"
    ERROR = "error"

class StatefulAgent:
    def __init__(self):
        self.state = AgentState.IDLE
        self.context = {}
        self.transitions: Dict[AgentState, Dict[AgentState, Callable]] = {
            AgentState.IDLE: {
                AgentState.PLANNING: self._start_planning
            },
            AgentState.PLANNING: {
                AgentState.EXECUTING: self._start_execution,
                AgentState.ERROR: self._handle_error
            },
            AgentState.EXECUTING: {
                AgentState.WAITING: self._wait_for_result,
                AgentState.COMPLETED: self._complete,
                AgentState.ERROR: self._handle_error
            },
            AgentState.WAITING: {
                AgentState.EXECUTING: self._continue_execution,
                AgentState.COMPLETED: self._complete
            }
        }

    def transition(self, new_state: AgentState):
        """Transition to new state with validation"""
        if new_state not in self.transitions.get(self.state, {}):
            raise ValueError(f"Invalid transition from {self.state} to {new_state}")

        transition_func = self.transitions[self.state][new_state]
        transition_func()
        self.state = new_state
        print(f"State: {self.state.value}")

    def _start_planning(self):
        print("Starting planning phase...")

    def _start_execution(self):
        print("Starting execution...")

    def _wait_for_result(self):
        print("Waiting for results...")

    def _continue_execution(self):
        print("Continuing execution...")

    def _complete(self):
        print("Task completed!")

    def _handle_error(self):
        print("Handling error...")

# Usage
agent = StatefulAgent()
agent.transition(AgentState.PLANNING)
agent.transition(AgentState.EXECUTING)
agent.transition(AgentState.COMPLETED)
```

## Multi-Agent Systems

### Collaborative Agents

```python
from typing import List
from dataclasses import dataclass

@dataclass
class AgentMessage:
    sender: str
    receiver: str
    content: str
    message_type: str  # "request", "response", "broadcast"

class CollaborativeAgent:
    def __init__(self, name: str, role: str, llm, tools):
        self.name = name
        self.role = role
        self.llm = llm
        self.tools = tools
        self.inbox: List[AgentMessage] = []

    def send_message(self, receiver: str, content: str, message_type: str = "request"):
        """Send message to another agent"""
        return AgentMessage(
            sender=self.name,
            receiver=receiver,
            content=content,
            message_type=message_type
        )

    def receive_message(self, message: AgentMessage):
        """Receive message from another agent"""
        self.inbox.append(message)

    def process_messages(self) -> List[AgentMessage]:
        """Process inbox and generate responses"""
        responses = []

        for message in self.inbox:
            if message.message_type == "request":
                # Process request and generate response
                response_content = self._handle_request(message.content)
                responses.append(
                    self.send_message(
                        message.sender,
                        response_content,
                        "response"
                    )
                )

        self.inbox.clear()
        return responses

    def _handle_request(self, content: str) -> str:
        """Handle incoming request"""
        prompt = f"""You are {self.name}, a {self.role} agent.
Process this request and provide a response:

Request: {content}

Response:
"""
        return self.llm.predict(prompt)


class AgentOrchestrator:
    def __init__(self):
        self.agents: Dict[str, CollaborativeAgent] = {}

    def register_agent(self, agent: CollaborativeAgent):
        """Register an agent"""
        self.agents[agent.name] = agent

    def route_message(self, message: AgentMessage):
        """Route message to appropriate agent"""
        receiver = self.agents.get(message.receiver)
        if receiver:
            receiver.receive_message(message)
        else:
            print(f"Warning: Agent '{message.receiver}' not found")

    def run_round(self):
        """Process one round of messages"""
        all_messages = []

        # Each agent processes their inbox
        for agent in self.agents.values():
            responses = agent.process_messages()
            all_messages.extend(responses)

        # Route all responses
        for message in all_messages:
            if message.receiver == "broadcast":
                for agent in self.agents.values():
                    if agent.name != message.sender:
                        agent.receive_message(message)
            else:
                self.route_message(message)

        return len(all_messages) > 0  # Continue if there are messages


# Example usage
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")

researcher = CollaborativeAgent(
    name="Researcher",
    role="information gatherer",
    llm=llm,
    tools=[]
)

analyst = CollaborativeAgent(
    name="Analyst",
    role="data analyzer",
    llm=llm,
    tools=[]
)

writer = CollaborativeAgent(
    name="Writer",
    role="content creator",
    llm=llm,
    tools=[]
)

# Orchestrate
orchestrator = AgentOrchestrator()
orchestrator.register_agent(researcher)
orchestrator.register_agent(analyst)
orchestrator.register_agent(writer)

# Start collaboration
initial_message = AgentMessage(
    sender="User",
    receiver="Researcher",
    content="Research the latest trends in AI agents",
    message_type="request"
)

orchestrator.route_message(initial_message)

# Run collaboration rounds
for _ in range(3):
    has_messages = orchestrator.run_round()
    if not has_messages:
        break
```

## Error Handling and Robustness

### Retry Strategies

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
from openai import RateLimitError, APIError

class RobustAgent:
    def __init__(self, agent_executor):
        self.agent_executor = agent_executor

    @retry(
        retry=retry_if_exception_type((RateLimitError, APIError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def run_with_retry(self, input_text: str):
        """Run agent with automatic retry on failures"""
        try:
            return self.agent_executor.invoke({"input": input_text})
        except Exception as e:
            print(f"Attempt failed: {e}")
            raise

    def run_with_fallback(self, input_text: str, fallback_response: str = None):
        """Run agent with fallback response"""
        try:
            return self.run_with_retry(input_text)
        except Exception as e:
            print(f"All retries failed: {e}")
            if fallback_response:
                return {"output": fallback_response}
            return {"output": "I apologize, but I'm unable to process your request at this time."}


# Usage
robust_agent = RobustAgent(agent_executor)

result = robust_agent.run_with_fallback(
    "Complex query that might fail",
    fallback_response="Let me try a different approach..."
)
```

### Graceful Degradation

```python
class DegradableAgent:
    def __init__(self, primary_llm, fallback_llm, tools):
        self.primary_llm = primary_llm  # e.g., GPT-4
        self.fallback_llm = fallback_llm  # e.g., GPT-3.5
        self.tools = tools
        self.use_fallback = False

    def run(self, input_text: str):
        """Run with automatic degradation to simpler model"""
        llm = self.fallback_llm if self.use_fallback else self.primary_llm

        try:
            agent = create_react_agent(llm, self.tools, prompt)
            executor = AgentExecutor(agent=agent, tools=self.tools)
            result = executor.invoke({"input": input_text})

            # Reset to primary if fallback succeeded
            if self.use_fallback:
                self.use_fallback = False

            return result

        except RateLimitError:
            if not self.use_fallback:
                print("Rate limited on primary model, degrading to fallback")
                self.use_fallback = True
                return self.run(input_text)  # Retry with fallback
            raise
```

## Observability and Monitoring

### Logging and Tracing

```python
import logging
from datetime import datetime
from typing import Any, Dict
import json

class AgentLogger:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.logger = logging.getLogger(agent_name)
        self.logger.setLevel(logging.INFO)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)

        # File handler for detailed logs
        file_handler = logging.FileHandler(f"{agent_name}_trace.log")
        file_handler.setLevel(logging.DEBUG)

        # Format
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)

        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)

    def log_interaction(self, interaction_type: str, data: Dict[str, Any]):
        """Log agent interaction"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": self.agent_name,
            "type": interaction_type,
            "data": data
        }
        self.logger.info(json.dumps(log_entry))

    def log_tool_call(self, tool_name: str, input_data: Any, output_data: Any, duration: float):
        """Log tool usage"""
        self.log_interaction("tool_call", {
            "tool": tool_name,
            "input": str(input_data)[:200],  # Truncate long inputs
            "output": str(output_data)[:200],
            "duration_ms": duration * 1000
        })

    def log_error(self, error: Exception, context: Dict[str, Any] = None):
        """Log errors with context"""
        self.logger.error(f"Error: {error}", extra={
            "context": context,
            "error_type": type(error).__name__
        })


# Usage with agent
logger = AgentLogger("MyAgent")

class LoggedAgent:
    def __init__(self, agent_executor, logger):
        self.agent_executor = agent_executor
        self.logger = logger

    def run(self, input_text: str):
        """Run agent with logging"""
        self.logger.log_interaction("input", {"query": input_text})

        try:
            start_time = datetime.now()
            result = self.agent_executor.invoke({"input": input_text})
            duration = (datetime.now() - start_time).total_seconds()

            self.logger.log_interaction("output", {
                "response": result["output"],
                "duration_s": duration
            })

            return result

        except Exception as e:
            self.logger.log_error(e, {"input": input_text})
            raise
```

### Performance Metrics

```python
from dataclasses import dataclass, field
from typing import List
import time

@dataclass
class AgentMetrics:
    total_runs: int = 0
    successful_runs: int = 0
    failed_runs: int = 0
    total_tokens: int = 0
    total_cost: float = 0.0
    average_latency: float = 0.0
    tool_usage: Dict[str, int] = field(default_factory=dict)
    latencies: List[float] = field(default_factory=list)

    def add_run(self, success: bool, tokens: int, cost: float, latency: float, tools_used: List[str]):
        """Record a run"""
        self.total_runs += 1
        if success:
            self.successful_runs += 1
        else:
            self.failed_runs += 1

        self.total_tokens += tokens
        self.total_cost += cost
        self.latencies.append(latency)
        self.average_latency = sum(self.latencies) / len(self.latencies)

        for tool in tools_used:
            self.tool_usage[tool] = self.tool_usage.get(tool, 0) + 1

    def get_success_rate(self) -> float:
        """Calculate success rate"""
        if self.total_runs == 0:
            return 0.0
        return self.successful_runs / self.total_runs

    def get_report(self) -> str:
        """Generate metrics report"""
        return f"""
Agent Performance Metrics:
- Total Runs: {self.total_runs}
- Success Rate: {self.get_success_rate():.2%}
- Average Latency: {self.average_latency:.2f}s
- Total Tokens: {self.total_tokens:,}
- Total Cost: ${self.total_cost:.4f}
- Tool Usage: {self.tool_usage}
        """.strip()


# Usage
metrics = AgentMetrics()

def run_agent_with_metrics(agent, input_text: str):
    """Run agent and track metrics"""
    start = time.time()
    tools_used = []

    try:
        result = agent.invoke({"input": input_text})
        latency = time.time() - start

        # Extract metrics (simplified)
        tokens = 500  # Would get from LLM callback
        cost = 0.01  # Would calculate based on model and tokens

        metrics.add_run(
            success=True,
            tokens=tokens,
            cost=cost,
            latency=latency,
            tools_used=tools_used
        )

        return result

    except Exception as e:
        latency = time.time() - start
        metrics.add_run(
            success=False,
            tokens=0,
            cost=0,
            latency=latency,
            tools_used=[]
        )
        raise


# After multiple runs
print(metrics.get_report())
```

## Production Best Practices

### Security Considerations

```python
import re
from typing import Any

class SecureAgent:
    """Agent with security controls"""

    DANGEROUS_PATTERNS = [
        r"rm\s+-rf",  # Dangerous file operations
        r"DROP\s+TABLE",  # SQL injection
        r"eval\(",  # Code injection
        r"__import__",  # Python imports
        r"exec\(",  # Code execution
    ]

    def __init__(self, agent_executor):
        self.agent_executor = agent_executor

    def _validate_input(self, input_text: str) -> bool:
        """Validate input for security threats"""
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, input_text, re.IGNORECASE):
                raise ValueError(f"Potentially dangerous input detected: {pattern}")
        return True

    def _sanitize_output(self, output: Any) -> str:
        """Sanitize output to prevent information leakage"""
        output_str = str(output)

        # Remove potential API keys
        output_str = re.sub(
            r'(api[_-]?key|token)["\']?\s*[:=]\s*["\']?[\w-]+',
            r'\1=***',
            output_str,
            flags=re.IGNORECASE
        )

        # Remove file paths
        output_str = re.sub(
            r'(/[a-zA-Z0-9_-]+)+/[\w.-]+',
            '[PATH]',
            output_str
        )

        return output_str

    def run(self, input_text: str, user_id: str = None):
        """Run agent with security controls"""
        # Validate input
        self._validate_input(input_text)

        # Log for audit
        print(f"User {user_id} query: {input_text[:100]}...")

        # Run agent
        result = self.agent_executor.invoke({"input": input_text})

        # Sanitize output
        result["output"] = self._sanitize_output(result["output"])

        return result
```

### Rate Limiting

```python
from collections import defaultdict
from datetime import datetime, timedelta
import time

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[datetime]] = defaultdict(list)

    def allow_request(self, user_id: str) -> bool:
        """Check if request is allowed under rate limit"""
        now = datetime.now()
        window_start = now - timedelta(seconds=self.window_seconds)

        # Remove old requests
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > window_start
        ]

        # Check limit
        if len(self.requests[user_id]) >= self.max_requests:
            return False

        # Record request
        self.requests[user_id].append(now)
        return True

    def wait_if_needed(self, user_id: str):
        """Wait until request is allowed"""
        while not self.allow_request(user_id):
            time.sleep(1)


# Usage
rate_limiter = RateLimiter(max_requests=10, window_seconds=60)

def run_with_rate_limit(agent, input_text: str, user_id: str):
    """Run agent with rate limiting"""
    if not rate_limiter.allow_request(user_id):
        raise Exception("Rate limit exceeded. Please try again later.")

    return agent.invoke({"input": input_text})
```

## Testing Agents

### Unit Tests

```python
import pytest
from unittest.mock import Mock, patch

def test_agent_basic_query():
    """Test agent can handle basic query"""
    mock_llm = Mock()
    mock_llm.predict.return_value = "Paris"

    agent = SimpleAgent(llm=mock_llm, tools=[])
    result = agent.run("What is the capital of France?")

    assert "Paris" in result["output"]


def test_agent_tool_usage():
    """Test agent uses tools correctly"""
    def mock_weather(location: str) -> str:
        return f"Weather in {location}: Sunny"

    weather_tool = Tool(
        name="weather",
        func=mock_weather,
        description="Get weather"
    )

    agent = create_react_agent(llm, [weather_tool], prompt)
    executor = AgentExecutor(agent=agent, tools=[weather_tool])

    result = executor.invoke({"input": "What's the weather in Tokyo?"})

    assert "Tokyo" in result["output"]
    assert "Sunny" in result["output"]


def test_agent_error_handling():
    """Test agent handles errors gracefully"""
    def failing_tool(x):
        raise ValueError("Tool error")

    tool = Tool(name="fail", func=failing_tool, description="Fails")

    agent = create_react_agent(llm, [tool], prompt)
    executor = AgentExecutor(
        agent=agent,
        tools=[tool],
        handle_parsing_errors=True
    )

    # Should not raise, but handle gracefully
    result = executor.invoke({"input": "Use the fail tool"})
    assert result is not None
```

### Integration Tests

```python
@pytest.mark.integration
def test_agent_with_real_apis():
    """Test agent with real API calls"""
    agent = create_production_agent()

    result = agent.run("What's the current weather in San Francisco?")

    # Verify structure
    assert "output" in result
    assert len(result["output"]) > 0

    # Verify it used tools
    assert hasattr(result, "intermediate_steps")
    assert len(result.intermediate_steps) > 0


@pytest.mark.integration
def test_agent_conversation_memory():
    """Test agent maintains conversation context"""
    agent_with_memory = create_agent_with_memory()

    # First interaction
    result1 = agent_with_memory.run("My favorite color is blue")
    assert result1 is not None

    # Second interaction - should remember
    result2 = agent_with_memory.run("What's my favorite color?")
    assert "blue" in result2["output"].lower()
```

## Troubleshooting

### Common Issues

**Issue**: Agent gets stuck in loops
```python
# Solution: Set max_iterations and add loop detection
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5,  # Prevent infinite loops
    early_stopping_method="generate"  # Generate final answer if max reached
)
```

**Issue**: Agent makes too many tool calls
```python
# Solution: Implement tool call budget
class BudgetedAgentExecutor:
    def __init__(self, agent_executor, max_tool_calls: int = 10):
        self.agent_executor = agent_executor
        self.max_tool_calls = max_tool_calls
        self.tool_call_count = 0

    def run(self, input_text: str):
        self.tool_call_count = 0

        def tracked_tool(original_func):
            def wrapper(*args, **kwargs):
                self.tool_call_count += 1
                if self.tool_call_count > self.max_tool_calls:
                    raise Exception("Tool call budget exceeded")
                return original_func(*args, **kwargs)
            return wrapper

        # Wrap tools
        # ... implementation

        return self.agent_executor.invoke({"input": input_text})
```

**Issue**: Inconsistent agent behavior
```python
# Solution: Set temperature=0 for deterministic responses
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Also consider caching
from langchain.cache import InMemoryCache
import langchain
langchain.llm_cache = InMemoryCache()
```

## Next Steps

**Related guides**:
- [Building Your First RAG System](/developers/building-first-rag-system)
- [Prompt Engineering for Developers](/developers/prompt-engineering-developers)
- [LLM Model Evaluation: Metrics and Testing](/developers/llm-evaluation-metrics)

**Advanced topics to explore**:
- LangGraph for complex agent orchestration
- AutoGPT and BabyAGI patterns
- Agents with external memory (Mem0, Zep)
- Evaluating agent performance systematically
- Deploying agents at scale

## Additional Resources

**Documentation**:
- [LangChain Agents Guide](https://python.langchain.com/docs/modules/agents/)
- [ReAct Paper](https://arxiv.org/abs/2210.03629)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)

**Example repos**:
- [LangChain Agent Examples](https://github.com/langchain-ai/langchain/tree/master/templates)
- [Agent Protocols](https://github.com/AI-Engineer-Foundation/agent-protocol)

**Community**:
- [LangChain Discord](https://discord.gg/langchain)
- [r/LangChain](https://reddit.com/r/LangChain)

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues) or submit a PR!
