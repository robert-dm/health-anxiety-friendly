import crypto from 'node:crypto';
import { getDb } from '../db/connection.js';
export const reportReasons = { personal_data:'Datos personales', harassment:'Insulto o acoso', advertising:'Publicidad o spam', fabricated:'Experiencia posiblemente inventada', medical_advice:'Contenido médico peligroso o búsqueda de diagnóstico', conflict:'Conflicto de interés', other:'Otro motivo' };
export async function createReport({ userId, reviewId, reason, details }) {
  const db = getDb();
  if (!Object.hasOwn(reportReasons, reason)) return { ok:false, errors:['Elegí un motivo válido.'] };
  const text = String(details || '').trim();
  if (text.length > 1200) return { ok:false, errors:['El detalle no puede superar 1200 caracteres.'] };
  if (!(await db.prepare("select id from reviews where id = ? and status = 'published'").get(reviewId))) return { ok:false, errors:['No encontramos esa experiencia publicada.'] };
  if ((await db.prepare("select id from reports where reporter_id = ? and review_id = ? and status in ('open','reviewing')").get(userId,reviewId))) return { ok:true };
  (await db.prepare("insert into reports (id,reporter_id,review_id,reason,details,created_at) values (?,?,?,?,?,?)").run(crypto.randomUUID(),userId,reviewId,reason,text || null,new Date().toISOString()));
  return { ok:true };
}
