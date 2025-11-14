---
title: "Patrones de Ingeniería de Prompts: Biblioteca de Plantillas Reutilizables"
description: "Colección de patrones de prompts probados para tareas comunes de IA"
sidebar:
  badge:
    text: "Referencia"
    variant: note
version: "1.0"
---

# Patrones de Ingeniería de Prompts

## Patrones Básicos

### 1. Aprendizaje de Pocos Ejemplos
```
Tarea: [Lo que quieres]

Ejemplos:
Entrada: [Entrada del ejemplo 1]
Salida: [Salida del ejemplo 1]

Entrada: [Entrada del ejemplo 2]
Salida: [Salida del ejemplo 2]

Entrada: [Entrada del ejemplo 3]
Salida: [Salida del ejemplo 3]

Ahora haz esto:
Entrada: [Tu entrada real]
Salida:
```

### 2. Cadena de Pensamiento
```
Resuelve esto paso a paso:

Problema: [Tu problema]

Piénsalo:
1. Primero, [paso]
2. Luego, [paso]
3. Finalmente, [paso]

Respuesta:
```

### 3. Basado en Roles
```
Eres [rol específico con experiencia].
Tus rasgos: [lista de características relevantes]
Tu conocimiento: [experiencia en el dominio]

Tarea: [lo que deben hacer]
Contexto: [información relevante]

Responde como lo haría este rol.
```

### 4. Especificación de Formato
```
[Descripción de la tarea]

Formato de salida:
{
  "campo1": "valor",
  "campo2": ["array", "de", "valores"],
  "campo3": {
    "anidado": "objeto"
  }
}

Entrada: [tu entrada]
```

### 5. Salida Restringida
```
[Tarea]

Requisitos:
- Longitud: [específica]
- Tono: [específico]
- Debe incluir: [elementos]
- Debe evitar: [elementos]
- Formato: [específico]
```

## Patrones Avanzados

### 6. Autocrítica
```
Tarea: [qué hacer]

Paso 1: Crea una respuesta inicial
Paso 2: Critica tu respuesta por:
- Precisión
- Completitud
- Claridad

Paso 3: Proporciona una versión mejorada
```

### 7. Múltiples Perspectivas
```
Analiza [tema] desde estas perspectivas:

1. [Perspectiva A]: [punto de vista]
2. [Perspectiva B]: [punto de vista]
3. [Perspectiva C]: [punto de vista]

Luego sintetiza en una vista equilibrada.
```

### 8. Refinamiento Iterativo
```
Borrador 1: [Crea versión inicial]

Retroalimentación: [Qué mejorar]

Borrador 2: [Versión mejorada]

Retroalimentación: [Mejoras adicionales]

Final: [Versión pulida]
```

## Patrones Específicos de Tareas

### Generación de Código
```
Lenguaje: [lenguaje de programación]
Tarea: [qué debe hacer el código]
Entrada: [parámetros/datos]
Salida: [resultado esperado]

Requisitos:
- [Requisito 1]
- [Requisito 2]

Incluir:
- Manejo de errores
- Comentarios
- Anotaciones de tipo (si aplica)
- Pruebas
```

### Análisis de Datos
```
Conjunto de datos: [descripción]
Pregunta: [qué quieres saber]

Pasos de análisis:
1. Describe los datos
2. Identifica patrones
3. Calcula métricas clave
4. Extrae insights
5. Recomienda acciones

Presenta los hallazgos claramente.
```

### Escritura Creativa
```
Tipo: [género/formato]
Audiencia: [lector objetivo]
Longitud: [conteo de palabras]
Tono: [tono específico]

Elementos a incluir:
- [Elemento 1]
- [Elemento 2]

Restricciones:
- [Restricción 1]
```

## Meta-Prompts

### Generador de Prompts
```
Necesito un prompt para: [tarea]
Contexto: [información relevante]
Resultado deseado: [cómo se ve el éxito]

Genera un prompt efectivo que:
1. Sea claro y específico
2. Proporcione el contexto necesario
3. Especifique el formato de salida
4. Incluya ejemplos si es útil
```

### Mejorador de Prompts
```
Prompt original: [tu prompt]

Problemas: [qué no está funcionando]

Mejora este prompt:
1. Agregando claridad
2. Proporcionando contexto
3. Especificando formato
4. Agregando ejemplos

Proporciona la versión mejorada con explicación.
```

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
