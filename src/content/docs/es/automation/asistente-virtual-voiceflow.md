---
title: "Creando un Asistente Virtual con Voiceflow"
description: "Diseño de flujos conversacionales, integración con IA, despliegue en WhatsApp/Telegram"
sidebar:
  badge:
    text: "Intermedio"
    variant: note
version: "1.0"
---

# Creando un Asistente Virtual con Voiceflow

## Descripción General

Construye asistentes de IA conversacionales usando la interfaz visual de Voiceflow, integra con OpenAI y despliega en plataformas de mensajería.

**Lo que construirás**: Un asistente virtual de servicio al cliente con comprensión de lenguaje natural, gestión de contexto y despliegue multi-canal.

**Casos de uso**: Soporte al cliente, reserva de citas, automatización FAQ, calificación de leads.

**Tiempo**: 40 minutos

## Prerrequisitos

- Cuenta Voiceflow (tier gratuito en [voiceflow.com](https://voiceflow.com))
- Clave API de OpenAI
- Canal de despliegue (WhatsApp Business API, Telegram, o web)

## Comenzando

### Crear Nuevo Proyecto

1. Ingresa a Voiceflow
2. Click "Nuevo Proyecto"
3. Elige "Asistente de Chat"
4. Selecciona plantilla o inicia en blanco

## Construyendo Tu Primer Flujo

### Componentes Básicos

**Bloques**:
- **Start**: Punto de entrada
- **Text**: Mostrar mensajes
- **Capture**: Obtener entrada del usuario
- **Condition**: Lógica de ramificación
- **API**: Llamadas externas
- **Code**: Lógica personalizada

### Flujo 1: Bot FAQ Simple

**Objetivo**: Responder preguntas comunes

**Diseño del Flujo**:
```
Inicio
  ↓
Mensaje Bienvenida
  ↓
Capturar Pregunta Usuario
  ↓
Llamada API OpenAI
  ↓
Mostrar Respuesta
  ↓
¿Fue útil?
  ↓
Sí: Gracias → Fin
No: Conectar con humano → Fin
```

**Implementación**:

**1. Bloque Bienvenida**
```
Tipo: Text
Mensaje: "¡Hola! Soy tu asistente virtual. ¿Cómo puedo ayudarte hoy?"
```

**2. Capturar Entrada**
```
Tipo: Capture
Variable: {pregunta_usuario}
Mensaje: "Por favor escribe tu pregunta..."
```

**3. Integración OpenAI**
```
Tipo: API
Método: POST
URL: https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer {tu_clave_api}
  Content-Type: application/json

Body:
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "Eres un asistente útil de servicio al cliente. Responde preguntas de manera concisa y profesional."
    },
    {
      "role": "user",
      "content": "{pregunta_usuario}"
    }
  ]
}

Mapeo Respuesta:
respuesta = response.choices[0].message.content
```

**4. Mostrar Respuesta**
```
Tipo: Text
Mensaje: "{respuesta}"
```

**5. Verificación Satisfacción**
```
Tipo: Choice
Mensaje: "¿Fue útil esto?"
Opciones:
  - Sí → Mensaje de agradecimiento → Fin
  - No → "Déjame conectarte con un agente humano" → Transferencia
```

## Características Avanzadas

### Gestión de Contexto

**Usa Variables** para rastrear estado de conversación:

```
Variables:
- nombre_usuario: String
- email_usuario: String
- tema_conversacion: String
- satisfecho: Boolean
- contador_reintentos: Number
```

**Ejemplo de Flujo con Contexto**:
```
Capturar nombre → Guardar en {nombre_usuario}
  ↓
Todos los mensajes futuros: "Hola {nombre_usuario}, ..."
  ↓
Rastrear tema en {tema_conversacion}
  ↓
Si {contador_reintentos} > 3 → Escalar a humano
```

### Reconocimiento de Intención

**Usa Condiciones para enrutamiento de intención**:

```
Bloque Condición:
SI {pregunta_usuario} contiene ["precio", "costo", "precios"]
  → Ir a Flujo Precios

SINO SI {pregunta_usuario} contiene ["demo", "prueba", "test"]
  → Ir a Flujo Reserva Demo

SINO SI {pregunta_usuario} contiene ["bug", "error", "roto"]
  → Ir a Flujo Soporte

SINO
  → Ir a Flujo FAQ General
```

### Conversaciones Multi-Paso

**Ejemplo: Reserva de Cita**

```
Inicio → Recopilar Tipo de Servicio
  ↓
Recopilar Fecha Preferida
  ↓
Recopilar Hora Preferida
  ↓
Recopilar Info de Contacto
  ↓
Confirmar Detalles
  ↓
Llamada API a Sistema de Calendario
  ↓
Enviar Confirmación
```

## Integraciones

### Despliegue WhatsApp

1. Obtén acceso API WhatsApp Business
2. En Voiceflow: Integraciones → WhatsApp
3. Conecta tu cuenta WhatsApp Business
4. Configura URL webhook
5. Prueba con tu número

### Bot Telegram

1. Crea bot con @BotFather
2. Obtén token del bot
3. En Voiceflow: Integraciones → Telegram
4. Pega token
5. Despliega

### Widget Chat Web

```html
<!-- Añadir a tu sitio web -->
<script type="text/javascript">
  (function(d, t) {
    var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    v.onload = function() {
      window.voiceflow.chat.load({
        verify: { projectID: 'TU_PROJECT_ID' },
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
- Proporcionar ejemplos en prompts
- Ofrecer botones de respuesta rápida
- Establecer expectativas del usuario temprano

**No hacer**:
- Hacer conversaciones muy largas
- Usar jerga compleja
- Pedir info que ya tienes
- Dejar usuarios en callejones sin salida

### 2. Manejo de Errores

**Siempre incluir**:
```
Bloques Try-Catch para llamadas API
Respuestas de respaldo para desconocidos
Ruta de escalamiento a humanos
Límites de reintento para entradas fallidas
```

### 3. Procesamiento Lenguaje Natural

**Mejorar comprensión**:
- Usar OpenAI para consultas complejas
- Añadir sinónimos a coincidencia de intención
- Implementar corrección ortográfica
- Manejar errores tipográficos comunes

## Testing

### Escenarios de Prueba

1. **Ruta Feliz**: Usuario obtiene respuesta fácilmente
2. **Usuario Confundido**: Preguntas poco claras
3. **Casos Límite**: Entradas inusuales
4. **Escenarios Error**: Fallos API
5. **Multi-Intención**: Múltiples preguntas a la vez

## Consejos de Producción

### 1. Rendimiento

- Cachear respuestas frecuentes
- Usar limitación de tasa API
- Optimizar tamaños imagen/media
- Establecer timeouts apropiadamente

### 2. Seguridad

```
- Validar todas las entradas de usuario
- Sanitizar antes de llamadas API
- No almacenar datos sensibles en variables
- Usar HTTPS para todas las integraciones
- Implementar limitación de tasa
```

### 3. Mantenimiento

**Tareas regulares**:
- Revisar logs de conversación semanalmente
- Actualizar base de conocimientos
- Re-entrenar intenciones
- Probar nuevos escenarios
- Actualizar integraciones API

## Próximos Pasos

**Mejora tu asistente**:
- Añadir soporte multiidioma
- Implementar análisis de sentimiento
- Crear flujos especializados
- Integrar con CRM

---

**¿Encontraste un problema?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
