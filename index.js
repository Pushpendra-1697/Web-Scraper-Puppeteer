const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

var jobWebsiteUrl = "https://www.indeed.com/" //Url of website which I want to scraping by puppeteer
// Enter search query eg: data analyst, full stack developer, frontend developer, backend developer etc;
var query = "full stack developer";
// Enter location;
var location = "Bangalore, Karnataka";

const scrapeIndeed = async () => {
    // Validation of Inputs;
    if (!jobWebsiteUrl || typeof jobWebsiteUrl !== 'string') {
        throw new Error('Invalid URL');
    };
    if (!query || typeof query !== 'string') {
        throw new Error('Invalid Query');
    };
    if (!location || typeof location !== 'string') {
        throw new Error('Invalid Location');
    };
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        let status = await page.goto(jobWebsiteUrl);
        // verify the website url like it is exsit or not by status code;
        status = status.status();
        if (status != 404) {
            console.log(`Probably HTTP response status code 200 OK.`);
        };

        await page.screenshot({ path: "example.png", fullPage: true });
        await page.pdf({ path: 'demo.pdf', format: "A4" });

        await page.type('#text-input-what', query);
        await page.type('#text-input-where', location);
        await page.click("[type=submit]"); //click of find Job button or It will return jobs after 5000ms automatically according to query;
        await page.waitForTimeout(5000);

        const jobs = await page.evaluate(() => {
            //fetch all the jobs according to queries;
            const heading = document.querySelectorAll(
                "#mosaic-provider-jobcards > ul > li"
            );
            let arr = [];
            heading.forEach((ele) => {
                let a = ele.innerText;
                a = a.trim().split("\n");
                let beg1 = "", beg2 = "";
                for (let i = 4; i < a.length; i++) {
                    beg1 += a[i] + ".";
                };
                for (let i = 3; i < a.length; i++) {
                    beg2 += a[i] + ".";
                };
                let obj = {
                    title: a[0],
                    comapny_name: a[1] == "new" ? a[2] : a[1],
                    location: a[1] == "new" ? a[3] : a[2],
                    description: a[1] == "new" ? beg1 : beg2,
                    date: a[1] == 'new' ? beg1.slice(beg1.length - 18, beg1.length - 1) : beg2.slice(beg2.length - 19, beg2.length - 1)
                };
                arr.push(obj);
            });
            return arr;
        });

        console.log(jobs);

        // Save the extracted data in a structured JSON format as per the name mention;
        fs.writeFile('db.json', JSON.stringify(jobs), (error) => {
            if (error) {
                console.log(error);
                throw error;
            } else {
                console.log('Successfully File Saved in JSON Formate');
            }
        });

        // automatically close browser after 5000ms;
        await browser.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

scrapeIndeed();
