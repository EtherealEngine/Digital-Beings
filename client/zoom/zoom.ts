import { from } from "request/node_modules/form-data";
import { detectOsOption } from "../utils";
const browserLauncher = require('../../src/browser-launcher')
import { launch, getStream }  from "puppeteer-stream"
import * as fs from 'fs'

export class zoom {
    messageResponseHandler;
    fakeMediaPath

    browser
    page

    constructor (messageResponseHandler, fakeMediaPath = "") {
        this.messageResponseHandler = messageResponseHandler
        this.fakeMediaPath = fakeMediaPath
    }
    
    async init() {
        const options = {
            headless: false,
            ignoreHTTPSErrors: true,
            args: [
                "--use-fake-device-for-media-stream",
                '--use-fake-ui-for-media-stream',
                //`--use-file-for-fake-video-capture=${this.fakeMediaPath}video.y4m`,
                `--use-file-for-fake-audio-capture=${this.fakeMediaPath}test_audio.wav`,
                '--disable-web-security=1',
                "--autoplay-policy=no-user-gesture-required",
            ],
            ignoreDefaultArgs: ['--mute-audio', '--mute-video'],
            ...detectOsOption()
        };
        console.log(JSON.stringify(options))

        this.browser = await launch(options)
        this.page = await this.browser.newPage()
        this.page.on('console', message => {
        });
    
        this.page.setViewport({ width: 0, height: 0 })
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')
        await this.navigate(process.env.ZOOM_INVITATION_LINK)
        await this.delay(20000)
        await this.typeMessage('inputname', process.env.BOT_NAME, false)
        await this.clickElementById('button', 'joinBtn')
        await this.delay(20000)
        await this.clickElementById('button', 'wc_agree1')
        await this.delay(20000)
        try {
            await this.typeMessage('inputpasscode', process.env.ZOOM_PASSWORD, false)
            await this.clickElementById('button', 'joinBtn')
            await this.delay(20000)
        } catch (ex) {}

        let audioBuffer = []
        let videoBuffer = []
        let audioStream = await getStream(this.page, { audio: true, video: false });
        let videoStream = await getStream(this.page, { audio: false, video: true });

        let done = false;

        while(!done) {
            try {
        audioStream.on('data', function(data) {
            audioBuffer.push(data);
        });
        audioStream.on('error', function(err) {
            console.log('audioStream error: ' + err)
        });
        videoStream.on('data', function(data) {
            videoBuffer.push(data);
        });
        videoStream.on('error', function(err) {
            console.log('audioStream error: ' + err)
        });
        done = true
    } catch (err) { console.log('error') ; done = false }
    }

    await this.page.evaluate(async () => {
        const video: any= await document.createElement("video");
        console.log('creating video');
        video.setAttribute('id', 'video-mock');
        video.setAttribute("src", 'https://woolyss.com/f/spring-vp9-vorbis.webm');
        video.setAttribute("crossorigin", "anonymous");
        video.setAttribute("controls", "");
        console.log('created video');

        video.oncanplay = async () => {
            console.log('play')
            const stream = await video.captureStream();

            navigator.mediaDevices.getUserMedia = () => Promise.resolve(stream);
        };

        document.querySelector("body").appendChild(video);
    });

        const dataUrl = await this.page.evaluate(async () => {
            const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
            await sleep(5000);
            return (document.getElementById('main-video') as any).toDataURL();
        });

        const data = Buffer.from(dataUrl.split(',').pop(), 'base64');
        fs.writeFileSync('image.png', data);        

        await this.catchScreenshot()
        await this.delay(5000)
        await this.catchScreenshot()
        await this.delay(5000)
        await this.catchScreenshot()
        await this.delay(5000)
        await this.catchScreenshot()
        await this.delay(5000)
    }

    async clickElementById(elemType, id) {
        await this.clickSelectorId(elemType, id);
    }

    async clickSelectorId(selector, id) {
        console.log(`Clicking for a ${selector} matching ${id}`)
        
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

    async clickElementByClass(elemType, classSelector) {
        await this.clickSelectorClassRegex(elemType || 'button', classSelector);
    }

    async clickSelectorClassRegex(selector, classRegex) {
        console.log(`Clicking for a ${selector} matching ${classRegex}`);

        await this.page.evaluate((selector, classRegex) => {
            classRegex = new RegExp(classRegex);
            let buttons = Array.from(document.querySelectorAll(selector));
            let enterButton = buttons.find(button => Array.from(button.classList).some(c => classRegex.test(c)));
            if (enterButton) 
                enterButton.click();
        }, selector, classRegex.toString().slice(1, -1));
    }

    async navigate(url, searchParams: { [param: string]: string } = undefined) {
        if (!this.browser) {
            await this.init()
        }

        let parsedUrl = new URL(url.includes('https') ? url : `https://${url}`);
        if (searchParams !== undefined) {
            for(let x in searchParams) {
                parsedUrl.searchParams.set(x, searchParams[x])
            }
        }
        const context = this.browser.defaultBrowserContext();
        context.overridePermissions(parsedUrl.origin, ['microphone', 'camera']);
        console.log('navigating to: ' + parsedUrl)
        await this.page.goto(parsedUrl, { waitUntil: 'domcontentloaded' });
    }

    async delay(timeout) {
        console.log(`Waiting for ${timeout} ms... `);
        await this.waitForTimeout(timeout);
    }

    async waitForTimeout(timeout) {
        return await new Promise<void>(resolve => setTimeout(() => resolve(), timeout));
    }

    async waitForSelector(selector, timeout) {
        return this.page.waitForSelector(selector, { timeout });
    }
    
    counter: number = 0
    async catchScreenshot() {
        this.counter++;
        console.log('screenshot');
        const path = 'screenshot' + this.counter + '.png'
        await this.page.screenshot({ path })
    }

    async typeMessage(input: string, message: string, clean: boolean) {
        if (clean) await this.page.click(`input[name="${input}"]`, { clickCount: 3 });
        await this.page.type(`input[name=${input}`, message);
    }
}