import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import {loadEnv} from 'vite';
const env=loadEnv(process.env.NODE_ENV||'production',process.cwd(),'PUBLIC_');
const site = process.env.PUBLIC_SITE_URL || env.PUBLIC_SITE_URL || 'http://localhost:4321';
if (!/^https?:\/\//.test(site)) throw new Error('PUBLIC_SITE_URL must be an absolute HTTP(S) URL');
export default defineConfig({site, trailingSlash:'always', output:'static', integrations:[mdx()], vite:{plugins:[tailwindcss()]}});
