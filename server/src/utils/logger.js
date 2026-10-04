const SENSITIVE_PATTERNS = [
  /api[-_]?key/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /password/i
];

function sanitize(message) {
  if (typeof message !== 'string') {
    try {
      message = JSON.stringify(message);
    } catch {
      message = String(message);
    }
  }

  // Mask sensitive values
  let sanitized = message;
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(
      new RegExp(`("${pattern.source}"\\s*:\\s*")([^"]+)(")`, 'gi'),
      '$1[REDACTED]$3'
    );
  });
  return sanitized;
}

function formatLog(level, message, meta = '') {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
  return `[${timestamp}] [${level}] ${sanitize(message)}${sanitize(metaString)}`;
}

export const logger = {
  info: (msg, meta) => console.log('\x1b[36m%s\x1b[0m', formatLog('INFO', msg, meta)),
  warn: (msg, meta) => console.warn('\x1b[33m%s\x1b[0m', formatLog('WARN', msg, meta)),
  error: (msg, meta) => console.error('\x1b[31m%s\x1b[0m', formatLog('ERROR', msg, meta)),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('\x1b[90m%s\x1b[0m', formatLog('DEBUG', msg, meta));
    }
  }
};
