from __future__ import absolute_import # Isso forca que os imports sejam absolutos


import datetime
from functools import wraps
from flask import current_app
from flask import request, jsonify, make_response, url_for
import jwt
import requests, string, random, re, os, unicodedata

import smtplib 
from email.mime.multipart import MIMEMultipart 
from email.mime.text import MIMEText 
from email.mime.base import MIMEBase 
from email import encoders 

from bank.common.database import *

requests.packages.urllib3.disable_warnings()

def getProviders(type="authenticate"):
    ret = []
    db = DB()
    dbproviders = db.Select("SELECT * FROM oauth_providers order by provider_id")
    if dbproviders is not None and len(dbproviders) > 0:
        for r in dbproviders:
            iclass = ''
            aclass = ''
            if 'face' in r['name'].lower():
                iclass = 'fa-facebook-official' 
                aclass = 'btn-face' 
            if 'cat' in r['name'].lower():
                iclass = 'fa-github' 
                aclass = 'btn-cat' 

            redirect_uri = request.url_root.rstrip("/") + url_for('.login').rstrip("/") + "/" + type + "/" + str(r['provider_id'])
            uri = r['url'].rstrip('/') + "/oauth/authorize?response_type=code&client_id=%s&scope=profile&redirect_uri=%s" % (r['client_id'], redirect_uri)

            ret.append({
                'client_id': r['client_id'],
                'client_secret': r['client_secret'],
                'url': uri,
                'name': r['name'],
                'iclass': iclass,
                'aclass': aclass
                })
        

    return ret

def getUser(id):
    db = DB()
    user = db.Select("SELECT * FROM users WHERE ID = %s", (id,))
    if user is not None and len(user) > 0:
        return { 
            'id': user[0]['id'],
            'email': user[0]['email'],
            'name': user[0]['name'],
            'providers': getOauthByUser(id)
        }
    else:
        return None

def getOauthByUser(id):
    ret = []
    db = DB()
    providers = db.Select("SELECT p.provider_id, p.name, ou.oauth_id, ou.oauth_username FROM oauth_providers as p inner join oauth_users as ou on ou.provider_id = p.provider_id WHERE ou.user_id = %s", (id,))
    if providers is not None and len(providers) > 0:
        for p in providers:
            ret.append({ 
                'provider_id': p['provider_id'],
                'name': p['name'],
                'oauth_id': p['oauth_id'],
                'oauth_username': p['oauth_username'],
            })
        return ret
    else:
        return None

def md5(text):
    import hashlib 
    result = hashlib.md5(text.encode('UTF-8'))
    return result.hexdigest() 

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.args.get('token') or None

        if token is None:
            token = request.args.get('access_token') or None

        try:
            if token is None:
                token = request.form['token'] or None
        except:
            pass

        try:
            if token is None:
                token = request.form['access_token'] or None
        except:
            pass

        try:
            if token is None:
                auth = request.headers['Authorization'] or None
                (token_type,token,*rest) = auth.split(' ')
                if token_type.lower() != "bearer":
                    return resp_notallowed('Authorization not implemented. Expected bearer')
        except:
            pass


        if not token:
            return resp_notallowed('token is missing')

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'])
            client_id = str(data['client_id']) or ""

            #print(client_id)
        
            db = DB()
            try:
                user = db.Select("SELECT client_id FROM oauth WHERE client_id = %s AND client_enable = 'yes'",( client_id, ))
                if user is None or len(user) == 0:
                    return resp_notallowed('token is invalid or expired')
            except Exception as e:
                raise e
            finally:
                db.Close()

        except:
            return resp_notallowed('token is invalid or expired')
        
        # adiciona o client_id no parametro das funcoes get, post, put e etc...
        return f(client_id, *args, **kwargs)

    return decorated


def resp_created(msg = 'Resource created', **extras):
    
    response = {'success': True, 'hasError': False, 'message': msg, 'status': 201}, 201

    response[0].update(extras)

    return response

def resp_sucess(msg = '', **extras):
    res = {'success': True, 'hasError': False, 'message': msg, 'status': 200}

    res.update(extras)

    response = make_response(
        jsonify(
            res
        ), 
        200,
        )
    response.headers["Content-Type"] = "application/json"
    return response

def resp_denied(msg = 'Access denied', **extras):
    res = {'success': True, 'hasError': True, 'error': msg, 'status': 403}

    res.update(extras)

    response = make_response(
        jsonify(
            res
        ), 
        401,
        )
    response.headers["Content-Type"] = "application/json"
    return response

def resp_notallowed(msg = 'Undefined error', **extras):
    res = {'success': True, 'hasError': True, 'error': msg, 'status': 401}

    res.update(extras)

    response = make_response(
        jsonify(
            res
        ), 
        401,
        )
    response.headers["Content-Type"] = "application/json"
    return response

def resp_notfound(msg = 'Resource not found'):
    response = make_response(
        jsonify(
            {'success': True, 'hasError': True, 'error': msg, 'status': 404}
        ), 
        404,
        )
    response.headers["Content-Type"] = "application/json"
    return response

def resp_precondition(msg = 'Undefined error'):
    response = make_response(
        jsonify(
            {'success': True, 'hasError': True, 'error': msg, 'status': 412}
        ), 
        412,
        )
    response.headers["Content-Type"] = "application/json"
    return response

def resp_badrequest(msg = 'Bad request', **extras):
    res = {'success': True, 'hasError': True, 'error': msg, 'status': 400}
    
    res.update(extras)

    response = make_response(
        jsonify(
            res
        ), 
        401,
        )
    response.headers["Content-Type"] = "application/json"
    return response

def resp_error(msg = 'Internal Error', exception=None):
    res = {'success': True, 'hasError': True, 'error': msg, 'status': 500}

    if exception is not None and isinstance(exception, Exception):
        from traceback import format_exc
        res.update({'exception': {
            'message': str(exception),
            'stack_trace': format_exc().strip()
            }})

    response = make_response(
        jsonify(
            res
        ), 
        400,
        )
    response.headers["Content-Type"] = "application/json"
    return response

