# LeagueManager

For firebase to work correctly https://firebase.google.com/docs/cli#windows-npm.


To generate SSL certificate for dev server: https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec
(for Windows https://digitaldrummerj.me/angular-local-ssl/)

1. create folder names ssl in project root
2. openssl genrsa -des3 -out angular-dev-rootCA.key 2048
3. openssl req -x509 -new -nodes -key angular-dev-rootCA.key -sha256 -days 1024 -out angular-dev-rootCA.pem -sub "/C=RO/ST=PH/L=Cornu/O=Student/OU=Student/CN=Student"
4. Import angular-dev-rootCA.pem into Keychain Access -> System -> Certificates section
5. create server.csr.cnf with the following content
[req]
default_bits=2048
prompt=no
default_md=sha256
distinguished_name=dn

[dn]
C=RO
ST=Prahova
L=Cornu
O=Student Ltd.
OU=Student Ltd.
emailAddress=dev.stefanoiu@gmail.com
CN=localhost

6. create v3.ext with the following content
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName=@alt_names

[alt_names]
DNS.1=localhost
IP.2=192.168.xxx.xxx

7. openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )
8. openssl x509 -req -in server.csr -CA angular-dev-rootCA.pem -CAkey angular-dev-rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext