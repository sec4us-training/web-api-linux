source "vmware-iso" "webapi" {
  // Docs: https://www.packer.io/plugins/builders/vmware/iso

  // VM Info:
  vm_name       = "webapi"
  # guest_os_type = "ubuntu64Guest"
  version       = "16"
  headless      = true
  // Virtual Hardware Specs
  memory        = 6144
  cpus          = 2
  cores         = 2
  disk_size     = 30720
  sound         = true
  disk_type_id  = 0
  
  // ISO Details
  iso_urls =[
          "file:/temp/jammy-live-server-amd64.iso",
          "https://cdimage.ubuntu.com/ubuntu-server/jammy/daily-live/current/jammy-live-server-amd64.iso"]
  iso_checksum = "sha256:e295c010cd8aca7afdb72a4aafe22b8daebc6d8e19b2286459ced9643231dd8e"
  iso_target_path   = "c:/temp/"
  output_directory  = "./output-vmware"
  snapshot_name     = "clean"  
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
}

build {
  sources = ["sources.vmware-iso.webapi"]
  
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

  post-processors {
    post-processor "compress" {
      keep_input_artifact = false
      output = "{{.BuildName}}.zip"
    }
  }


}
