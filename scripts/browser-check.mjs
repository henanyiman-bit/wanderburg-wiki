import {chromium} from 'playwright-core';
import fs from 'node:fs';

const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage();const errors=[];const requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
const paths=['/',...JSON.parse(fs.readFileSync('src/data/pages.json','utf8')).map(p=>'/'+p.slug+'/')];
for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:900});for(const route of paths){const r=await page.goto('http://localhost:4321'+route);if(r.status()!==200)errors.push(route+' HTTP '+r.status());if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push(route+' overflows at '+width);}}
await page.goto('http://localhost:4321/');await page.locator('#portal-search').fill('controls');await page.locator('#search-results a[href="/guides/controls/"]').waitFor();if(!await page.locator('#search-results').innerText().then(t=>t.includes('Controls')))errors.push('Search result missing');await page.locator('#search-results a[href="/guides/controls/"]').click();if(!page.url().endsWith('/guides/controls/'))errors.push('Search navigation failed');
await page.goto('http://localhost:4321/');await page.locator('#portal-search').fill('zzznomatch');await page.getByText('No matching entries.',{exact:false}).waitFor();await page.locator('#portal-search').fill('');if(await page.locator('#search-results').isVisible())errors.push('Empty search results still visible');await page.keyboard.press('/');if(!await page.locator('#portal-search').evaluate(el=>el===document.activeElement))errors.push('Keyboard shortcut failed');
await page.goto('http://localhost:4321/database/');await page.locator('[data-filter-search]').fill('unknown');await page.locator('[data-filter-category]').selectOption('modules');await page.locator('[data-filter-sort]').selectOption('za');if(!await page.locator('[data-empty]').isVisible())errors.push('Database empty state missing');
await page.goto('http://localhost:4321/faq/');await page.locator('summary').first().click();if(!await page.locator('details').first().getAttribute('open').then(x=>x!==null))errors.push('FAQ disclosure failed');
const remote=requests.filter(u=>!u.startsWith('http://localhost:4321'));if(remote.length)errors.push('Unexpected remote requests: '+remote.join(','));

await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log('PASS browser: 24 routes × 4 widths, search, filters, FAQ; no overflow, runtime errors, or remote requests.');
