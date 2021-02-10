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

class CouponCommand extends Command {
  constructor() {
    super('coupon', {
      aliases: ['coupon']
    });
  }

  exec(message) {
    
    var couponCode = "No coupon code available."
    var sql = `SELECT * FROM coupons WHERE channelID = ${message.channel.id}`;
    console.log(sql);
    link.query(sql, (e, r) => {
      if(e) throw(e);


      if(r.length < 1)
        return message.reply(couponCode);

        console.log(r);
      couponCode = `For ${r[0].couponValue}% off use coupon code ${r[0].code}.`;
      return message.reply(couponCode);
    })
  }
}

module.exports = CouponCommand;
