import { readFileSync } from 'fs';
import { join } from 'path';

const knowledgePath = join(process.cwd(), 'knowledge.json');
const knowledge = JSON.parse(readFileSync(knowledgePath, 'utf-8'));

const knowledgeText = `
КОМПАНИЯ: ${knowledge.company}
${knowledge.description}
${knowledge.about}

СТАТИСТИКА: ${knowledge.stats.projects} проектов, ${knowledge.stats.years}, поддержка ${knowledge.stats.support}

УСЛУГИ:
${knowledge.services.map((s, i) => `${i + 1}. ${s.name} (${s.name_en}): ${s.description} Технологии: ${s.technologies.join(', ')}${s.details ? '. ' + s.details : ''}`).join('\n')}

ТАРИФЫ:
${knowledge.pricing.map(p => `• ${p.plan} (${p.plan_en}) — ${p.price}: ${p.description}. Включает: ${p.includes.join(', ')}`).join('\n')}

FAQ:
${knowledge.faq.map(f => `В: ${f.q}\nО: ${f.a}`).join('\n\n')}

КОНТАКТЫ:
Telegram: ${knowledge.contact.telegram}
Email: ${knowledge.contact.email}
`.trim();

const SYSTEM_PROMPT = `Ты AI-ассистент компании svns.io. Твоя задача — помогать посетителям сайта.

ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе информации ниже. Не выдумывай цены, услуги или факты.
2. Если информации нет — честно скажи и предложи связаться через Telegram: https://t.me/svns_io
3. Отвечай кратко, по делу, дружелюбно. 2-4 предложения максимум.
4. Определяй язык вопроса и отвечай на нём (русский или английский).
5. Если посетитель хочет связаться с командой или обсудить проект — направляй в Telegram: https://t.me/svns_io
6. Не используй markdown-разметку в ответах, пиши простым текстом.

ДАННЫЕ О КОМПАНИИ:
${knowledgeText}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        messages: [{ role: 'user', content: message.trim() }],
        max_tokens: 1024,
        temperature: 0.6,
        system: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('MiniMax API error:', response.status, errText);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    return res.status(200).json({ response: text });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
