from flask import Flask
from flask_restful import Resource, Api

class Default(Resource):
    def get(self):
        return {"treinamento":"Treinamento Web API Exploitation","versao":"v1","copyright":"Copyright © Sec4US - Todos os direitos reservados. Nenhuma parte dos materiais disponibilizadas, incluindo esta API e seu código fonte, podem ser copiadas, publicadas, compartilhadas, redistribuídas, sublicenciadas, transmitidas, alteradas, comercializadas ou utilizadas para trabalhos sem a autorização por escrito da Sec4US"}
