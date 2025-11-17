---
title: "Frameworks Avanzados de Agentes: AutoGPT, BabyAGI, CrewAI"
description: "Construye agentes autónomos con frameworks avanzados y sistemas multi-agente"
sidebar:
  order: 55
  badge:
    text: "Avanzado"
    variant: danger
version: "1.0"
---

# Frameworks Avanzados de Agentes

## Patrón AutoGPT

```python
class AutonomousAgent:
    def __init__(self, objective):
        self.objective = objective
        self.memory = []
        self.completed_tasks = []

    def run(self, max_iterations=10):
        for i in range(max_iterations):
            # Crear lista de tareas
            tasks = self.create_tasks()

            # Ejecutar tareas
            for task in tasks:
                result = self.execute_task(task)
                self.memory.append({'task': task, 'result': result})

            # Verificar si se alcanzó el objetivo
            if self.is_objective_complete():
                break

    def create_tasks(self):
        prompt = f"""
        Objetivo: {self.objective}
        Completado: {self.completed_tasks}

        ¿Cuáles son las próximas 3 tareas?
        """

        response = llm.complete(prompt)
        return parse_tasks(response)
```

## Multi-Agente con CrewAI

```python
from crewai import Agent, Task, Crew

# Definir agentes especializados
researcher = Agent(
    role='Investigador',
    goal='Encontrar información relevante',
    backstory='Experto en encontrar y analizar información',
    tools=[search_tool, scrape_tool]
)

writer = Agent(
    role='Escritor',
    goal='Crear contenido convincente',
    backstory='Escritor de contenido profesional',
    tools=[grammar_check]
)

# Definir tareas
research_task = Task(
    description='Investigar tema: {topic}',
    agent=researcher
)

write_task = Task(
    description='Escribir artículo basado en la investigación',
    agent=writer
)

# Crear crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    verbose=True
)

# Ejecutar
result = crew.kickoff(inputs={'topic': 'Agentes de IA'})
```

## Protocolo de Comunicación entre Agentes

```python
class AgentMessage:
    def __init__(self, sender, receiver, content, message_type):
        self.sender = sender
        self.receiver = receiver
        self.content = content
        self.type = message_type

class AgentCoordinator:
    def __init__(self):
        self.agents = {}
        self.message_queue = []

    def register_agent(self, agent):
        self.agents[agent.name] = agent

    def send_message(self, message):
        self.message_queue.append(message)

    def process_messages(self):
        while self.message_queue:
            msg = self.message_queue.pop(0)
            receiver = self.agents[msg.receiver]
            receiver.receive_message(msg)
```

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
