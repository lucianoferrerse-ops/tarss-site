addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/ai')) {
    return handleAiRequest(request);
  }

  // Proxy all other requests to the Pages site origin.
  const ORIGIN = 'https://tarss-site.pages.dev';
  const originUrl = ORIGIN + url.pathname + url.search;

  const resp = await fetch(originUrl, request);
  const headers = new Headers(resp.headers);
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  headers.set('Permissions-Policy', 'geolocation=()');

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers
  });
}

async function handleAiRequest(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (!messages.length) {
    return new Response(JSON.stringify({ error: 'Faltan mensajes para procesar' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Clave de OpenAI no configurada' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const model = OPENAI_MODEL || 'gpt-4.1';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.45,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.2,
        max_tokens: 900,
        messages
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Error de OpenAI' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const assistantText = data.choices?.[0]?.message?.content?.trim() || 'No hay respuesta disponible.';
    return new Response(JSON.stringify({ reply: assistantText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error interno al conectar con OpenAI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
