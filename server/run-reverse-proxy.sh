#!/bin/bash
CONTAINER_NAME="caddy-server-reverse-proxy"
docker rm -f $CONTAINER_NAME
PRIMARY_IP=$(hostname -I | cut -d' ' -f1)
cat > Caddyfile <<EOF
$PRIMARY_IP {
	reverse_proxy 127.0.0.1:3000
	tls internal
}
EOF
docker run -d --name $CONTAINER_NAME --network host -v $PWD/Caddyfile:/etc/caddy/Caddyfile:z caddy
echo "Caddy reverse proxy server started, listening on https://$PRIMARY_IP"
echo "To stop the server, remove the $CONTAINER_NAME docker container"