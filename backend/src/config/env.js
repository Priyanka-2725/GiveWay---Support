require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || undefined });

const env = {
  databaseUrl: process.env.DATABASE_URL,
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:9002',
  jwtSecret: process.env.JWT_SECRET || 'replace-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtCookieName: process.env.JWT_COOKIE_NAME || 'giveway_access_token',
  superadminEmail: (process.env.SUPERADMIN_EMAIL || 'priyankasingh15102004@gmail.com').toLowerCase(),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'GiveWay <no-reply@giveway.local>',
  },
};

module.exports = { env };
