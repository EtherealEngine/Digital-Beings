require('dotenv-flow').config();

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
            //require("../client/discord/discord-client").createDiscordClient(messageResponseHandler);
            //require('../client/telegram/telegram-client').createTelegramClient(messageResponseHandler);
            //require("../client/twilio/twilio-client").createTwilioClient(messageResponseHandler);
            //require("../server/agents/echo/echo").createEcho(messageResponseHandler);
            //require("../server/agents/echo/echo").createTelegramEcho(messageResponseHandler);
            //require("../client/twitter/twitter-client").createTwitterClient(messageResponseHandler);
            require("../client/xr/xrengine-client").createXREngineClient(messageResponseHandler);
        }
    ); 
})();
