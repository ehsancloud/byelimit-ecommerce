ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJzSjfPInYSC8z11DrmDzDWhvNPAXZ2F2LwR/6N3UgzB vps-key


DB password: 00PtFlvx9Jq1xHdaKsagJVMi

root@ubuntu-byelimit:/var/www/byelimit/Backend# sudo sed -n '1p' /var/www/byelimit/Backend/.env
DATABASE_URL="postgresql://byelimit_user:00PtFlvx9Jq1xHdaKsagJVMi@127.0.0.1:5432/byelimit_db"
