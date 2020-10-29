import Express from 'express';
import cors from 'cors';
import './ircconnection/app';
import myEmitter from './ircconnection/utils/emitter';
import { getUsers, deleteUser, addUser, flushUserTable } from './ircconnection/utils/db/Users';

//const emitter = myEmitter();
const app = Express();
app.use(cors())


app.get('/test', async (req, res) => {
	res.writeHead(200, {
    		"Content-Type": "text/event-stream",
    		"Cache-Control": "no-cache",
    		"Connection": "keep-alive",

    		// enabling CORS
    		"Access-Control-Allow-Origin": "*",
    		"Access-Control-Allow-Headers":
      		"Origin, X-Requested-With, Content-Type, Accept",
  	})
	let users = await getUsers('#aboftytest');
        res.write('event: join\n');  // added these
        res.write(`data: ${JSON.stringify(users)}`);
        res.write("\n\n"); 	
	console.log('request received');
        setInterval(async () => {
        	users = await getUsers('#aboftytest');
		res.write('event: join\n');  // added these
    		res.write(`data: ${JSON.stringify(users)}`);
    		res.write("\n\n");	
       	}, 5000)
})

app.get('/onlineUsers', async (req, res) => {
	const onlineUsers = await getUsers('#aboftytest');
	res.send({users: onlineUsers});
});

myEmitter.on('users', (server: string, nick: string) => { 
      console.log("Hello there!");
});

myEmitter.on('join', async (server: string, nick: string) => {
      await addUser(nick, server);
});
myEmitter.on('part', async (server: string, nick: string) => {
      await deleteUser(nick, server);
});

flushUserTable('#aboftytest');
app.listen(4000, () => {console.log('listening on 4000')})
