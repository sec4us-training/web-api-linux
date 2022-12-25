# API

API de recebimento e tratamento dos callbacks de venda

## Instale as dependências
```
# echo deb http://nginx.org/packages/mainline/ubuntu/ `lsb_release --codename --short` nginx > /etc/apt/sources.list.d/nginx.list
# curl -s http://nginx.org/keys/nginx_signing.key | apt-key add -
# apt-get update && apt-get -y upgrade
# apt install nginx python3 python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools python3-venv  python-dev
```

## Crie usuário para a API
```
# groupadd api
# adduser --disabled-password --ingroup api apiauth
```

## Crie a estrutura base

### Copie o repostório todo
```
$ git clone git@gitlab.com:helvio_junior/ovpnsuite.git /tmp/apiauth
$ rsync -av /tmp/apiauth/sec4usbank/src/* /u01/www/bank/
```

### Instale as dependencias no python global do systema
```
# pip3 uninstall Authlib
# cd /tmp/apiauth/oauthlib
# pip3 install .
# pip3 install -r /tmp/apiauth/sec4usbank/requirements.txt
```

### Verifique as permissões
```
# chown -R www-data: /u01/www/bank/
```

## Edite o de configuração da api /u01/www/bank/config.ini
```
[GENERAL]
debug=True

[DATABASE]
user = bank
passwd = 123456
db = bank
host = localhost
port = 3306
charset = utf8
autocommit = False
```


## Crie a estrutura de bando de dados
```
# mysql -u root
mysql> CREATE DATABASE bank;
mysql> CREATE USER 'bank'@'localhost' IDENTIFIED BY '123456';
mysql> GRANT ALL PRIVILEGES ON `bank`.* TO 'bank'@'localhost';
mysql> FLUSH PRIVILEGES;

# mysql -u root bank < /tmp/apivul/vulnerablelab01/database/mysql.sql
```

## Edite o arquivo do NGINX (/etc/nginx/nginx.conf) conforme abaixo
```
user  nginx;
worker_processes  1;
 
error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;
 
 
events {
    worker_connections  1024;
}
 
 
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
 
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    server_names_hash_bucket_size  256;
 
    client_max_body_size 10m;
 
    log_format log_standard '$remote_addr, $http_x_forwarded_for - $remote_user [$time_local] "$request_method $scheme://$host$request_uri $server_protocol" $status $body_bytes_sent "$http_referer" "$http_user_agent" to: $upstream_addr';
 
    access_log /var/log/nginx/access.log log_standard;
    error_log /var/log/nginx/error.log;
 
    sendfile        on;
    #tcp_nopush     on;
 
    keepalive_timeout  65;
 
    #gzip  on;
 
    include /etc/nginx/conf.d/*.conf;
}
```

## Edite o arquivo do host NGINX (/etc/nginx/conf.d/bank.conf) conforme abaixo
```
server {
    #listen      80;
    listen       443 ssl;
    server_name sec4usbank.webapiexploitation.com.br;
 
    ssl_certificate      /etc/nginx/certs/webapiexploitation.com.br.cer;
    ssl_certificate_key  /etc/nginx/certs/webapiexploitation.com.br.key;

    location / {
 
        uwsgi_param   Host                 $host;
        uwsgi_param   X-Real-IP            $remote_addr;
        uwsgi_param   X-Forwarded-For      $proxy_add_x_forwarded_for;
        uwsgi_param   X-Forwarded-Proto    $http_x_forwarded_proto;

        proxy_read_timeout 600;
        proxy_connect_timeout 1d;
        proxy_max_temp_file_size 5024m;
        proxy_send_timeout 600;
        uwsgi_read_timeout 600;
        uwsgi_send_timeout 600;
        include uwsgi_params;
        uwsgi_pass unix:/tmp/bank.sock;
 
    }

}
```

## Recarregue a config do NGINX
```
# nginx -s reload
```

## Crie o arquivo de serviço (/etc/systemd/system/bank.service) conforme abaixo
```
[Unit]
Description=Auth API Service
After=network.target

[Service]
User = www-data
Group = www-data
WorkingDirectory=/u01/www/bank/
Environment="PATH=/u01/www/bank/"
ExecStart=/usr/local/bin/uwsgi --socket /tmp/bank.sock --chmod-socket=660 -w wsgi:app --processes=1  --threads=1 --reload-mercy=1 --worker-reload-mercy=1 --req-logger file:/dev/null

[Install]
WantedBy=multi-user.target
```

## Inicie os serviços
```
# systemctl daemon-reload
# systemctl enable bank
# systemctl start bank
# systemctl status bank
```


cd /u01/www/bank/; /usr/local/bin/uwsgi --socket /tmp/bank.sock --chmod-socket=777 -w wsgi:app --processes=1  --threads=1 --reload-mercy=1 --worker-reload-mercy=1 --req-logger file:/dev/null
