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
            await require("../client/discord/discord-client").createDiscordClient();
            //require("../client/messenger/messenger-client").createMessengerClient();
            //require('../client/telegram/telegram-client').createTelegramClient();
            //require("../client/twilio/twilio-client").createTwilioClient();
            //require("../client/whatsapp/whatsapp-client").createWhatsappClient();
            //require("../client/twitter/twitter-client").createTwitterClient();
            //require("../client/xr/xrengine-client").createXREngineClient();
            //require("../client/zoom/zoom-client").createZoomClient();
            await new tcpClient().init('127.0.0.1', process.env.TCP_PORT) 
         }
    ); 
})();

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});
