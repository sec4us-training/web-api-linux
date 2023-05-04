# WEB API Exploitation - Training Labs

## Copyright © Sec4US®

Todos os direitos reservados. Nenhuma parte dos materiais disponibilizadas, incluindo este repositório, scripts, servidor, suas aplicações e seu código fonte, podem ser redistribuídas, sublicenciadas, transmitidas, alteradas, comercializadas ou utilizadas para trabalhos sem a autorização por escrito da Sec4US

## Sobre

Este é um procedimento que realiza a configuração completa de um servidor Linux para as práticas de testes de invasão (Pentest) realizados durante o treinamento de Web API Exploitation da Sec4US.

Conheça mais sobre nosso treinamento em: https://sec4us.com.br/treinamentos/web-api-exploitation/

## Ambiente

Estes scripts visam automatizar o processo de criação da máquina virtual e sua instalação.


## Instalação das dependencias

### macOS

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/packer
```

### Ubuntu

```bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install packer
```

#### Outras plataformas (Windows e etc)

https://developer.hashicorp.com/packer/downloads?product_intent=packer


## Criação da máquina virtual

Após a instalação do packer (conforme item acima), verifique o procedimento específico de cada plataforma conforme abaixo:

- [VMware Fusion (Apple Users) or VMware Worksation (Windows/Linux users)](ubuntu-22-04-packer-fusion-workstation/README.md)


