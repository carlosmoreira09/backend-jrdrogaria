import rateLimit from 'express-rate-limit';

export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP a cada 15 minutos
  message: {
    message: 'Muitas requisições. Tente novamente em 15 minutos.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requisições por IP por minuto
  message: {
    message: 'Limite de requisições excedido. Aguarde um momento.',
    retryAfter: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const submitRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 submissões por hora por IP
  message: {
    message: 'Limite de envios excedido. Tente novamente mais tarde.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
