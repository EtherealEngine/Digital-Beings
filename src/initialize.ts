import { tcpClient } from "../client/tcpClient";
import { postgres } from "../client/postgres";
import { createWebServer } from "../client/webserver";

require('dotenv-flow').config();

createWebServer()
new postgres().connect()
postgres.getInstance.getBannedUsers(true)
postgres.getInstance.getChatFilterData(true)

const expectedServerDelta = 1000 / 60;
let lastTime = 0;
// @ts-ignore

globalThis.requestAnimationFrame = (f) => {
    const serverLoop = () => {
        const now = Date.now();
        if (now - lastTime >= expectedServerDelta) {
            lastTime = now;
            f(now);
        } else {
            setImmediate(serverLoop);
        }
    }
    serverLoop()
}
const pyConnect = require('./pyconnect');

(async function(){  
    await pyConnect.invoke(async function(){
        await new tcpClient().init('127.0.0.1', process.env.TCP_PORT) 
        //await require("../client/discord/discord-client").createDiscordClient();
        //await require("../client/reddit/reddit-client").createRedditClient();
        //await require("../client/messenger/messenger-client").createMessengerClient();
        //await require('../client/telegram/telegram-client').createTelegramClient();
        //await require("../client/twilio/twilio-client").createTwilioClient();
        //await require("../client/whatsapp/whatsapp-client").createWhatsappClient();
        //await require("../client/twitter/twitter-client").createTwitterClient();
        await require("../client/xr/xrengine-client").createXREngineClient();
        //await require("../client/zoom/zoom-client").createZoomClient();
    }); 
})();

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});
