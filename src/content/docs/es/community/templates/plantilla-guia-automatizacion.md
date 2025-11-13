---
title: "Plantilla de Guía de Automatización"
description: "Plantilla para crear guías de flujos de trabajo sin código/bajo código para n8n, Zapier y Make.com"
sidebar:
  badge:
    text: "Plantilla"
    variant: tip
version: "1.0"
---

# [Nombre del Flujo de Trabajo - Sea Descriptivo y Orientado a la Acción]

<!-- Ejemplo: "Crear un Clasificador de Correos Electrónicos con IA en n8n" -->

## Lo que construirás

Al final de esta guía, tu flujo de trabajo automáticamente:
- [Acción específica 1]
- [Acción específica 2]
- [Acción específica 3]
- [Resultado final]

**Tiempo para completar**: [Estimación realista, ej., "15-20 minutos"]

**Dificultad**: [Principiante/Intermedio/Avanzado]

**Plataforma**: [n8n/Zapier/Make.com]

<!-- Incluye una captura de pantalla o diagrama del flujo de trabajo final -->
<!-- ![Diagrama del flujo de trabajo final](../../assets/workflow-final.png) -->
**[Agrega aquí una captura de pantalla de tu flujo de trabajo completado]**

## Antes de comenzar

Necesitarás:
- [ ] Cuenta de [nombre de la plataforma] ([Enlace para registrarse - menciona el nivel gratuito si está disponible])
- [ ] Cuenta de [Servicio 1] (ej., Gmail)
- [ ] Clave API de [Servicio 2] (ej., OpenAI - [enlace para obtener la clave API])
- [ ] [Herramienta o cuenta opcional]

**Estimación de costo**: [ej., "El nivel gratuito funciona bien. OpenAI cuesta ~$0.10 por 100 correos procesados"]

## Cómo funciona

**El flujo de trabajo en lenguaje sencillo**:

1. [Plataforma] verifica [evento desencadenante, ej., "nuevo correo electrónico"]
2. Envía los [datos] a [servicio de IA]
3. La IA [hace algo, ej., "clasifica el correo electrónico"]
4. Basándose en el resultado, [realiza una acción, ej., "aplica una etiqueta"]
5. Finalmente, [paso opcional, ej., "envía una notificación de Slack"]

**Por qué esto es útil**: [Beneficio del mundo real, ej., "Ahorra 2 horas por día en clasificación de correos"]

## Paso 1: Crear un nuevo flujo de trabajo

1. Inicia sesión en [nombre de la plataforma]
2. Haz clic en **"Nuevo Flujo de Trabajo"** en la esquina superior derecha
3. Dale un nombre: `[Nombre sugerido del flujo de trabajo]`

<!-- Captura de pantalla mostrando dónde hacer clic, con anotaciones numeradas -->
<!-- ![Crear nuevo flujo de trabajo](../../assets/step-1-create.png) -->
**[Agrega captura de pantalla mostrando dónde hacer clic]**

## Paso 2: Agregar el desencadenador

**Lo que estamos haciendo**: Configurar [qué desencadena el flujo de trabajo]

1. Haz clic en cualquier lugar del lienzo para agregar tu primer nodo
2. En el cuadro de búsqueda, escribe **"[Nombre del desencadenador]"** (ej., "Gmail Trigger")
3. Selecciona **"[Nombre exacto del nodo]"** de los resultados

<!-- Captura de pantalla con flechas apuntando a elementos exactos de la UI -->
<!-- ![Agregar nodo desencadenador](../../assets/step-2-trigger.png) -->
**[Agrega captura de pantalla con flechas apuntando a elementos de la UI]**

### Configurar el desencadenador

1. Haz clic en **"Iniciar sesión con [Servicio]"** para conectar tu cuenta
2. En el menú desplegable **Evento**, selecciona **"[Tipo de evento]"** (ej., "Mensaje Recibido")
3. Establece **[Nombre de la configuración]** en **"[Valor]"** (ej., "Poll Times" en "Cada 5 minutos")
4. Haz clic en **"Ejecutar Nodo"** para probar la conexión

<!-- Captura de pantalla del panel de configuración con campos importantes resaltados -->
<!-- ![Configurar desencadenador](../../assets/step-2-config.png) -->
**[Agrega captura de pantalla del panel de configuración]**

**Qué hace esto**: [Explica en lenguaje sencillo qué monitorea este desencadenador y cuándo se activa]

**Solución de problemas**:
- **¿No puedes conectar la cuenta?** Asegúrate de haber iniciado sesión en [Servicio] en otra pestaña
- **¿No aparecen datos de prueba?** Envíate un correo de prueba y haz clic en "Ejecutar Nodo" nuevamente

## Paso 3: Agregar [Siguiente Nodo]

**Lo que estamos haciendo**: [Explica el propósito de este nodo]

1. Haz clic en el botón **+** en el lado derecho de tu nodo desencadenador
2. Busca **"[Nombre del nodo]"**
3. Selecciona **"[Nombre completo del nodo]"**

<!-- Visual mostrando dónde está el botón + -->
<!-- ![Agregar siguiente nodo](../../assets/step-3-add.png) -->
**[Agrega captura de pantalla mostrando la ubicación del botón +]**

### Configurar [Nombre del Nodo]

Completa estos campos:

| Campo | Valor | Qué hace |
|-------|-------|----------|
| **[Campo 1]** | `[Valor o variable]` | [Explicación] |
| **[Campo 2]** | `[Valor]` | [Explicación] |
| **[Campo 3]** | Haz clic en "Agregar Campo" → Selecciona "[Opción]" | [Explicación] |

**Usando datos de pasos anteriores**:

Para usar el asunto del correo del Paso 2:
1. Haz clic en el cuadro **[Nombre del campo]**
2. Haz clic en el **ícono de variable** (parece una etiqueta)
3. Navega a: **[Ruta a la variable]** → **[Nombre de la variable]**
4. Selecciónala para insertar: `{{ $json.subject }}`

<!-- Captura de pantalla mostrando el selector de variables -->
<!-- ![Seleccionar variable](../../assets/step-3-variable.png) -->
**[Agrega captura de pantalla del selector de variables]**

**Configuración de ejemplo**:
```
Prompt: Classify this email into one of these categories: Urgent, Important, Marketing, or Spam.

Email subject: {{ $json.subject }}
Email body: {{ $json.body }}

Return only the category name.
```

### Probar este nodo

1. Haz clic en **"Ejecutar Nodo"**
2. Deberías ver una salida como: `"Important"`

<!-- Captura de pantalla de salida de prueba exitosa -->
<!-- ![Salida de prueba](../../assets/step-3-test.png) -->
**[Agrega captura de pantalla de salida de prueba exitosa]**

**Solución de problemas**:
- **¿Error: "Missing API key"?** Verifica que hayas agregado tu clave API en el Paso 2
- **¿Obtienes resultados extraños?** Asegúrate de que tu prompt sea claro y específico

## Paso 4: [Continuar con Pasos Adicionales]

<!-- Repite el patrón anterior para cada nodo en tu flujo de trabajo:
- Lo que estamos haciendo
- Cómo agregar el nodo
- Detalles de configuración con visuales
- Instrucciones de prueba
- Solución de problemas comunes
-->

## Paso 5: Agregar lógica de decisión (If/Else)

**Lo que estamos haciendo**: Tomar diferentes acciones basadas en la clasificación de la IA

1. Agrega un nodo **"IF"** después de tu [nodo anterior]
2. Haz clic en **"Agregar Condición"**
3. Configúralo así:
   - **Valor 1**: `{{ $json.category }}` (del nodo anterior)
   - **Operación**: `Igual`
   - **Valor 2**: `Urgent`

<!-- Diagrama mostrando la ramificación del nodo IF -->
<!-- ![Configuración del nodo IF](../../assets/step-5-if.png) -->
**[Agrega captura de pantalla de la configuración del nodo IF]**

### Rama verdadera: manejar correos urgentes

Si la condición es VERDADERA (el correo es Urgente):

1. Haz clic en la salida **"true"** y agrega un **"[Nodo de Acción]"** (ej., "Gmail")
2. Configura la acción:
   - **Operación**: "Agregar Etiqueta"
   - **Etiqueta**: "URGENTE"
   - **ID del Mensaje**: `{{ $json.messageId }}`

### Rama falsa: manejar otros correos

Si la condición es FALSA:

1. Haz clic en la salida **"false"** y agrega una **"[Acción Diferente]"**
2. Configura para procesamiento normal

<!-- Visual mostrando ambas ramas -->
<!-- ![Ramificación completa](../../assets/step-5-branches.png) -->
**[Agrega captura de pantalla mostrando ambas ramas]**

## Paso 6: Activar tu flujo de trabajo

**¡Casi listo!** Activémoslo.

1. Haz clic en el interruptor en la esquina superior derecha para **"Activo"**
2. El interruptor debería ponerse verde

<!-- Captura de pantalla mostrando el interruptor activo -->
<!-- ![Activar flujo de trabajo](../../assets/step-6-activate.png) -->
**[Agrega captura de pantalla mostrando el interruptor activo]**

**Qué sucede ahora**: [Explica cuándo se ejecuta el flujo de trabajo y qué lo desencadena]

## Probar tu flujo de trabajo

### Prueba manual

1. [Acción desencadenante, ej., "Envíate un correo de prueba"]
2. Espera [intervalo de tiempo]
3. Verifica que [resultado esperado haya ocurrido]

### Verificar historial de ejecución

1. Ve a **Ejecuciones** en la barra lateral izquierda
2. Deberías ver las ejecuciones de tu flujo de trabajo
3. Haz clic en cualquier ejecución para ver los detalles

<!-- Captura de pantalla del historial de ejecución -->
<!-- ![Historial de ejecución](../../assets/test-executions.png) -->
**[Agrega captura de pantalla del historial de ejecución]**

**Marca de verificación verde** = ¡Éxito!
**X roja** = Error (haz clic para ver detalles)

## Personalizar tu flujo de trabajo

**Ideas para mejorarlo**:

- **Agregar más categorías**: Actualiza tu prompt de IA con categorías como "Newsletter", "Solicitud de Reunión"
- **Enviar notificaciones**: Agrega un nodo de Slack o Discord para alertarte sobre correos urgentes
- **Agregar filtrado**: Usa un nodo IF al inicio para procesar solo correos de remitentes específicos
- **Programar informes**: Agrega un desencadenador Cron para enviar un resumen diario

## Solución de problemas

### El flujo de trabajo no se está ejecutando

**Verifica**:
- [ ] ¿Está activo el flujo de trabajo? (El interruptor en la parte superior derecha debería estar verde)
- [ ] ¿Está configurado correctamente el desencadenador? (Haz clic en "Ejecutar Nodo" para probar)
- [ ] Verifica el historial de ejecución para errores

### La IA devuelve resultados inesperados

**Solución**:
- Haz tu prompt más específico
- Agrega ejemplos al prompt: "Por ejemplo: 'Reunión mañana' = Urgente"
- Prueba con el botón "Ejecutar Nodo" para iterar rápidamente

### El nodo muestra un error

Soluciones comunes:
- **Errores de autenticación**: Reconecta tu cuenta en el panel de credenciales
- **Datos faltantes**: Verifica que los nodos anteriores se ejecutaron exitosamente
- **Límites de tasa**: Agrega un retraso entre nodos o reduce la frecuencia de sondeo

**¿Aún atascado?**
- Consulta el [foro de la comunidad de nombre de la plataforma] [enlace]
- Busca en su [enlace de documentación]
- [Discord/Slack de la plataforma si está disponible]

## Lo que has aprendido

- ✅ Cómo configurar un desencadenador en [plataforma]
- ✅ Cómo conectar [servicio 1] y [servicio 2]
- ✅ Cómo usar IA para [tarea]
- ✅ Cómo agregar lógica condicional con nodos IF
- ✅ Cómo probar y activar flujos de trabajo

## Descargar este flujo de trabajo

**¿Quieres saltarte la configuración?** Descarga el flujo de trabajo completo:

<!-- [Descargar workflow.json](../../assets/workflow-export.json) -->
**[Agrega enlace a tu archivo de exportación de flujo de trabajo aquí]**

**Para importar**:
1. Haz clic en **"Importar desde Archivo"** en [plataforma]
2. Selecciona el archivo descargado
3. Actualiza las credenciales con tus claves API
4. ¡Activa!

## Próximos pasos

**Construye sobre este flujo de trabajo**:
- [Idea de flujo de trabajo relacionada 1]
- [Idea de flujo de trabajo relacionada 2]

**Guías relacionadas**:
- [Enlace a guía de automatización similar]
- [Enlace a tema relacionado]

**Únete a la comunidad**:
- [Foro de la Comunidad de [Plataforma]](link)
- [Discord de [Plataforma]](link)
- [Comparte tu flujo de trabajo en la comunidad]

---

**¿Preguntas sobre esta guía?** [Abre una discusión](https://github.com/javirub/The-New-Era-Codex/discussions)

**¿Encontraste un problema?** [Repórtalo aquí](https://github.com/javirub/The-New-Era-Codex/issues)
