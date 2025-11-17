---
title: "Edge Deployment: Running LLMs on Mobile & IoT Devices"
description: "Deploy optimized LLMs on resource-constrained edge devices"
sidebar:
  order: 82
  badge:
    text: "Deployment"
    variant: danger
version: "1.1"
---

# Edge Deployment of LLMs

## Model Selection for Edge

**Suitable models**:
- Phi-2 (2.7B parameters)
- Llama 2 7B (quantized)
- TinyLlama (1.1B)
- MobileLLM

## Quantization for Mobile

```python
import torch
from transformers import AutoModelForCausalLM

# Load model
model = AutoModelForCausalLM.from_pretrained("microsoft/phi-2")

# Quantize to INT8
model_int8 = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8
)

# Save for mobile
torch.save(model_int8.state_dict(), "model_mobile.pt")
```

## Android Integration

```kotlin
// Using ONNX Runtime
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

## iOS Integration

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
        // Inference code
    }
}
```

## Optimization Strategies

1. **Pruning**: Remove 30-50% of weights
2. **Quantization**: INT8 or INT4
3. **Distillation**: Smaller student model
4. **Caching**: Cache frequent outputs
5. **Batching**: Process multiple inputs together

---

**Found an issue?** [Open an issue](https://github.com/javirub/The-New-Era-Codex/issues)!
