import { defineCollection } from 'astro:content';
import {z} from 'zod';
import { glob } from 'astro/loaders';
export const collections={guides:defineCollection({loader:glob({pattern:'**/*.mdx',base:'./src/content/guides'}),schema:z.object({title:z.string(),quickAnswer:z.string(),tip:z.string(),warning:z.string()})})};
