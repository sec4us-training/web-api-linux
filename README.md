# WEB API Exploitation - Training Labs

## Copyright © Sec4US®

Todos os direitos reservados. Nenhuma parte dos materiais disponibilizadas, incluindo este repositório, scripts, servidor, suas aplicações e seu código fonte, podem ser redistribuídas, sublicenciadas, transmitidas, alteradas, comercializadas ou utilizadas para trabalhos sem a autorização por escrito da Sec4US

## Sobre

Este é um procedimento que realiza a configuração completa de um servidor Linux para as práticas de testes de invasão (Pentest) realizados durante o treinamento de Web API Exploitation da Sec4US.

Conheça mais sobre nosso treinamento em: https://sec4us.com.br/treinamentos/web-api-exploitation/

## Ambiente

**Nota:** O "alvo" servidor de deploy, deve ser um ubuntu linux e todos os seus dados poderão ser destruidos, sendo assim NÃO execute este procedimento em um servidor com dados que não podem ser perdidos.

Este ambiente é composto de duas máquinas:

1. **Cliente:** Qualquer equipamento linux que servirá somente para iniciar o processo de deploy. Nesta máquina necessita ter instalado somente o Ansible para execução dos comandos e procedimentos remotos no servidor.
2. **Servidor:** O servidor (ou alvo) deve ser um Ubuntu Linux que será o alvo de todo o procedimento de instalação. Recomenda-se que o servidor seja um Ubuntu Linux 20.04 ou superior, recentemente instalado e sem nenhuma informação que possa ser perdida, pois o procedimento de instalação é bem invasivo e irá reconfigurar diversos serviços do servidor.


## Preparação do cliente

### Atualize a maquina

```bash
apt update && apt -y upgrade
```

### Instale o ansible e suas dependências

```bash
apt install ansible

ansible-galaxy collection install community.general
ansible-galaxy collection install ansible.posix
ansible-galaxy collection install ansible.windows
ansible-galaxy collection install community.windows
```

## Meus Ajustes
```bash
edred@legion:/mnt/c/Users/edgar/web-api-linux$ vagrant ssh-config
Host default
  HostName 172.30.80.1
  User vagrant
  Port 2222
  UserKnownHostsFile /dev/null
  StrictHostKeyChecking no
  PasswordAuthentication no
  IdentityFile /mnt/c/Users/edgar/web-api-linux/.vagrant/machines/default/virtualbox/private_key
  IdentitiesOnly yes
  LogLevel FATAL

ssh -i /mnt/c/Users/<USER>/web-api-linux/.vagrant/machines/default/virtualbox/private_key -l vagrant 172.30.80.1 -p 2222
```

## Preparação do servidor

### Chaves SSH

Dentro do servidor Ubuntu Linux, crie um par de chaves SSH para autenticação

```bash
sudo su
apt install openssh-client openssh-server
systemctl enable ssh
systemctl start ssh
ssh-keygen
```

**Nota:** Na geração das chaves NÃO altere os valores padrão.

Este comando irá gerar 2 arquivos: 

1. **/root/.ssh/id_rsa** Chave privada
2. **/root/.ssh/id_rsa.pub** Chave pública

Autorize a chave privada em logar com o usuário root

```bash
sudo su
cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys
```

### Copiando chaves

Dentro da sua máquina cliente, copie os 2 arquivos (id_rsa e id_rsa.pub) gerados no servidor para o mesmo diretório onde está o arquivo deploy.sh ficando a estrutura conforme abaixo:

```
$ls

README.md       id_rsa.pub          setup_apiauth.yml   setup_burp.yml      setup_python38.yml  user_details.yml
deploy.sh       setup_api1.yml      setup_bank.yml      setup_nginx.yml     setup_rdp.yml       vars.yml
id_rsa          setup_api2.yml      setup_base.yml      setup_node.yml      setup_tools.yml     
```

## Realizando o deploy

Dentro da sua máquina cliente realize o procedimento abaixo

### Acesso SSH

Garanta que o seu usuário local tenha acesso via chave privada no servidor remoto

### Definição do usuário e senha

Caso deseje alterar o usuário e senha que será definido, altere no arquivo vars.yml os parâmetros abaixo:

```
local_username: webapi
default_password: "senha"
```

### Realize o deploy

```bash
chmod +x deploy.sh
./deploy.sh -u root -k id_rsa -t [ip_address]
```

**Nota:** o script deploy.sh irá executar todos o processo de deploy dos arquivos .yml, sendo assim NÃO precisa executar manualmente cada um deles.
