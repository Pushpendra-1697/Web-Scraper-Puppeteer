const puppeteer = require('puppeteer');

async function scrapeIndeed() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.indeed.com/');

    // Enter search query
    await page.type('#text-input-what', 'full stack developer');

    // Enter location
    await page.type('#text-input-where', 'New Delhi, Delhi');

    // Click "Find Jobs" button
    await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded" }),
        page.click('#jobsearch button')
    ]);

    let jobCount = 0;
    let jobs = [];

    while (true) {
        // Wait for search results to load
        await page.waitForSelector('#mosaic-provider-jobcards');

        // Extract job count on first page
        // if (jobCount === 0) {
        //     const jobCountText = await page.$eval('#searchCountPages', el => el.textContent);
        //     jobCount = parseInt(jobCountText.match(/(\d+)/)[0]);
        //     console.log(`Found ${jobCount} jobs:`);
        // }

        // Extract job data on current page
        const currentPageJobs = await page.$$eval('#mosaic-provider-jobcards article', jobCards => {
            return jobCards.map(jobCard => {
                const titleEl = jobCard.querySelector('.jobtitle a');
                const title = titleEl.textContent.trim();
                const url = titleEl.href;
                const company = jobCard.querySelector('.companyName').textContent.trim();
                const location = jobCard.querySelector('.companyLocation').textContent.trim();
                const date = jobCard.querySelector('.date').textContent.trim();
                const description = jobCard.querySelector('.job-snippet').textContent.trim();
                return { title, url, company, location, date, description };
            });
        });
        jobs = [...jobs, ...currentPageJobs];

        // Click "Next" button to go to next page
        // const nextButton = await page.$('#pagination-buttons-container > div > a:last-child');
        // console.log(nextButton);
        // const disabled = await nextButton.evaluate(node => node.classList.contains('disabled'));
        // if (disabled) {
        //     break;
        // }
        // await Promise.all([
        //     page.waitForNavigation({ waitUntil: "domcontentloaded" }),
        //     // nextButton.click()
        // ]);
    }

    console.log(jobs);

    await browser.close();
};

scrapeIndeed();
