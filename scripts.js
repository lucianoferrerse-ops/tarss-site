document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const navToggle = document.querySelector('.nav-toggle');
const navBar = navToggle?.closest('.topbar');
const navLinks = document.querySelectorAll('.nav-links a');

if (navToggle) {
  navToggle.setAttribute('aria-expanded', 'false');

  navToggle.addEventListener('click', () => {
    const isOpen = navBar?.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(!!isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (navBar?.classList.contains('nav-open')) {
      navBar.classList.remove('nav-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

const revealTargets = document.querySelectorAll('section, .card, .case-card, .cta-box, .hero h1, .hero-text, .hero-actions, label');
revealTargets.forEach((el) => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('reveal-active'));
}

const topbar = document.querySelector('.topbar');
const topbarScrollThreshold = 28;
const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

if (topbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > topbarScrollThreshold) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  });
}

if (contactForm && contactStatus) {
  const submitButton = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton) submitButton.disabled = true;
    contactStatus.textContent = 'Enviando mensaje...';

    const formData = new FormData(contactForm);
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        contactStatus.textContent = 'Gracias. Tu mensaje fue enviado correctamente. Te redirijo a la página de confirmación...';
        contactForm.reset();
        setTimeout(() => {
          window.location.href = 'https://tarss-site.pages.dev/gracias';
        }, 1200);
      } else {
        const data = await response.json();
        contactStatus.textContent = data?.error || 'Hubo un problema. Intenta de nuevo.';
        if (submitButton) submitButton.disabled = false;
      }
    } catch (error) {
      contactStatus.textContent = 'Error al enviar. Verifica tu conexión o intenta más tarde.';
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const assistantToggle = document.querySelector('#assistant-toggle');
const assistantPanel = document.querySelector('#assistant-panel');
const assistantClose = document.querySelector('#assistant-close');
const assistantMessages = document.querySelector('#assistant-messages');
const assistantForm = document.querySelector('#assistant-form');
const assistantInput = document.querySelector('#assistant-input');
const assistantProposalButton = document.querySelector('#assistant-proposal');
const assistantWhatsAppButton = document.querySelector('#assistant-whatsapp');
const assistantSuggestions = document.querySelectorAll('.assistant-suggestions button');

const assistantSystemMessage = {
  role: 'system',
  content: 'Eres el asistente de Tarss, un consultor digital experto en sitios web, tiendas online y marketing para emprendedores. Tu objetivo es: 1) entender rápido el negocio, público, objetivo y presupuesto; 2) proponer una solución clara con servicio, plazos y costo estimado; 3) ofrecer siguientes pasos simples como enviar propuesta por email o WhatsApp. Si te preguntan por precios, da rangos aproximados y explica qué incluye cada paquete. Si el usuario necesita un mensaje para WhatsApp, redacta un texto breve, amigable y orientado a concertar una llamada o respuesta. Responde siempre en español, con lenguaje directo, breve y profesional, enfocado en convertir la consulta en un cliente satisfecho.'
};

const conversation = [assistantSystemMessage];

function appendAssistantMessage(text, sender) {
  if (!assistantMessages) return;
  const message = document.createElement('div');
  message.className = `assistant-message ${sender}`;

  const textElement = document.createElement('div');
  textElement.className = 'assistant-text';
  textElement.textContent = text;
  message.appendChild(textElement);

  if (sender === 'bot') {
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'assistant-copy';
    copyButton.textContent = 'Copiar';
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyButton.textContent = 'Copiado';
        setTimeout(() => {
          copyButton.textContent = 'Copiar';
        }, 1500);
      } catch (error) {
        copyButton.textContent = 'Error';
        setTimeout(() => {
          copyButton.textContent = 'Copiar';
        }, 1500);
      }
    });
    message.appendChild(copyButton);
  }

  assistantMessages.appendChild(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function appendTypingIndicator() {
  appendAssistantMessage('Escribiendo...', 'bot');
}

function updateLastTypingIndicator(text) {
  if (!assistantMessages) return;
  const messages = assistantMessages.querySelectorAll('.assistant-message.bot');
  const last = messages[messages.length - 1];
  if (last && last.textContent === 'Escribiendo...') {
    last.textContent = text;
  }
}

function openAssistant() {
  if (!assistantPanel || !assistantToggle) return;
  assistantPanel.hidden = false;
  assistantToggle.setAttribute('aria-expanded', 'true');
  assistantInput?.focus();
  if (assistantMessages && assistantMessages.children.length === 0) {
    appendAssistantMessage('Hola, soy el asistente de Tarss. ¿En qué te puedo ayudar hoy?', 'bot');
  }
}

function closeAssistant() {
  if (!assistantPanel || !assistantToggle) return;
  assistantPanel.hidden = true;
  assistantToggle.setAttribute('aria-expanded', 'false');
}

async function sendAssistantQuery(query) {
  if (!assistantInput || !assistantMessages) return;
  const userMessage = { role: 'user', content: query };
  conversation.push(userMessage);
  appendAssistantMessage(query, 'user');
  assistantInput.value = '';
  appendTypingIndicator();

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation })
    });

    const data = await response.json();
    if (!response.ok) {
      updateLastTypingIndicator('Lo siento, no pude responder ahora. Intenta de nuevo más tarde.');
      return;
    }

    const answer = data.reply || 'No tengo una respuesta clara. Intentá de nuevo con otra pregunta.';
    conversation.push({ role: 'assistant', content: answer });
    updateLastTypingIndicator(answer);
  } catch (error) {
    updateLastTypingIndicator('Error al conectar con el asistente. Revisa tu conexión.');
  }
}

assistantToggle?.addEventListener('click', () => {
  if (assistantPanel?.hidden) {
    openAssistant();
  } else {
    closeAssistant();
  }
});

assistantClose?.addEventListener('click', () => {
  closeAssistant();
});

assistantForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = assistantInput?.value?.trim();
  if (!query) return;
  sendAssistantQuery(query);
});

assistantProposalButton?.addEventListener('click', () => {
  sendAssistantQuery('Genera una propuesta completa de sitio web para un emprendimiento. Incluye objetivos, estructura del sitio, servicios recomendados, plazos, opciones de precio y próximos pasos para contratar. Mantén el texto claro y profesional.');
});

assistantWhatsAppButton?.addEventListener('click', () => {
  sendAssistantQuery('Escribe un mensaje breve y persuasivo para enviar por WhatsApp a un cliente potencial que consultó por una página web. Debe ser amable, directo y proponer una llamada o respuesta rápida.');
});

assistantSuggestions.forEach((button) => {
  button.addEventListener('click', () => {
    const suggestion = button.getAttribute('data-suggestion');
    if (!suggestion) return;
    sendAssistantQuery(suggestion);
  });
});
