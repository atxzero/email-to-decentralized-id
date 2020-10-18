cd ~/PROD/EMAIL-TO-DID/email-to-decentralized-id

git pull

npm install

pm2 stop mypass
pm2 start app.js --name mypass

echo ~~FINISHED~~