import { detectOsOption } from "../utils";
const browserLauncher = require('../../src/browser-launcher')
import * as fs from 'fs';

let browser;
let page;
  
export const createWebsiteReader = async (bookUrl: string, maxPage: number, fileName: string) => {
    const options = {
        headless: true,
        ignoreHTTPSErrors: true,
        args: [
            '--disable-web-security=1',
            "--autoplay-policy=no-user-gesture-required",
        ],
        ignoreDefaultArgs: ['--mute-audio', '--mute-video'],
        ...detectOsOption()
    };
    
    browser = await browserLauncher.browser(options);
    page = await browser.newPage()
    page.setViewport({ width: 0, height: 0 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')
    await navigate(bookUrl);
    await delay(5000);

    let _text: string = '';
    for(let i = 1; i < maxPage; i++) {
        const text = await page.evaluate(() => {
            const el = document.getElementById('demo');
            return el.innerHTML
        })
    
        const data = getText(text);
        _text += data + '\n';
        navigate(bookUrl.substring(0, bookUrl.length - 1) + (i + 1))
        await delay(5000);
    }
    fs.writeFileSync(fileName + '.txt', _text);
};

const getText = (text: string) => {
    const lines: string[] = text.split('\n')
    let _res: string = ''
    for(let i = 0; i < lines.length;i++) {
        if (!lines[i].toLowerCase().includes('<p>') && !lines[i].toLowerCase().includes('</p>')) {
            //
        }
        else {
            _res = lines[i].split('<p></p>').join('\n---\n')
            _res = _res.split('\n---\n\n---\n').join('')
            _res = _res.split('<p>').join('')
            _res = _res.split('</p>').join('\n');
            _res = _res.replace(/<\/?[^>]+(>|$)/g, "");
        }
    }
    return _res.trim();
}

const navigate = async(url, searchParams: { [param: string]: string } = undefined) => {
    let parsedUrl = new URL(url.includes('https') ? url : `https://${url}`);
    if (searchParams !== undefined) {
        for(let x in searchParams) {
            parsedUrl.searchParams.set(x, searchParams[x])
        }
    }
    const context = browser.defaultBrowserContext();
    context.overridePermissions(parsedUrl.origin, ['microphone', 'camera']);
    console.log('navigating to: ' + parsedUrl)
    await page.goto(parsedUrl, { waitUntil: 'domcontentloaded' });
}

let counter: number = 0
const catchScreenshot = async() => {
    counter++;
    console.log('screenshot');
    const path = 'screenshot' + counter + '.png'
    await page.screenshot({ path })
}

const delay = async(timeout) => {
    console.log(`Waiting for ${timeout} ms... `);
    await waitForTimeout(timeout);
}

const waitForTimeout = async(timeout) => {
    return await new Promise<void>(resolve => setTimeout(() => resolve(), timeout));
}