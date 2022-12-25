from flask import Flask, jsonify, request
from flask_restful import Resource, Api

class Checker():

    @staticmethod
    def CheckAuth():
        '''Method to check Authentication conditions'''
        return True

    @staticmethod
    def CheckUser(user_hash):
        '''Method to check user conditions'''

        if not Checker.CheckAuth():
            return False

        # 128 caracteres é o tamanho de um hash SHA512 utilizado como nome do usuario
        if len(user_hash) != 128:
            return False

        return True


    @staticmethod
    def CheckHash(passwd):
        '''Method to check SHA512 hash conditions'''
        # 128 caracteres é o tamanho de um hash SHA512 utilizado como nome do usuario
        if len(passwd) != 128:
            return False

        return True
