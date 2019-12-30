const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.imdb.com/title/tt0377092/mediaindex?ref_=tt_pv_mi_sm', { waitUntil: 'domcontentloaded' });

  const links = await page.evaluate(() =>
    [...document.querySelector('.page_list').children]
      .map(linkTag => linkTag.href)
  )

  let urls = []
  for (const link of links) {
    await page.goto(link, { waitUntil: 'domcontentloaded' })

    urls.push(...await page.evaluate(() =>
      [...document.querySelectorAll('#media_index_thumbnail_grid > a > img')]
        .map(imageTag => imageTag.src.split('._')[0])
    ))
  }

  generateInsert(urls)

  await browser.close();
})();

function generateInsert(urls) {
  for (let url of urls) {
    fs.appendFileSync('inserts.txt', `INSERT INTO mean_girls (image_url) VALUES ("${url}"); \n`);
  }
}