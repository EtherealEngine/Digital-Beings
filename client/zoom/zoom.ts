import { from } from "request/node_modules/form-data";
import { detectOsOption } from "../utils";
const browserLauncher = require('../../src/browser-launcher')
import { launch, getStream }  from "puppeteer-stream"
import * as fs from 'fs'


interface HTMLVideoElementWithCaputreStream extends HTMLVideoElement{
    captureStream(): MediaStream;
  }
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
            devtools: true,
            args: [
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream',
                //`--use-file-for-fake-video-capture=${this.fakeMediaPath}video.y4m`,
                //`--use-file-for-fake-audio-capture=${this.fakeMediaPath}test_audio.wav`,
                '--disable-web-security',
                '--autoplay-policy=no-user-gesture-required'
            ],
            defaultViewport: {
                width: 1920,
                height: 1080,
            },
            ...detectOsOption()
        };
        console.log(JSON.stringify(options))

        this.browser = await launch(options)
        this.page = await this.browser.newPage()
        this.page.on('console', (log) => console.log(log._text));
    
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

        await this.playVideo('https://woolyss.com/f/spring-vp9-vorbis.webm')

        await this.clickElementById('button', 'audioOptionMenu');
        await this.catchScreenshot();
        const linkHandlers = await this.page.$x("//a[contains(text(), 'Fake Audio Input 1')]");

        if (linkHandlers.length > 0) {
            await linkHandlers[0].click();
        } else {
            throw new Error("Link not found");
        }
        await this.clickElementById('button', 'videoOptionMenu');
        await this.catchScreenshot();
        const linkHandlers2 = await this.page.$x("//a[contains(text(), 'fake_device_0')]");
        if (linkHandlers2.length > 0) {
            await linkHandlers2[0].click();
        } else {
            throw new Error("Link not found");
        }

        
        await this.clickElementById('button', 'audioOptionMenu');
        await this.catchScreenshot();
        const linkHandlers3 = await this.page.$x("//a[contains(text(), 'Fake Audio Output 1')]");

        if (linkHandlers3.length > 0) {
            await linkHandlers3[0].click();
        } else {
            throw new Error("Link not found");
        }
        
        await this.clickElementById('button', 'audioOptionMenu');
        await this.catchScreenshot();
        await this.getVideo();
        this.frameCapturerer();
    }

    frameCapturerer() {
        setTimeout(() => {
            this.getRemoteScreenshot();
            this.frameCapturerer();
        }, 500);
    }

    c = 0;
    async getRemoteScreenshot() {
        const dataUrl = await this.page.evaluate(async () => {
            const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
            await sleep(5000);
            return (document.getElementById('main-video') as HTMLCanvasElement).toDataURL();
        });

        this.c++;
        const data = Buffer.from(dataUrl.split(',').pop(), 'base64');
        //fs.writeFileSync('image' + this.c + '.png', data);      
    }

    async getVideo() {
        await this.page.evaluate(async () => {
            const video = document.getElementById('main-video') as HTMLCanvasElement;
            const stream = video.captureStream();
            const recorder = new MediaRecorder(stream)
            recorder.addEventListener('error', (error) => {console.log('recorder error: ' + error);});
            recorder.addEventListener('dataavailable', ({data}) => { 
                console.log('data: ' + JSON.stringify(data))
            });
            recorder.start(5000);
            console.log(stream.id);
        });
    }

    videoCreated: boolean = false
    async playVideo(url: string) {
        await this.page.evaluate(async (_url, _videCreated) => {
            let video = undefined;
            if (!this.videoCreated) video = await document.createElement("video", { }) as HTMLVideoElementWithCaputreStream;
            else video = await document.getElementById("video-mock") as HTMLVideoElementWithCaputreStream;
            video.setAttribute('id', 'video-mock');
            video.setAttribute("src", _url);
            video.setAttribute("crossorigin", "anonymous");
            video.setAttribute("controls", "");
            
            video.oncanplay = async () => {
                video.play();
            }

            video.onplay = async () => {
                const stream = video.captureStream();

                navigator.mediaDevices.getUserMedia = () => Promise.resolve(stream);
            };
        }, url, this.videoCreated);
        this.videoCreated = true;
        await this.delay(10000);
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