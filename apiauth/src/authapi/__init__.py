from flask import Flask
from flask_restful import Resource, Api
from .config import *
import uwsgi

from flask import json
from werkzeug.exceptions import HTTPException

app = Flask(__name__)
app.config.from_object(ProductionConfig())
api = Api(app)

from .views.default import *
from .views.auth import *
from .views import helper

api.add_resource(Default, '/', '/v1/')
api.add_resource(Auth, '/v1/auth/', '/v1/auth/<string:auth_type>', '/v1/auth/<string:auth_type>/<string:key>', '/v1/auth/<string:auth_type>/<string:username>/<string:passwd>', )


'''
@app.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        'success': True, 
        'hasError': True, 
        'error': 'Internal error', 
        'status': 500,
        'exception': {
            "code": e.code,
            "name": e.name,
            "description": e.description
        }
    })
    response.content_type = "application/json"

    return response
'''
'''
@app.errorhandler(InternalServerError)
def handle_500(e):
    original = getattr(e, "original_exception", None)

    response = {'success': True, 'hasError': True, 'error': 'Internal error', 'status': 500}, 500

    if original is not None and isinstance(original, Exception):
        response[0].update({'exception', original})

    return response
'''


#Fontes
#https://lucassimon.com.br/2018/10/serie-api-em-flask---parte-12---autenticacao-por-jwt/
#https://medium.com/@hedgarbezerra35/api-rest-com-flask-autenticacao-25d99b8679b6
#https://restfulapi.net/http-status-codes/