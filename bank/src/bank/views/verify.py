from __future__ import absolute_import # Isso forca que os imports sejam absolutos

from flask import Flask, jsonify, request
from flask_restful import Resource, Api
from datetime import datetime, timedelta

from bank.common.database import *
from bank.views.checker import *
from bank.views.helper import *

class Verify(Resource):
    def get(self):
        db = DB()
        users = None
        show_passwd = False
        email = None
        show_passwd = False

        req_data = request.args or None
        if req_data is not None:
            email = req_data.get('email', None)
            if req_data.get('show_passwd', None) == '1':
                show_passwd = True

        if user_id is None and email is None:
            return resp_precondition()

        if user_id is not None and sale_id > 0:
            user = db.Select("select u.* from users as u WHERE u.id = %s", (user_id,))
        else:
            user = db.Select("select u.* from users as u WHERE u.email = %s", (email,))

        if user is None or len(user) == 0:
            return resp_notfound('user not found')
        else:
            objret = {
                'user_id': user[0]['user_id'],
                'username': user[0]['login'],
                'full_name': user[0]['fullname'],
                'email': user[0]['email'],
                'passwd': user[0]['passwd'] if show_passwd else '',
                }
            return resp_sucess('', **{ 'user_data': objret })

    @auth_required
    def delete(client_id, self, user_id=None):

        if user_id is None:
            return resp_precondition('user_id is empty')

        db = DB()
        try:
            user = db.Select("SELECT user_id FROM users WHERE id = %s",( user_id, ))
            if user is None or len(user) == 0:
                return resp_notfound('User not found')
            else:
                if db.Execute("DELETE FROM users WHERE id = %s",( user_id, )):
                    return resp_sucess('user deleted')
                else:
                    return resp_precondition()

            db.Commit()
        finally:
            db.Close()

    @auth_required
    def put(client_id, self, user_id=None):
        json_data = request.get_json(force=True) or None
        client_ip = request.remote_addr or None

        if user_id is not None:
            return resp_precondition('method not permited')

        if json_data is not None:

            email = json_data.get('email', None)
            if email is None or email.strip() == "":
                return resp_precondition('field email not provided')

            full_name = json_data.get('full_name', None)
            if full_name is None or full_name.strip() == "":
                return resp_precondition('field full_name not provided')  

            db = DB()
            try:
                # verifica se o usuario existe na base
                user = db.Select("SELECT user_id FROM users WHERE email = %s",( email, ))
                if user is None or len(user) == 0:

                    passwd = ''.join(random.choice(string.ascii_lowercase + string.ascii_uppercase + string.digits) for _ in range(32))
                    
                    #propositalmente vou inserir user e senha igual, pois o user será atualizado depois
                    db.Execute("INSERT INTO users (login, passwd, email, fullname) VALUES(%s, %s, %s, %s)", (passwd, passwd, email, full_name.title(),))
                    
                    user = db.Select("SELECT * FROM users WHERE email = %s", (email,))
                    if user is None or len(user) == 0:
                        raise Exception('Falha consultando usuário inserido')

                    user_id = int(user[0]['user_id'])

                    username = create_username(user_id)
                    res = db.Execute("UPDATE users set login = %s WHERE user_id = %s", (username, user_id,))

                    db.Commit()

                    if res:
                        return resp_created('User created')
                    else:
                        return resp_precondition()

                else:
                    return resp_precondition( 'An user with the same e-mail already exists')

            except Exception as e:
                print(e)
                return resp_badrequest()
            finally:
                db.Close()
            
        else:
            return resp_badrequest()

