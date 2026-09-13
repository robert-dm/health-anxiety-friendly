import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import worker from '../src/worker.js';
import { verifyPassword } from '../src/auth/passwords.js';
const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys=ON');
for (const file of fs.readdirSync('drizzle').filter(file => file.endsWith('.sql')).sort()) db.exec(fs.readFileSync('drizzle/'+file,'utf8'));
function statement(sql, values=[]) {
  return {sql,values,bind(...params){return statement(sql,params);},async first(){return db.prepare(sql).get(...values) || null;},async all(){return {results:db.prepare(sql).all(...values)};},async run(){return {meta:{changes:db.prepare(sql).run(...values).changes}};}};
}
const env = { DB:{prepare:sql=>statement(sql), async batch(statements){db.exec('begin');try{const result=statements.map(item=>({meta:{changes:db.prepare(item.sql).run(...item.values).changes}}));db.exec('commit');return result;}catch(error){db.exec('rollback');throw error;}}}, ASSETS:{fetch:async()=>new Response('asset-ok')} };
let cookie, profile, suggestionId, reviewId;
async function send(path, method='GET', data={}, extra={}) {
  return worker.fetch(new Request('https://directory.test'+path,{method,headers:{origin:'https://directory.test',cookie:cookie || '',...extra},...(method==='POST'?{body:new URLSearchParams(data)}:{})}),env);
}
test('Worker serves the directory and registers a persistent session through async D1', async()=>{
  const home=await send('/');assert.equal(home.status,200);assert.match(await home.text(),/El directorio empieza/);
  const created=await send('/registro','POST',{email:'worker@example.test',password:'test-password-long',acceptedGuidelines:'yes'});
  assert.equal(created.status,303);assert.match(created.headers.get('set-cookie'),/Secure/);cookie=created.headers.get('set-cookie').split(';')[0];
  assert.equal((await send('/cuenta')).status,200);
  assert.equal(db.prepare('select count(*) as n from sessions').get().n,1);
});
test('Worker completes proposal moderation and review persistence with real constraints',async()=>{
  assert.equal((await send('/agregar','POST',{targetType:'professional',name:'Profesional para prueba',specialty:'Cardiología',city:'Haedo',reason:'Atención respetuosa y comunicación clara en la consulta.'})).status,303);
  suggestionId=db.prepare('select id from profile_suggestions').get().id;
  assert.equal((await send('/admin/suggestions/status','POST',{id:suggestionId,status:'published'})).status,403);
  db.prepare("update users set role='admin' where email='worker@example.test'").run();
  assert.equal((await send('/admin/suggestions/status','POST',{id:suggestionId,status:'published'})).status,303);
  profile=db.prepare('select * from professionals').get();assert.equal(profile.is_demo,0);assert.equal(profile.verification_status,'community');
  const q=await send('/buscar?q=cardiologo&where=Haedo');assert.equal(q.status,200);assert.match(await q.text(),/Profesional para prueba/);
  const scores=Object.fromEntries(['listening','respect','clear_communication','non_alarmist','avoids_reassurance_seeking','respects_limits','rational_tests','uncertainty_support','understands_health_anxiety'].map(key=>[key,'4']));
  assert.equal((await send('/review/profesional/'+profile.id,'POST',{...scores,overall_rating:'4',anonymous:'yes',comment:'Respetó mis preferencias de comunicación.'})).status,303);
  reviewId=db.prepare('select id from reviews').get().id;assert.equal(db.prepare('select count(*) as n from review_scores').get().n,9);
  assert.equal((await send('/admin/reviews/status','POST',{id:reviewId,status:'published'})).status,303);
  const page=await send('/profesionales/'+profile.slug);const html=await page.text();assert.match(html,/Paciente anónimo/);assert.doesNotMatch(html,/worker@example.test/);assert.match(html,/1 experiencia/);
});
test('Worker enforces origin and body limits and serves assets independently',async()=>{
  assert.equal((await send('/salir','POST',{}, {origin:'https://other.test'})).status,403);
  const big=await send('/registro','POST',{data:'x'.repeat(100001)});assert.equal(big.status,413);
  assert.equal(await (await send('/styles/main.css')).text(),'asset-ok');
  assert.equal((await send('/missing')).status,404);
});
test('Portable password verification accepts original Node scrypt hashes',async()=>{
  const salt=crypto.randomBytes(16), hash=crypto.scryptSync('legacy-password',salt,64);
  const stored=`scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
  assert.equal(await verifyPassword('legacy-password',stored),true);
  assert.equal(await verifyPassword('incorrect-password',stored),false);
});
after(()=>db.close());
