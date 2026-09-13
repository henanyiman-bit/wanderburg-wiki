import {chromium} from 'playwright-core';
import lighthouse from 'lighthouse';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--remote-debugging-port=9333']});
try{const result=await lighthouse('http://localhost:4321/',{port:9333,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/lighthouse.json',result.report);const scores=Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score*100]));const cls=result.lhr.audits['cumulative-layout-shift'].numericValue;console.log(JSON.stringify({scores,cls},null,2));if(scores.performance<90||scores.seo<95||cls>=.1)throw Error('Lighthouse target missed');}finally{await browser.close();}
