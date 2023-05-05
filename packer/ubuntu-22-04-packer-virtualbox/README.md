
## Pré-requisitos

Você deve ter instalado em seu sistema os sequintes pacotes:
- VirtualBox
- Hashicorp Packer (Version 1.8.6 é o atual quando criamos este procedimento)

## Procedimento de criação da VM

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

- **output-virtualbox**: Diretório contendo o OVF e VMDK da máquina virtual pronta para importação em seu VirtualBox.
- **webapi.zip**: Arquivo compactado contendo OVF e VMDK da máquina virtual pronta para importação em seu VirtualBox.
- **web_api_ssh_key.pem**: Chave privada SSH para autenticação como o usuário webapi. `ssh -i web_api_ssh_key.pem webapi@ip_do_servidor`

**Nota:** Como o OVF é um padrão aberto a máquina virtual poderá ser importada em outras plataformas como VmWare, Hyper-V e etc, porém nessas plataformas recomendamos que seja desinstalado o VBoxGuest Adittions e instalado o pacote de cada plataforma, como o VmWare Tools (para VMWare).

## Basicamente o que este script e o Packer realizarão?

- Realiza o download da imagem ISO do Ubuntu 22.04 LTS Server
- Verifica a integridade da imagem através do seu checksum do site oficial
- Atualiza o arquivo de configuração com o Checksum da ISO, diretório de Downloads, Usuário inicial, Senha inicial e etc.
- Realiza a criação da máquina virtual no VirtualBox
- Define o usuário de build/ssh para permitir sudo sem solicitar senha
- Redefine o tamanho do disco lógico para utilizar 100% do disco virtual atribuido
- Instala as depenências base: openssh-server, open-fm-tools, cloud-init, whois, zsh, wget, tasksel, ansible, python3
- Instala todo o ambiente do treinamento Web API Exploitation utilizando o script [deploy.sh](../../deploy.sh)


## Ubuntu Download Pages
- [Jammy Releases](http://releases.ubuntu.com/jammy/)
- [Daily Server Build](https://cdimage.ubuntu.com/ubuntu-server/daily-live/current/)
- [Daily Desktop Build](https://cdimage.ubuntu.com/daily-live/current/)
