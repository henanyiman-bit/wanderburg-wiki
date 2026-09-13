import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';
const root=path.resolve('dist');
function walk(dir:string):string[]{return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
export function audit(check:string){
if(!fs.existsSync(root))throw Error('Build first: dist is missing.');
const docs=walk(root).filter(p=>p.endsWith('.html')).map(file=>{const html=fs.readFileSync(file,'utf8');const route='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'');return {file,html,route,$:load(html)};});
const failures:string[]=[];const fail=(route:string,msg:string)=>failures.push(route+': '+msg);
const exists=(url:URL)=>{const p=decodeURIComponent(url.pathname);return fs.existsSync(path.join(root,p,p.endsWith('/')?'index.html':''));};
const titles=new Set<string>();const descriptions=new Set<string>();
for(const d of docs){const {$,route}=d;const canonical=$('link[rel=canonical]').attr('href')||'';const base=canonical||'http://localhost:4321'+route;
if(check==='meta'){
const title=$('title').text();const description=$('meta[name=description]').attr('content')||'';
if(!title||titles.has(title))fail(route,'Missing or duplicate title');titles.add(title);
if(!description||descriptions.has(description))fail(route,'Missing or duplicate description');descriptions.add(description);
if($('h1').length!==1)fail(route,'Expected exactly one H1');
if(!canonical)fail(route,'Missing canonical');
for(const tag of ['og:title','og:description','og:url','og:image'])if(!$(`meta[property="${tag}"]`).attr('content'))fail(route,'Missing '+tag);
if(!$('meta[name="twitter:card"]').attr('content'))fail(route,'Missing Twitter card');
if(!$('time[datetime]').length)fail(route,'Missing updated date');
$('script[type="application/ld+json"]').each((_,el)=>{try{JSON.parse($(el).text());}catch{fail(route,'Invalid JSON-LD');}});
}
if(check==='canonical'){
try{const u=new URL(canonical);if(u.pathname!==route||!u.pathname.endsWith('/')||u.pathname!==u.pathname.toLowerCase()||u.search||u.hash)fail(route,'Invalid canonical path');const expected=process.env.PUBLIC_SITE_URL;if(expected&&u.origin!==new URL(expected).origin)fail(route,'Wrong canonical origin');if($('meta[property="og:url"]').attr('content')!==canonical)fail(route,'OG URL mismatch');}catch{fail(route,'Malformed canonical');}
}
if(check==='external-links'||check==='orphan-pages'){
$('a[href]').each((_,el)=>{const href=$(el).attr('href')!;try{const u=new URL(href,base);if(u.origin!==new URL(base).origin){if(check==='external-links')fail(route,'Unexpected external link '+href);return;}if(!exists(u))fail(route,'Broken internal URL '+href);else if(u.hash){const target=docs.find(d=>d.route===u.pathname);if(target&&!target.$('[id]').toArray().some(el=>target.$(el).attr('id')===decodeURIComponent(u.hash.slice(1))))fail(route,'Broken anchor '+href);}}catch{fail(route,'Invalid href '+href);}});
}
if(check==='page-density'){
$('main section').each((_,el)=>{const node=$(el);if(!node.text().trim()&&!node.find('svg,img,iframe').length)fail(route,'Empty section');});
if(!$('main').text().trim())fail(route,'Empty main content');
if((process.env.PUBLIC_AD_PROVIDER||'none')==='none'&&$('.ad-slot,iframe[src*="adsterra"],script[src*="adsterra"]').length)fail(route,'Visible disabled ad');
if($('.hero,.page-hero').filter((_,el)=>!$(el).text().trim()).length)fail(route,'Empty hero');
}
if(check==='media'){
$('img').each((_,el)=>{for(const attr of ['width','height','alt','loading'])if($(el).attr(attr)===undefined)fail(route,'Image missing '+attr);});
$('img[src],script[src],link[rel=stylesheet],meta[property="og:image"]').each((_,el)=>{const src=$(el).attr('src')||$(el).attr('href')||$(el).attr('content');if(src?.startsWith('data:'))return;if(src){const u=new URL(src,base);if(u.origin===new URL(base).origin&&!exists(u))fail(route,'Missing asset '+src);}});
$('iframe').each((_,el)=>{const src=$(el).attr('src');if(!src)fail(route,'Empty iframe');if(src?.includes('youtube')&&!src.startsWith('https://www.youtube-nocookie.com/embed/'))fail(route,'Non-private YouTube embed');if(!$(el).attr('title'))fail(route,'Iframe missing title');});
}
}
if(check==='orphan-pages'){
const inbound=new Map(docs.map(d=>[d.route,new Set<string>()]));for(const d of docs)d.$('a[href]').each((_,el)=>{const u=new URL(d.$(el).attr('href')!,'http://local'+d.route);if(u.origin==='http://local'&&u.pathname!==d.route)inbound.get(u.pathname)?.add(d.route);});for(const [route,links] of inbound)if(route!=='/'&&!links.size)fail(route,'Orphan page');
}
if(check==='intent-conflicts'){
const data=JSON.parse(fs.readFileSync('src/data/keywords.json','utf8')) as {primary:string;intent:string;url:string}[];for(const key of ['primary','intent','url'] as const){const set=new Set();for(const p of data){const value=p[key].trim().toLowerCase();if(!value||set.has(value))fail(p.url,'Duplicate or missing '+key);set.add(value);}}
const allSlugs=new Set<string>();for(const type of ['modules','captains','artifacts','weapons','vehicles','biomes','bosses']){const entities=JSON.parse(fs.readFileSync('src/data/database/'+type+'.json','utf8'));for(const e of entities){if(!e.name||!e.source||!e.updated||!e.slug)fail(type,'Incomplete entity evidence');if(allSlugs.has(e.slug))fail(type,'Entity core data duplicated across files: '+e.slug);allSlugs.add(e.slug);}}
}
if(check==='home-duplicates'){
const home=docs.find(d=>d.route==='/')!;const headings=new Set();home.$('main h2').each((_,el)=>{const text=home.$(el).text().trim().toLowerCase();if(headings.has(text))fail('/','Repeated section heading '+text);headings.add(text);});const hrefs=new Set();home.$('.portal-card').each((_,el)=>{const href=home.$(el).attr('href');if(hrefs.has(href))fail('/','Duplicate portal card '+href);hrefs.add(href);});if(hrefs.size<10)fail('/','Fewer than ten portal cards');
}
if(failures.length){console.error(failures.join('\n'));throw Error(check+': '+failures.length+' failure(s)');}
console.log('PASS '+check+' ('+docs.length+' pages)');return docs.length;
}
