import catalog from '../../data/expanded-directory-2026-09.json' with {type:'json'};
import { getDb } from './connection.js';
import { runBatch } from './batch.js';

// Trusted, versioned server catalog. No request input is accepted. Data imports
// are atomic and separate from schema migrations; existing profiles stay intact.
export async function importExpandedDirectory() {
  const db = getDb();
  if (await db.prepare('select id from directory_imports where id = ?').get(catalog.version)) return;
  const statements = [], now = new Date().toISOString();
  const add = (sql, ...params) => statements.push({sql,params});
  for (const [slug,name,category] of catalog.specialties) {
    add('insert or ignore into specialties (id,name,slug,category,active) values (?,?,?,?,1)', 'spec-'+slug,name,slug,category);
  }
  add('insert or ignore into study_types (id,name,slug,active) values (?,?,?,1)', 'study-resonancia-magnetica','Resonancia magnética','resonancia-magnetica');
  for (const row of catalog.records) {
    const location = 'loc-expanded-'+row.id;
    add('insert or ignore into locations (id,country_code,province,city,zone,neighborhood) values (?,\'AR\',?,?,?,?)', location,row.city === 'CABA' ? 'CABA' : 'Buenos Aires',row.city,row.city === 'Berazategui' ? 'Sur' : null,row.neighborhood);
    const notes = 'Datos publicados por el profesional o la institución. Fuente consultada el '+catalog.reviewedAt+'. Ver evidencia y alcance en este perfil.';
    if (row.type === 'professional') {
      add(`insert or ignore into professionals (id,slug,display_name,bio,primary_specialty_id,location_id,address_public,website_url,public_phone,care_modes,verification_status,source_notes,created_at,updated_at,is_demo) values (?,?,?,?,(select id from specialties where slug=?),?,?,?,?,?,'incomplete',?,?,?,0)`,row.id,row.slug,row.name,row.description,row.specialty,location,row.address,row.website,row.phone,'["in_person"]',notes,now,now);
      add(`insert or ignore into professional_specialties (professional_id,specialty_id) select p.id,s.id from professionals p,specialties s where p.slug=? and s.slug=?`,row.slug,row.specialty);
    } else {
      add(`insert or ignore into facilities (id,slug,name,description,facility_type,location_id,address_public,website_url,public_phone,verification_status,source_notes,created_at,updated_at,is_demo) values (?,?,?,?,?,?,?,?,?,'incomplete',?,?,?,0)`,row.id,row.slug,row.name,row.description,row.facilityType,location,row.address,row.website,row.phone,notes,now,now);
      add(`insert or ignore into facility_specialties (facility_id,specialty_id) select f.id,s.id from facilities f,specialties s where f.slug=? and s.slug=?`,row.slug,row.specialty);
      for (const study of row.studies) add(`insert or ignore into facility_study_types (facility_id,study_type_id) select f.id,s.id from facilities f,study_types s where f.slug=? and s.slug=?`,row.slug,study);
    }
  }
  for (const id of ['fac-toc-argentina','fac-instituto-realize']) {
    for (const slug of ['psicologia','psiquiatria']) add(`insert or ignore into facility_specialties (facility_id,specialty_id) select f.id,s.id from facilities f,specialties s where f.id=? and s.slug=?`,id,slug);
  }
  for (const row of catalog.evidence) {
    const column = row.type === 'professional' ? 'professional_id' : 'facility_id';
    const table = row.type === 'professional' ? 'professionals' : 'facilities';
    // SELECT protects against a previously removed or renamed profile.
    add(`insert or ignore into profile_evidence (id,${column},kind,scope,summary,source_url,source_title,reviewed_at) select ?,id,?,?,?,?,?,? from ${table} where id=?`, 'evidence-'+row.target+'-'+row.kind,row.kind,row.scope,row.summary,row.url,row.title,catalog.reviewedAt,row.target);
  }
  add('insert or ignore into directory_imports (id,applied_at) values (?,?)',catalog.version,now);
  await runBatch(db,statements);
}
