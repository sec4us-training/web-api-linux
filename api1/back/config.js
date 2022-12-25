require("dotenv-safe").config({
  allowEmptyValues: true
})

global.SALT_KEY = process.env.SALT_KEY

module.exports = {
  port: process.env.PORT || 4000,
  secret: process.env.SECRET,
  production: process.env.production,
  basePath: (process.env.PATH_BASE + "/").replace("//", "/"),
  tmplStore: './src/templates/',
  email_from: process.env.SMTP_MAILFROM,
  email_config: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secureConnection: process.env.SMTP_SECURE,
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  database: {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE
  }
};
