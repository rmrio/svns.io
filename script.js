(() => {
  'use strict';

  // --- Language System ---
  const LANG_KEY = 'svns-lang';
  let currentLang = localStorage.getItem(LANG_KEY) || 'ru';

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    document.querySelectorAll('[data-ru][data-en]').forEach(el => {
      el.textContent = el.dataset[lang];
    });

    document.querySelectorAll('[data-placeholder-ru][data-placeholder-en]').forEach(el => {
      el.placeholder = el.dataset[`placeholder${lang === 'ru' ? 'Ru' : 'En'}`];
    });

    document.querySelectorAll('.lang-toggle__option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.value === lang);
    });

    document.title = lang === 'ru'
      ? 'svns.io — AI для вашего бизнеса'
      : 'svns.io — AI for your business';
  }

  // --- Header Scroll ---
  const header = document.getElementById('header');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    lastScroll = y;
  }

  // --- Active Nav Link ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    let currentSection = '';

    sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
    });
  }

  // --- Reveal on Scroll ---
  function initReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // --- Mobile Menu ---
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  function toggleMobileMenu() {
    const isOpen = burger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // --- FAQ Smooth Toggle ---
  document.querySelectorAll('.faq__item').forEach(item => {
    const summary = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      if (item.open) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        requestAnimationFrame(() => {
          answer.style.maxHeight = '0';
          answer.style.opacity = '0';
        });
        answer.addEventListener('transitionend', function handler() {
          item.open = false;
          answer.style.maxHeight = '';
          answer.style.opacity = '';
          answer.removeEventListener('transitionend', handler);
        }, { once: true });
      } else {
        item.open = true;
        const h = answer.scrollHeight;
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        requestAnimationFrame(() => {
          answer.style.transition = 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease';
          answer.style.maxHeight = h + 'px';
          answer.style.opacity = '1';
        });
        answer.addEventListener('transitionend', function handler() {
          answer.style.maxHeight = '';
          answer.style.transition = '';
          answer.removeEventListener('transitionend', handler);
        }, { once: true });
      }
    });
  });

  // --- Contact Form ---
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      status.textContent = currentLang === 'ru'
        ? 'Пожалуйста, заполните все поля.'
        : 'Please fill in all fields.';
      status.className = 'form__status form__status--error';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = currentLang === 'ru'
        ? 'Проверьте email-адрес.'
        : 'Please check your email address.';
      status.className = 'form__status form__status--error';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.style.opacity = '0.6';

    setTimeout(() => {
      status.textContent = currentLang === 'ru'
        ? 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.'
        : 'Request sent! We will contact you shortly.';
      status.className = 'form__status form__status--success';
      form.reset();
      btn.disabled = false;
      btn.style.opacity = '';
    }, 800);
  });

  // --- Smooth Scroll for Anchors ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      closeMobileMenu();

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', targetId);
    });
  });

  // --- Init ---
  function init() {
    setLanguage(currentLang);

    burger.addEventListener('click', toggleMobileMenu);

    document.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.getElementById('langToggle').addEventListener('click', (e) => {
      const option = e.target.closest('.lang-toggle__option');
      if (!option) {
        setLanguage(currentLang === 'ru' ? 'en' : 'ru');
        return;
      }
      const lang = option.dataset.value;
      if (lang && lang !== currentLang) {
        setLanguage(lang);
      }
    });

    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        onScroll();
        updateActiveNav();
      });
    }, { passive: true });

    onScroll();
    updateActiveNav();
    initReveal();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        closeChatWidget();
      }
    });

    initChatWidget();
  }

  // --- Chat Widget ---
  const chatWidget = document.getElementById('chatWidget');
  const chatToggle = document.getElementById('chatToggle');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  let chatOpen = false;
  let chatInitialized = false;

  const WELCOME_MSG = {
    ru: 'Здравствуйте! Я AI-ассистент svns.io. Могу рассказать об услугах, ценах и помочь с выбором. О чём хотите спросить?',
    en: 'Hello! I\'m the svns.io AI assistant. I can tell you about our services, pricing, and help you choose. What would you like to know?'
  };

  function openChatWidget() {
    chatOpen = true;
    chatWidget.classList.add('open');
    if (!chatInitialized) {
      addChatMessage(WELCOME_MSG[currentLang] || WELCOME_MSG.ru, 'assistant');
      chatInitialized = true;
    }
    setTimeout(() => chatInput.focus(), 350);
  }

  function closeChatWidget() {
    chatOpen = false;
    chatWidget.classList.remove('open');
  }

  function toggleChatWidget() {
    chatOpen ? closeChatWidget() : openChatWidget();
  }

  function addChatMessage(text, role) {
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${role}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-typing';
    div.id = 'chatTyping';
    div.innerHTML = '<span class="chat-typing__dot"></span><span class="chat-typing__dot"></span><span class="chat-typing__dot"></span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('chatTyping');
    if (el) el.remove();
  }

  async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addChatMessage(text, 'user');
    chatInput.value = '';
    chatSend.disabled = true;
    showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      removeTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }

      const data = await res.json();
      addChatMessage(data.response, 'assistant');
    } catch (err) {
      removeTyping();
      const errorText = currentLang === 'ru'
        ? 'Произошла ошибка. Попробуйте позже или напишите в Telegram: @svns_io'
        : 'An error occurred. Try again later or message us on Telegram: @svns_io';
      addChatMessage(errorText, 'error');
    }

    chatSend.disabled = !chatInput.value.trim();
    chatInput.focus();
  }

  function initChatWidget() {
    chatToggle.addEventListener('click', toggleChatWidget);
    chatClose.addEventListener('click', closeChatWidget);

    chatInput.addEventListener('input', () => {
      chatSend.disabled = !chatInput.value.trim();
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !chatSend.disabled) sendChatMessage();
    });

    chatSend.addEventListener('click', sendChatMessage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
