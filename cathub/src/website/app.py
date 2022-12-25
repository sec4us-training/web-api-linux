import os
from flask import Flask, session, url_for
from .models import db, User, OAuth2Client
from .oauth2 import config_oauth
from .routes import bp
from sqlalchemy import event, DDL

def create_app(config=None):
    app = Flask(__name__)

    # load default configuration
    app.config.from_object('website.settings')

    # load environment configuration
    if 'WEBSITE_CONF' in os.environ:
        app.config.from_envvar('WEBSITE_CONF')

    # load app specified configuration
    if config is not None:
        if isinstance(config, dict):
            app.config.update(config)
        elif config.endswith('.py'):
            app.config.from_pyfile(config)

    # Cria os dados iniciais do DB
    event.listen(User.__table__, 'after_create',
             DDL(""" INSERT INTO user (id, username, email) VALUES (1, 'admin','admin@webapiexploitation.com.br') """))

    event.listen(OAuth2Client.__table__, 'after_create',
             DDL(""" INSERT INTO oauth2_client (user_id, client_id, client_secret, client_id_issued_at, client_secret_expires_at, client_metadata) VALUES (1, 'TGFzmaJCWFsJNjzzfgjv2hOc', '6eiINyy1rlEVhbPhWQycI2F980gEbb6ClkmwaAQ6pNnaSBmn', 1612736299, 0, '{"client_name":"OAuth Tester","client_uri":"https://auth.webapiexploitation.com.br/v1/oauth/authenticate/provider2","grant_types":["authorization_code","password"],"redirect_uris":["https://auth.webapiexploitation.com.br/v1/oauth/authenticate/provider2"],"response_types":["code"],"scope":"profile","token_endpoint_auth_method":"client_secret_basic"}') """))

    setup_app(app)
    return app


def setup_app(app):
    # Create tables if they do not exist already
    @app.before_first_request
    def create_tables():
        db.create_all()

    db.init_app(app)
    config_oauth(app)
    app.register_blueprint(bp, url_prefix=app.config['URI_BASE'])

