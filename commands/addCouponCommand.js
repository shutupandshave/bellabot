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

class AddCouponCommand extends Command {
  constructor() {
    super('addcoupon', {
      aliases: ['addcoupon'],
      args: [
        {
            id: 'code',
            type: 'string'
        },
        {
            id: 'value',
            type: 'number'
        },
    ],
    userPermissions: ['ADMINISTRATOR'],
    });
  }

  exec(message, args) {
    
    if(args.code === null || args.value === null)
    {
      message.reply("!addcoupon [coupon code] [coupon value]\n\tExample: w!addcoupon IbnIsAmazing 69")
      return;
    }

    var sql = `SELECT * FROM coupons WHERE channelID = '${message.channel.id}'`
    
    link.query(sql, (e, r) => {
      if(e) throw(e);

      if(r.length > 0)
      {
        sql = `UPDATE coupons SET code = '${args.code}', couponValue =  ${args.value} WHERE channelID = '${message.channel.id}'`;
      }
      else
      {
        sql = `INSERT INTO coupons (code, channelID, couponValue) VALUES ('${args.code}', '${message.channel.id}', ${args.value})`;
      }
      link.query(sql, (e, r) => {
        if(e) throw(e);
        message.reply("Coupon Updated");
      })
    });
  }
}

module.exports = AddCouponCommand;
