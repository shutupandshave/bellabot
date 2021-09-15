const { Command } = require('discord-akairo');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const Config = require('../config');

class reauthCommand extends Command {
  constructor() {
    super('reauth', {
      aliases: ['reauth']
    });
  }

  exec(message) {
    let link = mysql.createConnection({
      host: Config.MySQL.hostname,
      user: Config.MySQL.username,
      password: Config.MySQL.password,
      database: Config.MySQL.database
    });
    link.connect((e) => {
      if (e) throw e;
    });
    let myUUID = uuidv4();
    message.author.send(`Welcome to the server, http://${Config.HTTP.Hostname}/auth/${myUUID}`);
    let SQL = "INSERT INTO users (id, UUID) VALUES ('" + message.author.id + "', '" + myUUID + "')";
    console.log(SQL);
    link.query(SQL, (e, r) => {
      if (e && e.errno !== 1062) {
        throw e;
      }
    });
    console.log(`http://${Config.HTTP.Hostname}/auth/${myUUID}`);
  }
}

module.exports = reauthCommand;
