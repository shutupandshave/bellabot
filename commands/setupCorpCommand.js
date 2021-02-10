const { Command } = require('discord-akairo');
const mysql = require('mysql');
const Config = require('../config');

let link = mysql.createConnection({
  host: Config.MySQL.hostname,
  user: Config.MySQL.username,
  password: Config.MySQL.password,
  database: Config.MySQL.database
});

link.connect((e) => {
  if(e) throw e;});

class SetupCorpCommand extends Command {
  constructor() {
    super('SetupCorpCommand', {
      aliases: ['setupcorp'],
      args: [
        {
            id: 'corpid',
            type: 'number'
        },
        {
            id: 'role',
            type: 'role'
        },
    ],
    userPermissions: ['ADMINISTRATOR'],
    });
  }

  exec(message, args) {
    if(args.corpid === null || args.role === null)
    {
      message.reply("!setupcorp [corp id] [role]\n\tExample: !setupcorp 263585335 @BlackOmegaSecurity")
      return;
    }

    var sql = `SELECT * FROM corporations WHERE id = '${args.corpid}'`
    
    link.query(sql, (e, r) => {
      if(e) throw(e);

      if(r.length < 1)
        return message.reply("No corp found with that ID, someone must auth from that corp before it can be setup.");
      
      sql = `UPDATE corporations SET roleID = '${args.role.id}' WHERE id = '${args.corpid}'`;
      
      link.query(sql, (e, r) => {
        if(e) throw(e);
        message.reply("Corp Setup");
      })
    });
  }
}

module.exports = SetupCorpCommand;
