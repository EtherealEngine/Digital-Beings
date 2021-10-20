import { postgres } from "../client/postgres";
import { createWebServer } from "../client/webserver";

require('dotenv-flow').config();

createWebServer()
new postgres().connect()

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
    await pyConnect.invoke(
        {
            'grpc_args': {},
            'grpc_method':'InitializeAgents',
            'grpc_method_params':['']
        },function(){
            const messageResponseHandler = async (args, callback) => {
                args.response = await pyConnect.invoke(args)
                callback(args.response);
            }
            require("../client/discord/discord-client").createDiscordClient(messageResponseHandler);
            //require("../client/messenger/messenger-client").createMessengerClient(messageResponseHandler);
            //require('../client/telegram/telegram-client').createTelegramClient(messageResponseHandler);
            //require("../client/twilio/twilio-client").createTwilioClient(messageResponseHandler);
            //require("../client/whatsapp/whatsapp-client").createWhatsappClient(messageResponseHandler);
            //require("../client/twitter/twitter-client").createTwitterClient(messageResponseHandler);
            //require("../client/xr/xrengine-client").createXREngineClient(messageResponseHandler);
            //require("../client/zoom/zoom-client").createZoomClient(messageResponseHandler);
         }
    ); 
})();

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});