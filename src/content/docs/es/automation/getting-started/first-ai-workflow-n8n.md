---
title: "Tu Primer Workflow de IA con n8n"
description: "Guía visual para conectar OpenAI a n8n y crear flujos de automatización con IA simples"
sidebar:
  order: 10
  badge:
    text: "Básico"
    variant: tip
version: "1.0"
---

# Tu Primer Workflow de IA con n8n

## Descripción General

n8n es una herramienta de automatización de workflows que te permite conectar modelos de IA como GPT de OpenAI con cientos de aplicaciones sin código. Construye automatizaciones inteligentes visualmente.

**Lo que construirás**: Un workflow de moderación de contenido con IA que analiza automáticamente envíos de usuarios y los enruta según sentimiento.

**Casos de uso**: Moderación de contenido, auto-respuestas de email, enriquecimiento de datos, triage de soporte al cliente.

**Tiempo**: 30 minutos

## Configurando n8n

### Opción 1: Cloud (Más Fácil)

1. Ve a [n8n.cloud](https://n8n.cloud)
2. Crea cuenta gratuita
3. Accede al editor de workflows

### Opción 2: Auto-hospedado (Docker)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Accede en `http://localhost:5678`

## Conectando OpenAI a n8n

### Paso 1: Agregar Credenciales OpenAI

1. Click **Ajustes** > **Credenciales**
2. Click **Agregar Credencial**
3. Busca "OpenAI"
4. Ingresa tu clave API
5. Prueba conexión
6. Guarda

### Paso 2: Crear Tu Primer Workflow

**Workflow: Analizador de Contenido IA**

**Componentes**:
1. **Webhook** - Recibe envíos de contenido
2. **OpenAI** - Analiza sentimiento
3. **IF** - Enruta según resultado
4. **HTTP Request** - Envía a endpoint apropiado

### Construyendo el Workflow

**1. Agregar Trigger Webhook**

- Arrastra nodo "Webhook" al canvas
- Establece ruta: `/analizar-contenido`
- Método: POST
- Click "Escuchar evento de prueba"

**2. Agregar Nodo OpenAI**

- Busca "OpenAI" y agrega nodo
- Conecta a webhook
- Selecciona credencial
- Operación: "Message a Model"
- Modelo: `gpt-4o-mini`
- Prompt:
```
Analiza este contenido para sentimiento y toxicidad:

Contenido: {{$json.body.contenido}}

Retorna JSON con formato:
{
  "sentimiento": "positivo|negativo|neutral",
  "toxico": boolean,
  "confianza": 0.0-1.0,
  "razon": "explicación breve"
}
```

**3. Agregar Nodo IF**

- Conecta a nodo OpenAI
- Condición: `{{$json.toxico}} === true`
- Rama verdadera: Marcar para revisión
- Rama falsa: Aprobar

**4. Agregar Nodos de Acción**

Para Verdadero (contenido tóxico):
- Nodo HTTP Request
- URL: Tu endpoint de moderación
- Método: POST
- Body: `{{$json}}`

Para Falso (contenido limpio):
- Nodo HTTP Request
- URL: Tu endpoint de aprobación
- Método: POST
- Body: `{{$json}}`

### Probando el Workflow

1. Click **Ejecutar Workflow**
2. Envía datos de prueba vía webhook:

```bash
curl -X POST http://localhost:5678/webhook/analizar-contenido \
  -H "Content-Type: application/json" \
  -d '{"contenido": "¡Este es un gran producto!"}'
```

## Patrones Comunes n8n + IA

### Patrón 1: Auto-Respuesta de Email

```
Trigger Gmail → OpenAI (Borrador Respuesta) → IF (¿Confiado?) → Gmail (Enviar)
```

### Patrón 2: Enriquecimiento de Datos

```
Trigger Base de Datos → OpenAI (Analizar) → Actualizar Registro → Notificar Slack
```

## Mejores Prácticas

### 1. Manejo de Errores

Agrega nodo "Error Trigger":
- Captura fallos de workflow
- Registra en sistema de monitoreo
- Envía alertas

### 2. Limitación de Tasa

Usa nodo "Wait" entre llamadas API.

### 3. Control de Costos

Monitorea uso de OpenAI:
- Establece max tokens
- Usa modelos más baratos para tareas simples
- Cachea solicitudes frecuentes

## Solución de Problemas

**Problema**: Timeout de OpenAI
- Aumenta timeout en configuración HTTP Request
- Usa prompts más cortos
- Verifica estado API

**Problema**: Webhook no recibe datos
- Verifica URL de webhook correcta
- Revisa configuración firewall
- Prueba con curl primero

**Problema**: Costos altos
- Usa `gpt-4o-mini` en vez de `gpt-4o`
- Agrega capa de caché
- Limita triggers de workflow

## Próximos Pasos

**Aprende más**:
- [Documentación n8n](https://docs.n8n.io/)
- [Workflows Comunitarios n8n](https://n8n.io/workflows/)

---

**¿Encontraste un problema?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
