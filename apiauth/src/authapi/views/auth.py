from __future__ import absolute_import # Isso forca que os imports sejam absolutos

from flask import Flask, jsonify, request
from flask_restful import Resource, Api
from datetime import datetime, timedelta
import json, base64
import secrets

from authapi.views.checker import *
from authapi.views.helper import *

class Auth(Resource):
    def get(self, auth_type=None, username=None, passwd=None):
        try:
            if auth_type is not None:
                auth = request.headers.get('Authorization', '   ')
                (token_type,*token) = auth.replace(' =','=').replace('= ','=').split(' ')
                token_type = token_type.strip()

                if auth_type.lower() == "basic":

                    if username is not None or passwd is not None:
                        if token_type.lower() != "basic":
                            response = resp_notallowed('Autenticação requerida')
                            response.headers['WWW-Authenticate'] = 'Basic realm="Digite o usuário e senha"'
                            return response

                        decoded = base64.b64decode(token[0]).decode("UTF-8")
                        (user,password) = decoded.split(":", 2)

                        checker = []
                        checker.append('Usuário %s %s %s' % (username, "==" if username == user else "!=", user))
                        checker.append('Senha %s %s %s' % (passwd, "==" if passwd == password else "!=", password))

                        objret = {
                            'method': token_type,
                            'base64_encoded': token[0],
                            'base64_decoded': decoded,
                            'usuario': user,
                            'senha': passwd,
                            'auth_result': (username == user and passwd == password),
                            'checker': checker

                            }

                        if user != username or passwd != password:
                            response = resp_notallowed('Autenticação requerida', **{ 'user_data': objret })
                            response.headers['WWW-Authenticate'] = 'Basic realm="Digite o usuário e senha"'
                            return response
                        else:
                            return resp_sucess('', **{ 'user_data': objret })
                    else:
                        return resp_notallowed('Utilize a URL /v1/auth/basic/:username/:password/')
                  
                elif auth_type.lower() == "digest":

                    if username is not None or passwd is not None:
                        if token_type.lower() != "digest":
                            nonce = secrets.token_hex(nbytes=16)
                            opaque = secrets.token_hex(nbytes=16)
                            response = resp_notallowed('Autenticação requerida')
                            response.headers['WWW-Authenticate'] = 'Digest algorithm=MD5, realm="auth@webapiexploitation.com.br", qop="auth", nonce="%s", opaque="%s"' % (nonce, opaque)
                            return response

                        params = {}
                        for p1 in token:
                            for p in p1.split(','):
                                if '=' in p:
                                    (k,v) = p.split('=')
                                    params[k.strip()] = v.strip(' "')

                        user = params['username']
                        if user != username:
                            nonce = secrets.token_hex(nbytes=16)
                            opaque = secrets.token_hex(nbytes=16)
                            response = resp_notallowed('Autenticação requerida')
                            response.headers['WWW-Authenticate'] = 'Digest algorithm=MD5, realm="auth@webapiexploitation.com.br", qop="auth", nonce="%s", opaque="%s"' % (nonce, opaque)
                            return response

                        checker = []
                        checker.append('Usuário %s %s %s' % (username, "==" if username == user else "!=", user))

                        text1 = "%s:%s:%s" % (user,params['realm'],passwd)
                        HA1 = md5(text1)
                        text2 = "%s:%s" % (request.method,request.path)
                        HA2 = md5(text2)
                        text3 = "%s:%s:%s:%s:%s:%s" % (HA1,params['nonce'],params['nc'],params['cnonce'],params['qop'],HA2)
                        md5res = md5(text3)

                        checker.append('HA1 = MD5( %s )' % text1)
                        checker.append('    = %s' % HA1)
                        checker.append('HA2 = MD5( %s )' % text2)
                        checker.append('    = %s' % HA2)
                        checker.append('Response = MD5( %s )' % text3)
                        checker.append('         = %s' % md5res)

                        checker.append('Response %s %s %s' % (params['response'], "==" if params['response'] == md5res else "!=", md5res))

                        objret = {
                            'method': token_type,
                            'usuario': username,
                            'senha': passwd,
                            'auth_result': (username == user and params['response'] == md5res),
                            'parametros': params,
                            'checker': checker
                            }
                        return resp_sucess('', **{ 'user_data': objret })
                    else:
                        return resp_notallowed('Utilize a URL /v1/auth/digest/:username/:password/')
                                 

                else:
                    return resp_notallowed('Método de autenticação desconhecido ou não informado')

            else:
                return resp_notallowed('Método de autenticação desconhecido ou não informado')

        except Exception as e:

            return resp_error('Erro interno', e)

