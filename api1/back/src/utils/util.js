'use strict';

const hbs           = require('handlebars');
const nodemailer    = require('nodemailer')
const fs            = require('fs');
const config        = require('../../config');
const database      = require('../database/connection')

exports.encrypt = async (data) => {
  let aux = Buffer.from(data, 'ascii').toString('base64');
  aux = aux.replace(/A/g, '.');
  aux = aux.replace(/a/g, '|');
  aux = aux.replace(/=/g, 'sec4us_');
  aux = aux.split('').reverse().join('');
  return aux;
}

exports.decrypt = async (data) => {
  let aux = data.split('').reverse().join('');
  aux = aux.replace(/sec4us_/g, '=');
  aux = aux.replace(/\|/g, 'a');
  aux = aux.replace(/\./g, 'A');
  aux = Buffer.from(aux, 'base64').toString('ascii');
  return aux;
}

exports.sendTemplateMail = async (email, subject, tmpl_src, tmpl_replace, lang) => {
  return new Promise((resolve, reject) => {
    fs.readFile(config.tmplStore + tmpl_src, 'utf-8', (err, data) => {
      try {
        if (err) throw err;
        // eslint-disable-next-line arrow-body-style
        hbs.registerHelper('if_eq', (a, b, opts) => {
          return a === b ? opts.fn(this) : opts.inverse(this);
        });

        const transporter = nodemailer.createTransport(config.email_config);
        const tmpl = hbs.compile(data);
        const html = tmpl(tmpl_replace);

        const mailOptions = {
          from: config.email_from,
          to: email,
          subject: subject,
          html: html,
          textEncoding: 'base64',
          dsn: {
            id: new Date(),
            return: 'headers',
            notify: ['failure', 'delay'],
            recipient: config.email_from
          }
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject({
              error: {
                message: 'Ocorreu um erro durante o envio do email'
              }
            });
          }

          resolve(info);
        });
      } catch (ex) {
        reject({
          error: {
            message: 'Erro na leitura do template de email'
          }
        });
      }
    });
  });
}
