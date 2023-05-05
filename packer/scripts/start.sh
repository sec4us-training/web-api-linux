#!/bin/bash

set -e

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

echo -e "${O}===================================================${W}"
echo -e "${O} Iniciando script Docker ${W}"
echo -e "${O}===================================================${W}"

echo -e "\n${OK} Clonando repositório"
git clone https://github.com/sec4us-training/web-api-linux.git /tmp/web-api-linux
if [ "$?" != "0" ]; then
    echo -e "${ERROR} ${O} Erro clonando repositório${W}\n"
    info
    exit 1
fi
cd /tmp/web-api-linux

VM="workstation"
VBOX=$(vboxmanage --version)
if [ "$?" == "0" ]; then
    VM="virtualbox"
fi

echo -e "\n${OK} VM platform: ${VM}"

echo -e "\n${OK} Localizando script de inicialização"
BUILD_FILE=$(find /tmp/web-api-linux -type f -name "build.sh" | grep ubuntu | grep packer | grep "${VM}")
if [ ! -f "$BUILD_FILE" ]; then
    echo -e "${ERROR} ${O}Arquivo de build não localizado${W}\n"
    exit 1
fi

pushd $(dirname $BUILD_FILE)

/bin/bash $BUILD_FILE

popd