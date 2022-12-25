from __future__ import absolute_import # Isso forca que os imports sejam absolutos


import datetime
from functools import wraps
from flask import current_app
from flask import request, jsonify, make_response
import jwt
import requests, string, random, re, os, unicodedata

import smtplib 
from email.mime.multipart import MIMEMultipart 
from email.mime.text import MIMEText 
from email.mime.base import MIMEBase 
from email import encoders 

requests.packages.urllib3.disable_warnings()

def md5(text):
    import hashlib 
    result = hashlib.md5(text.encode('UTF-8'))
    return result.hexdigest() 


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

