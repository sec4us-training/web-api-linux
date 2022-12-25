import configparser
import os
import random
import string
import platform
from datetime import timedelta

class Config(object):
    '''As configs que serao publicadas no sistema devem estar em caixa alta'''
    DEBUG = True
    TESTING = False
    
    # Armazena a localização atual do arquivo
    BASEDIR = os.path.dirname(os.path.realpath(__file__))

    # Ler as configurações do banco de um arquivo
    config = configparser.ConfigParser()
    config.read(f'{BASEDIR}/config.ini')

    try:
        if config['GENERAL']['debug'] == True:
            DEBUG = True
    except:
        pass

    USER = config['DATABASE']['user']
    PASSWD = config['DATABASE']['passwd']
    DATABASE = config['DATABASE']['db']
    HOST = config['DATABASE']['host']
    PORT = int(config['DATABASE']['port'])

    HOSTNAME = ""
    try:
        HOSTNAME = platform.node() or ""
    except:
        pass

    key = ''.join(random.choice(string.ascii_letters + string.digits + string.ascii_uppercase) for i in range(30))

    #if DEBUG:
    #    key = '123456'

    # Definições do banco de dados e app
    # Gera uma chave aleatória para aplicação a cada execução do servidor
    SECRET_KEY = key

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=30
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=2
    )


class ProductionConfig(Config):
        pass    

class DevelopmentConfig(Config):
        DEBUG = True

class TestingConfig(Config):
        TESTING = True
