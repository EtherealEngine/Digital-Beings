import { PageUtils } from "../pageUtils";
import { redisDb } from "../redisDb";
import { tcpClient } from "../tcpClient";
import { userDatabase } from "../userDatabase";
import { detectOsOption } from "../utils";
import { handleMessages } from "./messageHandler";
import { UsersInHarassmentRange, UsersInIntimateRange, UsersInRange, UsersLookingAt } from "./UsersInRange";
import { xrEnginePacketHandler } from "./xrEnginePacketHandler";

const XRENGINE_URL = process.env.XRENGINE_URL || 'https://dev.theoverlay.io/location/test';

const browserLauncher= require('../../src/browser-launcher')
const { existsSync } = require('fs');

const doTests: boolean = false

async function createXREngineClient() {
    //generateVoice('hello there', (buf, path) => {}, false)
    //speechToText('test.wav', (res) => { console.log('Res: ' + res); })
    console.log('creating xr engine client')
    const xrengineBot = new XREngineBot({ headless: !process.env.GUI });

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
    headless: boolean;
    name: string;
    autoLog: boolean;
    fakeMediaPath: any;
    page: any;
    browser: any;
    pu: PageUtils;
    userId: string
    chatHistory: string[] = [];
    avatars: string[] = [ 'Alissa', 'Cornelius', 'James_ReadyPlayerMe', 'Jamie', 'Mogrid', 'Warrior' ]
    username_regex: RegExp
    constructor({
        name = "Bot",
        fakeMediaPath = "",
        headless = true,
        autoLog = true } = {}
    ) {
        new xrEnginePacketHandler(this)
        this.headless = headless;
        this.name = name;
        this.autoLog = autoLog;
        this.fakeMediaPath = fakeMediaPath;
        setInterval(() => this.getInstanceMessages(), 1000)
    }

    async sendMessage(message) {
        console.log('sending message: ' + message)
        if(message === null || message === undefined) return;
        await this.typeMessage('newMessage', message, false);
        await this.pressKey('Enter')
    }

    async sendMovementCommand(x : any, y: any, z : any) {
        if (x === undefined || y === undefined || z == undefined) {
            console.log(`Invalid parameters! (${x},${y},${z})`)
            return
        }

        var _x : number = parseFloat(x)
        var _y : number = parseFloat(y)
        var _z : number = parseFloat(z)
        await this._sendMovementCommand(_x, _y, _z)
    }
    async _sendMovementCommand(x : number, y : number, z : number) {
        if (x === undefined || y === undefined || z === undefined) {
            console.log(`Invalid parameters! (${x},${y},${z})`)
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

        await this.sendMessage(`/metadata world,${maxDistance}`)
    }
    async requestAllWorldMetadata() {
        await this.requestWorldMetadata(Number.MAX_SAFE_INTEGER)
    }  
    async requestPlayers() {
        await this.sendMessage('/listAllusers ')
    }

    removeSystemFromChatMessage(text: string): string {
        return text.substring(text.indexOf(']', 0) + 1)
    }
    async goTo(landmark: string) { 
        if (landmark === undefined || landmark === '') return

        await this.sendMessage(`/goTo ${landmark}`)
    }
    async playEmote(emote: string) {
        if (emote === undefined || emote === '') return

        await this.sendMessage(`/emote ${emote}`)
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

        await this.sendMessage(`/getPosition ${player}`)
    }
    async getRotation(player: string) {
        if (player === undefined || player === '') return

        await this.sendMessage(`/getRotation ${player}`)
    }
    async getScale(player: string) {
        if (player === undefined || player === '') return

        await this.sendAudio(`/getScale ${player}`)
    }
    async getTransform(player: string) {
        if (player === undefined || player === '') return

        await this.sendMessage(`getTransform ${player}`)
    }
    async subscribeToChatSystem(system: string) {
        if (system === undefined || system === '') return

        await this.sendMessage(`/subscribe ${system}`)
    }
    async unsubscribeFromChatSystem(system: string) {
        if (system === undefined || system === '') return

        await this.sendMessage(`/unsubscribe ${system}`)
    }
    async getSubscribedChatSystems() {
        await this.sendMessage('/getSubscribed')
    }
    async follow(player: string) {
        if (player === undefined || player === '') return

        await this.sendMessage(`/follow ${player}`)
    }
    async getChatHistory() {
        await this.sendMessage('/getChatHistory')
    }
    async getLocalUserId() {
        await this.sendMessage('/getLocalUserId')
    }

    counter : number = 0
    async getInstanceMessages() {
        //#region  Tests
        if (doTests) {
            this.counter++
            if (this.counter === 10) this.playEmote('dance1')
            if (this.counter === 20) this.requestSceneMetadata()
            if (this.counter === 25) this.sendMovementCommand(1, 1, 1)
            //if (this.counter === 35) this.requestWorldMetadata(5)
            //if (this.counter === 40) this.requestAllWorldMetadata()
            if (this.counter === 25) this.sendMovementCommand(2, 2, 2)
            //if (this.counter === 50) this.follow('alex')
            //if (this.counter === 60) this.follow('stop')
            //if (this.counter === 70) this.goTo('Window')
           // if (this.counter === 75) this.getChatHistory()
            //if (this.counter === 80) this.requestPlayers()
        }
        //#endregion

        await this.updateChannelState()
        if(!this.activeChannel) return;
        const messages = this.activeChannel.messages;
        if (messages === undefined || messages === null) return;

        for(var i = 0; i < messages.length; i++ ){
            //messages[i].text = this.removeSystemFromChatMessage(messages[i].text)
            const messageId = messages[i].id
            const senderId = messages[i].sender.id
            var sender = messages[i].sender.name
            //var text = message.text

            delete messages[i].senderId
            delete messages[i].sender
            messages[i].senderName = sender
            messages[i].updatedAt = new Date(messages[i].updatedAt).getTime() / 1000
            messages[i].createdAt = new Date(messages[i].createdAt).getTime() / 1000
            messages[i].author = ['xr-engine', senderId]

            if (this.chatHistory.includes(messageId) || this.userId === senderId || 
                userDatabase.getInstance.isUserBanned(senderId, 'xr-engine')) {
                const index : number = await this.getMessageIndex(messages, messageId)
                if (index > -1) messages.splice(index, 1)
            }
            
            //await _redisDb.setValue(messageId, messages[i])
            this.chatHistory.push(messageId)
        }

        await handleMessages(messages, this)
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
            ...detectOsOption()
        };

        this.browser = await browserLauncher.browser(options);
        this.page = await this.browser.newPage();
        this.page.on('console', message => {
            if (message.text().startsWith('scene_metadata')) {
                const data = message.text().split('|', 2)
                if (data.length === 2) {
                    const _data = data[1]
                    console.log(`Scene Metadata: Data:${_data}`)
                    tcpClient.getInstance.sendMetadata('xr-engine', 'xr-engine', 'xr-engine', data || 'none')
                }
                else
                    console.log(`invalid scene metadata length (${data.length}): ${data}`)
            }
            else if (message.text().startsWith('metadata')) {
                const data = message.text().split('|', 3)
                if (data.length === 3) {
                    const xyz = data[1]
                    const _data = data[2]
                    console.log(`Metadata: Position: ${xyz}, Data: ${_data}`)
                }
                else
                    console.log(`invalid metadata length ${data.length}: ${data}`)
            }
            else if (message.text().startsWith('players|')) {
                const cmd = message.text().split('|')[0]
                const data = message.text().substring(cmd.length + 1)
                console.log(`Players: ${data}`)
            }
            else if (message.text().startsWith('messages|')) {
                const cmd = message.text().split('|')[0]
                const data = message.text().substring(cmd.length + 1)
                console.log(`Messages: ${data}`)
            }
            else if (message.text().startsWith('proximity|')) {
                const data = message.text().split('|')
                //console.log('Proximity Data: ' + data)
                if (data.length === 4) {
                    const mode = data[1]
                    const player = data[2]
                    const value = data[3]

                    if (value === 'left') {
                        if (mode == 'inRange') {
                            UsersInRange[player] = undefined
                        } else if (mode == 'intimate') {
                            UsersInIntimateRange[player] = undefined
                        } else if (mode == 'harassment') {
                            UsersInHarassmentRange[player] = undefined
                        } else if (mode == 'lookAt') {
                            UsersLookingAt[player] = undefined
                        }
                    } else {
                        if (mode == 'inRange') {
                            UsersInRange[player] = value
                        } else if (mode == 'intimate') {
                            UsersInIntimateRange[player] = value
                        } else if (mode == 'harassment') {
                            UsersInHarassmentRange[player] = value
                        } else if (mode == 'lookAt') {
                            UsersLookingAt[player] = value
                        }
                    }
                }
            }
            else if (message.text().startsWith('localId|')) {
                const cmd = message.text().split('|')[0]
                const data = message.text().substring(cmd.length + 1)
                console.log('local user id: ' + data)
                if (data !== undefined && data !== '') {
                    this.userId = data
                }
            } 
            else if (message.text().startsWith('emotions|')) {
            }
                
            //if (this.autoLog)
            //    console.log(">> ", message.text())
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

        let parsedUrl = new URL(url.includes('https') ? url : `https://${url}`);
        parsedUrl.searchParams.set('bot', 'true')
        console.log("parsed url is", parsedUrl);
        const context = this.browser.defaultBrowserContext();
        console.log("permission allow for ", parsedUrl.origin);
        context.overridePermissions(parsedUrl.origin, ['microphone', 'camera']);

        console.log(`Going to ${parsedUrl}`);
        await this.page.goto(parsedUrl, { waitUntil: 'domcontentloaded' });

       /* const granted = await this.page.evaluate(async () => {
            return (await navigator.permissions.query({ name: 'camera' })).state;
        });
        console.log('Granted:', granted);*/
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

        this.username_regex = new RegExp(process.env.BOT_NAME_REGEX, 'ig')

        if (this.headless) {
            // Disable rendering for headless, otherwise chromium uses a LOT of CPU
        }

        //@ts-ignore
        if (this.setName != null) this.setName(name)

        await this.page.mouse.click(0, 0);

        await this.delay(10000)

        await this.getUser()
        await this.updateChannelState()
        await this.updateUsername(name)
        await this.delay(10000)
        const index = this.getRandomNumber(0, this.avatars.length - 1)
        console.log(`avatar index: ${index}`)
        await this.updateAvatar(this.avatars[index])
        await this.requestPlayers()
        await this.getUser()
        await setInterval(() => this.getUser(), 1000)
    }

    getRandomNumber(min, max): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async updateChannelState() {
        this.activeChannel = await this.evaluate(() => {
            const chatState = globalThis.chatState;
            if (chatState === undefined) {
                console.log('chat state is undefined');
                return;
            }
            const channelState = chatState.channels;
            const channels = channelState.channels.value;
            const activeChannelMatch = Object.entries(channels).find(([key, channel]) => channels[key].channelType === 'instance');
            if (activeChannelMatch && activeChannelMatch.length > 0) {
                const res = deepCopy(activeChannelMatch[1]);

                function deepCopy(obj) {
                    var copy;
                
                    if (null == obj || "object" != typeof obj) return obj;
                
                    if (obj instanceof Date) {
                        copy = new Date();
                        copy.setTime(obj.getTime());
                        return copy;
                    }
                
                    if (obj instanceof Array) {
                        copy = [];
                        for (var i = 0, len = obj.length; i < len; i++) {
                            copy[i] = deepCopy(obj[i]);
                        }
                        return copy;
                    }
                
                    if (obj instanceof Object) {
                        copy = {};
                        for (var attr in obj) {
                            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
                        }
                        return copy;
                    }
                
                    throw new Error("Unable to copy obj! Its type isn't supported.");
                }

                return res
            } else {
                console.warn("Couldn't get chat state");
                return undefined;
            }
        })
    }

    

    async updateUsername(name: string) {
        if (name === undefined || name === '') return
        
        await this.clickElementById('SPAN', 'Profile_0')
        await this.typeMessage('username', name, true)
        await this.pressKey('Enter')
        await this.clickElementById('SPAN', 'Profile_0')
    }

    async updateAvatar(avatar) {
        console.log(`updating avatar to: ${avatar}`)
       
        await this.clickElementById('SPAN', 'Profile_0')
        await this.clickElementById('button', 'CreateIcon')
        await this.clickSelectorByAlt('img', avatar)
        //await this.clickElementById('button', 'confirm-avatar')
    }

    async getUser() {
        this.userId = await this.evaluate(() => {
            return globalThis.userId;
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
    async clickSelectorByAlt(elemType, title) {
        await this.pu.clickSelectorByAlt(elemType, title)
    }

    async typeMessage(input: string, message: string, clean: boolean) {
        if (clean) await this.page.click(`input[name="${input}"]`, { clickCount: 3 });
        await this.page.type(`input[name=${input}`, message);
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

module.exports = { createXREngineClient }