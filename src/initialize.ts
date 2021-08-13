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

(async function(){  await pyConnect.invoke({'request_args': {'sender':'client', 'message':'listen'}, 'grpc_method':'HandleMessage'}); })();

const messageResponseHandler = async (args, callback) => {
    if(args.command === '.agents'){
        args.response = await pyConnect.invoke({'grpc_method':args.grpc_method})
    }else if(args.command === '.setagent'){
        args.response = await pyConnect.invoke(args)
    }
    else{
        args.response = await pyConnect.invoke(args)
    }
    
    callback(args.response);
}

// Initialize bots 
require("../client/discord/discord-client").createDiscordClient(messageResponseHandler);
require("../client/twitter/twitter-client").createTwitterClient(messageResponseHandler);
require("../client/xr/xrengine-client").createXREngineClient(messageResponseHandler);
