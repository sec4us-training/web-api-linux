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
$ rsync -av /tmp/apiauth/auth/src/* /home/apiauth/api/
$ rsync -av /tmp/apiauth/auth/requirements.txt /home/apiauth/
```

### Verifique as permissões
```
# chown -R apiauth:api /home/apiauth/ 
```

## Edite o de configuração da api /home/apiauth/api/authapi/config.ini
```
[GENERAL]
debug=True
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

## Edite o arquivo do host NGINX (/etc/nginx/conf.d/apiauth.conf) conforme abaixo
```
server {
    #listen      80;
    listen       443 ssl;
    server_name auth.webapiexploitation.com.br;
 
    ssl_certificate      /etc/nginx/certs/webapiexploitation.com.br.cer;
    ssl_certificate_key  /etc/nginx/certs/webapiexploitation.com.br.key;

    location / {
        return 301 /v1/;
    }
    
    location /v1/ {
 
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
        uwsgi_pass unix:/home/apiauth/api/api.sock;
 
    }

}
```

## Recarregue a config do NGINX
```
# nginx -s reload
```

## Crie o arquivo de serviço (/etc/systemd/system/apiauth.service) conforme abaixo
```
[Unit]
Description=Auth API Service
After=network.target

[Service]
User = apiauth
Group = nginx
WorkingDirectory=/home/apiauth/api
Environment="PATH=/home/apiauth/api/"
ExecStart=/usr/local/bin/uwsgi --socket /home/apiauth/api/api.sock --chmod-socket=660 -w wsgi:app --processes=1  --threads=1 --reload-mercy=1 --worker-reload-mercy=1 --req-logger file:/dev/null

[Install]
WantedBy=multi-user.target
```

## Inicie os serviços
```
# systemctl daemon-reload
# systemctl enable apiauth
# systemctl start apiauth
# systemctl status apiauth
```

## Insira as linhas abaixo no /etc/hosts
```
127.0.0.1   auth.webapiexploitation.com.br
```



