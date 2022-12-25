import MySQLdb
from flask import request, jsonify
from flask import current_app 

class DB():
    _db = None

    def __init__(self):
        pass

    def Connect(self):
        self._db=MySQLdb.connect(
                host=current_app.config['HOST'],
                user=current_app.config['USER'],
                passwd=current_app.config['PASSWD'],
                db=current_app.config['DATABASE'])

    def Select(self, query, data = None):
        if self._db is None:
            self.Connect()

        c = self.GetCursor()
        c.execute(query, data)

        columns = c.description 
        result = [{columns[index][0]:column for index, column in enumerate(value)} for value in c.fetchall()]

        #olumns = c.description
        #print("####")
        #print(columns)
        #result = []
        #for value in c.fetchall():
        #    tmp = {}
        #    for (index,column) in enumerate(value):
        #        tmp[columns[index][0]] = column
        #    result.append(tmp)

        return result


    def Execute(self, query, data = None):
        if self._db is None:
            self.Connect()

        c = self.GetCursor()
        return c.execute(query, data)


    def GetCursor(self):
        if self._db is None:
            return None;
        return self._db.cursor()

    def Commit(self):
        if self._db is not None:
            self._db.commit()

    def Close(self):
        if self._db is not None:
            self._db.close()
    