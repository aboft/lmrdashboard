import { connect } from 'tls';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import dotenv from 'dotenv';
dotenv.config();
import myEmitter from './utils/emitter';
import { DatabaseUserUtils } from './utils/db/Users';
import { DatabaseMessageUtils } from './utils/db/Messages';

interface IrcMessage {
  prefix?: string;
  command: string;
  params: string[];
}

const parseMessage = (line: string): IrcMessage => {
  if (line[0] == ':') {
    const input = line.split(' ');
    const msg = {
      prefix: input[0],
      command: input[1],
      params: input.slice(2),
    };
    return msg;
  } else {
    const input = line.split(' ');
    const msg = { command: input[0], params: [input[1]] };
    return msg;
  }
};

const options = {
  key: readFileSync('./keys/key.pem'),
  cert: readFileSync('./keys/cert.pem'),
  host: 'irc.snoonet.org',
};

const client = connect(6697, options, async () => {
  console.log('connected to server!');
  client.write(`USER ${process.env.IRC_USER} localhost * :LMR Dashboard Connection\r\n`);
  client.write(`NICK ${process.env.IRC_USER} \r\n`);
  setTimeout(() => {
    client.write(`PRIVMSG nickserv IDENTIFY ${process.env.IRC_PASS}\r\n`);
  }, 2000);
});
const rl = createInterface({ input: client, crlfDelay: Infinity });

const names: string[] = [];

const joinConfig = {
  channel: process.env.IRC_CHANNEL || '#linuxmasterrace',
  user: process.env.IRC_USER || 'lmrdashboard',
  bufferTime: new Date(),
};

rl.on('line', async (line) => {
  // for some reason the chunks arent always parsed as lines by \r\n
  // so we force it by splitting our selves then loop over each line
  const ircMessage: IrcMessage = parseMessage(line);
  if (ircMessage.command == 'PING') {
    client.write('PONG ' + ircMessage.params[0] + '\r\n');
  } else if (ircMessage.command == 'MODE') {
    client.write(`JOIN ${joinConfig.channel}\r\n`);
    client.write(`NAMES ${joinConfig.channel}\r\n`);
    console.log(`TRYING TO JOIN ${joinConfig.channel}`);
  } else if (ircMessage.command == 'JOIN') {
    const nick = ircMessage.prefix && ircMessage.prefix.split('!')[0].slice(1);
    if (nick != joinConfig.user) {
      const server: string = ircMessage.params[0].split(' ', 1)[0].replace(':', '')
      await addUserToDatabase(nick!, server);
      myEmitter.emit('join', server, nick);
    }
  } else if (ircMessage.command == '353') {
    ircMessage.params.slice(3).forEach(async (name) => {
      name = name.replace(':', '').trim();
      if (name.length > 0 && !names.includes(name)) {
        names.push(name);
        const server = '#' + ircMessage.params[2].slice(1);
        await addUserToDatabase(name, server);
      }
    });
  } else if (ircMessage.command == 'PART') {
    const nick = ircMessage.prefix && ircMessage.prefix.split('!')[0].slice(1);
    const server = ircMessage.params[0].split(' ', 1)[0].replace(':', '');
    await deleteUserFromDatabase(nick!, server);
    myEmitter.emit('part', server, nick);
  } else if (ircMessage.command == 'PRIVMSG' && !ircMessage.prefix?.toLowerCase().includes('bot@')) {
    if (Date.now() - joinConfig.bufferTime.getTime() < 5000) {
      return;
    }
    const server = ircMessage.params[0];
    const msg = ircMessage.params.slice(1).join(' ').substring(1, 256);
    const nick = ircMessage.prefix && ircMessage.prefix.split('!')[0].slice(1);
    await saveLineToDatabase(nick!, server, msg);
    myEmitter.emit('line', nick, server, msg);
  }
});

const addUserToDatabase = async (nick: string, server: string) => {
  await DatabaseUserUtils.addUser(nick, server);
}

const deleteUserFromDatabase = async (nick: string, server: string) => {
  await DatabaseUserUtils.deleteUser(nick, server);
}

const saveLineToDatabase = async (nick: string, server: string, msg: string) => {
  await DatabaseMessageUtils.saveLine(nick, server, msg);
}

client.on('end', () => {
  console.log('disconnected from server');
});