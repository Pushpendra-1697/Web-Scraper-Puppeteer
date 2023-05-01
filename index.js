const puppeteer = require('puppeteer');

async function scrapeIndeed() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    let status = await page.goto('https://www.indeed.com/');
    status = status.status();
    if (status != 404) {
        console.log(`Probably HTTP response status code 200 OK.`);
    }else{
        return;
    }

    // Enter search query
    await page.type('#text-input-what', 'full stack developer');

    // Enter location
    await page.type('#text-input-where', 'New Delhi, Delhi');

    // Click "Find Jobs" button
    await Promise.all([
        page.waitForNavigation(),
        page.click('.yosegi-InlineWhatWhere-primaryButton')
    ]);

    let jobCount = 0;
    let jobs = [];

    while (true) {
        // Wait for search results to load
        await page.waitForSelector('#mosaic-provider-jobcards');

        // Extract job count on first page
        // if (jobCount === 0) {
        //     const jobCountText = await page.$$eval('#searchCountPages');
        //     console.log("jobCountText", jobCountText);
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
        // const disabled = await nextButton.evaluate(node => node.classList.contains('disabled'));
        // if (disabled) {
        //     break;
        // }
        if (currentPageJobs.length >= 20) {
            break;
        }
        await Promise.all([
            page.waitForNavigation(),
            // nextButton.click()
        ]);
        jobCount++;
        console.log(jobCount);
        console.log(currentPageJobs);
    }

    console.log(jobs);

    await browser.close();
}
scrapeIndeed();
