---
title: "Prompt Engineering Patterns: Reusable Templates Library"
description: "Collection of proven prompt patterns for common AI tasks"
sidebar:
  badge:
    text: "Reference"
    variant: note
version: "1.0"
---

# Prompt Engineering Patterns

## Core Patterns

### 1. Few-Shot Learning
```
Task: [What you want]

Examples:
Input: [Example 1 input]
Output: [Example 1 output]

Input: [Example 2 input]
Output: [Example 2 output]

Input: [Example 3 input]
Output: [Example 3 output]

Now do this:
Input: [Your actual input]
Output:
```

### 2. Chain-of-Thought
```
Solve this step-by-step:

Problem: [Your problem]

Think through it:
1. First, [step]
2. Then, [step]
3. Finally, [step]

Answer:
```

### 3. Role-Based
```
You are [specific role with expertise].
Your traits: [list relevant characteristics]
Your knowledge: [domain expertise]

Task: [what they should do]
Context: [relevant information]

Respond as this role would.
```

### 4. Format Specification
```
[Task description]

Output format:
{
  "field1": "value",
  "field2": ["array", "of", "values"],
  "field3": {
    "nested": "object"
  }
}

Input: [your input]
```

### 5. Constrained Output
```
[Task]

Requirements:
- Length: [specific]
- Tone: [specific]
- Must include: [elements]
- Must avoid: [elements]
- Format: [specific]
```

## Advanced Patterns

### 6. Self-Critique
```
Task: [what to do]

Step 1: Create initial response
Step 2: Critique your response for:
- Accuracy
- Completeness
- Clarity

Step 3: Provide improved version
```

### 7. Multiple Perspectives
```
Analyze [topic] from these perspectives:

1. [Perspective A]: [viewpoint]
2. [Perspective B]: [viewpoint]
3. [Perspective C]: [viewpoint]

Then synthesize into balanced view.
```

### 8. Iterative Refinement
```
Draft 1: [Create initial version]

Feedback: [What to improve]

Draft 2: [Improved version]

Feedback: [Further improvements]

Final: [Polished version]
```

## Task-Specific Patterns

### Code Generation
```
Language: [programming language]
Task: [what the code should do]
Input: [parameters/data]
Output: [expected result]

Requirements:
- [Requirement 1]
- [Requirement 2]

Include:
- Error handling
- Comments
- Type hints (if applicable)
- Tests
```

### Data Analysis
```
Dataset: [description]
Question: [what you want to know]

Analysis steps:
1. Describe the data
2. Identify patterns
3. Calculate key metrics
4. Draw insights
5. Recommend actions

Present findings clearly.
```

### Creative Writing
```
Type: [genre/format]
Audience: [target reader]
Length: [word count]
Tone: [specific tone]

Elements to include:
- [Element 1]
- [Element 2]

Constraints:
- [Constraint 1]
```

## Meta-Prompts

### Prompt Generator
```
I need a prompt for: [task]
Context: [relevant info]
Desired outcome: [what success looks like]

Generate an effective prompt that:
1. Is clear and specific
2. Provides necessary context
3. Specifies output format
4. Includes examples if helpful
```

### Prompt Improver
```
Original prompt: [your prompt]

Issues: [what's not working]

Improve this prompt by:
1. Adding clarity
2. Providing context
3. Specifying format
4. Adding examples

Provide improved version with explanation.
```

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
