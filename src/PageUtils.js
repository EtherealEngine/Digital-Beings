class PageUtils {
    constructor({ page, autoLog = true }) {
        this.page = page;
        this.autoLog = autoLog;
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
        if (this.autoLog)
            console.log(`Clicking for a ${selector} matching ${id}`);

        await this.page.evaluate((selector, id) => {
            let matches = Array.from(document.querySelectorAll(selector));
            let singleMatch = matches.find(button => button.id === id);
            let result;
            if (singleMatch && singleMatch.click) {
                console.log('normal click');
                result = singleMatch.click();
            }
            if (singleMatch && !singleMatch.click) {
                console.log('on click');
                result = singleMatch.dispatchEvent(new MouseEvent('click', { 'bubbles': true }));
            }
            if (!singleMatch) {
                console.log('event click', matches.length);
                const m = matches[0];
                result = m.dispatchEvent(new MouseEvent('click', { 'bubbles': true }));
            }
        }, selector, id);
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
exports.PageUtils = PageUtils;
