'use strict';

const config        = require('../../config');
const database      = require('../database/connection')

let errors = [];

class Validation {
  constructor() {
    errors = [];
  }
  isRequired(value, message, tokenTranslate) {
    if (!value || value.length <= 0) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  inArray(value, array, message, tokenTranslate) {
    if (array.indexOf(value) === -1) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  isArray(value, message, tokenTranslate) {
    if (!Array.isArray(value)) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  hasMinLen(value, min, message, tokenTranslate) {
    if (!value || value.length < min) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  hasMaxLen(value, max, message, tokenTranslate) {
    if (!value || value.length > max) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  equals(value1, value2, message, tokenTranslate) {
    if (value1 !== value2) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  notEquals(value1, value2, message, tokenTranslate) {
    if (value1 === value2) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  // IsFixedLenght
  IsFixedLenght(value, len, message, tokenTranslate) {
    if (value.length !== len) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  // IsEmail
  isEmail(value, message, tokenTranslate) {
    const reg = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (!reg.test(value)) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }
  permitedLang(value, message, tokenTranslate) {
    if (config.permited_lang.indexOf(value) === -1) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    }
  }

  pushMessage(message, tokenTranslate) {
    errors.push({
      message: message,
      token_translate: tokenTranslate
    });
  }

  async emailExists(email, message, tokenTranslate) {
    try {
      const rows = await database('users').whereRaw('email = "' + email + '"');
      if (rows.length > 0){
          errors.push({
            message: message,
            token_translate: tokenTranslate
          });
        }
    } catch (error) {
      errors.push({
        message: "Erro verificando e-mail na base de dados",
        token_translate: tokenTranslate
      });
    }
  }

  clear() {
    errors = [];
  }
  isValid() {
    return errors.length === 0;
  }
  
  errors() {
    return errors;
  }

  firstError() {
    return errors[0];
  }

  isRequiredArray(value, message, tokenTranslate) {
    if (!Array.isArray(value) || value.length === 0) {
      errors.push({
        message: message,
        token_translate: tokenTranslate
      });
    } else {
      value.forEach(element => {
        if (element === '') {
          errors.push({
            message: message,
            token_translate: tokenTranslate
          });
        }
      });
    }
  }
}


module.exports = Validation;