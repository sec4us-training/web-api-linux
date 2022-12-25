# API

API de recebimento e tratamento dos callbacks de venda

## Instale as dependências
```
# echo deb http://nginx.org/packages/mainline/ubuntu/ `lsb_release --codename --short` nginx > /etc/apt/sources.list.d/nginx.list
# curl -s http://nginx.org/keys/nginx_signing.key | apt-key add -
# apt-get update && apt-get -y upgrade
# apt install nginx python3 python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools python3-venv  python-dev
```

## Crie a estrutura base

### Copie o repostório todo
```
# mkdir -p /u01/www/cathub/
# git clone git@gitlab.com:helvio_junior/ovpnsuite.git /tmp/apiauth
# rsync -av /tmp/apiauth/cathub/src/* /u01/www/cathub/
```

### Instale as dependencias no python global do systema
```
# pip3 uninstall Authlib
# cd /tmp/apiauth/oauthlib
# pip3 install .
# pip3 install -r /tmp/apiauth/cathub/requirements.txt
```

### Verifique as permissões
```
# chown -R www-data: /u01/www/cathub/
```

## Edite o arquivo do host NGINX (/etc/nginx/conf.d/cathub.conf) conforme abaixo
```
server {
    #listen      80;
    listen       443 ssl;
    server_name cathub.webapiexploitation.com.br;
 
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
        uwsgi_pass unix:/tmp/cathub.sock;
 
    }

}
```

## Recarregue a config do NGINX
```
# nginx -s reload
```

## Crie o arquivo de serviço (/etc/systemd/system/cathub.service) conforme abaixo
```
[Unit]
Description=Cathub Service
After=network.target

[Service]
User = www-data
Group = www-data
WorkingDirectory=/u01/www/cathub/
Environment="AUTHLIB_INSECURE_TRANSPORT=1"
ExecStart=/usr/local/bin/uwsgi --socket /tmp/cathub.sock --chmod-socket=660 -w wsgi:app --processes=1  --threads=1 --reload-mercy=1 --worker-reload-mercy=1 --req-logger file:/dev/null

[Install]
WantedBy=multi-user.target
```

## Inicie o serviço
```
# systemctl daemon-reload
# systemctl enable cathub
# systemctl start cathub
# systemctl status cathub
```

rm -rf /u01/www/cathub/website/db.sqlite; cd /u01/www/cathub/; /usr/local/bin/uwsgi --socket /tmp/cathub.sock --chmod-socket=777 -w wsgi:app --processes=1  --threads=1 --reload-mercy=1 --worker-reload-mercy=1 --req-logger file:/dev/null
