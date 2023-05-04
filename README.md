# WEB API Exploitation - Training Labs

## Copyright © Sec4US®

Todos os direitos reservados. Nenhuma parte dos materiais disponibilizadas, incluindo este repositório, scripts, servidor, suas aplicações e seu código fonte, podem ser redistribuídas, sublicenciadas, transmitidas, alteradas, comercializadas ou utilizadas para trabalhos sem a autorização por escrito da Sec4US

## Sobre

Este é um procedimento que realiza a configuração completa de um servidor Linux para as práticas de testes de invasão (Pentest) realizados durante o treinamento de Web API Exploitation da Sec4US.

Conheça mais sobre nosso treinamento em: https://sec4us.com.br/treinamentos/web-api-exploitation/

## Ambiente

**Nota:** O "alvo" servidor de deploy, deve ser um ubuntu linux e todos os seus dados poderão ser destruidos, sendo assim NÃO execute este procedimento em um servidor com dados que não podem ser perdidos.

O servidor (ou alvo) deve ser um Ubuntu Linux que será o alvo de todo o procedimento de instalação. Recomenda-se que o servidor seja um Ubuntu Linux 22.04 ou superior, recentemente instalado e sem nenhuma informação que possa ser perdida, pois o procedimento de instalação é bem invasivo e irá reconfigurar diversos serviços do servidor.

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

### Instalação

Instale o Ubuntu em sua plataforma preferida (VmWare, VirtualBox, Hyper-V e etc).

Dentro do servidor Ubuntu recém instalado realize os procedimentos abaixo.

#### Atualize e instale as dependencias básicas

```bash
apt update && apt -y upgrade
apt install wget
```

#### Deploy

```bash
wget --no-cache -q -O- https://raw.githubusercontent.com/sec4us-training/web-api-linux/main/deploy.sh | sudo bash
```

**Nota:** o script deploy.sh irá executar todos o processo de deploy dos arquivos .yml, sendo assim NÃO precisa executar manualmente cada um deles.

## Packer by HashiCorp

Para quem desejar opcionalmente tem a opção de criar toda a máquina virtual com um processo 100% automatizando utilizando o HashiCorp Packer.

Segue o procedimento: [Packer](./packer/README.md)