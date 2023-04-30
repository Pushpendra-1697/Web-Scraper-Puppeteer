const  puppeteer = require('puppeteer');

async function run(){
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    await page.goto('https://in.indeed.com');


    

    await browser.close();
};

run();
