from __future__ import absolute_import # Isso forca que os imports sejam absolutos

from flask import Flask, jsonify, request, render_template, make_response, session, redirect, url_for
from requests.auth import HTTPBasicAuth
from flask_restful import Resource, Api
from datetime import datetime, timedelta
import json, base64, requests
import secrets

from bank.common.database import *
from bank.views.checker import *
from bank.views.helper import *

class GrantUser(Resource):
    def get(self, provider=None):
        try:
            
            id = session.get('id', None)
            email = session.get('email', None)

            if id is None or email is None:
                return resp_error('Usuário não autenticado')

            db = DB()
            dbproviders = db.Select("SELECT * FROM oauth_providers WHERE provider_id = %s", (provider,))
            if dbproviders is None or len(dbproviders) == 0:
                return resp_error('Provider não encontrado')

            client = dbproviders[0]['client_id']
            secret = dbproviders[0]['client_secret']
            url = dbproviders[0]['url']
            provider_name = dbproviders[0]['name']
            code=request.args.get('code', None)
            denied=request.args.get('denied', '')
            
            if denied != '':
                return redirect(url_for('.home', denied=denied))

            data = {

                'grant_type': 'authorization_code',
                'scope': 'profile',
                'code': code
            }

            r1 = requests.post(("%s/oauth/token" % (url.strip("/"))), verify=False, data=data, auth=HTTPBasicAuth(client, secret))
            if r1.status_code != 200:
                content = ""
                try:
                    content = r1.json()
                except:
                    
                    try:
                        content = json.loads(r1.content)
                    except:
                        content = str(r1.content, 'utf-8')

                data = {
                    'client': client,
                    'client_secret': secret,
                    'provider': provider,
                    'provider_uri': url,
                    'response_code': r1.status_code,
                    'response_content': content,
                }
                resp = resp_badrequest('Erro requisitando OAuth Provider', response_data=data)
                return resp
            else:
                content = {}
                try:
                    content = r1.json()
                except:
                    
                    try:
                        content = json.loads(r1.content)
                    except:
                        return resp_error('Erro tratando o retorno do OAuth Provider', e)

                auth = (content.get('token_type', '') + " " + content.get('access_token', '')).strip()
                
                r1 = requests.get(("%s/api/me" % (url.strip("/"))), verify=False, headers={'Authorization': auth})
                if r1.status_code != 200:
                    
                    content = ""
                    try:
                        content = r1.json()
                    except:
                        
                        try:
                            content = json.loads(r1.content)
                        except:
                            content = str(r1.content, 'utf-8')

                    data = {
                        'authorization': auth,
                        'provider': provider,
                        'provider_uri': url,
                        'response_code': r1.status_code,
                        'response_content': content,
                    }
                    resp = resp_badrequest('Erro requisitando dados do usuário', response_data=data)
                    return resp
                else:
                    content = {}
                    try:
                        content = r1.json()
                    except:
                        
                        try:
                            content = json.loads(r1.content)
                        except:
                            return resp_error('Erro tratando o retorno dos dados do usuário', e)

                    username = content.get('username', None)
                    email = content.get('email', username)
                    oauth_id = content.get('id', None)

                    db = DB()
                    dbuser = db.Select("SELECT u.id,u.name,u.email, p.name as provider_name FROM oauth_users as o inner join users as u on u.id = o.user_id inner join oauth_providers as p on p.provider_id = o.provider_id WHERE o.oauth_id = %s and p.provider_id = %s",( oauth_id, provider, ))
                    if dbuser is None or len(dbuser) == 0:
                        # Nao existe
                        db.Execute("INSERT INTO oauth_users (user_id,provider_id,oauth_id,oauth_username) values(%s,%s,%s,%s)", ( id, provider, oauth_id, username, ))
                        db.Commit()


            return redirect(url_for('.home'))

        except Exception as e:

            return resp_error('Erro interno', e)

