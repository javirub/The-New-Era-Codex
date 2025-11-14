---
title: "Despliegue en Edge: Ejecutando LLMs en Dispositivos Móviles e IoT"
description: "Despliega LLMs optimizados en dispositivos edge con recursos limitados"
sidebar:
  badge:
    text: "Avanzado"
    variant: danger
version: "1.0"
---

# Despliegue de LLMs en Edge

## Selección de Modelos para Edge

**Modelos adecuados**:
- Phi-2 (2.7B parámetros)
- Llama 2 7B (cuantizado)
- TinyLlama (1.1B)
- MobileLLM

## Cuantización para Móviles

```python
import torch
from transformers import AutoModelForCausalLM

# Cargar modelo
model = AutoModelForCausalLM.from_pretrained("microsoft/phi-2")

# Cuantizar a INT8
model_int8 = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8
)

# Guardar para móvil
torch.save(model_int8.state_dict(), "model_mobile.pt")
```

## Integración Android

```kotlin
// Usando ONNX Runtime
class LLMInference {
    private lateinit var session: OrtSession

    fun initialize(modelPath: String) {
        val env = OrtEnvironment.getEnvironment()
        session = env.createSession(modelPath)
    }

    fun generate(prompt: String): String {
        val inputTensor = createInputTensor(prompt)
        val outputs = session.run(mapOf("input_ids" to inputTensor))
        return decodeOutput(outputs)
    }
}
```

## Integración iOS

```swift
import CoreML

class LLMModel {
    var model: MLModel?

    func loadModel() {
        guard let modelURL = Bundle.main.url(forResource: "model", withExtension: "mlmodel") else {
            return
        }
        model = try? MLModel(contentsOf: modelURL)
    }

    func predict(prompt: String) -> String? {
        // Código de inferencia
    }
}
```

## Estrategias de Optimización

1. **Pruning**: Eliminar 30-50% de los pesos
2. **Cuantización**: INT8 o INT4
3. **Destilación**: Modelo estudiante más pequeño
4. **Caché**: Cachear salidas frecuentes
5. **Batching**: Procesar múltiples entradas juntas

---

**¿Encontraste un problema?** [Abre un issue](https://github.com/javirub/The-New-Era-Codex/issues)!
