'use strict'

const config        = require('../../config');
const database      = require('../database/connection')
const util          = require('../utils/util')
const ValidationContract = require('../validators/fluent-validator');

const { v4: uuid }  = require('uuid')
const md5           = require('md5')
const jwt           = require('jsonwebtoken')
const nodemailer    = require('nodemailer')

/*
Documentação:
Instala dependencias
npm install apidoc -g

Atualiza a documentação
apidoc -i src/ -f .js -o help/;
*/

/**
 * @api {get} /users/list Lista todos os usuários
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName list
 * @apiGroup Usuários
 *
 * @apiDescription Lista todos os usuários.
 *
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
 * curl -i https://api1.webapiexploitation.com.br/api/v1/users/list
 *
 *
 * @apiSuccessExample {json} Sucess 200 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *          "id": "ID do usuário 001",
 *          "name": "Nome do usuário 001",
 *          "email": "nome@email.com.br",
 *          "phone": null,
 *          "document": null,
 *          "gender": null,
 *          "birth_date": null,
 *          "status": null,
 *          "role": "user",
 *          "photo": null
 *       },
 *       {
 *          "id": "ID do usuário 002",
 *          "name": "Nome do usuário 002",
 *          "email": "nome@email.com.br",
 *          "phone": null,
 *          "document": null,
 *          "gender": null,
 *          "birth_date": null,
 *          "status": null,
 *          "role": "user",
 *          "photo": null
 *       }
 *     ]
 */
exports.getUsers = (request, response) => {
  database('users').then(rows => response.status(200).send(rows))
}

/**
 * @api {get} /users/:id Retorna Informações do Usuário
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName user
 * @apiGroup Usuários
 *
 * @apiDescription Retorna Informações do Usuário
 *
 *
 * @apiHeader {String} x-access-token Token JWT gerado pela requisição ```/users/authenticate```.
 *
 * @apiDescription Atualiza os dados do usuário
 * @apiHeaderExample {json} Cabeçalho de autenticação:
 *     {
 *       "x-access-token": "Token JWT"
 *     }
 *
 * @apiParam {Number} id ID do usuário.
 *
 * @apiExample Exemplo de utilização:
 * curl -i https://api1.webapiexploitation.com.br/api/v1/users/:id
 *
 *
 * @apiSuccessExample {json} Sucess 200 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": "ID do usuário",
 *        "name": "Nome do usuário",
 *        "email": "nome@email.com.br",
 *        "phone": null,
 *        "document": null,
 *        "gender": null,
 *        "birth_date": null,
 *        "status": null,
 *        "role": "user",
 *        "photo": null
 *     }
 */
exports.getUserById = (request, response) => {
  const { id } = request.params

  database('users')
    .where('id', id)
    .then(rows => response.status(200).send(rows[0]))
}


/**
 * @api {get} /users/verify/:email Verifica a existência do e-mail
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName verify
 * @apiGroup Usuários
 *
 * @apiDescription Verifica a existência do usuário com o e-mail informado na base de dados 
 *
 * @apiParam {String} email E-mail do usuário.
 *
 * @apiExample Exemplo de utilização:
 * curl -i https://api1.webapiexploitation.com.br/api/v1/users/verify/:email
 *
 *
 * @apiSuccessExample {json} Sucess 200 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *        "email_validated": true
 *     }
 *
 * @apiErrorExample {json} Error 500 - Erro:
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Mensagem de erro"
 *     }
 */
exports.verifyEmail = async (request, response) => {
  const { email } = request.params

  try {
    const isEmailValid = await verifyEmail(email)
    response.status(200).send({ email_validated: isEmailValid })
  } catch (error) {
    response.status(500).send({ message: error })
  }
}


/**
 * @api {post} /users/authenticate Autentica o usuário
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName authenticate
 * @apiGroup Autenticação
 *
 * @apiDescription Autentica o usuário. O token retornado ```JWT``` deve ser enviado nas requisições subsequentes no cabeçalho ```x-access-token```. Exemplo:```x-access-token:Token JWT```
 *
 * @apiParam {String} email E-mail do usuário.
 * @apiParam {String} password Senha do usuário.
 *
 * @apiParamExample {json} Exemplo de requisição:
 *     {
 *       "email": "E-mail do usuário",
 *       "password": "Senha"
 *     }
 *
 * @apiExample Exemplo de utilização:
 * curl -k -i -X POST -H "Content-Type: application/json" -d '{"email":"E-mail do usuário","password": "Senha"}' https://api1.webapiexploitation.com.br/api/v1/users/authenticate
 *
 * @apiSuccess {Boolen}   auth          Resultado da autenticação.
 * @apiSuccess {String}   jwt           Token JWT.
 * @apiSuccess {String}   id            ID do usuário.
 * @apiSuccess {String}   email         E-mail do usuário.
 * @apiSuccess {String}   role          Role (função) do usuário.\
 *                                      Ex.: ```user``` ou ```admin```
 * @apiSuccess {String}   [name]        Nome do usuário.
 * @apiSuccess {String}   [photo]       URL da foto do usuário.
 * @apiSuccess {String}   [phone]       Telefone do usuário.
 *
 * @apiSuccessExample {json} Sucess 200 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *         "auth": true,
 *         "jwt": "JWT Token",
 *         "id": "ID do usuário",
 *         "email": "E-mail do usuário",
 *         "name": "Nome do usuário",
 *         "photo": null,
 *         "phone": null,
 *         "role": "user"
 *     }
 *
 * @apiErrorExample {json} Error 500 - Erro:
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Mensagem de erro"
 *     }
 */
exports.authenticate = async (request, response) => {
  const contract = new ValidationContract();

  contract.isEmail(request.body.email, 'E-mail inválido', '');
  contract.isRequired(request.body.password, 'O campo senha é obrigatório', '');

  // Se os dados forem inválidos
  if (!contract.isValid()) {
    response.status(400).send(
      contract.firstError()
    );
    return;
  }
  
  const { email, password } = request.body

  const passwordMd5 = md5(password + global.SALT_KEY)

  const rows = await database('users').where('email', email)
  const user = rows[0]

  if (!user) {
    response.status(404).send({
      message: 'Usuário ou senha inválidos'
    })

    return
  } else {
    if (user.password !== passwordMd5) {
      response.status(401).send({
        message: 'Senha inválida'
      })

      return
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.secret,
      {
        expiresIn: 999999
      },
    )

    response.status(200).send({
      auth: true,
      jwt: token,
      email: user.email,
      name: user.name,
      photo: user.photo,
      phone: user.phone,
      id: user.id,
      role: user.role,
    });
  }
}

/**
 * @api {post} /users/create Cria um novo usuário
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName create
 * @apiGroup Usuários
 *
 * @apiDescription Cria um novo usuário
 *
 * @apiParam {String}   email         E-mail do usuário.
 * @apiParam {String}   password      Senha do usuário.
 * @apiParam {String}   conf_password Confirnmação da senha do usuário.
 * @apiParam {String}   [name]        Nome do usuário.
 * @apiParam {String}   [photo]       URL da foto do usuário.
 * @apiParam {String}   [phone]       Telefone do usuário.
 *
 * @apiParamExample {json} Exemplo de requisição:
 *     {
 *         "email": "E-mail do usuário",
 *         "name": "Nome do usuário",
 *         "photo": null,
 *         "phone": null,
 *         "password": "senha",
 *         "conf_password": "confirmação da senha"
 *     }
 *
 * @apiExample Exemplo de utilização:
 * curl -k -i -X POST -H "Content-Type: application/json" -d '{ "name": "Nome do usuário", "email": "E-mail do usuário", "password": "Senha", "conf_password": "Confirmação da senha" }' https://api1.webapiexploitation.com.br/api/v1/users/create
 *
 * @apiSuccess {String}   message       Mensagem de confirmação.
 * @apiSuccess {String}   email_status  Status do envio de e-mail de boas vindas.
 * @apiSuccess {Boolen}   auth          Resultado da autenticação.
 * @apiSuccess {String}   jwt           Token JWT.
 * @apiSuccess {String}   id            ID do usuário.
 * @apiSuccess {String}   email         E-mail do usuário.
 * @apiSuccess {String}   role          Role (função) do usuário.\
 *                                      Ex.: ```user``` ou ```admin```
 * @apiSuccess {String}   [name]        Nome do usuário.
 * @apiSuccess {String}   [photo]       URL da foto do usuário.
 * @apiSuccess {String}   [phone]       Telefone do usuário.
 *
 * @apiSuccessExample {json} Sucess 201 - Resposta exemplo:
 *     HTTP/1.1 201 Created
 *     {
 *         message: "Usuário criado com sucesso!",
 *         email_status: "Status do envio de e-mail de boas vindas",
 *         user: {
 *             "auth": "true",
 *             "jwt": "JWT Token",
 *             "data": {
 *                "id": "ID do usuário",
 *                "email": "E-mail do usuário",
 *                "name": "Nome do usuário",
 *                "photo": null,
 *                "phone": null,
 *                "role": "user"
 *             }
 *         }
 *     }
 *
 * @apiErrorExample {json} Error 500 - Erro:
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Mensagem de erro"
 *     }
 */
exports.createUser = async (request, response) => {
  const contract = new ValidationContract();

  contract.isRequired(request.body.name, 'O campo nome é obrigatório', '');
  contract.isEmail(request.body.email, 'E-mail inválido', '');
  contract.isRequired(request.body.password, 'O campo senha é obrigatório', '');
  contract.isRequired(request.body.conf_password, 'O campo confirmação de senha é obrigatório', '');
  await contract.emailExists(request.body.email, 'Já existe um usuário cadastrado com este e-mail', '');
  contract.equals(request.body.password, request.body.conf_password, 'O campo senha e confirmação de senha não conferem', '');

  // Se os dados forem inválidos
  if (!contract.isValid()) {
    response.status(400).send(
      contract.firstError()
    );
    return;
  }

  const userData = {}
  userData.id = uuid();
  userData.name = request.body.name;
  userData.email = request.body.email;
  userData.password = md5(request.body.password + global.SALT_KEY)
  if (request.body.phone) userData.phone = request.body.phone;
  if (request.body.gender) userData.gender = request.body.gender;
  if (request.body.birth_date) userData.birth_date = request.body.birth_date;
  if (request.body.photo) userData.photo = request.body.photo;
  if (request.body.document) userData.document = request.body.document;
  userData.role =  (request.body.role) ? request.body.role : "user";

  const updatedUser = await database
    .insert(userData)
    .table('users')
    .then(() => {
      return getById(userData.id)
    })
    .catch(error => {
      console.log(error)

      response.status(500).send({
        message: error,
      })
      return null
    });

  if (!updatedUser)
    return;

  let email_status = "";
  await util.sendTemplateMail(
    updatedUser.email,
    'Cadastro efetuado',
    'welcome.html', 
    {
      user: updatedUser.name,
      email: updatedUser.email,
      password: request.body.password
    },
    request.headers['x-locale-lang']
  )
  .then((response) => {
    if (response.rejected.length > 0) {
      email_status = 'Email de boas vindas de senha não enviado';
    }else{
      email_status = 'Email enviado com sucesso';
    }
  })
  .catch((err) => {
    console.log(err);
    email_status = 'Erro ao enviar email de boas vindas';
  });

  const token = jwt.sign(
    {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    },
    config.secret,
    {
      expiresIn: 999999
    },
  )

  response.status(201).send({
    message: 'Usuário criado com sucesso!',
    email_status: email_status,
    user: {
      auth: true,
      jwt: token,
      data: updatedUser
    },
  })

}

/**
 * @api {patch} /users/:id Atualiza os dados do usuário
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName update
 * @apiGroup Usuários
 *
 *
 * @apiHeader {String} x-access-token Token JWT gerado pela requisição ```/users/authenticate```.
 *
 * @apiDescription Atualiza os dados do usuário
 * @apiHeaderExample {json} Cabeçalho de autenticação:
 *     {
 *       "x-access-token": "Token JWT"
 *     }
 *
 * @apiParam {String}   id            ID do usuário.
 * @apiParam {String}   email         E-mail do usuário.
 * @apiParam {String}   name          Nome do usuário.
 * @apiParam {String}   [old_password]    Senha atual do usuário.
 * @apiParam {String}   [new_password]    Nova Senha do usuário.
 * @apiParam {String}   [conf_new_password] Confirnmação da nova senha do usuário.
 * @apiParam {String}   [photo]       URL da foto do usuário.
 * @apiParam {String}   [phone]       Telefone do usuário.
 *
 * @apiParamExample {json} Exemplo de requisição:
 *     {
 *         "email": "E-mail do usuário",
 *         "name": "Nome do usuário",
 *         "photo": null,
 *         "phone": null,
 *         "password": "senha",
 *         "conf_password": "confirmação da senha"
 *     }
 *
 * @apiExample Exemplo de utilização:
 * curl -k -i -X PATCH -H "Content-Type: application/json" -d '{ "name": "Nome do usuário", "email": "E-mail do usuário", "password": "Senha", "conf_password": "Confirmação da senha" }' https://api1.webapiexploitation.com.br/api/v1/users/:id
 *
 * @apiSuccess {String}   message       Mensagem de confirmação.
 * @apiSuccess {String}   email_status  Status do envio de e-mail de boas vindas.
 * @apiSuccess {Boolen}   auth          Resultado da autenticação.
 * @apiSuccess {String}   jwt           Token JWT.
 * @apiSuccess {String}   id            ID do usuário.
 * @apiSuccess {String}   email         E-mail do usuário.
 * @apiSuccess {String}   role          Role (função) do usuário.\
 *                                      Ex.: ```user``` ou ```admin```
 * @apiSuccess {String}   [name]        Nome do usuário.
 * @apiSuccess {String}   [photo]       URL da foto do usuário.
 * @apiSuccess {String}   [phone]       Telefone do usuário.
 *
 * @apiSuccessExample {json} Sucess 201 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *         message: "Usuário criado com sucesso!",
 *         user: {
 *             "id": "ID do usuário",
 *             "email": "E-mail do usuário",
 *             "name": "Nome do usuário",
 *             "photo": null,
 *             "phone": null,
 *             "role": "user"
 *         },
 *         updatedBy: "ID do usuário que realizou a alteração",
 *     }
 *
 * @apiErrorExample {json} Error 500 - Erro:
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Mensagem de erro"
 *     }
 */
exports.updateUser = async (request, response) => {
  const contract = new ValidationContract();

  const { id } = request.params
  const tokenUser = await getById(request.userId);
  const updateUser = await getById(id);
  const userData = {}
  userData.id = id;

  if (!updateUser){
    response.status(404).send({
      message: 'Usuário não encontrado!'
    })

    return;
  }

  contract.isRequired(tokenUser, 'Usuário do token não encontrado', '');
  contract.isRequired(request.body.name, 'O campo name é obrigatório', '');
  contract.isRequired(request.body.email, 'O campo email é obrigatório', '');
  contract.isEmail(request.body.email, 'E-mail inválido', '');

  if (contract.isValid() && request.body.email.toLowerCase() !== updateUser.email.toLowerCase()) {
    await contract.emailExists(request.body.email, 'Já existe um usuário cadastrado com este e-mail', '');
  }

  if (request.body.new_password) {
    contract.isRequired(request.body.old_password, 'O campo senha antiga é obrigatório', '');
    contract.isRequired(request.body.new_password, 'O campo nova senha é obrigatório', '');
    contract.isRequired(request.body.conf_new_password, 'O campo confirmação de nova senha é obrigatório', '');
    contract.equals(request.body.new_password, request.body.conf_new_password, 'O campo senha e confirmação de senha não conferem', '');
    contract.equals(updateUser.password, md5(request.body.old_password + global.SALT_KEY), 'Senha atual do usuário inválida', '');
    if (contract.isValid()) {
      userData.password = md5(request.body.new_password + global.SALT_KEY)
    }
  }

  // Se os dados forem inválidos
  if (!contract.isValid()) {
    response.status(400).send(
      contract.firstError()
    );
    return;
  }

  console.log(tokenUser);
  if ((id !== tokenUser.id) && (tokenUser.role.toLowerCase() !== "admin")) {
    response.status(403).send({
      message: 'Acesso negado!'
    })

    return;
  }

  userData.name = request.body.name;
  userData.email = request.body.email;
  if (request.body.phone) userData.phone = request.body.phone;
  if (request.body.gender) userData.gender = request.body.gender;
  if (request.body.birth_date) userData.birth_date = request.body.birth_date;
  if (request.body.photo) userData.photo = request.body.photo;
  if (request.body.document) userData.document = request.body.document;
  userData.role =  (request.body.role) ? request.body.role : "user";

  database
    .table('users')
    .where('id', id)
    .update(userData)
    .then(() => {
      return database('users').where('id', userData.id)
    })
    .then(rows => {

      response.status(200).send({
        message: 'Usuário atualizado com sucesso!',
        user: rows[0],
        updatedBy: tokenUser.id
      })
    })
    .catch(error => {
      console.log(error)

      response.status(500).send({
        message: error,
      })
    })
}

async function verifyEmail(email) {
  try{
    const rows = await database('users').whereRaw('email = "' + email + '"')
    return rows.length > 0 ? true : false
  } catch (error) {
    return false;
  }
}

async function getById(id) {
  let user = null;
  await database('users').where('id', id).then(rows => { user = rows[0]; });
  return user
}

async function getByEmail(email) {
  let user = null;
  await database('users').where('email', email).then(rows => { user = rows[0]; });
  return user
}


/*
exports.logout = async (request, response) => {
  response.status(200).send({
    message: 'Usuário deslogado com sucesso!',
    auth: false,
    token: null,
  })
}
*/

/**
 * @api {post} /users/recovery-password Recuperação de senha
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName recovery
 * @apiGroup Usuários
 *
 * @apiDescription Envia e-mail de recuperação de senha
 *
 * @apiParam {String}   email         E-mail do usuário.
 *
 * @apiParamExample {json} Exemplo de requisição:
 *     {
 *         "email": "E-mail do usuário"
 *     }
 *
 * @apiExample Exemplo de utilização:
 * curl -k -i -X POST -H "Content-Type: application/json" -d '{ "email": "E-mail do usuário" }' https://api1.webapiexploitation.com.br/api/v1/users/recovery-password
 *
 * @apiSuccess {String}   message       Mensagem de confirmação.
 *
 * @apiSuccessExample {json} Sucess 201 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *         message: "Email enviado com sucesso"
 *     }
 *
 * @apiErrorExample {json} Error 500 - Erro:
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Mensagem de erro"
 *     }
 */
exports.recoveryPassword = async (request, response) => {
  const { email } = request.body

  try {
    let user = await getByEmail(email);

    if (user) {
      
      const today = new Date();
      const hash = await util.encrypt(user.id + '|' + today + '|' + user.password);

      let url = 'http://' + request.headers.host + '/resetpass/' + hash;

      await util.sendTemplateMail(
        user.email,
        'Recuperação de senha',
        'recover_password.html', 
          {
          user: user.name,
          email: user.email,
          url_recovery: url
        },
        request.headers['x-locale-lang']
      )
      .then((res) => {
        console.log(res)
        if (res.rejected.length > 0) {
          response.status(400).send({
            message: 'Email de recuperação de senha não enviado'
          });
        }else{

          response.status(200).send({
            message: 'Email enviado com sucesso'
          });
        }
      })
      .catch((err) => {
        console.log(err);
        response.status(400).send({
          message: 'Erro ao enviar email de recuperação de senha'
        });
      });
    } else {
      response.status(404).send({
        message: 'E-mail não encontrado'
      });
    }

  } catch (error) {
    response.status(500).send({
      message: error.message,
    });
  }
}


/**
 * @api {post} /users/:id/profile Envia arquivo de perfil
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName upload
 * @apiGroup Usuários
 *
 * @apiDescription Envia arquivo de imagem do perfil
 *
 * @apiHeader {String} x-access-token Token JWT gerado pela requisição ```/users/authenticate```.
 *
 * @apiDescription Atualiza os dados do usuário
 * @apiHeaderExample {json} Cabeçalho de autenticação:
 *     {
 *       "x-access-token": "Token JWT"
 *     }
 *
 * @apiParam {String}   id            ID do usuário.
 * @apiParam {String}   file          URI de imagem\
 * Padrão: ```data:image/jpeg;base64,[base64]```\
 * Onde: ```[base64]``` é o conteúdo do arquivo de imagem encodado em base64
 *
 * @apiParamExample {json} Exemplo de requisição:
 *     {
 *         "file":"data:image/jpeg;base64,amF2YXNjcmlwdDphbGVydCgndGVzdGUnKTsK"
 *     }
 *
 * @apiExample Exemplo de utilização:
 * curl -k -i -X POST -H "Content-Type: application/json" -d '{ "file":"data:image/jpeg;base64,amF2YXNjcmlwdDphbGVydCgndGVzdGUnKTsK" }' https://api1.webapiexploitation.com.br/api/v1/users/:id/profile
 *
 * @apiSuccess {String}   message       Mensagem de confirmação.
 *
 * @apiSuccessExample {json} Sucess 201 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *         message: "Mensagem de retorno"
 *     }
 *
 * @apiErrorExample {json} Error 500 - Erro:
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Mensagem de erro"
 *     }
 */
exports.uploadFile = async (req, res, next) => {
  const { id } = req.params
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  const user = await getById(id);
  const data = new Date();

  //Espera receber no body algo como abaixo
  //{"file":"data:image/jpeg;base64,amF2YXNjcmlwdDphbGVydCgndGVzdGUnKTsK","source":"media"}

  res.status(500).send({
      message: "Funcionalidade não implementada!",
    });
};


/**
 * @api {delete} /users/:id Exclui o usuário
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName delete
 * @apiGroup Usuários
 *
 * @apiDescription Exclui o usuário. Somente usuários com role = admin podem excluir outros usuários.
 *
 * @apiHeader {String} x-access-token Token JWT gerado pela requisição ```/users/authenticate```.
 *
 * @apiHeaderExample {json} Cabeçalho de autenticação:
 *     {
 *       "x-access-token": "Token JWT"
 *     }
 *
 * @apiParam {String}   id          ID do usuário a ser excluído
 *
 *
 * @apiExample Exemplo de utilização:
 * curl -k -i -X DELETE https://api1.webapiexploitation.com.br/api/v1/users/:id
 *
 * @apiSuccess {String}   message       Mensagem de confirmação.
 *
 * @apiSuccessExample {json} Sucess 201 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *         message: "Mensagem de retorno"
 *     }
 *
 * @apiErrorExample {json} Error 500 - Erro:
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Mensagem de erro"
 *     }
 */
exports.deleteUser = async (request, response, next) => {
  const { id } = request.params
  
  if (request.role == "admin") {
    const user = await getById(id);
    const data = new Date();

    if (user){
      database
      .table('users')
      .where('id', id)
      .delete()
      .then(() => {
        response.status(200).send({
          message: 'Usuário excluído com sucesso!'
        })
      })
      .catch(error => {
        console.log(error)

        response.status(500).send({
          message: error,
        })
      })
  }else{
    response.status(404).send({
        message: "Usuário não localizado!",
      });
  }

  }else{
    response.status(403).send({
        message: "Acesso negado!",
      });
  }
};


/**
 * @api {post} /users/reset-password Alteração de senha
 * @apiSampleRequest off
 * @apiVersion 1.0.0
 * @apiName resetpass
 * @apiGroup Usuários
 *
 * @apiDescription Realiza a operação de troca de senha com a utilização do hash enviado por e-mail
 *
 * @apiParam {String}   hash          Hash de recuperação de senha enviado por e-mail.
 * @apiParam {String}   password      Senha do usuário.
 * @apiParam {String}   conf_password Confirnmação da senha do usuário.
 *
 * @apiParamExample {json} Exemplo de requisição:
 *     {
 *         "hash": "Hash enviado por e-mail",
 *         "password": "senha",
 *         "conf_password": "confirmação da senha"
 *     }
 *
 * @apiExample Exemplo de utilização:
 * curl -k -i -X POST -H "Content-Type: application/json" -d '{ "hash": "Hash enviado por e-mail","password": "senha","conf_password": "confirmação da senha" }' https://api1.webapiexploitation.com.br/api/v1/users/reset-password
 *
 * @apiSuccess {String}   message       Mensagem de confirmação.
 * @apiSuccess {String}   id            ID do usuário.
 * @apiSuccess {String}   email         E-mail do usuário.
 * @apiSuccess {String}   role          Role (função) do usuário.\
 *                                      Ex.: ```user``` ou ```admin```
 * @apiSuccess {String}   [name]        Nome do usuário.
 * @apiSuccess {String}   [photo]       URL da foto do usuário.
 * @apiSuccess {String}   [phone]       Telefone do usuário.
 *
 * @apiSuccessExample {json} Sucess 201 - Resposta exemplo:
 *     HTTP/1.1 200 OK
 *     {
 *         message: "Email enviado com sucesso",
 *         user: {
 *             "id": "ID do usuário",
 *             "email": "E-mail do usuário",
 *             "name": "Nome do usuário",
 *             "photo": null,
 *             "phone": null,
 *             "role": "user"
 *         },
 *     }
 *
 * @apiErrorExample {json} Error 500 - Erro:
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Mensagem de erro"
 *     }
 */
exports.resetPassword = async (request, response) => {
  try {
    const info = (await util.decrypt(request.body.hash)).split('|');
    if (info.length === 3) {
      const new_password = md5(request.body.password + global.SALT_KEY);
      const current_pass = info[2];
      const date = new Date(info[1]);
      const id = info[0];
      const now = new Date();
      const user = await getById(id);

      if (date.getDate() !== now.getDate() || date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) {
        response.status(404).send({
          message: 'Link expirado. Realize uma nova recuperação de senha',
        });
        return;
      }

      if (!user) {
        response.status(404).send({
          message: 'Usuário não encontrado',
        });
        return;
      }

      const contract = new ValidationContract();
      contract.isRequired(request.body.password, 'O campo nova senha é obrigatório', '');
      contract.isRequired(request.body.conf_password, 'O campo confirmação de nova senha é obrigatório', '');
      contract.equals(request.body.password, request.body.conf_password, 'O campo senha e confirmação de senha não conferem', '');
      

      if (!contract.isValid()) {
        response.status(400).send(
          contract.firstError()
        );
        return;
      }

      contract.equals(user.password, current_pass, 'Você já definiu sua senha utilizando esta URL', '');
      contract.notEquals(user.password, new_password, 'Você não pode definir a mesma senha novamente', '');

      if (!contract.isValid()) {
        response.status(400).send(
          contract.firstError()
        );
        return;
      }

      const userData = {}
      userData.id = id;
      userData.password = new_password;

      database
        .table('users')
        .where('id', id)
        .update(userData)
        .then(() => {
          return database('users').where('id', userData.id)
        })
        .then(rows => {

          response.status(200).send({
            message: 'Usuário atualizado com sucesso!',
            user: rows[0]
          })
        })
        .catch(error => {
          console.log(error)

          response.status(500).send({
            message: error,
          })
        })

    } else {
      response.status(400).send({
        message: 'Inconsistência de dados. Verifique e tente novamente',
      });
    }
  } catch (error) {
    response.status(500).send({
      message: error.message,
    });
  }
}

