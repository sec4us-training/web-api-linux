const cluster       = require('cluster');
const express       = require('express')
const bodyParser    = require('body-parser');
const path          = require('path');
const config        = require('./config');
const database      = require('./src/database/connection')
const router        = require('./src/routes/routes')
const port          = config.port;
const root          = path.dirname( __dirname );
const cCPUs         = require('os').cpus().length;

if( cluster.isMaster ) {

  // Create 3 worker for each CPU
  for( var i = 0; i < (cCPUs * 3); i++ ) {
    cluster.fork();
  }

  cluster.on( 'online', function( worker ) {
    console.log( 'Worker ' + worker.process.pid + ' is online.' );
  });
  cluster.on( 'exit', function( worker, code, signal ) {
    console.log( 'worker ' + worker.process.pid + ' died.' );
  });

}else{

    const app = express()

    app.use(express.json())

    app.use(bodyParser.json({
      limit: '20mb'
    }));
    app.use(bodyParser.urlencoded({  
      extended: false
    }));

    // Habilita o CORS
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      next();
    });

    app.use(router)

    app.disable("x-powered-by");
    app.disable("etag");

    // caminho /help como diretório estático
    app.use(config.basePath + 'help', express.static('./help'));


    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
}
