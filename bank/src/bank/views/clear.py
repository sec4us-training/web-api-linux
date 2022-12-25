from flask import Flask, session, redirect, url_for, session
from flask_restful import Resource, Api

from bank.common.database import *

class Clear(Resource):
    def get(self):
        id = session.get('id', None)

        if id is None:
            return redirect(url_for('.login'))

        db = DB()
        db.Select("DELETE FROM oauth_users where user_id = %s", (id,))
        db.Commit()

        return redirect(url_for('.home'))