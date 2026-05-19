# WhatsApp + Claude — Setup

## Variables de entorno en Vercel

Ir a **Vercel → proyecto → Settings → Environment Variables** y agregar:

| Variable | Valor |
|----------|-------|
| `WHATSAPP_TOKEN` | Token del sistema (el mismo de `INSTAGRAM/config.env`) |
| `WHATSAPP_PHONE_NUMBER_ID` | `1003123379561844` |
| `WHATSAPP_VERIFY_TOKEN` | Elegir una cadena propia, ej: `cg_webhook_2026` |
| `ANTHROPIC_API_KEY` | API key de console.anthropic.com |

---

## Registrar el webhook en Meta

1. Ir a **Meta for Developers → tu app → WhatsApp → Configuración**
2. En "Webhooks" → **Editar**:
   - URL: `https://clasicosgarage.com/api/webhook`
   - Token de verificación: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`
3. Hacer click en **Verificar y guardar**
4. Suscribirse al campo: **`messages`**

---

## Flujo una vez configurado

```
Usuario escribe en WA
  → Meta manda POST a clasicosgarage.com/api/webhook
  → webhook extrae el mensaje
  → llama a Claude (claude-haiku) con el historial de la conversación
  → Claude responde
  → webhook envía la respuesta por WA al usuario
```

## Modelo usado
`claude-haiku-4-5` — rápido y económico, ideal para atención al cliente.
Cambiarlo a `claude-sonnet-4-6` en `webhook.js` si se quiere más calidad de respuesta.
