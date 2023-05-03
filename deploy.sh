#!/bin/bash


usage()
{
    echo "usage: wget --no-cache -q -O- https://raw.githubusercontent.com/sec4us-training/web-api-linux/main/deploy.sh | sudo bash"
}


W='\033[0m'  # white (normal)
R='\033[31m' # red
G='\033[32m' # green
O='\033[33m' # orange
B='\033[34m' # blue
P='\033[35m' # purple
C='\033[36m' # cyan
GR='\033[37m' # gray
D='\033[2m'   # dims current color. {W} resets.

OK=$(echo -e "${W}${D}[${W}${G}+${W}${D}]${W}")
ERROR=$(echo -e "${O}[${R}!${O}]${W}")
WARN=$(echo -e "${W}[${C}?${W}]")
DEBUG=$(echo -e "${D}[${W}${B}*${W}${D}]${W}")

unset ansible_user
unset key
unset ip

echo "IF9fX19fICAgICAgICAgICAgIF9fXyBfICAgXyBfX19fXwovICBfX198ICAgICAgICAgICAvICAgfCB8IHwgLyAgX19ffApcIGAtLS4gIF9fXyAgX19fIC8gL3wgfCB8IHwgXCBgLS0uCiBgLS0uIFwvIF8gXC8gX18vIC9ffCB8IHwgfCB8YC0tLiBcCi9cX18vIC8gIF9fLyAoX19cX19fICB8IHxffCAvXF9fLyAvClxfX19fLyBcX19ffFxfX198ICAgfF8vXF9fXy9cX19fXy8K" | base64 -d
echo " "
echo "Treinamento: Web API Exploitation"
echo "Linux Deploy"
echo " "
echo "Copyright © Sec4US® - Todos os direitos reservados. Nenhuma parte dos materiais disponibilizadas, incluindo este script, servidor, suas aplicações e seu código fonte, podem ser copiadas, publicadas, compartilhadas, redistribuídas, sublicenciadas, transmitidas, alteradas, comercializadas ou utilizadas para trabalhos sem a autorização por escrito da Sec4US"

if [ "$(id -u)" -ne 0 ]; then 
  echo -e "\n${ERROR} ${O}Execute este script como root${W}\n"
  exit 1; 
fi

ansible_user=$(whoami)
status_file=$(pwd)/executed.txt

echo -e "\n${OK} Atualizando servidor"

apt update && apt -y upgrade
apt install -y ansible openssh-client openssh-server

echo -e "\n${OK} Configurando SSH"
systemctl enable ssh
systemctl start ssh


echo -e "\n${OK} Instalando dependencias Ansible"
ansible-galaxy collection install community.general
ansible-galaxy collection install ansible.posix
ansible-galaxy collection install ansible.windows
ansible-galaxy collection install community.windows

echo -e "\n${OK} Gerando chaves SSH"
key="/tmp/sshkey"
ssh-keygen -b 2048 -t rsa -f $key -q -N ""

echo -e "\n${OK} Iniciando deploy"

ip="127.0.0.1"

# remove a linha ansible_user do vars.yml
cp vars.yml vars_old.yml
grep -i -v "ansible_user" vars_old.yml > vars.yml

SSH_FILE=$key
# Verifica se o arquivo da chave SSH existe
if [ ! -f "$SSH_FILE" ]; then
    echo -e "${ERROR} ${O}Arquivo de chave privada do SSH inexistente: ${C}${SSH_FILE}${W}\n"
    exit 1
fi

SSH_FILE_PUB="$key.pub"
# Verifica se o arquivo da chave SSH existe
if [ ! -f "$SSH_FILE_PUB" ]; then
    echo -e "${ERROR} ${O}Arquivo de chave pública do SSH inexistente: ${C}${SSH_FILE_PUB}${W}\n"
    exit 1
fi

cp -f $SSH_FILE ssh_key.pem
cp -f $SSH_FILE_PUB ssh_key.pub

ansible_path=`command -v ansible-playbook 2> /dev/null`
if [ "$?" -ne "0" ] || [ "W$ansible_path" = "W" ]; then
  ansible_path=`which ansible-playbook 2> /dev/null`
  if [ "$?" -ne "0" ]; then
    ansible_path=""
  fi
fi
if [ "W$ansible_path" = "W" ]; then
  echo -e "${ERROR} ${O}A aplicação ansible-playbook parece não estar instalada.${W}\n\n"
  echo "Em ambientes debian/ubuntu, realize a instalação com os comandos abaixo:"
  echo "sudo apt install ansible"
  echo "ansible-galaxy collection install community.general"
  echo "ansible-galaxy collection install ansible.posix"
  echo "ansible-galaxy collection install ansible.windows"
  echo "ansible-galaxy collection install community.windows"
  echo " "
  exit 1
fi

echo -e "\n${OK} Instalando dependencias do ansible"
grep "ansible_deps" "$status_file" >/dev/null 2>&1
if [ "$?" == "0" ]; then
    echo -e "${DEBUG} ${C}Pulando instalação...${W}"
else
    ansible-galaxy collection install community.general
    ansible-galaxy collection install ansible.posix
    ansible-galaxy collection install ansible.windows
    ansible-galaxy collection install community.windows
    echo "ansible_deps" >> "$status_file"
    echo -e "${OK} ${G}OK${W}"
fi

echo -e "\n${OK} Verificando conectividade com o IP ${O}${ip}${W}"
chmod 400 "$SSH_FILE" 1>/dev/null 2>&1
check1=$(ssh -o StrictHostKeyChecking=no -o PasswordAuthentication=no -i $SSH_FILE $ansible_user@$ip "whoami")
if [ "$ansible_user" != "$check1" ]; then
    echo -e "\n${ERROR} ${O}Falha autenticando remotamente com o usuário ${C}${ansible_user}${O} em ${C}${ip}${O}!${W}\n"
    exit 1
else
    echo -e "${OK} ${G}OK${W}"
fi

echo -e "\n${OK} Verificando permissões de acesso do usuário"
check2=$(ssh -o StrictHostKeyChecking=no -o PasswordAuthentication=no -i $SSH_FILE $ansible_user@$ip "whoami")
if [ "$check2" != "root" ]; then
    check2=$(ssh -o StrictHostKeyChecking=no -i $SSH_FILE $ansible_user@$ip "sudo whoami")
    if [ "$check2" != "root" ]; then
        echo -e "\n${ERROR} ${O}Usuário ${C}${ansible_user} ${O}não tem permissão para executar comandos como root!${W}\n"
        exit 1
    fi
else
    echo -e "${OK} ${G}OK${W}"
fi

echo -e "\n${OK} Realizando o download dos scripts"
git clone https://github.com/sec4us-training/web-api-linux.git /tmp/
pushd /tmp/web-api-linu

echo -e "\n${OK} Verificando senha padrão no arquivo vars.yml"
password=$(cat vars.yml | grep default_password | cut -d '"' -f2)
if [ "$?" -ne "0" ] || [ "W$password" = "W" ]; then
  echo -e "\n${ERROR} ${O}Senha do usuário ${C}webapi ${O}não definida no parâmetro ${C}'default_password' ${O}do arquivo vars.yml${W}\n"
  exit 1
else
    echo -e "${OK} ${G}OK${W}"
fi

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

# Step 1 - base
echo -e "\n${OK} Executando passo 1 - setup_base.yml"
grep "step1_base" "$status_file" >/dev/null 2>&1
if [ "$?" == "0" ]; then
    echo -e "${DEBUG} ${C}Pulando passo 1...${W}"
else
    ansible-playbook -i $ip,  --private-key $SSH_FILE  --extra-vars ansible_user=$ansible_user  --ssh-extra-args '-o StrictHostKeyChecking=no  -o UserKnownHostsFile=/dev/null' setup_base.yml
    if [ "$?" != "0" ]; then
        echo -e "${ERROR} ${O} Erro executando ansible setup base${W}\n"
        exit 1
    fi
    echo "step1_base" >> "$status_file"
    echo -e "${OK} ${G}OK${W}"
fi

# Step 2 - Tools
echo -e "\n${OK} Executando passo 2 - setup_tools.yml"
grep "step2_tools" "$status_file" >/dev/null 2>&1
if [ "$?" == "0" ]; then
    echo -e "${DEBUG} ${C}Pulando passo 2...${W}"
else
    ansible-playbook -i $ip,  --private-key $SSH_FILE  --extra-vars ansible_user=$ansible_user  --ssh-extra-args '-o StrictHostKeyChecking=no  -o UserKnownHostsFile=/dev/null' setup_tools.yml
    if [ "$?" != "0" ]; then
        echo -e "${ERROR} ${O} Erro executando ansible tools${W}\n"
        exit 1
    fi
    echo "step2_tools" >> "$status_file"
    echo -e "${OK} ${G}OK${W}"
fi

# Step 3 - API1
echo -e "\n${OK} Executando passo 3 - setup_api1.yml"
grep "step3_api1" "$status_file" >/dev/null 2>&1
if [ "$?" == "0" ]; then
    echo -e "${DEBUG} ${C}Pulando passo 3...${W}"
else
    ansible-playbook -i $ip,  --private-key $SSH_FILE  --extra-vars ansible_user=$ansible_user  --ssh-extra-args '-o StrictHostKeyChecking=no  -o UserKnownHostsFile=/dev/null' setup_api1.yml
    if [ "$?" != "0" ]; then
        echo -e "${ERROR} ${O} Erro executando ansible API1 setup${W}\n"
        exit 1
    fi
    echo "step3_api1" >> "$status_file"
    echo -e "${OK} ${G}OK${W}"
fi


# Step 4 - API2
echo -e "\n${OK} Executando passo 4 - setup_api2.yml"
grep "step4_api2" "$status_file" >/dev/null 2>&1
if [ "$?" == "0" ]; then
    echo -e "${DEBUG} ${C}Pulando passo 4...${W}"
else
    ansible-playbook -i $ip,  --private-key $SSH_FILE  --extra-vars ansible_user=$ansible_user  --ssh-extra-args '-o StrictHostKeyChecking=no  -o UserKnownHostsFile=/dev/null' setup_api2.yml
    if [ "$?" != "0" ]; then
        echo -e "${ERROR} ${O} Erro executando ansible API2 setup${W}\n"
        exit 1
    fi
    echo "step4_api2" >> "$status_file"
    echo -e "${OK} ${G}OK${W}"
fi

# Step 5 - API Auth
echo -e "\n${OK} Executando passo 5 - setup_apiauth.yml"
grep "step5_apiauth" "$status_file" >/dev/null 2>&1
if [ "$?" == "0" ]; then
    echo -e "${DEBUG} ${C}Pulando passo 5...${W}"
else
    ansible-playbook -i $ip,  --private-key $SSH_FILE  --extra-vars ansible_user=$ansible_user  --ssh-extra-args '-o StrictHostKeyChecking=no  -o UserKnownHostsFile=/dev/null' setup_apiauth.yml
    if [ "$?" != "0" ]; then
        echo -e "${ERROR} ${O} Erro executando ansible API Auth setup${W}\n"
        exit 1
    fi
    echo "step5_apiauth" >> "$status_file"
    echo -e "${OK} ${G}OK${W}"
fi

# Step 6 - OAuth Bank
echo -e "\n${OK} Executando passo 6 - setup_bank.yml"
grep "step6_bank" "$status_file" >/dev/null 2>&1
if [ "$?" == "0" ]; then
    echo -e "${DEBUG} ${C}Pulando passo 6...${W}"
else
    ansible-playbook -i $ip,  --private-key $SSH_FILE  --extra-vars ansible_user=$ansible_user  --ssh-extra-args '-o StrictHostKeyChecking=no  -o UserKnownHostsFile=/dev/null' setup_bank.yml
    if [ "$?" != "0" ]; then
        echo -e "${ERROR} ${O} Erro executando ansible Bank setup${W}\n"
        exit 1
    fi
    echo "step6_bank" >> "$status_file"
    echo -e "${OK} ${G}OK${W}"
fi


# Step 7 - RDP
echo -e "\n${OK} Executando passo 7 - setup_rdp.yml"
grep "step7_rdp" "$status_file" >/dev/null 2>&1
if [ "$?" == "0" ]; then
    echo -e "${DEBUG} ${C}Pulando passo 7...${W}"
else
    ansible-playbook -i $ip,  --private-key $SSH_FILE  --extra-vars ansible_user=$ansible_user  --ssh-extra-args '-o StrictHostKeyChecking=no  -o UserKnownHostsFile=/dev/null' setup_rdp.yml
    if [ "$?" != "0" ]; then
        echo -e "${ERROR} ${O} Erro executando ansible RDP setup${W}\n"
        exit 1
    fi
    echo "step7_rdp" >> "$status_file"
    echo -e "${OK} ${G}OK${W}"
fi

popd

echo -e "\n\n${OK} Deploy finalizado!\n"
echo -e "${OK} Credenciais"
echo -e "     ${C}Usuário.:${O} webapi${W}"
echo -e "     ${C}Senha...:${O} ${password}${W}"
echo ""
echo -e "${OK} Acessos"
echo -e "     ${C}IP......:${O} ${ip}${W}"
echo -e "     ${C}SSH.....:${O} Porta 22${W}"
echo -e "     ${C}RDP.....:${O} Porta 48389${W}"
echo -e "     ${C}Proxy...:${O} Porta 48284${W}"
echo " "
