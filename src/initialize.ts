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

let enabled_services = (process.env.ENABLED_SERVICES || '').split(',').map(
    (item) => item.trim().toLowerCase()
).filter(
    (value, index, self) => self.indexOf(value) === index
);

(async function(){  
    await pyConnect.invoke(async function() {
        // Enable the TCP client
        await new tcpClient().init('0.0.0.0', process.env.TCP_PORT);
        // Discord support
        if (enabled_services.includes('discord')) {
            await require('../client/discord/discord-client').createDiscordClient();
        }
        // Reddit support
        if (enabled_services.includes('reddit')) {
            await require('../client/reddit/reddit-client').createRedditClient();
        }
        // TODO: MSN? Facebook? Messenger support
        if (enabled_services.includes('messenger')) {
            await require('../client/messenger/messenger-client').createMessengerClient();
        }
        // Instagram support
        if (enabled_services.includes('instagram')) {
            await require('../client/instagram/instagram-client').createInstagramClient();
        }
        // Telegram support
        if (enabled_services.includes('telegram')) {
            await require('../client/telegram/telegram-client').createTelegramClient();
        }
        // Twilio support for SMS
        if (enabled_services.includes('twilio')) {
            await require('../client/twilio/twilio-client').createTwilioClient();
        }
        // Whatsapp support
        if (enabled_services.includes('whatsapp')) {
            await require('../client/whatsapp/whatsapp-client').createWhatsappClient();
        }
        // Twitter support
        if (enabled_services.includes('twitter')) {
            await require('../client/twitter/twitter-client').createTwitterClient();
        }
        // Harmony support
        if (enabled_services.includes('harmony')) {
            await require('../client/harmony/harmony-client').createHarmonyClient();
        }
        // XREngine support
        if (enabled_services.includes('xrengine')) {
            await require('../client/xr/xrengine-client').createXREngineClient();
        }
        // Zoom support
        if (enabled_services.includes('zoom')) {
            await require('../client/zoom/zoom-client').createZoomClient();
        }
    }); 
})();

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});
