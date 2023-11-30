variables {
    accelerator = "kvm"
    cpus = 4
    disk_size = 51200
    headless = false
    memory = 8192
    name = "{{ env `NAME` }}"
    packer_images_output_dir = "{{ env `PACKER_IMAGES_OUTPUT_DIR` }}"
    packer_templates_logs = "{{ env `LOGDIR` }}"
    preseed_file_name = "preseed.cfg"
    ssh_password = "webapi"
    ssh_username = "webapi"
    ubuntu_images_url = "{{ env `UBUNTU_IMAGES_URL` }}"
  }

source "virtualbox-iso" "webapi" {

  // VM Info:
  vm_name       = "webapi-2023-11-30"
  guest_os_type = "ubuntu64Guest"
  headless      = false
  // Virtual Hardware Specs
  memory        = var.memory
  cpus          = var.cpus
  disk_size     = var.disk_size
  guest_additions_path =  "VBoxGuestAdditions_{{.Version}}.iso"
  hard_drive_interface = "sata"
  format               = "ova"

  // ISO Details
  iso_urls =[
          "file:c:/temp/jammy-live-server-amd64.iso",
          "https://cdimage.ubuntu.com/ubuntu-server/jammy/daily-live/current/jammy-live-server-amd64.iso"]
  iso_checksum = "sha256:57241d205a8949d612d9ed39b7bbbcb50bd7977b695528c964858ee4a5328c91"
  iso_target_path   = "c:/temp/"
  output_directory  = "./output-virtualbox"
  http_directory    = "http"
  ssh_username      = "webapi"
  ssh_password      = "webapi"
  shutdown_command  = "sudo shutdown -P now"
  ssh_pty           = "true"
  ssh_timeout       = "30m"
  ssh_handshake_attempts = "20"

  boot_wait = "5s"
  boot_command = [
    "c<wait>",
    "linux /casper/vmlinuz --- autoinstall ds=\"nocloud-net;seedfrom=http://{{.HTTPIP}}:{{.HTTPPort}}/\"",
    "<enter><wait>",
    "initrd /casper/initrd",
    "<enter><wait>",
    "boot",
    "<enter>"
  ]

  vboxmanage = [
    [
      "modifyvm",
      "{{.Name}}",
      "--nictype1",
      "virtio"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--memory",
      "${var.memory}"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--cpus",
      "${var.cpus}"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--graphicscontroller",
      "vmsvga"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--vram",
      "128"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--ioapic",
      "on"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--rtcuseutc",
      "on"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--accelerate3d",
      "off"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--nested-hw-virt",
      "on"
    ],
    [
      "modifyvm",
      "{{.Name}}",
      "--clipboard",
      "bidirectional"
    ],
    [
      "setextradata",
      "global",
      "GUI/MaxGuestResolution",
      "any"
    ],
    [
      "setextradata",
      "{{.Name}}",
      "CustomVideoMode1",
      "1024x768x32"
    ]
  ]
}

build {
  sources = ["sources.virtualbox-iso.webapi"]

  provisioner "shell" {
    inline = ["while [ ! -f /var/lib/cloud/instance/boot-finished ]; do echo 'Waiting for cloud-init...'; sleep 1; done"]
  }

  provisioner "shell" {
    inline = ["wget --no-cache -q -O- https://raw.githubusercontent.com/sec4us-training/web-api-linux/main/deploy.sh | sudo bash"]
  }

  provisioner "file" {
    source = "/tmp/web_api_ssh_key.pem"
    destination = "web_api_ssh_key.pem"
    direction = "download"
  }

  provisioner "file" {
    source = "/tmp/web_api_ssh_key.pub"
    destination = "web_api_ssh_key.pub"
    direction = "download"
  }

}
