
## Pré-requisitos

Você deve ter instalado em seu sistema os sequintes pacotes:
- VMware Fusion (Apple) or VMware Worksation (Windows/Linux)
- Hashicorp Packer (Version 1.8.6 é o atual quando criamos este procedimento)

## Procedimento de criação da VM (Opção 01)

Para criar a máquina virtual do zero você precisa realizar o seguinte procedimento:

1. Instalar o packer
2. Clonar este repositório
3. Executar o script build.sh

### Windows

Para usuários windows ao invés de executar o script `build.sh` execute o comando abaixo:

```bash
packer build -force "./"
```

### Resultado da execução
Como resultante da execução os seguintes arquivos/diretórios serão criados:

- **webapi.zip**: Arquivo ZIP  contento a máquina virtual VMWare pronta para uso.
- **web_api_ssh_key.pem**: Chave privada SSH para autenticação como o usuário webapi. `ssh -i web_api_ssh_key.pem webapi@ip_do_servidor`


## Basicamente o que este script e o Packer realizarão?

- Realiza o download da imagem ISO do Ubuntu 22.04 LTS Server
- Verifica a integridade da imagem através do seu checksum do site oficial
- Atualiza o arquivo de configuração com o Checksum da ISO, diretório de Downloads, Usuário inicial, Senha inicial e etc.
- Realiza a criação da máquina virtual no VMware Fusion ou Workstation
- Define o usuário de build/ssh para permitir sudo sem solicitar senha
- Redefine o tamanho do disco lógico para utilizar 100% do disco virtual atribuido
- Instala as depenências base: openssh-server, open-fm-tools, cloud-init, whois, zsh, wget, tasksel, ansible, python3
- Instala todo o ambiente do treinamento Web API Exploitation utilizando o script [deploy.sh](../../deploy.sh)

## Ubuntu Download Pages
- [Jammy Releases](http://releases.ubuntu.com/jammy/)
- [Daily Server Build](https://cdimage.ubuntu.com/ubuntu-server/daily-live/current/)
- [Daily Desktop Build](https://cdimage.ubuntu.com/daily-live/current/)

## Fonte:
- [burkeazbill project](https://github.com/burkeazbill/ubuntu-22-04-packer-fusion-workstation)

## Procedimento de criação da VM (Opção 02)

Esta opção utilizará uma imagem Docker para criar a máquina virtual 

## Build

Primeiramente crie a imagem docker

```bash
docker build -t sec4us/webapi-builder .
```

### Executando
```bash
docker run --privileged --net=host --rm -it -v $(pwd):/u01 -v $(pwd):/root/Downloads/ sec4us/webapi-builder
```
