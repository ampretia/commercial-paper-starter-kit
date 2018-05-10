PM2_HOME=.pm2 pm2 stop scripts/ldap.js || true
docker rm -f mongo || true