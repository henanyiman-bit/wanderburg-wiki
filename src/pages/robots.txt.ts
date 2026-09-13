import type {APIContext} from 'astro';
export function GET({site}:APIContext){return new Response('User-agent: *\nAllow: /\nSitemap: '+new URL('/sitemap.xml',site||'https://wanderburg.ymmyi.wiki').href+'\n');}
