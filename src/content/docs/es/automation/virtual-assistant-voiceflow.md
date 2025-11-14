---
title: "Creando un Asistente Virtual con Voiceflow"
description: "Diseña flujos conversacionales, integra con IA, despliega en WhatsApp/Telegram"
sidebar:
  badge:
    text: "Intermedio"
    variant: note
version: "1.0"
---

# Creando un Asistente Virtual con Voiceflow

## Descripción General

Construye asistentes de IA conversacional usando la interfaz visual de Voiceflow, integra con OpenAI y despliega en múltiples plataformas de mensajería.

**Lo que construirás**: Un asistente virtual de servicio al cliente con comprensión de lenguaje natural, gestión de contexto y despliegue multi-canal.

**Casos de uso**: Soporte al cliente, reserva de citas, automatización de FAQ, calificación de leads.

**Tiempo**: 40 minutos

## Prerrequisitos

- Cuenta de Voiceflow (tier gratuito disponible en [voiceflow.com](https://voiceflow.com))
- Clave API de OpenAI
- Canal de despliegue (WhatsApp Business API, Telegram o web)

## Primeros Pasos

### Crear Nuevo Proyecto

1. Inicia sesión en Voiceflow
2. Haz clic en "New Project"
3. Elige "Chat Assistant"
4. Selecciona plantilla o comienza en blanco

## Construyendo tu Primer Flujo

### Componentes Básicos

**Bloques**:
- **Start**: Punto de entrada
- **Text**: Mostrar mensajes
- **Capture**: Obtener entrada del usuario
- **Condition**: Lógica de ramificación
- **API**: Llamadas externas
- **Code**: Lógica personalizada

### Flujo 1: Bot Simple de FAQ

**Objetivo**: Responder preguntas comunes

**Diseño del Flujo**:
```
Start
  ↓
Welcome Message
  ↓
Capture User Question
  ↓
OpenAI API Call
  ↓
Display Answer
  ↓
Ask if helpful?
  ↓
Yes: Thank you → End
No: Connect to human → End
```

**Implementación**:

**1. Bloque de Bienvenida**
```
Type: Text
Message: "Hi! I'm your virtual assistant. How can I help you today?"
```

**2. Capturar Entrada**
```
Type: Capture
Variable: {user_question}
Message: "Please type your question..."
```

**3. Integración con OpenAI**
```
Type: API
Method: POST
URL: https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer {your_api_key}
  Content-Type: application/json

Body:
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful customer service assistant. Answer questions concisely and professionally."
    },
    {
      "role": "user",
      "content": "{user_question}"
    }
  ]
}

Response Mapping:
answer = response.choices[0].message.content
```

**4. Mostrar Respuesta**
```
Type: Text
Message: "{answer}"
```

**5. Verificación de Satisfacción**
```
Type: Choice
Message: "Was this helpful?"
Choices:
  - Yes → Thank you message → End
  - No → "Let me connect you with a human agent" → Handoff
```

## Características Avanzadas

### Gestión de Contexto

**Usar Variables** para rastrear el estado de la conversación:

```
Variables:
- user_name: String
- user_email: String
- conversation_topic: String
- satisfied: Boolean
- retry_count: Number
```

**Ejemplo de Flujo con Contexto**:
```
Capture name → Store in {user_name}
  ↓
All future messages: "Hi {user_name}, ..."
  ↓
Track topic in {conversation_topic}
  ↓
If {retry_count} > 3 → Escalate to human
```

### Reconocimiento de Intención

**Usar Condiciones para enrutamiento de intención**:

```
Condition Block:
IF {user_question} contains ["price", "cost", "pricing"]
  → Go to Pricing Flow

ELSE IF {user_question} contains ["demo", "trial", "test"]
  → Go to Demo Booking Flow

ELSE IF {user_question} contains ["bug", "error", "broken"]
  → Go to Support Flow

ELSE
  → Go to General FAQ Flow
```

### Conversaciones Multi-Paso

**Ejemplo: Reserva de Cita**

```
Start → Collect Service Type
  ↓
Collect Preferred Date
  ↓
Collect Preferred Time
  ↓
Collect Contact Info
  ↓
Confirm Details
  ↓
API Call to Calendar System
  ↓
Send Confirmation
```

**Implementación**:

```javascript
// Step 1: Collect Service
Text: "What service do you need?"
Choice:
  - Consultation
  - Support
  - Demo

// Step 2: Date Collection
Capture: {preferred_date}
Validation: Must be future date

// Step 3: Time Selection
Choice: Pick from available slots
Buttons:
  - 9:00 AM
  - 11:00 AM
  - 2:00 PM
  - 4:00 PM

// Step 4: Contact Info
Capture: {email}
Validation: Must be valid email

// Step 5: Confirmation
Text: "Booking {service} on {date} at {time}. Confirm?"
Choice: Yes/No

// Step 6: API Call (if Yes)
API: POST /api/bookings
Body: {
  service: {service},
  date: {date},
  time: {time},
  email: {email}
}

// Step 7: Success Message
Text: "Confirmed! Check {email} for details."
```

## Integraciones

### Despliegue en WhatsApp

1. Obtén acceso a WhatsApp Business API
2. En Voiceflow: Integrations → WhatsApp
3. Conecta tu cuenta de WhatsApp Business
4. Configura URL de webhook
5. Prueba con tu número

### Bot de Telegram

1. Crea bot con @BotFather
2. Obtén token del bot
3. En Voiceflow: Integrations → Telegram
4. Pega el token
5. Despliega

### Widget de Chat Web

```html
<!-- Add to your website -->
<script type="text/javascript">
  (function(d, t) {
    var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    v.onload = function() {
      window.voiceflow.chat.load({
        verify: { projectID: 'YOUR_PROJECT_ID' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production'
      });
    }
    v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
    v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
  })(document, 'script');
</script>
```

## Mejores Prácticas

### 1. Diseño de Conversación

**Hacer**:
- Usar lenguaje claro y conciso
- Proporcionar ejemplos en los prompts
- Ofrecer botones de respuesta rápida
- Establecer expectativas del usuario temprano

**No hacer**:
- Hacer conversaciones demasiado largas
- Usar jerga compleja
- Pedir información que ya tienes
- Dejar a los usuarios en callejones sin salida

### 2. Manejo de Errores

**Siempre incluir**:
```
Try-Catch blocks for API calls
Fallback responses for unknowns
Escalation path to humans
Retry limits for failed inputs
```

**Ejemplo**:
```
API Call
  ↓
Success? → Continue
  ↓
No → Try again (max 2 times)
  ↓
Still failing? → "I'm having technical difficulties. Let me connect you to a person."
```

### 3. Procesamiento de Lenguaje Natural

**Mejorar la comprensión**:
- Usar OpenAI para consultas complejas
- Agregar sinónimos a la coincidencia de intenciones
- Implementar corrector ortográfico
- Manejar errores tipográficos comunes

**Ejemplo de Configuración NLU**:
```javascript
// Code block in Voiceflow
const userInput = {user_question}.toLowerCase();

// Handle variations
if (userInput.includes('hi') ||
    userInput.includes('hello') ||
    userInput.includes('hey')) {
  setVariable('intent', 'greeting');
}
```

### 4. Analítica y Mejora

**Rastrear**:
- Puntos de abandono del usuario
- Consultas comunes no manejadas
- Longitud promedio de conversación
- Puntuaciones de satisfacción

**En Voiceflow**:
- Usar panel de Analytics
- Revisar registros de conversación
- Probar A/B diferentes flujos
- Iterar basándose en datos

## Pruebas

### Escenarios de Prueba

1. **Happy Path**: Usuario obtiene respuesta fácilmente
2. **Usuario Confundido**: Preguntas poco claras
3. **Casos Límite**: Entradas inusuales
4. **Escenarios de Error**: Fallos de API
5. **Multi-Intención**: Múltiples preguntas a la vez

### Lista de Verificación de Pruebas

```
□ Todas las intenciones reconocidas correctamente
□ Variables almacenando datos apropiadamente
□ Llamadas API devolviendo datos esperados
□ Mensajes de error mostrándose
□ Fallbacks funcionando
□ Handoff a humano funcional
□ Todas las plataformas (WhatsApp, Web, etc.) funcionando
```

## Consejos de Producción

### 1. Rendimiento

- Cachear respuestas frecuentes
- Usar limitación de tasa de API
- Optimizar tamaños de imagen/medios
- Establecer timeouts apropiadamente

### 2. Seguridad

```
- Validar todas las entradas del usuario
- Sanitizar antes de llamadas API
- No almacenar datos sensibles en variables
- Usar HTTPS para todas las integraciones
- Implementar limitación de tasa
```

### 3. Escalabilidad

**Manejar alto volumen**:
- Usar colas para handoffs
- Balancear carga de llamadas API
- Monitorear tiempos de respuesta
- Configurar alertas para fallos

### 4. Mantenimiento

**Tareas regulares**:
- Revisar registros de conversación semanalmente
- Actualizar base de conocimiento
- Reentrenar intenciones
- Probar nuevos escenarios
- Actualizar integraciones API

## Casos de Uso Comunes

### Caso de Uso 1: Triaje de Soporte al Cliente

```
Flow:
User Question → Classify Issue Type → Route to:
  - Knowledge Base (self-service)
  - Ticket Creation (async)
  - Live Agent (urgent)
```

### Caso de Uso 2: Calificación de Leads

```
Flow:
Greeting → Collect:
  - Company Size
  - Industry
  - Budget Range
  - Timeline
→ Score Lead → Route to Sales
```

### Caso de Uso 3: Seguimiento de Pedidos

```
Flow:
Capture Order Number → API Lookup → Display:
  - Order Status
  - Expected Delivery
  - Tracking Link
→ Offer to help with issues
```

## Solución de Problemas

**Problema**: Bot no responde
- Verificar estado de despliegue
- Verificar configuración de webhook
- Probar con chat integrado primero

**Problema**: Llamadas API fallando
- Verificar clave API
- Verificar formato de solicitud
- Revisar registros de error
- Probar endpoint directamente

**Problema**: Intención incorrecta detectada
- Agregar más frases de entrenamiento
- Mejorar descripciones de intención
- Usar OpenAI para NLU complejo

## Próximos Pasos

**Mejora tu asistente**:
- Agregar soporte multiidioma
- Implementar análisis de sentimiento
- Crear flujos especializados
- Integrar con CRM
- Agregar capacidades de voz

**Guías relacionadas**:
- [Flujos de Trabajo con n8n](/automation/first-ai-workflow-n8n)
- [Automatización con Zapier](/automation/email-automation-zapier)

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
