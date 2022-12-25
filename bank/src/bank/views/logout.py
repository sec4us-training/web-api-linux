from flask import Flask, session, redirect, url_for
from flask_restful import Resource, Api

class Logout(Resource):
    def get(self):
        if session.get('id', None) is not None:
            del session['id']
        
        if session.get('username', None) is not None:
            del session['username']
        
        if session.get('provider', None) is not None:
            del session['provider']

        return redirect(url_for('.login'))