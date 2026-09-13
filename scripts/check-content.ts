import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';
const pages=JSON.parse(fs.readFileSync('src/data/pages.json','utf8')) as {slug:string}[];
const paragraphs:{route:string;text:string}[]=[];
const problems:string[]=[];
const routes=['/',...pages.map(p=>'/'+p.slug+'/')];
const results=[];
for(const route of routes){
 const $=load(fs.readFileSync(path.join('dist',route,'index.html'),'utf8'));
 const text=$('main').text();
 if(/lorem ipsum|\bTODO\b|awaiting verified entries|content coming soon/i.test(text))problems.push(route+': content placeholder');
 const words=text.trim().split(/\s+/).length;
 if(words<150)problems.push(route+': unexpectedly little content');
 const title=$('title').text();const meta=$('meta[name=description]').attr('content')||'';
 if(title.length<45||title.length>65)problems.push(route+': title length '+title.length);
 if(meta.length<145||meta.length>165)problems.push(route+': description length '+meta.length);
 $('main .step-card p').each((_,el)=>{const text=$(el).text().trim().toLowerCase().replace(/\s+/g,' ');if(text.split(' ').length>=30)paragraphs.push({route,text});});
 results.push({route,words,titleLength:title.length,descriptionLength:meta.length});
}
function shingles(text:string){const words=text.split(' ');return new Set(words.slice(0,-4).map((_,i)=>words.slice(i,i+5).join(' ')));}
for(let i=0;i<paragraphs.length;i++)for(let j=i+1;j<paragraphs.length;j++){
 const a=paragraphs[i],b=paragraphs[j];if(a.route===b.route)continue;
 if(a.text===b.text){problems.push('Duplicate body paragraph: '+a.route+' and '+b.route);continue;}
 const x=shingles(a.text),y=shingles(b.text);const intersection=[...x].filter(s=>y.has(s)).length;
 if(intersection/(x.size+y.size-intersection)>.8)problems.push('Near-duplicate body paragraph: '+a.route+' and '+b.route);
}

if(problems.length)throw Error(problems.join('\n'));
console.log('PASS content: '+routes.length+' original pages; no placeholders, duplicate body paragraphs, or weak metadata lengths.');
