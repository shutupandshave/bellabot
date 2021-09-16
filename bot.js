const { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } = require('discord-akairo');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const mysql = require('mysql');
const Config = require('./config');
const EsiApi = require('./esi.js');

let link = mysql.createConnection({
  host: Config.MySQL.hostname,
  user: Config.MySQL.username,
  password: Config.MySQL.password,
  database: Config.MySQL.database
});

link.connect((e) => {
  if (e) throw e;
});

class MyClient extends AkairoClient {
  constructor() {
    super(
      {
        // Options for Akairo go here.
        ownerID: '108758603258712064'
      },
      {
        // Options for discord.js goes here.
      }
    );
    this.commandHandler = new CommandHandler(this, {
      directory: './commands/',
      prefix: '!' // or ['?', '!']
    });
    this.commandHandler.loadAll();

    this.listenerHandler = new ListenerHandler(this, {
      directory: './listeners/'
    });
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler
    });
    this.listenerHandler.loadAll();

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: './inhibitors/'
    });
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.inhibitorHandler.loadAll();
  }
}

const requestListener = async function (request, response) {
  if (request.url == '/') {
    response.writeHead(200);
    return;
  }

  if (request.url.startsWith('/callback')) {
    //process oauth callback
    let parameters = request.url.split('?')[1].split('&');
    let code = '';

    parameters.forEach(async function (e, i) {
      if (e.startsWith('code')) {
        code = e.split('=')[1];
        let uuid = parameters[1].split('=')[1];

        var tokens = await EsiApi.fetchToken(code);
        var accessTokenInfo = await EsiApi.verifyToken(tokens.accessToken);
        var characterInfo = await EsiApi.GetCharacterInfo(accessTokenInfo.characterID);
        var allianceInfo = await EsiApi.GetAllianceInfo(characterInfo.alliance_id);
        var corporationInfo = await EsiApi.GetCorporationInfo(characterInfo.corporation_id);

        let allianceID = null;

        if(characterInfo.alliance_id)
        {
          allianceID = characterInfo.alliance_id;
          link.query(
            'INSERT INTO alliances (id, name, ticker) VALUES (' + characterInfo.alliance_id + ", '" + allianceInfo.name + "', '" + allianceInfo.ticker + "')",
            (e, r) => {
              if (e && e.errno !== 1062) {
                throw e;
              }
            }
          );
        }
        link.query(
          'INSERT INTO corporations (id, name, allianceID, ticker) VALUES (' +
            characterInfo.corporation_id +
            ", '" +
            corporationInfo.name +
            "', " +
            allianceID +
            ", '" +
            corporationInfo.ticker +
            "')",
          (e, r) => {
            if (e && e.errno !== 1062) {
              throw e;
            }
          }
        );
        link.query(
          "UPDATE users SET ESI_AUTH_TOKEN = '" +
            tokens.accessToken +
            "', ESI_CHAR_ID = '" +
            accessTokenInfo.characterID +
            "', ESI_CORP_ID = " +
            characterInfo.corporation_id +
            ", ESI_CHAR_NAME = '" +
            characterInfo.name +
            "' WHERE UUID = '" +
            uuid +
            "'",
          (e, r) => {
            if (e) throw e;
          }
        );

        updateCorpRoles(accessTokenInfo.characterID);
        updateAllianceRoles(accessTokenInfo.characterID);
      }
    });
  }

  if (request.url.startsWith('/auth')) {
    let ESIuuid = request.url.split('/')[2];

    //redirect to ccp
    response.writeHead(302, {
      Location:
        `https://login.eveonline.com/oauth/authorize?response_type=code&redirect_uri=http://${Config.HTTP.Hostname}/callback&client_id=` +
        Config.ESI.ClientID +
        '&state=' +
        ESIuuid
    });
  }
  response.end('\\o/');
};

function addRoles(DiscordID, RoleID) {
  if (RoleID === null || RoleID === 'null') {
    console.error('NULL RoleID');
    return;
  }
  client.guilds.fetch(Config.Discord.ServerID).then((guild) => {
    guild.members.fetch(DiscordID).then((member) => {
      guild.roles.fetch(RoleID).then((role) => {
        member.roles.add(role);
      });
    });
  });
}

function removeRoles(DiscordID, RoleID) {
  client.guilds.fetch(Config.Discord.ServerID).then((guild) => {
    guild.members.fetch(DiscordID).then((member) => {
      guild.roles.fetch(RoleID).then((role) => {
        member.roles.remove(role);
      });
    });
  });
}

function updateCorpRoles(charID) {
  let corpRole = '0',
    discordID;
  // add corporation roles
  let SQL =
    'SELECT corporations.roleID as RoleID, users.id as DiscordID FROM corporations, users WHERE users.ESI_CORP_ID = corporations.id AND users.ESI_CHAR_ID = ' +
    charID;
  link.query(SQL, (e, r) => {
    if (e) {
      throw e;
    }
    if (r.length < 1 || r[0].RoleID === null) {
      return;
    }
    corpRole = r[0].RoleID;
    discordID = r[0].DiscordID;
    addRoles(discordID, corpRole);
    // remove all existing corporation roles from the user except the current one
  });

  SQL = "SELECT roleID FROM corporations WHERE roleID NOT IN ('" + corpRole + "')";
  link.query(SQL, (e, r) => {
    if (e) {
      throw e;
    }
    if (r.length < 1) {
      return;
    }
    for (let i = 0; i < r.length; i++) {
      removeRoles(discordID, r[i].roleID);
    }
  });
}

function updateAllianceRoles(charID) {
  // remove all existing alliance roles from the user except the current one

  // add corporation roles
  let SQL =
    'SELECT users.id as DiscordID, alliances.roleID as RoleID FROM corporations, users, alliances WHERE corporations.allianceID = alliances.id AND users.ESI_CORP_ID = corporations.id AND users.ESI_CHAR_ID = ' +
    charID;
  link.query(SQL, (e, r) => {
    if (e) throw e;

    if (r.length < 1 || r[0].RoleID === null) return;

    addRoles(r[0].DiscordID, r[0].RoleID);
  });
}

const server = http.createServer(requestListener);
server.listen(Config.HTTP.Port);

//END HTTP SETUP

function createAuthLink(member) {
  let myUUID = uuidv4();
  console.log(`New User "${member.user.username}" has joined "${member.guild.name}"`);
  client.users.cache
    .get(member.id)
    .send(`Welcome to the server please use the following link to authenticate yourself! http://${Config.HTTP.Hostname}/auth/${myUUID}`);

  link.query("INSERT INTO users (id, UUID) VALUES ('" + member.id + "', '" + myUUID + "')", (e, r) => {
    if (e) throw e;
  });
  member.guild.channels.cache.get(Config.Discord.DebugChannelID).send(`"${member.user.username}" has joined this server`);
}

async function updateUserInfo() {
  link.query(
    'SELECT users.id, users.ESI_CHAR_ID, users.ESI_CORP_ID, corporations.allianceID FROM users, corporations WHERE users.ESI_CORP_ID = corporations.id',
    async (e, r) => {
      var characterInfo, corporationInfo, allianceInfo;
      for (var i = 0; i < r.length; i++) {
        characterInfo = await EsiApi.GetCharacterInfo(r[i].ESI_CHAR_ID);
        corporationInfo = await EsiApi.GetCorporationInfo(characterInfo.corporation_id);

        if (!corporationInfo.alliance_id)
          corporationInfo.alliance_id = 'null';
        else
          allianceInfo = await EsiApi.GetAllianceInfo(corporationInfo.alliance_id);

        if (r[i].ESI_CORP_ID != characterInfo.corporation_id || r[i].allianceID != corporationInfo.alliance_id) {
          if (corporationInfo.alliance_id !== 'null')
            link.query(
              'INSERT INTO alliances (id, name, ticker) VALUES (' + characterInfo.alliance_id + ", '" + allianceInfo.name + "', '" + allianceInfo.ticker + "')",
              (e, r) => {
                if (e && e.errno !== 1062) {
                  throw e;
                }
              }
            );

          link.query(
            'INSERT INTO corporations (id, name, allianceID, ticker) VALUES (' +
              characterInfo.corporation_id +
              ", '" +
              corporationInfo.name +
              "', " +
              corporationInfo.alliance_id +
              ", '" +
              corporationInfo.ticker +
              "')",
            (e, r) => {
              if (e && e.errno !== 1062) {
                throw e;
              }
            }
          );

          link.query(`UPDATE users SET ESI_CORP_ID = ${characterInfo.corporation_id} WHERE id = ${r[i].id}`, async (e, r) => {
            if (e) throw e;
          });

          updateCorpRoles(r[i].id);
          updateAllianceRoles(r[i].id);
        }
      }
    }
  );
}

const client = new MyClient();
client.login(Config.Discord.ClientToken);
// Attach a listener function
client.on('guildMemberAdd', (member) => {
  createAuthLink(member);
});

setInterval(updateUserInfo, 15 * 60 * 1000);
updateUserInfo();
