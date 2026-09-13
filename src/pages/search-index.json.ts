import {searchIndex} from '../lib/data';
export function GET(){return new Response(JSON.stringify(searchIndex),{headers:{'Content-Type':'application/json'}});}
