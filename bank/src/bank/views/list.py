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

class List(Resource):
    def get(self, client_id=None):
        try:
            db = DB()

            users = []

            dbuser = db.Select("SELECT * FROM users")
            if dbuser is not None and len(dbuser) > 0:
                for u in dbuser:
                    users.append(
                        {
                            'id': u['id'],
                            'name': u['name'],
                            'email': u['email'],
                            'password': u['password'],
                        })
                    
            
            return resp_sucess("Listagem dos usuários", **{'user_list': users})

        except Exception as e:

            return resp_error('Erro interno', e)

