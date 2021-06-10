const e = require('express');
const puppeteer = require('puppeteer');

module.exports = {
    userDetails: async(handle) => {
        let details = [],status = 'ok';
        const browser = await puppeteer.launch({ headless: true, defaultViewport: null});
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(1000*60*60);
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
        await page.goto(`https://www.codechef.com/users/${handle}`, {waitUntil : 'domcontentloaded'});
        const name = await page.$eval('body > main > div > div > div > div > div > header > h2', el => el.textContent.trim());
        for(let i=2;i<7;i++) {
            details.push(await page.$eval(`body > main > div > div > div > div > div > section.user-details > ul > li:nth-child(${i}) > span`, el => el.textContent.trim()));
        }
        await browser.close();
        return {status,name,details};
    },

    userContestsWithRanks: async(handle) => {
        let contests = [],status = 'ok';
        const browser = await puppeteer.launch({ headless: true, defaultViewport: null});
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(1000*60*60);
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
        await page.goto(`https://www.codechef.com/users/${handle}`, {waitUntil : 'domcontentloaded'});
        // let rows = await page.$eval('#hp-sidebar-blurbRating > div > table > tbody', el => el.children.length);
        // let cols = await page.$eval('#hp-sidebar-blurbRating > div > table > tbody > tr', el => el.children.length);
        for(let i=1;i<=3;i++) {
            let temp = [];
            for(let j=1;j<=4;j++) {
                temp.push(await page.$eval(`#hp-sidebar-blurbRating > div > table > tbody > tr:nth-child(${i}) > td:nth-child(${j})`, el => el.textContent.trim()))
            }
            contests.push(temp);
        }
        return {status,contests};
    },

    userSubmissions: async(handle) => {
        let submissions = [],status = 'ok';
        const browser = await puppeteer.launch({ headless: true, defaultViewport: null});
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(1000*60*60);
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
        await page.goto(`https://www.codechef.com/users/${handle}`, {waitUntil : 'domcontentloaded'});
        const pages = await parseInt(await (await page.$eval('#loader > div', el => el.textContent)).split(' ')[2]);
        for(let i=1;i<pages;i++) {
            let rows = await page.$eval('#rankContentDiv > div:nth-child(1) > table > tbody', el => el.children.length);
            for(let j=1;j<=rows;j++) {
                let problem = [];
                for(let k=1;k<=4;k++) {
                    let selector = `#rankContentDiv > div:nth-child(1) > table > tbody > tr:nth-child(${j}) > td:nth-child(${k})`;
                    if(k==3) {
                        let verdict = await page.$eval(`${selector} > span`, el => el.getAttribute('title'));
                        if(verdict=='') problem.push('accepted');
                        else problem.push(verdict);
                    }
                    else problem.push(await page.$eval(selector, el => el.textContent.trim()));
                }
                submissions.push(problem);
            }
            await page.click('#rankContentDiv > table > tbody > tr > td:nth-child(3) > a') .catch(err => console.error('Error occured' + err));
        }
        return {status,submissions};
    }
}