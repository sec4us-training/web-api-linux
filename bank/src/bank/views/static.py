from flask import Flask
from flask_restful import Resource, Api

class StaticData(Resource):
    def get(self, path):
        return send_from_directory('static', path)