#!/usr/bin/env bash -e
# Set your variables as desired here:
VM_BASE_NAME="webapi"
VM_HOSTNAME="webapi"
# Specify where the ISO should download to (or where you already have downloaded it to)
DOWNLOADS_FOLDER="${HOME}/Downloads"
GUEST_USERNAME="webapi"
GUEST_PASSWORD="webapi"
# Caution: The Encrypted PW following - when you regenerate it, if it has a / in it, then the sed command I use down below doesn't work!
# You must escape each "/" with a "\" See the following example, then compare what is output into your user-data file
GUEST_ENCRYPTED_PW='$6$M8D0rc1UaTM29W9I$wSxBvq1KXB5j.LXeLcdjuEwPXouUEtvDI5uhRwSjQP0yfUOLmHRiN.y\/NNk.TMBkVBkh\/z9Gxd3pT1kLQcgZx.'
# The Encrypted password above is created using the following command (NOTE: mkpasswd part of whois package in Ubuntu):
# echo 'webapi' | mkpasswd -m sha-512 --stdin
VM_SUFFIX=`date +"%Y-%m-%d"`
BUILD_SUFFIX=`date +"%Y-%m-%d-%H-%M"`

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


# Backup the current config files:
cp ubuntu-2204-daily.pkr.hcl ubuntu-2204-daily.pkr.hcl.bak
cp http/user-data http/user-data.bak

# Let's make sure the ISO we're trying to use has the correct/current checksum:
ISO="jammy-live-server-amd64.iso"
DAILY_ISO="https://cdimage.ubuntu.com/ubuntu-server/jammy/daily-live/current/${ISO}"
DAILY_ISO_CHECKSUM=`curl -s https://cdimage.ubuntu.com/ubuntu-server/jammy/daily-live/current/SHA256SUMS | grep "${ISO}" | awk '{print $1}'`
# Now do some search and replace to customize (I know this can be done with variables.pkrvars.hcl, but keeping things extra simple for now)
if [ `uname -s` == "Darwin" ]; then
  sed -i "" "s/iso_checksum = .*/iso_checksum = \"sha256:$DAILY_ISO_CHECKSUM\"/" "ubuntu-2204-daily.pkr.hcl"
  sed -i "" "s|https://cdimage.ubuntu.com/ubuntu-server/jammy/daily-live/current/jammy-live-server-amd64.iso|${DAILY_ISO}|g" "ubuntu-2204-daily.pkr.hcl"
  sed -i "" "s|jammy-live-server-amd64.iso|${ISO}|g" "ubuntu-2204-daily.pkr.hcl"
  sed -i "" "s/vm_name       = .*/vm_name       = \"${VM_BASE_NAME}-${VM_SUFFIX}\"/" "ubuntu-2204-daily.pkr.hcl"
  sed -i "" "s/  ssh_username      = .*/  ssh_username      = \"${GUEST_USERNAME}\"/" "ubuntu-2204-daily.pkr.hcl"
  sed -i "" "s/  ssh_password      = .*/  ssh_password      = \"${GUEST_PASSWORD}\"/" "ubuntu-2204-daily.pkr.hcl"
  sed -i "" "s|/Users/m4v3r1ck/Downloads|${DOWNLOADS_FOLDER}|g" "ubuntu-2204-daily.pkr.hcl"
  sed -i "" "s/    hostname: .*/    hostname: ${VM_HOSTNAME}/g" "./http/user-data"
  sed -i "" "s/    username: .*/    username: ${GUEST_USERNAME}/g" "./http/user-data"
  sed -i "" "s/vmadmin/${GUEST_USERNAME}/g" "./http/user-data"
  sed -i "" "s/    password: .*/    password: ${GUEST_ENCRYPTED_PW}/g" "./http/user-data"
else
  sed -i "s/iso_checksum = .*/iso_checksum = \"sha256:$DAILY_ISO_CHECKSUM\"/" "ubuntu-2204-daily.pkr.hcl"
  sed -i "s|https://cdimage.ubuntu.com/ubuntu-server/jammy/daily-live/current/jammy-live-server-amd64.iso|${DAILY_ISO}|g" "ubuntu-2204-daily.pkr.hcl"
  sed -i "s|jammy-live-server-amd64.iso|${ISO}|g" "ubuntu-2204-daily.pkr.hcl"
  sed -i "s/vm_name       = .*/vm_name       = \"${VM_BASE_NAME}-${VM_SUFFIX}\"/" "ubuntu-2204-daily.pkr.hcl"
  sed -i "s/  ssh_username      = .*/  ssh_username      = \"${GUEST_USERNAME}\"/" "ubuntu-2204-daily.pkr.hcl"
  sed -i "s/  ssh_password      = .*/  ssh_password      = \"${GUEST_PASSWORD}\"/" "ubuntu-2204-daily.pkr.hcl"
  sed -i "s|/Users/m4v3r1ck/Downloads|${DOWNLOADS_FOLDER}|g" "ubuntu-2204-daily.pkr.hcl"
  sed -i "s/    hostname: .*/    hostname: ${VM_HOSTNAME}/g" "./http/user-data"
  sed -i "s/    username: .*/    username: ${GUEST_USERNAME}/g" "./http/user-data"
  sed -i "s/vmadmin/${GUEST_USERNAME}/g" "./http/user-data"
  sed -i "s/    password: .*/    password: ${GUEST_ENCRYPTED_PW}/g" "./http/user-data"
fi

### Build an Ubuntu Server 22.04 LTS Template for VMware Fusion. ###
echo -e "${O}===================================================${W}"
echo -e "${O} Building an WEB API Server Template for VMware... ${W}"
echo -e "${O}===================================================${W}"

export PACKER_LOG=1
export PACKER_LOG_PATH="packerlog.txt"

packer build -force "./"
### All done ###
cp ubuntu-2204-daily.pkr.hcl ubuntu-2204-daily.pkr.hcl-${BUILD_SUFFIX}.bak
cp http/user-data http/user-data-${BUILD_SUFFIX}.bak

mv ubuntu-2204-daily.pkr.hcl.bak ubuntu-2204-daily.pkr.hcl
mv http/user-data.bak http/user-data

echo -e "${O}======================================================${W}"
echo -e "${O} Done!............................................... ${W}"
echo -e "${O}======================================================${W}"
