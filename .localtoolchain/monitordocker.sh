#!/bin/bash

docker start logspout || docker run -d --name="logspout" \
	--volume=/var/run/docker.sock:/var/run/docker.sock \
	--publish=127.0.0.1:8000:80 \
	--network=cp-stack-network \
	--ip 172.25.0.42   \
	gliderlabs/logspout  

curl http://127.0.0.1:8000/logs
    
# https://github.com/gliderlabs/logspout/tree/master/httpstream