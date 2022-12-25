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

class Home(Resource):
    def get(self, client_id=None):
        try:

            id = session.get('id', None)
            email = session.get('email', None)
            provider = session.get('provider', None)

            user = None
            if id is None or email is None:
                return redirect(url_for('.login'))

            providers = getProviders("grant")

            user = getUser(id)
            user['provider'] = provider

            resp = make_response(render_template('home.html', user=user, providers=providers))
            resp.headers['Content-type'] = 'text/html; charset=utf-8'
            return resp

        except Exception as e:

            return resp_error('Erro interno', e)

