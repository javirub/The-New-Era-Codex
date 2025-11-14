---
title: "Extracción de Datos Web con Make.com e IA"
description: "Web scraping combinado con análisis GPT, soluciones sin código y plantillas reutilizables"
sidebar:
  badge:
    text: "Intermedio"
    variant: note
version: "1.0"
---

# Extracción de Datos Web con Make.com e IA

## Descripción General

Extrae y analiza datos web usando Make.com (anteriormente Integromat) combinado con IA para procesamiento inteligente de datos, transformación y enriquecimiento.

**Lo que construirás**: Escenario automatizado de web scraping que extrae datos de productos, los analiza con IA y almacena resultados estructurados.

**Casos de uso**: Análisis competitivo, monitoreo de precios, agregación de contenido, generación de leads.

**Tiempo**: 35 minutos

## Prerrequisitos

- Cuenta de Make.com (tier gratuito disponible)
- Clave API de OpenAI
- Sitio web objetivo para scraping (usar ética y legalmente)

## Configurar Make.com

1. Regístrate en [Make.com](https://www.make.com)
2. Crear nuevo escenario
3. Agregar conexión OpenAI en configuración

## Escenario 1: Monitor de Precios de Productos

### Componentes

**Objetivo**: Monitorear precios de la competencia y analizar tendencias

**Flujo**:
```
HTTP Request → HTML Parser → Iterator → OpenAI Analysis → Google Sheets
```

### Paso a Paso

**1. Módulo HTTP - Obtener Página Web**
```
URL: https://example.com/products
Method: GET
Headers:
  User-Agent: Mozilla/5.0...
```

**2. Parser HTML**
- Analizar contenido HTML
- Extraer elementos por selector CSS
- Ejemplo: `.product-card`

**3. Iterator**
- Recorrer cada producto

**4. OpenAI - Extraer Datos Estructurados**

Prompt:
```
Extract product information from this HTML:

{{html_content}}

Return JSON:
{
  "name": "product name",
  "price": numeric_value,
  "currency": "USD",
  "in_stock": boolean,
  "features": ["feature1", "feature2"]
}
```

**5. Google Sheets - Agregar Fila**
- Spreadsheet: Price Monitor
- Sheet: Products
- Values: {{parsed_data}}

## Escenario 2: Agregador de Noticias + Resumidor

### Flujo

```
RSS Feed → OpenAI Summarize → Filter → Notion Database
```

### Implementación

**1. Módulo RSS**
- Feed URL: RSS de noticias tech
- Limit: 10 items

**2. OpenAI - Resumir**

Prompt:
```
Summarize this article in 2-3 sentences:

Title: {{title}}
Content: {{content}}

Focus on key points and implications.
```

**3. Filter**
- Solo continuar si el resumen menciona "AI" o "automation"

**4. Notion - Crear Página**
- Database: News Tracker
- Properties:
  - Title: {{title}}
  - Summary: {{ai_summary}}
  - URL: {{link}}
  - Date: {{published}}

## Escenario 3: Enriquecimiento de Leads

### Flujo

```
Webhook → Scrape LinkedIn → OpenAI Analyze → CRM Update
```

### Pasos

**1. Webhook Trigger**
- Receives: `{"linkedin_url": "..."}`

**2. HTTP - Scrape Profile**
```
Note: Use LinkedIn API or authorized scraping service
Direct scraping may violate ToS
```

**3. OpenAI - Extraer Información Clave**

Prompt:
```
From this LinkedIn profile, extract:

Profile text: {{profile_html}}

Return JSON:
{
  "industry": "...",
  "company_size": "...",
  "seniority": "junior|mid|senior|executive",
  "interests": ["..."],
  "likely_pain_points": ["..."]
}
```

**4. HubSpot - Actualizar Contacto**
- Encontrar contacto por email
- Actualizar campos personalizados con insights de IA

## Patrones Avanzados

### Patrón 1: Scraping Multi-Página

```
HTTP Get Page 1
  ↓
Extract Pagination Links
  ↓
Iterator (Each Page)
  ↓
HTTP Get Each Page
  ↓
Aggregate Results
```

### Patrón 2: Limitación de Tasa

Agregar módulo **Sleep** entre solicitudes:
- Delay: 2 segundos
- Previene bloqueo de IP

### Patrón 3: Validación de Datos

Usar módulos **Filter**:
```
Filter: Price > 0 AND Price < 10000
Filter: Name is not empty
```

### Patrón 4: Manejo de Errores

Agregar ruta **Error Handler**:
- En error HTTP: Registrar en sheet
- En error de parseo: Enviar alerta a Slack
- Continuar ejecución

## Mejores Prácticas

### 1. Respetar robots.txt

Verificar robots.txt del sitio web:
```
https://example.com/robots.txt
```

Solo scrapear rutas permitidas.

### 2. Usar Delays

Agregar delays entre solicitudes:
- Mínimo 1-2 segundos
- Para operaciones grandes: 5+ segundos

### 3. Manejar Contenido Dinámico

Para contenido renderizado con JavaScript:
- Usar servicio de automatización de navegador (Browserless, Apify)
- O APIs cuando estén disponibles

### 4. Cachear Resultados

Almacenar HTML scrapeado:
- Reduce llamadas API
- Permite reprocesamiento
- Debugging más fácil

## Gestión de Costos

### Operaciones de Make.com

Tier gratuito: 1,000 operaciones/mes
- 1 solicitud HTTP = 1 operación
- 1 llamada OpenAI = 1 operación
- 1 actualización Sheet = 1 operación

### Ejemplo de Costo de Escenario

Monitorear 50 productos diariamente:
- Solicitudes HTTP: 50/día × 30 = 1,500 ops
- Análisis OpenAI: 50/día × 30 = 1,500 ops
- Actualizaciones Sheet: 50/día × 30 = 1,500 ops
- **Total**: 4,500 ops/mes = $9/mes

### Consejos de Optimización

1. **Procesamiento por lotes**: Procesar múltiples elementos por ejecución
2. **Ejecución condicional**: Solo ejecutar cuando sea necesario
3. **Usar webhooks**: Basado en trigger vs programado

## Plantillas Prácticas

### Plantilla 1: Scraper de Bolsa de Trabajo

```yaml
Trigger: Schedule (daily 9 AM)
1. HTTP - Get job listings page
2. HTML Parse - Extract job cards
3. Iterator - Loop jobs
4. OpenAI - Extract job details
5. Filter - Match criteria
6. Telegram - Send matching jobs
```

### Plantilla 2: Monitor de Redes Sociales

```yaml
Trigger: Schedule (every hour)
1. Twitter API - Search mentions
2. OpenAI - Sentiment analysis
3. Router:
   - Positive → Thank user
   - Negative → Alert team
   - Neutral → Add to CRM
```

### Plantilla 3: Alerta de Caída de Precio

```yaml
Trigger: Schedule (twice daily)
1. HTTP - Get product pages
2. Parse prices
3. Google Sheets - Get previous prices
4. Compare - If dropped > 10%
5. Email - Send alert
6. Update sheet with new price
```

## Solución de Problemas

**Problema**: HTTP 403 Forbidden
- Agregar encabezado User-Agent apropiado
- Respetar límites de tasa
- Considerar usar proxy
- Verificar si el scraping está permitido

**Problema**: Errores de parseo
- Inspeccionar estructura HTML real
- Usar devtools del navegador para encontrar selectores
- Manejar elementos faltantes con gracia

**Problema**: Datos inconsistentes
- Agregar filtros de validación
- Usar try-catch con manejadores de error
- Establecer valores predeterminados para campos faltantes

**Problema**: Timeouts de escenario
- Dividir en escenarios más pequeños
- Usar data stores para resultados intermedios
- Optimizar selectores

## Consideraciones Legales y Éticas

### Siempre:
- ✅ Verificar robots.txt
- ✅ Leer Términos de Servicio
- ✅ Respetar límites de tasa
- ✅ Identificar tu bot (User-Agent)
- ✅ Usar APIs oficiales cuando estén disponibles

### Nunca:
- ❌ Scrapear datos personales sin consentimiento
- ❌ Sobrecargar servidores con solicitudes
- ❌ Evadir autenticación
- ❌ Ignorar avisos de cese y desistimiento

## Próximos Pasos

**Mejora tus escenarios**:
- Agregar limpieza de datos con OpenAI
- Implementar detección de cambios
- Crear dashboards visuales
- Configurar monitoreo y alertas

**Guías relacionadas**:
- [Tu Primer Flujo de Trabajo con IA en n8n](/automation/first-ai-workflow-n8n)
- [Automatización de Email con Zapier](/automation/email-automation-zapier)

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
