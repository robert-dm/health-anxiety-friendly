import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
const temp = mkdtempSync(join(tmpdir(), 'haf-test-'));
process.env.DATABASE_PATH = join(temp, 'test.db');
process.env.APP_ORIGIN = 'https://directory.test';
execFileSync(process.execPath, ['--no-warnings','src/db/seed.js'], {env:{...process.env,DEMO_DATA:'1'}});
const { getDb, setDefaultDatabase } = await import('../src/db/connection.js');
const { getNodeDb } = await import('../src/db/node.js');
setDefaultDatabase(getNodeDb());
const { searchTargets } = await import('../src/domain/search.js');
const { getProfessionalBySlug } = await import('../src/domain/profiles.js');
const { targetCard } = await import('../src/views/components/cards.js');
const { professionalPage } = await import('../src/views/pages/profile.js');
const { createReview } = await import('../src/domain/reviews.js');
const { registerUser } = await import('../src/domain/users.js');
const { createSession, parseCookies } = await import('../src/auth/sessions.js');
const { updateReviewStatus, updateSuggestionStatus } = await import('../src/domain/admin.js');
const { createProfileSuggestion } = await import('../src/domain/suggestions.js');
const { createReport } = await import('../src/domain/reports.js');
const { route } = await import('../src/server.js');
const db = getDb();
const user = (await registerUser({email:'reader@example.test',password:'a-long-test-password',displayName:'Private identity',acceptedGuidelines:true}));
const admin = (await registerUser({email:'admin@example.test',password:'a-long-test-password',acceptedGuidelines:true}));
db.prepare("update users set role='admin' where id=?").run(admin.userId);
const scores = Object.fromEntries(['listening','respect','clear_communication','non_alarmist','avoids_reassurance_seeking','respects_limits','rational_tests','uncertainty_support','understands_health_anxiety'].map(key => [key,'4']));
const form = {...scores,overall_rating:'4',comment:'Escuchó mis preferencias antes de comenzar.',anonymous:'yes',approx_visit_month:'2026-01'};
let reviewId, realId, realSlug;
async function request(path, { method='GET', body='', cookie='', origin='https://directory.test' }={}) {
  const req = new EventEmitter(); req.bodyReader = async () => body; Object.assign(req,{url:path,method,headers:{host:'directory.test',origin,cookie},socket:{encrypted:true}});
  const res = {status:0,headers:{},body:'',writeHead(status,headers){this.status=status;this.headers=headers;},end(body=''){this.body=body;}};
  const pending = route(req,res);
  if (method==='POST') { req.emit('data',body); req.emit('end'); }
  await pending; return res;
}
test('seed profiles are labeled, unverified and have no invented ratings', async () => {
  const results=(await searchTargets()); assert.equal(results.length,4);
  for (const item of results) { assert.equal(item.is_demo,1); assert.equal(item.published_review_count,0); assert.notEqual(item.verification_status,'verified'); assert.match(targetCard(item),/Perfil ficticio/); assert.doesNotMatch(targetCard(item),/4,7/); }
  assert.equal((await createReview({userId:user.userId,targetType:'professional',targetId:'pro-maria-rivas',form})).ok,false);
});
test('type, category, accent, location and modality filters work together', async () => {
  assert.equal((await searchTargets({tipo:'centros'})).length,2);
  assert.equal((await searchTargets({tipo:'profesionales'})).length,2);
  assert.equal((await searchTargets({categoria:'mental_health'})).length,1);
  assert.equal((await searchTargets({q:'Psicólogo TOC',modalidad:'virtual'})).length,1);
  assert.equal((await searchTargets({q:'ecografía',where:'Háedo',tipo:'centros'})).length,1);
  assert.equal((await searchTargets({q:'cardiólogo',where:'caballito'})).length,1);
  assert.equal((await searchTargets({verificado:true})).length,0);
});
test('publishing a proposal creates exactly one searchable community profile', async () => {
  const result = (await createProfileSuggestion({userId:user.userId,targetType:'professional',form:{name:'Profesional de prueba',specialty:'Cardiologia',city:'Morón',reason:'Experiencia de trato y comunicación respetuosa para probar el flujo.'}}));
  assert.equal(result.ok,true);
  const proposal = db.prepare('select id from profile_suggestions').get();
  assert.equal((await updateSuggestionStatus({suggestionId:proposal.id,status:'verified',moderatorId:admin.userId})).ok,false);
  assert.equal((await updateSuggestionStatus({suggestionId:proposal.id,status:'published',moderatorId:admin.userId})).ok,true);
  assert.equal((await updateSuggestionStatus({suggestionId:proposal.id,status:'published',moderatorId:admin.userId})).ok,false);
  const matches=(await searchTargets({q:'Profesional de prueba',where:'Moron'})); assert.equal(matches.length,1); assert.equal(matches[0].verification_status,'community'); realId=matches[0].id; realSlug=matches[0].slug;
});
test('published scores reflect actual reviews and remove hidden reviews immediately', async () => {
  const result=(await createReview({userId:user.userId,targetType:'professional',targetId:realId,form})); assert.equal(result.ok,true);reviewId=result.reviewId;
  assert.equal((await getProfessionalBySlug(realSlug)).published_review_count,0);
  (await updateReviewStatus({reviewId,status:'published',moderatorId:admin.userId}));
  const profile=(await getProfessionalBySlug(realSlug)); assert.equal(profile.published_review_count,1); assert.equal(profile.overall_average,4); assert.equal(profile.anxiety_compatibility_average,4);
  assert.match(professionalPage({professional:profile}),/Aún no mostramos un promedio/);
  assert.doesNotMatch(professionalPage({professional:profile}),/Private identity|reader@example/);
  (await updateReviewStatus({reviewId,status:'hidden',moderatorId:admin.userId})); assert.equal((await getProfessionalBySlug(realSlug)).published_review_count,0);
  (await updateReviewStatus({reviewId,status:'published',moderatorId:admin.userId}));
});
test('reports persist, duplicates are idempotent and do not hide criticism', async () => {
  const args={userId:user.userId,reviewId,reason:'personal_data',details:'Revisar el contenido.'};
  assert.equal((await createReport(args)).ok,true); assert.equal((await createReport(args)).ok,true);
  assert.equal(db.prepare('select count(*) as n from reports').get().n,1);
  assert.equal(db.prepare('select status from reviews where id=?').get(reviewId).status,'published');
  assert.equal((await createReport({...args,reason:'unsupported'})).ok,false);
});
test('server rejects cross-origin writes and normal users cannot moderate', async () => {
  const session=(await createSession(user.userId)); const cookie=`haf_session=${session.token}`;
  assert.equal((await request('/admin',{cookie})).status,403);
  assert.equal((await request('/admin/reviews/status',{method:'POST',cookie,body:`id=${reviewId}&status=hidden`})).status,403);
  assert.equal((await request('/registro',{method:'POST',origin:'https://attacker.test'})).status,403);
  assert.equal((await request('/registro',{method:'POST',origin:''})).status,403);
  const adminSession=(await createSession(admin.userId));
  assert.equal((await request('/admin/reviews/status',{method:'POST',cookie:`haf_session=${adminSession.token}`,body:`id=${reviewId}&status=hidden`})).status,303);
  assert.equal((await getProfessionalBySlug(realSlug)).published_review_count,0);
});
test('pages render expected filters, escaped values, and private caching', async () => {
  const home=await request('/'); assert.equal(home.status,200);assert.match(home.body,/La forma de atenderte/);assert.match(home.body,/favicon.svg/);
  const search=await request('/buscar?tipo=centros&q=%3Cscript%3E');assert.equal(search.status,200);assert.match(search.body,/&lt;script&gt;/);assert.match(search.body,/value="centros" selected/);assert.equal(search.headers['cache-control'],'no-store');
  const profile=await request('/profesionales/'+realSlug);assert.equal(profile.status,200);
});
test('invalid cookies and overlong submissions fail safely', async () => {
  assert.equal(parseCookies('haf_session=%GG').haf_session,undefined);
  assert.equal((await createReview({userId:user.userId,targetType:'professional',targetId:realId,form:{...form,comment:'x'.repeat(1601)}})).ok,false);
  assert.equal((await createReview({userId:user.userId,targetType:'professional',targetId:realId,form:{...form,approx_visit_month:'2026-99'}})).ok,false);
  assert.equal((await createProfileSuggestion({userId:user.userId,targetType:'facility',form:{name:'Test',city:'Morón',reason:'x'.repeat(50),website_url:'javascript:alert(1)'}})).ok,false);
});
after(()=>{db.close();rmSync(temp,{recursive:true,force:true});});
