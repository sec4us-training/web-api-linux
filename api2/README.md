# Vulnerable API 2 - Java

API de treinamento pertencente ao Treinamento Web APi Exploitation

## Instale as dependências
```
# apt-get update && apt-get -y upgrade
# apt-get install curl
# echo deb http://nginx.org/packages/mainline/ubuntu/ `lsb_release --codename --short` nginx > /etc/apt/sources.list.d/nginx.list
# curl -s http://nginx.org/keys/nginx_signing.key | apt-key add -
# apt-get install software-properties-common
# apt-get update && apt-get -y upgrade
# apt-get install openjdk-8-jre openjdk-8-jdk unzip zip maven iptables-persistent
```

## Verifique a instalação do Java
```
# java -version
openjdk version "1.8.0_275"
OpenJDK Runtime Environment (build 1.8.0_275-8u275-b01-0ubuntu1~18.04-b01)
OpenJDK 64-Bit Server VM (build 25.275-b01, mixed mode)
```

## Crie usuário para a API
```
# groupadd api
# adduser --disabled-password --ingroup api apivul2
```

## Realize o download do repositório
```
# git clone .... /tmp/vulnerablelab02
# chmod -R 777 /tmp/vulnerablelab02
```

## Conexão com Banco de Dados

Edite o arquivo de conexão com banco de dados


```
# cd /tmp/vulnerablelab02
# vi ./src/main/resources/application.properties
```

Alterando as linhas abaixo:


```
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url = jdbc:mysql://127.0.0.1:3306/wae
spring.datasource.username = api2
spring.datasource.password = 123456
```

## Crie a estrutura de bando de dados
```
# mysql -u root
mysql> CREATE DATABASE api2;
mysql> CREATE USER 'api2'@'localhost' IDENTIFIED BY '123456';
mysql> GRANT ALL PRIVILEGES ON `api2`.* TO 'api2'@'localhost';
mysql> FLUSH PRIVILEGES;

# mysql -u root api2 < /tmp/vulnerablelab02/database/mysql.sql
```


## Porta de início

Ajuste a porta de início da aplicação no arquivo /src/main/resources/application.properties


```
server.port=4002
```


## Compile o projeto
```
# cd /tmp/vulnerablelab02
# mvn package
# cp ./target/spring-boot-crud-training-0.0.1-SNAPSHOT.jar /home/apivul2/api2.jar
# chown -R apivul2:api /home/apivul2/ 
# chmod 777 /home/apivul2/api2.jar
```

Caso deseje desabilitar os erros de conexão com o banco de dados, adicione as linhas abaixo no arquivo pow.xml

```
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
        <configuration>
            <skipTests>true</skipTests>
        </configuration>
</plugin>
```


## Crie o arquivo de serviço (/etc/systemd/system/apivul2.service) conforme abaixo
```
[Unit]
Description=Vulnerable API 2 Service
After=network.target

[Service]
User = apivul2
Group = www-data
WorkingDirectory=/home/apivul2/
Environment="PATH=/home/apivul2/api/:/usr/local/bin:/usr/bin"
ExecStart=/usr/bin/java --illegal-access=warn -jar /home/apivul2/api2.jar
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

## Inicie os serviços
```
# systemctl daemon-reload
# systemctl enable apivul2
# systemctl start apivul2
# systemctl status apivul2
```


## Edite o arquivo do NGINX (/etc/nginx/nginx.conf) conforme abaixo
```
user  www-data;
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

## Edite o arquivo do host NGINX (/etc/nginx/conf.d/default.conf) conforme abaixo
```
server {
    listen 80 default_server;
    server_name _;
    return 301 https://sec4us.com.br/;
}
```

## Crie o arquivo do host NGINX (/etc/nginx/conf.d/apivul2.conf) conforme abaixo
```
server {
    #listen       80;
    listen       443 ssl;
    server_name  api2.webapiexploitation.com.br;
    add_header x-stream be2;  

    ssl_certificate      /etc/nginx/certs/webapiexploitation.com.br.cer;
    ssl_certificate_key  /etc/nginx/certs/webapiexploitation.com.br.key;

    location / {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

}
```

## Recarregue a config do NGINX
```
# nginx -s reload
```

## Iptables

Edite o arquivo /etc/iptables/rules.v4


```
# Generated by Helvio Junior M4v3r1ck
*mangle
:PREROUTING ACCEPT [89:22829]
:INPUT ACCEPT [89:22829]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [88:24171]
:POSTROUTING ACCEPT [88:24171]
COMMIT
#
*nat
:PREROUTING ACCEPT [0:0]
:INPUT ACCEPT [0:0]
:OUTPUT ACCEPT [15:1119]
:POSTROUTING ACCEPT [15:1119]
#-A POSTROUTING -o eth0 -j MASQUERADE
COMMIT
#
*filter
:INPUT DROP [0:0]
:FORWARD DROP [0:0]
:OUTPUT ACCEPT [0:0]
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
-A INPUT -i lo -j ACCEPT
-A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
-A FORWARD -p icmp -j ACCEPT
# Entrada
-A INPUT -p tcp -m tcp --sport 1024:65535 --dport 80 -j ACCEPT
-A INPUT -p tcp -m tcp --sport 1024:65535 --dport 443 -j ACCEPT
-A INPUT -p tcp -m tcp --sport 1024:65535 --dport 22 -j ACCEPT
#Encaminhamento
# Bloqueios inter redes
#
-A OUTPUT -m state --state NEW,RELATED,ESTABLISHED -j ACCEPT
-A OUTPUT -j ACCEPT
COMMIT
```

### Carregue as regras de FW
```
iptables-restore < /etc/iptables/rules.v4
```
