const Anthropic = require('@anthropic-ai/sdk');

const VERIFY_TOKEN   = process.env.WHATSAPP_VERIFY_TOKEN;
const WA_TOKEN       = process.env.WHATSAPP_TOKEN;
const PHONE_ID       = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;

const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

// In-memory conversation history (per sender phone number)
// Resets on cold start — acceptable for low-volume lead qualification
const conversations = new Map();
const MAX_HISTORY = 12; // messages kept per conversation

const SYSTEM_PROMPT = `Sos el asistente virtual de Clásicos Garage, una empresa de alquiler de autos clásicos de lujo en Buenos Aires.

## Tu rol
Atendés consultas de personas interesadas en alquilar un auto clásico. Tu objetivo es calificar el lead: entender qué necesitan, para cuándo y con qué auto, y dejarlos con ganas de cerrar la reserva.

## La flota
- **Mercedes-Benz W111** — descapotable azul marino, el más romántico y elegante. Ideal para casamientos y sesiones editoriales.
- **Mercedes-Benz W126** — sedán ejecutivo negro. Para traslados, activaciones de marca y eventos corporativos.
- **Jaguar XJ6 Serie 2** — sedán clásico británico color crema. Muy versátil, ideal para casamientos, escapadas y producciones.
- **SS1** — deportivo inglés de los años 30. El más atrevido. Para sesiones editoriales y quienes buscan algo único.

## Servicios
- **Casamientos**: el auto llega al evento, se queda para fotos, traslado de novios.
- **Escapadas**: alquiler por el día o fin de semana para recorridos y rutas.
- **Sesiones editoriales y producciones**: alquiler por horas para shooting de fotos/video.
- **Activaciones de marca**: presencia del auto en eventos corporativos.
- **Traslados ejecutivos**: traslados puntuales con el W126.

## Cómo calificar un lead
Preguntá (de a una, sin bombardear):
1. Tipo de evento o uso que tiene en mente
2. Fecha aproximada
3. Auto de preferencia (o ayudalo a elegir según el uso)
4. Cómo le llegó la info (no siempre, solo si surge natural)

Una vez que tenés esos datos, decile que vas a confirmar disponibilidad y que te vas a comunicar con él/ella para darle los detalles de precio y reserva.

## Tono
- Cálido, cercano, profesional. No demasiado formal.
- Usá español rioplatense (vos, che, bárbaro).
- Respuestas cortas. WhatsApp no es un email.
- Si alguien pregunta precio, decí que depende de la fecha y el servicio, y que lo confirmás enseguida.
- Nunca inventes precios ni disponibilidad.

## Límites
- Si la consulta no tiene nada que ver con autos o el servicio, redirigí amablemente al tema.
- Si alguien pide hablar con una persona real, decí: "¡Claro! Anotá el pedido y te llamo/escribo en breve."`;

async function sendWhatsAppMessage(to, text) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WA_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WA send error:', err);
  }
}

module.exports = async (req, res) => {
  // ── Webhook verification (GET) ──────────────────────────────────────────────
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  // ── Incoming message (POST) ─────────────────────────────────────────────────
  if (req.method === 'POST') {
    // Always return 200 immediately so Meta doesn't retry
    res.status(200).json({ status: 'ok' });

    try {
      const entry   = req.body?.entry?.[0];
      const change  = entry?.changes?.[0];
      const value   = change?.value;
      const message = value?.messages?.[0];

      // Ignore non-text messages and status updates
      if (!message || message.type !== 'text') return;

      const from = message.from;
      const text = message.text.body.trim();

      console.log(`Message from ${from}: ${text}`);

      // Build history
      if (!conversations.has(from)) conversations.set(from, []);
      const history = conversations.get(from);
      history.push({ role: 'user', content: text });
      if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

      // Call Claude
      const response = await client.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system:     SYSTEM_PROMPT,
        messages:   history,
      });

      const reply = response.content[0].text;
      history.push({ role: 'assistant', content: reply });

      await sendWhatsAppMessage(from, reply);
      console.log(`Reply to ${from}: ${reply}`);

    } catch (err) {
      console.error('Webhook error:', err);
    }
  }
};
