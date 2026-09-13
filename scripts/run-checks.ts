import {audit} from './audit.ts';
for(const name of ['intent-conflicts','orphan-pages','external-links','meta','home-duplicates','page-density','media','canonical'])audit(name);
