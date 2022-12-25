'use strict'

const config        = require('../../config');
const jwt           = require('jsonwebtoken')


exports.verifyJWT = async (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({ auth: false, message: 'Token inválido.' });
  
  var parts = token.split('.');

  if (parts.length !== 3){
    return res.status(500).json({ auth: false, message: 'Token inválido.', error:'jwt malformed' });
  }

  let tokenHeader = Buffer.from(parts[0], 'base64').toString('ascii');
  var oTokenHeader = null
  if(typeof tokenHeader === 'string') {
    try {
      var obj = JSON.parse(tokenHeader);
      if(obj !== null && typeof obj === 'object') {
        oTokenHeader = obj;
      }
    } catch (e) { }
  }

  if (oTokenHeader != null && oTokenHeader.alg == "none"){
      jwt.verify(token, null, { algorithms: ['none'] }, function(err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Token inválido.', error: err });
        
        req.userId = decoded.id;
        req.role = decoded.role;

        next();
      });
  }else{
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Token inválido.', error: err });
        
        req.userId = decoded.id;
        req.role = decoded.role;

        next();
      });
  }
}


/**
 * @api {get} /jwtinfo Exibe as informações do token JWT
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName jwtinfo
 * @apiGroup API
 *
 * @apiDescription Resgata informações gerais da API.
 *
 * @apiHeader {String} x-access-token Token JWT gerado pela requisição ```/users/authenticate```.
 *
 * @apiDescription Atualiza os dados do usuário
 * @apiHeaderExample {json} Cabeçalho de autenticação:
 *     {
 *       "x-access-token": "Token JWT"
 *     }
 *
 * @apiExample Exemplo de utilização:
 * curl -i https://api1.webapiexploitation.com.br/api/v1/jwtinfo
 *
 *
 * @apiSuccessExample {json} Sucess 200 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *       "jwt": {
 *         "received_toke": "Received Token",
 *         "header": {
 *           "encoded": "Base64 encoded token header",
 *           "string_decoded": "Base64 string decoded token header",
 *           "object_decoded": {
 *             "alg": "HS256",
 *             "typ": "JWT"
 *           }
 *         },
 *         "payload": {
 *           "encoded": "Base64 encoded token payload",
 *           "string_decoded": "Base64 string decoded token payload",
 *           "object_decoded": {
 *             "id": "143fba53-8e79-41b6-a88a-ec6ce487b255",
 *             "email": "user@webapiexploitation.com.br",
 *             "name": "Helvio Junior",
 *             "role": "admin",
 *             "iat": 1615417446,
 *             "exp": 1616417445
 *           }
 *         },
 *         "sign": "base64 sign",
 *         "validation": {
 *           "message": "Token validado com sucesso"
 *         }
 *       }
 *     }
 */
exports.jwtInfo = async (request, response) => {

  try {
    const retData = {}
    const token = request.headers['x-access-token'];
    if (!token) return response.status(401).json({ auth: false, message: 'Token inválido.' });
    
    var parts = token.split('.');

    if (parts.length !== 3){
      return response.status(500).json({ auth: false, message: 'Token inválido.', error:'jwt malformed' });
    }

    var tokenHeaderB64 = parts[0];
    var tokenHeader = Buffer.from(tokenHeaderB64, 'base64').toString('ascii');
    var oTokenHeader = null
    if(typeof tokenHeader === 'string') {
      try {
        var oTokenHeader = JSON.parse(tokenHeader);
      } catch (e) {
        return response.status(500).json({ auth: false, message: 'Não foi possível converter o header em um objeto JSON.', error:'jwt malformed' });
      }
    }

    var tokenPayloadB64 = parts[1];
    var tokenPayload = Buffer.from(tokenPayloadB64, 'base64').toString('ascii');
    var oTokenPayload = null
    if(typeof tokenPayload === 'string') {
      try {
        var oTokenPayload = JSON.parse(tokenPayload);
      } catch (e) {
        return response.status(500).json({ auth: false, message: 'Não foi possível converter o payload em um objeto JSON.', error:'jwt malformed' });
      }
    }

    retData.jwt = {};
    retData.jwt = {
      received_toke: token,
      header: {
        encoded: tokenHeaderB64,
        string_decoded: tokenHeader,
        object_decoded: oTokenHeader
      },
      payload: {
        encoded: tokenPayloadB64,
        string_decoded: tokenPayload,
        object_decoded: oTokenPayload
      },
      sign: parts[2]
    };

    if (oTokenHeader != null && oTokenHeader.alg == "none"){
        jwt.verify(token, null, { algorithms: ['none'] }, function(err, decoded) {
          if (err) {
            retData.jwt.validation = {
              message: "Token inválido",
              error: err
            }
          }else{
            retData.jwt.validation = {
              message: "Token validado com sucesso"
            }
          }
        });
    }else{
      jwt.verify(token, config.secret, function(err, decoded) {
          if (err) {
            retData.jwt.validation = {
              message: "Token inválido",
              error: err
            }
          }else{
            retData.jwt.validation = {
              message: "Token validado com sucesso"
            }
          }
        });
    }

    response.status(200).send(retData);

  } catch (error) {
    response.status(500).send({
      message: error.message,
    });
  }
}

/**
 * @api {get} / Resgata informações gerais da API
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName Root
 * @apiGroup API
 *
 * @apiDescription Resgata informações gerais da API.
 *
 *
 * @apiExample Exemplo de utilização:
 * curl -i https://api1.webapiexploitation.com.br/api/v1/
 *
 * @apiSuccess {String}   treinamento   Nome do Treinamento.
 * @apiSuccess {String}   versao        Versão da API.
 * @apiSuccess {String}   copyright     Copyright.
 *
 * @apiSuccessExample {json} Sucess 200 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *         "treinamento": "Treinamento Web API Exploitation",
 *         "versao": "v1",
 *         "copyright": "Copyright © Sec4US - Todos os direitos reservados. Nenhuma parte dos materiais disponibilizadas, incluindo esta API e seu código fonte, podem ser copiadas, publicadas, compartilhadas, redistribuídas, sublicenciadas, transmitidas, alteradas, comercializadas ou utilizadas para trabalhos sem a autorização por escrito da Sec4US"
 *     }
 */
exports.general = async (request, response) => {
  response.status(200).send({
        treinamento: "Treinamento Web API Exploitation",
        versao:"v1",
        copyright: "Copyright © Sec4US - Todos os direitos reservados. Nenhuma parte dos materiais disponibilizadas, incluindo esta API e seu código fonte, podem ser copiadas, publicadas, compartilhadas, redistribuídas, sublicenciadas, transmitidas, alteradas, comercializadas ou utilizadas para trabalhos sem a autorização por escrito da Sec4US"
      });
}


exports.generalUsers = async (request, response) => {
    response.status(200).send({
        message: "Try Harder!!!"
      });
  /*
  response.status(200).send({
        list: {
            descricao:'lista os usuários',
            method:'GET',
            uri:'http://' + request.headers.host + config.basePath + 'users/list'
        },
        create: {
            descricao:'cria um novo usuário',
            method:'POST',
            uri:'http://' + request.headers.host + config.basePath + 'users/create',
            post_sample:{
                name:'Nome do usuário',
                email:'E-mail do usuário',
                password:'Senha',
                conf_password:'Confirmação da senha'
            }
        },
        authenticate: {
            descricao:'realiza o login com um usuário',
            method:'POST',
            uri:'http://' + request.headers.host + config.basePath + 'users/authenticate',
            post_sample:{
                email: "E-mail do usuário",
                password: "Senha"
            }
        },
        verify_email: {
            descricao:'verifica se o e-mail existe na base',
            method:'GET',
            uri:'http://' + request.headers.host + config.basePath + 'users/verify/[email]'
        },
        get_uder_data: {
            descricao:'resgata os dados do usuário',
            method:'GET',
            uri:'http://' + request.headers.host + config.basePath + 'users/[id]'
        },
        update_user_data: {
            descricao:'atualiza os dados do usuário',
            method:'POST',
            uri:'http://' + request.headers.host + config.basePath + 'users/[id]',
            post_sample:{
                name:'Nome do usuário',
                email:'E-mail do usuário',
                password:'Senha',
                conf_password:'Confirmação da senha',
            }
        },
        recovery_password: {
            descricao:'envia o e-mail de recuperação de senha',
            method:'POST',
            uri:'http://' + request.headers.host + config.basePath + 'users/recovery-password',
            post_sample:{email:'email do usuário'}
        },
        reset_password: {
            descricao:'realiza a troca da senha',
            method:'POST',
            uri:'http://' + request.headers.host + config.basePath + 'users/reset-password/',
            post_sample:{ hash:"hash gerado pelo link de recuperação de senha", senha:'nova senha',conf_senha:'confirmação da nova senha'}
        },
      });*/
}
