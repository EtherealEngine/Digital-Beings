const puppeteer = require('puppeteer');
const fs = require('fs');

class BrowserLauncher {
    static browser(options: { headless: any; ignoreHTTPSErrors: boolean; args: string[]; ignoreDefaultArgs: string[]; }): any {
        throw new Error("Method not implemented.");
    }
    constructor() {}
    _browser
    async browser(options) {
        console.log('Making new browser');
        console.log(this._browser);
        if (this._browser) return await this._browser

        if (fs.existsSync("/.dockerenv"))
        {
            options.headless = true
            options.args = (options.args || []).concat(['--no-sandbox', '--disable-setuid-sandbox'])
        }

        this._browser = puppeteer.launch(options);
        return await this._browser
    }
}

module.exports = new BrowserLauncher()