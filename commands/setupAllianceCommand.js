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

class SetupAllianceCommand extends Command {
  constructor() {
    super('SetupAllianceCommand', {
      aliases: ['setupalliance'],
      args: [
        {
            id: 'allianceid',
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
    if(args.allianceid === null || args.role === null)
    {
      message.reply("!setupalliance [alliance id] [role]\n\tExample: !alliance 498125261 @TestAlliance")
      return;
    }

    var sql = `SELECT * FROM alliances WHERE id = '${args.allianceid}'`
    
    link.query(sql, (e, r) => {
      if(e) throw(e);

      if(r.length < 1)
        return message.reply("No alliance found with that ID, someone must auth from that alliance before it can be setup.");
      
      sql = `UPDATE alliances SET roleID = '${args.role.id}' WHERE id = '${args.allianceid}'`;
      
      link.query(sql, (e, r) => {
        if(e) throw(e);
        message.reply("Alliance Setup");
      })
    });
  }
}

module.exports = SetupAllianceCommand;
