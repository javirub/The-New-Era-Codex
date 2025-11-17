---
title: "Biblioteca de Plantillas de Workflows: Automatizaciones IA Listas para Usar"
description: "10+ workflows exportables para automatización CRM, enriquecimiento de datos, moderación de contenido y más"
sidebar:
  order: 100
  badge:
    text: "Básico"
    variant: tip
version: "1.0"
---
## Descripción General

Colección de plantillas de workflow listas para producción que puedes importar y personalizar para casos de uso comunes de automatización con IA.

**Lo que obtendrás**: 10+ workflows probados para varias plataformas (n8n, Zapier, Make.com) listos para importar y usar.

**Casos de uso**: Automatización CRM, moderación de contenido, enriquecimiento de datos, calificación de leads, soporte al cliente.

**Tiempo**: 5-10 minutos por plantilla

## Plantilla 1: Calificador de Leads IA

**Plataforma**: n8n o Zapier

**Caso de uso**: Calificar automáticamente leads basado en datos de perfil

**Flujo**:
```
Webhook/CRM Trigger → Análisis OpenAI → Cálculo Score → Actualizar CRM → Notificar Slack
```

**Prompt OpenAI**:
```
Califica este lead 0-100 basado en:

Empresa: {{empresa}}
Industria: {{industria}}
Tamaño: {{tamano_empresa}}
Rol: {{titulo_trabajo}}
Engagement: {{aperturas_email}}, {{clicks_enlace}}

Criterios calificación:
- Fit industria (0-30): Tech/SaaS más alto
- Tamaño empresa (0-25): 50-500 empleados ideal
- Rol (0-25): Director+ más alto
- Engagement (0-20): Alto engagement más alto

Retorna JSON:
{
  "score": 0-100,
  "categoria": "caliente|tibio|frio",
  "razonamiento": "explicación breve",
  "siguiente_accion": "paso sugerido"
}
```

## Plantilla 2: Pipeline Moderación de Contenido

**Plataforma**: Make.com o n8n

**Caso de uso**: Moderar automáticamente contenido generado por usuarios

**Flujo**:
```
Nuevo Contenido → Check Toxicidad OpenAI → Filtro → Si Tóxico: Marcar + Notificar | Si Limpio: Aprobar + Publicar
```

**Prompt OpenAI**:
```
Analiza este contenido para:
1. Toxicidad/acoso
2. Spam/promocional
3. Fuera de tema
4. Problemas de calidad

Contenido: {{contenido_usuario}}

Retorna JSON:
{
  "toxico": boolean,
  "spam": boolean,
  "fuera_tema": boolean,
  "baja_calidad": boolean,
  "confianza": 0.0-1.0,
  "accion": "aprobar|revisar|rechazar"
}
```

## Plantilla 3: Personalizador Newsletter Email

**Plataforma**: Zapier

**Caso de uso**: Generar contenido de email personalizado basado en datos de usuario

**Flujo**:
```
Programar → Obtener Lista Suscriptores → Para Cada: OpenAI Personalizar → Servicio Email Enviar
```

## Plantilla 4: Triage Soporte al Cliente

**Plataforma**: n8n

**Caso de uso**: Clasificar y enrutar tickets de soporte

**Flujo**:
```
Nuevo Ticket → OpenAI Clasificar → Enrutar por Categoría → Asignar a Equipo → Establecer Prioridad
```

**Categorías**: Técnico, Facturación, Solicitud Función, Reporte Bug, General

## Plantilla 5: Generador Respuestas Redes Sociales

**Plataforma**: Make.com

**Caso de uso**: Generar respuestas contextuales a menciones sociales

**Flujo**:
```
Nueva Mención → Obtener Contexto → OpenAI Generar Respuesta → Cola Revisión → Publicar
```

## Plantilla 6: Pipeline Enriquecimiento de Datos

**Plataforma**: n8n

**Caso de uso**: Enriquecer registros de contacto con insights generados por IA

**Flujo**:
```
Nuevo Contacto → Búsqueda LinkedIn → Análisis OpenAI → Calcular Score Fit → Actualizar CRM
```

## Plantilla 7: Resumidor Notas de Reunión

**Plataforma**: Zapier

**Caso de uso**: Auto-generar resúmenes de reunión y ítems de acción

**Flujo**:
```
Evento Calendario Termina → Obtener Grabación/Transcripción → OpenAI Resumir → Enviar Email → Actualizar CRM
```

## Plantilla 8: Analizador Reseñas Producto

**Plataforma**: Make.com

**Caso de uso**: Agregar y analizar reseñas de productos

**Flujo**:
```
Programar → Obtener Reseñas → Para Cada: OpenAI Analizar → Agregar → Generar Reporte → Email Equipo
```

## Plantilla 9: Generador Calendario Contenido

**Plataforma**: n8n

**Caso de uso**: Generar ideas de contenido y programar

**Flujo**:
```
Programar Semanal → OpenAI Generar Ideas → Filtro Revisión → Añadir a Calendario → Notificar Equipo
```

## Plantilla 10: Extractor Datos Facturas

**Plataforma**: Make.com

**Caso de uso**: Extraer datos de PDFs/imágenes de facturas

**Flujo**:
```
Nuevo Email con Adjunto → Descargar PDF → OpenAI Extraer Datos → Validar → Añadir a Hoja de Cálculo
```

## Cómo Usar Plantillas

### Paso 1: Elegir Plantilla

Selecciona plantilla que coincida con tu caso de uso

### Paso 2: Importar

**n8n**: Importa JSON vía ajustes workflow
**Zapier**: Usa URL plantilla
**Make.com**: Importa blueprint

### Paso 3: Configurar

1. Añade claves API (OpenAI, servicios)
2. Conecta tus herramientas
3. Personaliza prompts
4. Establece programación/triggers

### Paso 4: Probar

Ejecuta con datos de muestra antes de producción

### Paso 5: Desplegar

Activa y monitorea

## Consejos de Personalización

### Ajustar Prompts

Modifica prompts IA para tu:
- Voz de marca
- Terminología industria
- Requisitos específicos
- Idioma/locale

### Añadir Lógica

Mejora con:
- Filtros adicionales
- Ramas condicionales
- Manejo de errores
- Notificaciones

## Mantenimiento de Plantillas

### Actualizaciones Regulares

- Revisa salidas IA semanalmente
- Ajusta prompts basado en resultados
- Actualiza filtros y reglas
- Prueba con nuevos escenarios

### Control de Versiones

- Exporta versiones actualizadas
- Documenta cambios
- Mantén changelog
- Comparte mejoras

## Próximos Pasos

**Comienza con**:
1. Elige plantilla más simple para tu necesidad
2. Prueba en entorno sandbox
3. Personaliza gradualmente
4. Despliega a producción

---

**¿Encontraste un problema?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
