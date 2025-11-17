---
title: "Prompt Engineering for Developers"
description: "Advanced techniques: few-shot learning, chain-of-thought, function calling, and structured outputs for production AI applications"
sidebar:
  order: 10
  badge:
    text: "Prompting"
    variant: tip
version: "1.0"
---

# Prompt Engineering for Developers

## Overview

Prompt engineering is the practice of designing inputs that guide language models to produce desired outputs reliably. For developers, this means treating prompts as a programmatic interface—testable, version-controlled, and optimized for consistent results.

**What you'll learn**: Production-ready prompting techniques including few-shot learning, chain-of-thought reasoning, function calling, structured outputs, and systematic optimization.

**Use cases**:
- Building reliable AI features in applications
- Extracting structured data from unstructured text
- Creating AI assistants with consistent behavior
- Automating complex reasoning tasks
- Integrating LLMs into existing systems

**Time to complete**: 45 minutes

## Prerequisites

**Required**:
- Python 3.9+
- OpenAI or Anthropic API key
- Basic understanding of LLMs

**Helpful**:
- Experience with APIs
- Understanding of JSON
- Software testing principles

## Fundamental Principles

### 1. Clear Instructions

**Bad**:
```python
prompt = "Tell me about dogs"
```

**Good**:
```python
prompt = """You are a veterinary expert. Provide a concise, factual summary of dog nutrition.

Focus on:
- Daily caloric needs by size
- Essential nutrients
- Common dietary mistakes

Keep response under 200 words. Use bullet points."""
```

### 2. Provide Context

```python
def create_code_review_prompt(code: str, language: str, standards: str) -> str:
    return f"""Review this {language} code for:
- Adherence to {standards} standards
- Potential bugs or edge cases
- Performance issues
- Security vulnerabilities

Code:
```{language}
{code}
```

Provide specific, actionable feedback."""
```

### 3. Specify Output Format

```python
prompt = """Analyze this customer review and return JSON:

Review: "{review_text}"

Required JSON format:
{{
  "sentiment": "positive|negative|neutral",
  "topics": ["topic1", "topic2"],
  "key_points": ["point1", "point2"],
  "action_needed": boolean
}}"""
```

## Advanced Techniques

### Few-Shot Learning

Teach the model by example:

```python
from openai import OpenAI

client = OpenAI()

def extract_intent_few_shot(user_message: str) -> str:
    """Extract user intent using few-shot examples"""

    prompt = f"""Classify user intent into one of: query, command, complaint, praise

Examples:
User: "How do I reset my password?"
Intent: query

User: "Cancel my subscription immediately"
Intent: command

User: "Your service is terrible, nothing works"
Intent: complaint

User: "This feature is amazing, exactly what I needed!"
Intent: praise

User: "{user_message}"
Intent:"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=10
    )

    return response.choices[0].message.content.strip()


# Usage
print(extract_intent_few_shot("Where can I find the API docs?"))
# Output: query
```

### Chain-of-Thought (CoT)

For complex reasoning:

```python
def solve_math_problem(problem: str) -> dict:
    """Solve math problems with step-by-step reasoning"""

    prompt = f"""Solve this problem step by step. Show your work.

Problem: {problem}

Let's solve this step by step:
1."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return {
        "problem": problem,
        "reasoning": response.choices[0].message.content,
        "answer": extract_final_answer(response.choices[0].message.content)
    }


def extract_final_answer(text: str) -> str:
    """Extract final answer from reasoning"""
    # Look for patterns like "Answer:", "Therefore:", etc.
    import re
    match = re.search(r'(?:Answer|Therefore|Final answer):\s*(.+)', text, re.IGNORECASE)
    return match.group(1) if match else text.split('\n')[-1]
```

### Self-Consistency

Generate multiple reasoning paths and vote:

```python
def solve_with_consistency(problem: str, n_samples: int = 5) -> str:
    """Solve problem with self-consistency (majority vote)"""

    answers = []

    for _ in range(n_samples):
        result = solve_math_problem(problem)
        answers.append(result['answer'])

    # Return most common answer
    from collections import Counter
    return Counter(answers).most_common(1)[0][0]
```

## Function Calling / Tool Use

Modern approach for structured interactions:

```python
from openai import OpenAI
import json

client = OpenAI()

# Define functions
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g. 'San Francisco'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit"
                    }
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_database",
            "description": "Search internal database for customer information",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                    "email": {"type": "string"}
                },
                "required": []
            }
        }
    }
]

# Actual function implementations
def get_weather(location: str, unit: str = "fahrenheit") -> dict:
    """Implement actual weather API call"""
    return {
        "location": location,
        "temperature": 72,
        "unit": unit,
        "condition": "sunny"
    }

def search_database(customer_id: str = None, email: str = None) -> dict:
    """Implement actual database search"""
    return {
        "customer_id": customer_id or "12345",
        "name": "John Doe",
        "status": "active"
    }

# Map function names to implementations
available_functions = {
    "get_weather": get_weather,
    "search_database": search_database
}

def chat_with_tools(user_message: str) -> str:
    """Chat with function calling capability"""

    messages = [{"role": "user", "content": user_message}]

    # First API call
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    # If model wants to call functions
    if tool_calls:
        messages.append(response_message)

        # Execute each function call
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)

            # Call the function
            function_response = available_functions[function_name](**function_args)

            # Add function response to messages
            messages.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": json.dumps(function_response)
            })

        # Second API call with function results
        second_response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )

        return second_response.choices[0].message.content

    return response_message.content


# Usage
print(chat_with_tools("What's the weather in Tokyo in celsius?"))
print(chat_with_tools("Look up customer with email john@example.com"))
```

## Structured Outputs

Ensure reliable JSON responses:

```python
from pydantic import BaseModel
from typing import List, Literal

# Define output schema with Pydantic
class SentimentAnalysis(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float
    key_phrases: List[str]
    topics: List[str]

def analyze_sentiment(text: str) -> SentimentAnalysis:
    """Analyze sentiment with guaranteed structure"""

    response = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[
            {
                "role": "system",
                "content": "You are a sentiment analysis expert. Analyze the text and return structured results."
            },
            {
                "role": "user",
                "content": f"Analyze this text:\n\n{text}"
            }
        ],
        response_format=SentimentAnalysis
    )

    return response.choices[0].message.parsed


# Usage
result = analyze_sentiment("This product exceeded my expectations! The quality is outstanding.")
print(result.sentiment)  # "positive"
print(result.confidence)  # 0.95
print(result.key_phrases)  # ["exceeded expectations", "quality is outstanding"]
```

### Complex Nested Structures

```python
class CodeReview(BaseModel):
    summary: str
    issues: List[dict]  # [{severity, description, line_number, suggestion}]
    quality_score: int  # 1-10
    recommendations: List[str]

def review_code(code: str, language: str) -> CodeReview:
    """Get structured code review"""

    prompt = f"""Review this {language} code:

```{language}
{code}
```

Provide detailed analysis."""

    response = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[{"role": "user", "content": prompt}],
        response_format=CodeReview
    )

    return response.choices[0].message.parsed
```

## Prompt Optimization

### A/B Testing Prompts

```python
class PromptTester:
    def __init__(self, test_cases: List[dict]):
        """
        test_cases: [{"input": "...", "expected_output": "..."}]
        """
        self.test_cases = test_cases

    def test_prompt(self, prompt_template: callable) -> dict:
        """Test prompt against test cases"""
        results = {
            "passed": 0,
            "failed": 0,
            "failures": []
        }

        for case in self.test_cases:
            prompt = prompt_template(case["input"])

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )

            output = response.choices[0].message.content.strip()

            if output == case["expected_output"]:
                results["passed"] += 1
            else:
                results["failed"] += 1
                results["failures"].append({
                    "input": case["input"],
                    "expected": case["expected_output"],
                    "actual": output
                })

        results["success_rate"] = results["passed"] / len(self.test_cases)
        return results


# Usage
test_cases = [
    {"input": "great product!", "expected_output": "positive"},
    {"input": "terrible experience", "expected_output": "negative"},
    {"input": "it's okay", "expected_output": "neutral"}
]

tester = PromptTester(test_cases)

# Test prompt version A
def prompt_v1(text):
    return f"What's the sentiment: {text}\nAnswer with one word: positive, negative, or neutral."

# Test prompt version B
def prompt_v2(text):
    return f"""Classify sentiment:
Text: "{text}"
Respond with exactly one word: positive, negative, or neutral."""

results_v1 = tester.test_prompt(prompt_v1)
results_v2 = tester.test_prompt(prompt_v2)

print(f"V1 success rate: {results_v1['success_rate']:.1%}")
print(f"V2 success rate: {results_v2['success_rate']:.1%}")
```

### Token Optimization

```python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """Count tokens in text"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def optimize_prompt(prompt: str, max_tokens: int) -> str:
    """Trim prompt to fit token budget"""
    current_tokens = count_tokens(prompt)

    if current_tokens <= max_tokens:
        return prompt

    # Trim from middle (keep instructions and end)
    lines = prompt.split('\n')
    while count_tokens('\n'.join(lines)) > max_tokens:
        mid = len(lines) // 2
        lines.pop(mid)

    return '\n'.join(lines)


# Calculate costs
def estimate_cost(prompt: str, expected_response_tokens: int, model: str = "gpt-4o-mini") -> float:
    """Estimate API call cost"""
    pricing = {
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},  # per 1M tokens
        "gpt-4o": {"input": 2.50, "output": 10.00}
    }

    input_tokens = count_tokens(prompt, model)
    input_cost = (input_tokens / 1_000_000) * pricing[model]["input"]
    output_cost = (expected_response_tokens / 1_000_000) * pricing[model]["output"]

    return input_cost + output_cost
```

## Production Patterns

### Prompt Templates

```python
from string import Template

class PromptTemplate:
    def __init__(self, template: str):
        self.template = Template(template)

    def format(self, **kwargs) -> str:
        return self.template.safe_substitute(**kwargs)


# Define templates
CODE_REVIEW_TEMPLATE = PromptTemplate("""
You are an expert code reviewer specializing in $language.

Review this code for:
- Code quality and best practices
- Potential bugs
- Security issues
- Performance concerns

Code:
```$language
$code
```

Standards: $standards

Provide specific, actionable feedback.
""")

# Usage
prompt = CODE_REVIEW_TEMPLATE.format(
    language="Python",
    code="def foo(): pass",
    standards="PEP 8"
)
```

### Prompt Versioning

```python
from enum import Enum
from dataclasses import dataclass
from datetime import datetime

class PromptVersion(Enum):
    V1_0 = "1.0"
    V1_1 = "1.1"
    V2_0 = "2.0"

@dataclass
class VersionedPrompt:
    version: PromptVersion
    template: str
    created_at: datetime
    performance_metrics: dict = None

class PromptRegistry:
    def __init__(self):
        self.prompts = {}

    def register(self, name: str, version: PromptVersion, template: str):
        """Register a prompt version"""
        if name not in self.prompts:
            self.prompts[name] = {}

        self.prompts[name][version] = VersionedPrompt(
            version=version,
            template=template,
            created_at=datetime.now()
        )

    def get(self, name: str, version: PromptVersion = None) -> str:
        """Get prompt by name and version"""
        if version:
            return self.prompts[name][version].template

        # Return latest version
        latest = max(self.prompts[name].keys(), key=lambda v: v.value)
        return self.prompts[name][latest].template


# Usage
registry = PromptRegistry()

registry.register(
    "sentiment",
    PromptVersion.V1_0,
    "Classify sentiment: {text}"
)

registry.register(
    "sentiment",
    PromptVersion.V2_0,
    "Analyze sentiment with confidence score: {text}"
)

prompt = registry.get("sentiment", PromptVersion.V2_0)
```

### Error Handling

```python
from tenacity import retry, stop_after_attempt, wait_exponential

class PromptExecutor:
    def __init__(self, client):
        self.client = client

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def execute(self, prompt: str, **kwargs) -> str:
        """Execute prompt with retry logic"""
        try:
            response = self.client.chat.completions.create(
                model=kwargs.get("model", "gpt-4o-mini"),
                messages=[{"role": "user", "content": prompt}],
                temperature=kwargs.get("temperature", 0),
                max_tokens=kwargs.get("max_tokens", 1000)
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error executing prompt: {e}")
            raise

    def execute_with_validation(
        self,
        prompt: str,
        validator: callable,
        max_retries: int = 3
    ) -> str:
        """Execute with output validation"""
        for attempt in range(max_retries):
            output = self.execute(prompt)

            if validator(output):
                return output

            # Refine prompt
            prompt += f"\n\nPrevious attempt was invalid. Please ensure output matches required format."

        raise ValueError(f"Failed to get valid output after {max_retries} attempts")


# Usage
executor = PromptExecutor(client)

def is_valid_json(text: str) -> bool:
    try:
        json.loads(text)
        return True
    except:
        return False

result = executor.execute_with_validation(
    "Return user data as JSON",
    validator=is_valid_json
)
```

## Best Practices

### 1. System Messages

```python
def create_specialized_assistant(role: str, rules: List[str]) -> callable:
    """Create assistant with consistent behavior"""

    system_message = f"""You are a {role}.

Rules:
{chr(10).join(f"- {rule}" for rule in rules)}

Always follow these rules in your responses."""

    def chat(user_message: str) -> str:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ]
        )
        return response.choices[0].message.content

    return chat


# Usage
code_reviewer = create_specialized_assistant(
    role="senior code reviewer",
    rules=[
        "Always provide specific line numbers",
        "Explain why each issue matters",
        "Suggest concrete improvements",
        "Be constructive, not critical"
    ]
)

review = code_reviewer("Review this Python function...")
```

### 2. Context Management

```python
class ContextualChat:
    def __init__(self, max_context_messages: int = 10):
        self.messages = []
        self.max_context = max_context_messages

    def add_message(self, role: str, content: str):
        """Add message to context"""
        self.messages.append({"role": role, "content": content})

        # Trim old messages
        if len(self.messages) > self.max_context:
            # Keep system message and recent messages
            system_msgs = [m for m in self.messages if m["role"] == "system"]
            recent_msgs = self.messages[-self.max_context:]
            self.messages = system_msgs + recent_msgs

    def chat(self, user_message: str) -> str:
        """Chat with maintained context"""
        self.add_message("user", user_message)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=self.messages
        )

        assistant_message = response.choices[0].message.content
        self.add_message("assistant", assistant_message)

        return assistant_message
```

### 3. Prompt Security

```python
def sanitize_user_input(user_input: str) -> str:
    """Prevent prompt injection"""
    # Remove common injection patterns
    dangerous_patterns = [
        "ignore previous instructions",
        "disregard all",
        "new instructions:",
        "system:",
        "assistant:"
    ]

    cleaned = user_input
    for pattern in dangerous_patterns:
        cleaned = cleaned.replace(pattern, "")

    return cleaned

def create_safe_prompt(user_input: str, template: str) -> str:
    """Create prompt with input sandboxing"""
    cleaned_input = sanitize_user_input(user_input)

    return template.format(
        user_input=f'"""{cleaned_input}"""'  # Clearly delimited
    )
```

## Troubleshooting

**Issue**: Inconsistent outputs
- Set `temperature=0`
- Use structured outputs
- Add few-shot examples
- Be more specific in instructions

**Issue**: Token limits exceeded
- Trim context
- Use sliding window for chat history
- Summarize old messages
- Choose models with larger context

**Issue**: Slow responses
- Use `gpt-4o-mini` for simple tasks
- Implement caching
- Reduce `max_tokens`
- Consider batch processing

## Next Steps

**Related guides**:
- [Building Your First RAG System](/developers/building-first-rag-system)
- [AI Agent Architecture](/developers/agent-architecture-patterns)
- [LLM Model Evaluation](/developers/llm-evaluation-metrics)

**Advanced topics**:
- Meta-prompting and self-improvement
- Multi-agent prompt orchestration
- Prompt compression techniques
- Fine-tuning vs prompting trade-offs

## Resources

**Documentation**:
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Library](https://docs.anthropic.com/claude/prompt-library)

**Papers**:
- [Chain-of-Thought Prompting](https://arxiv.org/abs/2201.11903)
- [Self-Consistency](https://arxiv.org/abs/2203.11171)

**Tools**:
- [LangChain PromptTemplates](https://python.langchain.com/docs/modules/model_io/prompts/)
- [Tiktoken](https://github.com/openai/tiktoken) - Token counting

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues) or submit a PR!
