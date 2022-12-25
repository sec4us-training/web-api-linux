from __future__ import absolute_import # Isso forca que os imports sejam absolutos

from flask import Flask, jsonify, request, render_template, make_response, redirect, url_for, session
from flask_restful import Resource, Api
from flask import current_app
from datetime import datetime, timedelta
import json, base64
import secrets

from bank.common.database import *
from bank.views.checker import *
from bank.views.helper import *

class Login(Resource):
    def post(self, client_id=None):
        try:

            error = ""
            providers = getProviders()

            email = request.form.get('email', '').strip()
            password = request.form.get('pass', '').strip()

            if email == "" or password == "":
                error = "Usuário ou senha não informados"
            else:
                db = DB()
                dbuser = db.Select("SELECT id,name,email,password FROM users WHERE email = %s",( email, ))
                if dbuser is not None and len(dbuser) > 0:

                    if password == dbuser[0]['password']:
                        session['id'] = dbuser[0]['id']
                        session['email'] = dbuser[0]['email']
                        session['provider'] = "local"

                        return redirect(url_for('.home'))

                    error = "Senha inválida"

                else:
                    error = "E-mail não encontrado"
                

            resp = make_response(render_template('login.html', error=error, providers=providers))
            resp.headers['Content-type'] = 'text/html; charset=utf-8'
            return resp

        except Exception as e:
            return resp_error('Erro interno', e)

    def get(self, client_id=None):
        try:

            error=None
            id = session.get('id', None)
            email = session.get('email', None)
            if id is not None and email is not None:
                return redirect(url_for('.home'))

            denied=request.args.get('denied', '')

            if denied != '':
                error = "Autorização cancelada pelo usuário"

            providers = getProviders()

            resp = make_response(render_template('login.html', error=error, providers=providers))
            resp.headers['Content-type'] = 'text/html; charset=utf-8'
            return resp

        except Exception as e:

            return resp_error('Erro interno', e)

