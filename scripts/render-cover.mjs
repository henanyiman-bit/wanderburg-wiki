import {chromium} from 'playwright-core';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
await page.goto(pathToFileURL(path.resolve('public/images/game/portal-cover.svg')).href);
await page.screenshot({path:'public/images/game/portal-cover.png'});await browser.close();
