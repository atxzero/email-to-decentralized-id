cd ~/EMAIL-TO-DID/email-to-decentralized-id

git pull

npm install

pm2 stop emailtodid
pm2 start app.js --name emailtodid

echo ~~FINISHED~~