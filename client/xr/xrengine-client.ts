import { waitForClientReady } from "grpc";
import { resolve } from "path";

const XRENGINE_URL = process.env.XRENGINE_URL || 'https://dev.theoverlay.io/location/test';

const browserLauncher= require('../../src/browser-launcher')
const { existsSync } = require('fs');

function getOS() {
    const platform = process.platform;
    console.log(platform);
    let os;
    if (platform.includes('darwin')) {
      os = 'Mac OS';
    } else if (platform.includes('win32')) {
      os = 'Windows';
    } else if (platform.includes('linux')) {
      os = 'Linux';
    }
  
    return os;
}


async function createXREngineClient(messageResponseHandler) {
    console.log('creating xr engine client')
    const xrengineBot = new XREngineBot({ headless: !process.env.GUI, messageResponseHandler });

    console.log("Preparing to connect to ", XRENGINE_URL);
    xrengineBot.delay(Math.random() * 100000);
    console.log("Connecting to server...");
    await xrengineBot.launchBrowser();
    xrengineBot.enterRoom(XRENGINE_URL, { name: "TestBot" })

    /*console.log('delay bot')
    await xrengineBot.delay(10000)
    console.log('bot delay done')*/
    
/*await xrengineBot.sendMessage("Hello World! I have connected.")

    await new Promise((resolve) => {
        setTimeout(() => xrengineBot.enterRoom(XRENGINE_URL, { name: "TestBot" }), 1000);
    });

console.log('bot loaded')
    await new Promise((resolve) => {
        setTimeout(() => xrengineBot.sendMessage("Hello World! I have connected."), 5000);
    });*/
console.log('bot fully loaded')
}

/**
 * Main class for creating a bot.
 */
class XREngineBot {
    activeChannel;
    messageResponseHandler
    headless: boolean;
    name: string;
    autoLog: boolean;
    fakeMediaPath: any;
    page: any;
    browser: any;
    pu: PageUtils;
    userId : string = '';
    chatHistory: string[] = [];
    constructor({
        name = "Bot",
        fakeMediaPath = "",
        headless = true,
        messageResponseHandler = null,
        autoLog = true } = {}
    ) {
        this.headless = headless;
        this.name = name;
        this.autoLog = autoLog;
        this.messageResponseHandler = messageResponseHandler;
        this.fakeMediaPath = fakeMediaPath;

        setInterval(() => this.getInstanceMessages(), 1000)
        setInterval(() => this.getLocalUserId(), 15000)
    }

    async sendMessage(message) {
        if(message === null || message === undefined) return;
        console.log('send message: ' + message)
        await this.typeMessage(message);
        await this.pressKey('Enter')
    }

    async sendMovementCommand(x : any, y: any, z : any) {
        if (x === undefined || y === undefined || z == undefined) {
            console.log("Invalid parameters! (" + x + ", " + y + ", " + z + ")")
            return
        }

        var _x : number = parseFloat(x)
        var _y : number = parseFloat(y)
        var _z : number = parseFloat(z)
        await this._sendMovementCommand(_x, _y, _z)
    }
    async _sendMovementCommand(x : number, y : number, z : number) {
        if (x === undefined || y === undefined || z === undefined) {
            console.log("Invalid parameters! (" + x + ", " + y + ", " + z + ")")
            return
        }

        var message : string = '/move ' + x + ',' + y + ',' + z
        await this.sendMessage(message)
    }
    async requestSceneMetadata() {
        await this.sendMessage('/metadata scene')
    }
    async requestWorldMetadata(maxDistance: number) {
        if (maxDistance === undefined || maxDistance <= 0) return

        await this.sendMessage('/metadata world,' + maxDistance)
    }
    async requestAllWorldMetadata() {
        await this.requestWorldMetadata(Number.MAX_SAFE_INTEGER)
    }
    async goTo(landmark: string) { 
        if (landmark === undefined || landmark === '') return

        await this.sendMessage('/goTo ' + landmark)
    }
    async playEmote(emote: string) {
        if (emote === undefined || emote === '') return

        await this.sendMessage('/emote ' + emote)
    }
    async playFaceExpression(types: string[], perc: string[], time: string) {
        if (types === undefined || types.length <= 0) return
        if (types.length !== perc.length) return

        var message: string = '/face '
        for(var i = 0; i < types.length; i++) 
            message += types[i] + ' ' + perc[i] + ' '
        message += time

        await this.sendMessage(message)
    }
    async getPosition(player: string) {
        if (player === undefined || player === '') return

        await this.sendMessage('/getPosition ' + player)
    }
    async getRotation(player: string) {
        if (player === undefined || player === '') return

        await this.sendMessage('/getRotation ' + player)
    }
    async getScale(player: string) {
        if (player === undefined || player === '') return

        await this.sendAudio('/getScale ' + player)
    }
    async getTransform(player: string) {
        if (player === undefined || player === '') return

        await this.sendMessage('getTransform ' + player)
    }
    async subscribeToChatSystem(system: string) {
        if (system === undefined || system === '') return

        await this.sendMessage('/subscribe ' + system)
    }
    async unsubscribeFromChatSystem(system: string) {
        if (system === undefined || system === '') return

        await this.sendMessage('/unsubscribe ' + system)
    }
    async getSubscribedChatSystems() {
        await this.sendMessage('/getSubscribed')
    }
    async follow(player: string) {
        if (player === undefined || player === '') return

        await this.sendMessage('/follow ' + player)
    }

    counter : number = 0
    async getInstanceMessages() {
        await this.updateChannelState()
        if(!this.activeChannel) return;
        const messages = this.activeChannel.messages;
        if (messages === undefined || messages === null) return;

        for(var i = 0; i < messages.length; i++ ){
            const message = messages[i]
            const messageId = message.id
            const senderId = message.sender.id
            //var sender = message.sender.name
            //var text = message.text

            if (senderId === this.userId || this.chatHistory.includes(messageId)) {
                const index : number = await this.getMessageIndex(messages, messageId)
                if (index > -1) messages.splice(index, 1)
            }

            this.chatHistory.push(messageId)
        }
        /*this.counter++
        if (this.counter === 20)
        this.requestSceneMetadata()

        if (this.counter === 25)
        this.sendMovementCommand(0.01, 0.01, 0.01)

        if (this.counter === 35)
        this.requestWorldMetadata(5)

        if (this.counter === 40)
        this.requestAllWorldMetadata()*/

        this.messageResponseHandler("replaceme", messages, (response) => this.sendMessage(response));
        return this.activeChannel && messages;
    }

    async getMessageIndex(messages: any, messageId: string) {
        for(var i = 0; i < messages.length; i++) {
            if (messages[i].id === messageId)
               return i
        }

        return -1
    }


    async sendAudio(duration) {
        console.log("Sending audio...");
        await this.clickElementById('button', 'UserAudio');
        await this.waitForTimeout(duration);
    }

    async stopAudio(bot) {
        console.log("Stop audio...");
        await this.clickElementById('button', 'UserAudio');
    }

    async recvAudio(duration) {
        console.log("Receiving audio...");
        await this.waitForSelector('[class*=PartyParticipantWindow]', duration);
    }

    async sendVideo(duration) {
        console.log("Sending video...");
        await this.clickElementById('button', 'UserVideo');
        await this.waitForTimeout(duration);
    }

    async stopVideo(bot) {
        console.log("Stop video...");
        await this.clickElementById('button', 'UserVideo');
    }

    async recvVideo(duration) {
        console.log("Receiving video...");
        await this.waitForSelector('[class*=PartyParticipantWindow]', duration);
    }

    async delay(timeout) {
        console.log(`Waiting for ${timeout} ms... `);
        await this.waitForTimeout(timeout);
    }

    async interactObject() {

    }

    /** Return screenshot
 * @param {Function} fn Function to execut _in the node context._
 */
    async screenshot() {
            return await this.page.screenshot();
    }


    /** Runs a function and takes a screenshot if it fails
     * @param {Function} fn Function to execut _in the node context._
     */
    async catchAndScreenShot(fn, path = "botError.png") {
        try {
            await fn()
        }
        catch (e) {
            if (this.page) {
                console.warn("Caught error. Trying to screenshot")
                this.page.screenshot({ path })
            }
            throw e
        }
    }

    /**
     * Runs a funciton in the browser context
     * @param {Function} fn Function to evaluate in the browser context
     * @param args The arguments to be passed to fn. These will be serailized when passed through puppeteer
     */
    async evaluate(fn, ...args) {
        if (!this.browser) {
            await this.launchBrowser();
        }
        return await this.page.evaluate(fn, ...args)
    }

    /**
     * A main-program type wrapper. Runs a function and quits the bot with a
     * screenshot if the function throws an exception
     * @param {Function} fn Function to evaluate in the node context
     */
    exec(fn) {
        this.catchAndScreenShot(() => fn(this)).catch((e) => {
            console.error("Failed to run. Check botError.png if it exists. Error:", e)
            process.exit(-1)
        })
    }

    /**
     * Detect OS platform and set google chrome path.
     */
    detectOsOption() {
        const os = getOS();
        const options: { executablePath: any } = {executablePath: null};
        let chromePath = '';
        switch (os) {
            case 'Mac OS':
                chromePath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome';
                break;
            case 'Windows':
                chromePath = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
                break;
            case 'Linux':
                chromePath = '/usr/bin/google-chrome';
                break;
            default:
                break;
        }

        if (chromePath) {
            if (existsSync(chromePath)) {
                options.executablePath = chromePath;
            }
            else {
                console.warn("Warning! Please install Google Chrome to make bot workiing correctly in headless mode.\n");
            }
        }
        return options;
    }

    /** Launches the puppeteer browser instance. It is not necessary to call this
     *  directly in most cases. It will be done automatically when needed.
     */
    async launchBrowser() {
        console.log('Launching browser');
        const options = {
            headless: this.headless,
            ignoreHTTPSErrors: true,
            args: [
                "--disable-gpu",
                "--use-fake-ui-for-media-stream=1",
                "--use-fake-device-for-media-stream=1",
                `--use-file-for-fake-video-capture=${this.fakeMediaPath}/video.y4m`,
                `--use-file-for-fake-audio-capture=${this.fakeMediaPath}/audio.wav`,
                '--disable-web-security=1',
                //     '--use-fake-device-for-media-stream',
                //     '--use-file-for-fake-video-capture=/Users/apple/Downloads/football_qcif_15fps.y4m',
                //     // '--use-file-for-fake-audio-capture=/Users/apple/Downloads/BabyElephantWalk60.wav',
                '--allow-file-access=1',
            ],
            ignoreDefaultArgs: ['--mute-audio'],
            ...this.detectOsOption()
        };

        this.browser = await browserLauncher.browser(options);
        this.page = await this.browser.newPage();
        this.page.on('console', message => {
            if (message.text().startsWith('scene_metadata')) {
                const data = message.text().split('|', 2)
                if (data.length === 2) {
                    const _data = data[1]
                    console.log('Scene Metadata: Data:' + _data)
                }
                else
                    console.log('invalid scene metadata length ('+data.length+'): ' + data)
            }
            else if (message.text().startsWith('metadata')) {
                const data = message.text().split('|', 3)
                if (data.length === 3) {
                    const xyz = data[1]
                    const _data = data[2]
                    console.log('Metadata: Position: ' + xyz + ', Data: ' + _data)
                }
                else
                    console.log('invalid metadata length ('+data.length+'): ' + data)
            }
                
            if (this.autoLog)
                console.log(">> ", message.text())
        })

        this.page.setViewport({ width: 0, height: 0 });
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')

        this.pu = new PageUtils(this);
    }

    async keyPress(key, numMilliSeconds) {
        await this.setFocus('canvas');
        await this.clickElementById('canvas', 'engine-renderer-canvas');
        const interval = setInterval(() => {
            console.log('Pressing', key);
            this.pressKey(key);
        }, 100);
        return new Promise<void>((resolve) => setTimeout(() => {
            console.log('Clearing button press for ' + key, numMilliSeconds);
            this.releaseKey(key);
            clearInterval(interval);
            resolve()
        }, numMilliSeconds));
    }

    async pressKey(keycode) {
        await this.page.keyboard.down(keycode);
    }

    async releaseKey(keycode) {
        await this.page.keyboard.up(keycode);
    }

    async navigate(url) {
        if (!this.browser) {
            await this.launchBrowser();
        }

        let parsedUrl = new URL(url.includes('https') ? url : 'https://' + url);
        parsedUrl.searchParams.set('bot', 'true')
        console.log("parsed url is", parsedUrl);
        const context = this.browser.defaultBrowserContext();
        console.log("permission allow for ", parsedUrl.origin);
        context.overridePermissions(parsedUrl.origin, ['microphone', 'camera']);

        console.log('Going to ' + parsedUrl);
        await this.page.goto(parsedUrl, { waitUntil: 'domcontentloaded' });

        const granted = await this.page.evaluate(async () => {
            return (await navigator.permissions.query({ name: 'camera' })).state;
        });
        console.log('Granted:', granted);
    }

    /** Enters the room specified, enabling the first microphone and speaker found
     * @param {string} roomUrl The url of the room to join
     * @param {Object} opts
     * @param {string} opts.name Name to set as the bot name when joining the room
     */
    async enterRoom(roomUrl, { name = 'bot' } = {}) {
        await this.navigate(roomUrl);
        await this.page.waitForSelector("div[class*=\"instance-chat-container\"]", { timeout: 100000 });

        if (name) {
            this.name = name
        }
        else {
            name = this.name
        }

        if (this.headless) {
            // Disable rendering for headless, otherwise chromium uses a LOT of CPU
        }

        //@ts-ignore
        if (this.setName != null) this.setName(name)

        await this.page.mouse.click(0, 0);

        await this.delay(10000)

        await this.getLocalUserId()
        await this.updateChannelState()
    }

    async getLocalUserId() {
        this.userId = await this.evaluate(() => {
            if (globalThis.store === undefined) {
                return console.warn("Store was not found, ignoring user id fetch");
            }
            
            const selfUser = globalThis.store.getState().get('auth').get('user')
            const userId = selfUser.id
            return userId
        })
    }

    async updateChannelState() {
        this.activeChannel = await this.evaluate(() => {
        if (globalThis.store === undefined) {
            return console.warn("Store was not found, ignoring chat");
        }
        const chatState = globalThis.store.getState().get('chat');
        const channelState = chatState.get('channels');
        const channels = channelState.get('channels');
        const activeChannelMatch = [...channels].find(([, channel]) => channel.channelType === 'instance');
        if (activeChannelMatch && activeChannelMatch.length > 0) {
            this.activeChannel = activeChannelMatch[1];
            return this.activeChannel;
        } else {
            console.warn("Couldn't get chat state")
            return undefined;
        }
    })
    }

    async waitForTimeout(timeout) {
        return await new Promise<void>(resolve => setTimeout(() => resolve(), timeout));
    }

    async waitForSelector(selector, timeout) {
        return this.page.waitForSelector(selector, { timeout });
    }

    async clickElementByClass(elemType, classSelector) {
        await this.pu.clickSelectorClassRegex(elemType || 'button', classSelector);
    }

    async clickElementById(elemType, id) {
        await this.pu.clickSelectorId(elemType, id);
    }

    async typeMessage(message: string) {
        await this.page.type('input[name="newMessage"]', message);
        //await this.page.keyboard.type(message);
    }

    async setFocus(selector) {
        await this.page.focus(selector);
    }

    /**
     * Leaves the room and closes the browser instance without exiting node
     */
    quit() {
        if (this.page) {
            this.page.close();
        }
        if (this.browser) {
            this.browser.close();
        }
    }
}

class PageUtils {
    page: any;
    autoLog: boolean;
    constructor({ page, autoLog = true }) {
        this.page = page;
        this.autoLog = autoLog;
    }

    async clickButton(buttonName: string) {
        await this.page.evaluate((selector) => { const v = document.querySelector(selector)
    if (v != undefined && v != null)
        v.click()
    }, buttonName)
}
    
    async clickSelectorClassRegex(selector, classRegex) {
        if (this.autoLog)
            console.log(`Clicking for a ${selector} matching ${classRegex}`);

        await this.page.evaluate((selector, classRegex) => {
            classRegex = new RegExp(classRegex);
            let buttons = Array.from(document.querySelectorAll(selector));
            let enterButton = buttons.find(button => Array.from(button.classList).some(c => classRegex.test(c)));
            if (enterButton) 
                enterButton.click();
        }, selector, classRegex.toString().slice(1, -1));
    }
    async clickSelectorId(selector, id) {
        if (this.autoLog) console.log(`Clicking for a ${selector} matching ${id}`)
        
        await this.page.evaluate(
          (selector, id) => {
            let matches = Array.from(document.querySelectorAll(selector))
            let singleMatch = matches.find((button) => button.id === id)
            let result
            if (singleMatch && singleMatch.click) {
              console.log('normal click')
              result = singleMatch.click()
            }
            if (singleMatch && !singleMatch.click) {
              console.log('on click')
              result = singleMatch.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            }
            if (!singleMatch) {
              console.log('event click', matches.length)
             if (matches.length > 0) {
                  const m = matches[0]
                  result = m.dispatchEvent(new MouseEvent('click', { bubbles: true }))
              }
            }
          },
          selector,
          id
        )
      }
    async clickSelectorFirstMatch(selector) {
        if (this.autoLog)
            console.log(`Clicking for first ${selector}`);

        await this.page.evaluate((selector) => {
            let matches = Array.from(document.querySelectorAll(selector));
            let singleMatch = matches[0];
            if (singleMatch)
                singleMatch.click();
        }, selector);
    }
}

module.exports = { createXREngineClient }
