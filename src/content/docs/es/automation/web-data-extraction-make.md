---
title: "Extracción de Datos Web con Make.com y IA"
description: "Web scraping combinado con análisis GPT, soluciones sin código y plantillas reutilizables"
sidebar:
  order: 30
  badge:
    text: "Intermedio"
    variant: note
version: "1.0"
---

# Extracción de Datos Web con Make.com y IA

## Descripción General

Extrae y analiza datos web usando Make.com (antes Integromat) combinado con IA para procesamiento, transformación y enriquecimiento inteligente de datos.

**Lo que construirás**: Escenario automatizado de web scraping que extrae datos de productos, los analiza con IA y almacena resultados estructurados.

**Casos de uso**: Análisis competitivo, monitoreo de precios, agregación de contenido, generación de leads.

**Tiempo**: 35 minutos

## Prerrequisitos

- Cuenta Make.com (tier gratuito disponible)
- Clave API de OpenAI
- Sitio web objetivo para scraping (usar ética y legalmente)

## Configurar Make.com

1. Regístrate en [Make.com](https://www.make.com)
2. Crea nuevo escenario
3. Agrega conexión OpenAI en ajustes

## Escenario 1: Monitor de Precios de Productos

### Componentes

**Objetivo**: Monitorear precios de competidores y analizar tendencias

**Flujo**:
```
HTTP Request → HTML Parser → Iterator → Análisis OpenAI → Google Sheets
```

### Paso a Paso

**1. Módulo HTTP - Obtener Página Web**
```
URL: https://ejemplo.com/productos
Método: GET
Headers:
  User-Agent: Mozilla/5.0...
```

**2. Parser HTML**
- Parsear contenido HTML
- Extraer elementos por selector CSS
- Ejemplo: `.tarjeta-producto`

**3. Iterador**
- Loop a través de cada producto

**4. OpenAI - Extraer Datos Estructurados**

Prompt:
```
Extrae información del producto desde este HTML:

{{contenido_html}}

Retorna JSON:
{
  "nombre": "nombre producto",
  "precio": valor_numerico,
  "moneda": "USD",
  "en_stock": boolean,
  "caracteristicas": ["caracteristica1", "caracteristica2"]
}
```

**5. Google Sheets - Agregar Fila**
- Hoja de cálculo: Monitor de Precios
- Hoja: Productos
- Valores: {{datos_parseados}}

## Escenario 2: Agregador de Noticias + Resumen

### Flujo

```
RSS Feed → OpenAI Resumir → Filtro → Base de Datos Notion
```

### Implementación

**1. Módulo RSS**
- URL Feed: RSS noticias tech
- Límite: 10 ítems

**2. OpenAI - Resumir**

Prompt:
```
Resume este artículo en 2-3 oraciones:

Título: {{titulo}}
Contenido: {{contenido}}

Enfócate en puntos clave e implicaciones.
```

**3. Filtro**
- Solo continuar si resumen menciona "IA" o "automatización"

**4. Notion - Crear Página**
- Base de datos: Rastreador Noticias
- Propiedades:
  - Título: {{titulo}}
  - Resumen: {{resumen_ia}}
  - URL: {{enlace}}
  - Fecha: {{publicado}}

## Escenario 3: Enriquecimiento de Leads

### Flujo

```
Webhook → Scrape LinkedIn → OpenAI Analizar → Actualizar CRM
```

### Pasos

**1. Trigger Webhook**
- Recibe: `{"url_linkedin": "..."}`

**2. HTTP - Scrape Perfil**
```
Nota: Usa API LinkedIn o servicio autorizado de scraping
Scraping directo puede violar ToS
```

**3. OpenAI - Extraer Info Clave**

Prompt:
```
De este perfil LinkedIn, extrae:

Texto perfil: {{html_perfil}}

Retorna JSON:
{
  "industria": "...",
  "tamano_empresa": "...",
  "senioridad": "junior|mid|senior|ejecutivo",
  "intereses": ["..."],
  "puntos_dolor_probables": ["..."]
}
```

**4. HubSpot - Actualizar Contacto**
- Encuentra contacto por email
- Actualiza campos personalizados con insights IA

## Patrones Avanzados

### Patrón 1: Scraping Multi-Página

```
HTTP Obtener Página 1
  ↓
Extraer Enlaces Paginación
  ↓
Iterador (Cada Página)
  ↓
HTTP Obtener Cada Página
  ↓
Agregar Resultados
```

### Patrón 2: Limitación de Tasa

Agrega módulo **Sleep** entre requests:
- Delay: 2 segundos
- Previene bloqueo IP

### Patrón 3: Validación de Datos

Usa módulos **Filter**:
```
Filtro: Precio > 0 AND Precio < 10000
Filtro: Nombre no está vacío
```

## Mejores Prácticas

### 1. Respetar robots.txt

Verifica robots.txt del sitio web:
```
https://ejemplo.com/robots.txt
```

Solo scrape rutas permitidas.

### 2. Usar Delays

Agrega delays entre requests:
- Mínimo 1-2 segundos
- Para operaciones grandes: 5+ segundos

### 3. Manejar Contenido Dinámico

Para contenido renderizado con JavaScript:
- Usa servicio de automatización de navegador (Browserless, Apify)
- O APIs cuando estén disponibles

## Gestión de Costos

### Operaciones Make.com

Tier gratuito: 1,000 operaciones/mes
- 1 request HTTP = 1 operación
- 1 llamada OpenAI = 1 operación
- 1 actualización Sheet = 1 operación

### Costo Escenario Ejemplo

Monitorear 50 productos diariamente:
- Requests HTTP: 50/día × 30 = 1,500 ops
- Análisis OpenAI: 50/día × 30 = 1,500 ops
- Actualizaciones Sheet: 50/día × 30 = 1,500 ops
- **Total**: 4,500 ops/mes = $9/mes

## Consideraciones Legales y Éticas

### Siempre:
- ✅ Verifica robots.txt
- ✅ Lee Términos de Servicio
- ✅ Respeta límites de tasa
- ✅ Identifica tu bot (User-Agent)
- ✅ Usa APIs oficiales cuando estén disponibles

### Nunca:
- ❌ Scrape datos personales sin consentimiento
- ❌ Abrumes servidores con requests
- ❌ Evites autenticación
- ❌ Ignores avisos de cese y desista

## Próximos Pasos

**Mejora tus escenarios**:
- Agrega limpieza de datos con OpenAI
- Implementa detección de cambios
- Crea dashboards visuales
- Configura monitoreo y alertas

---

**¿Encontraste un problema?** ¡[Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
