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

(async function(){  await pyConnect.invoke({'sender':'client', 'message':'listen'}); })();

const messageResponseHandler = async (sender, message, callback) => {
    const response = await pyConnect.invoke({'sender':sender, 'message':message})
    callback(response);
}

// Initialize bots 
require("../client/discord/discord-client").createDiscordClient(messageResponseHandler);
require("../client/twitter/twitter-client").createTwitterClient(messageResponseHandler);
require("../client/twitter/xrengine-client").createXREngineClient(messageResponseHandler);