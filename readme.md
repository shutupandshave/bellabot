apt-get -yq update; apt-get -yq upgrade;
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server
npm i -g pm2
setcap CAP_NET_BIND_SERVICE=+eip /usr/bin/node
adduser --disabled-password --disabled-login --shell /dev/null bellabot
mkdir /home/bellabot/bot
cd /home/bellabot/bot
git clone https://github.com/shutupandshave/bellabot.git ./
npm i
cp config.example config.js
nano config.js
cat ./db/init_database.sql | mysql -u root

Run `mysql -u root`
Set a password by running the command below and putting a passowrd in;
`ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YOUR_PASSWORD';`
then run `FLUSH PRIVILEGES;`
then `\q`

pm2 init
pm2 startup
pm2 start -u bellabot bot.js
pm2 save
