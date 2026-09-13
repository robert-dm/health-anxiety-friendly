import { getDb } from '../db/connection.js';
export const evidenceLabels = {
  health_anxiety: 'Declara atención de ansiedad por la salud',
  ocd: 'Declara experiencia o formación en TOC',
  dental_anxiety: 'Declara atención adaptada al miedo dental',
  claustrophobia: 'Publica una opción para claustrofobia',
  communication: 'Declara comunicación clara · sin evidencia específica en TOC',
};
export async function getEvidence({professionalId=null,facilityId=null}) {
  return getDb().prepare('select * from profile_evidence where professional_id = ? or facility_id = ? order by kind, id').all(professionalId,facilityId);
}
