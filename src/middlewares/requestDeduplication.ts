import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface RequestCache {
  hash: string;
  timestamp: number;
  response?: any;
}

const requestCache = new Map<string, RequestCache>();
const CACHE_DURATION = 1000; // 1 second deduplication window

// Clean old cache entries every 5 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 2) {
      requestCache.delete(key);
    }
  }
}, 5000);

export const deduplicateRequests = (req: Request, res: Response, next: NextFunction) => {
  // Only deduplicate GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Create a unique hash for this request
  const requestHash = crypto
    .createHash('md5')
    .update(`${req.method}:${req.originalUrl}:${JSON.stringify(req.headers.authorization || '')}`)
    .digest('hex');

  const cached = requestCache.get(requestHash);
  const now = Date.now();

  // If we have a recent identical request, return the cached response
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`Duplicate request detected for ${req.originalUrl}, returning cached response`);
    
    if (cached.response) {
      return res.status(200).json(cached.response);
    }
    
    // If no response yet, it's still processing - return 429
    return res.status(429).json({
      message: 'Duplicate request detected, please wait',
      retryAfter: 1
    });
  }

  // Store this request in cache
  requestCache.set(requestHash, {
    hash: requestHash,
    timestamp: now
  });

  // Intercept the response to cache it
  const originalSend = res.send;
  res.send = function(data: any) {
    // Cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const cached = requestCache.get(requestHash);
      if (cached) {
        cached.response = typeof data === 'string' ? JSON.parse(data) : data;
        requestCache.set(requestHash, cached);
      }
    }
    
    return originalSend.call(this, data);
  };

  next();
};
