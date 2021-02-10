const { Listener } = require('discord-akairo');

class MissingPermissions extends Listener {
    constructor() {
        super('MissingPermissions', {
            emitter: 'commandHandler',
            event: 'missingPermissions'
        });
    }

    exec(message, command, client, permissions) {
        return message.reply("You do not have permisisons to use that command.");
    }
}

module.exports = MissingPermissions;