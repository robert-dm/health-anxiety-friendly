import crypto from "node:crypto";
import { getDb } from "../db/connection.js";

const allowedTargets = new Set(["professional", "facility"]);

function clean(value, max = 240) {
  return String(value || "").trim().slice(0, max);
}

export function createProfileSuggestion({ userId, targetType, form }) {
  const errors = [];
  const normalizedTargetType = allowedTargets.has(targetType) ? targetType : "";

  if (!normalizedTargetType) errors.push("Elegi si queres agregar un profesional o un centro.");
  if (!clean(form.name, 120)) errors.push("El nombre es obligatorio.");

  const payload = {
    name: clean(form.name, 120),
    specialty: clean(form.specialty, 120),
    institution: clean(form.institution, 120),
    city: clean(form.city, 80),
    neighborhood: clean(form.neighborhood, 80),
    address_public: clean(form.address_public, 160),
    website_url: clean(form.website_url, 200),
    public_phone: clean(form.public_phone, 80),
    relationship: clean(form.relationship, 80),
    reason: clean(form.reason, 1200),
  };

  if (normalizedTargetType === "professional" && !payload.specialty) errors.push("La especialidad es obligatoria.");
  if (normalizedTargetType === "facility" && !payload.city) errors.push("La ciudad es obligatoria.");
  if (!payload.reason || payload.reason.length < 20) errors.push("Contanos brevemente por que puede ser util para la comunidad.");
  if (payload.reason.length > 1200) errors.push("La descripcion es demasiado larga.");

  if (errors.length) return { ok: false, errors };

  getDb()
    .prepare("insert into profile_suggestions (id, submitted_by, target_type, payload_json, status, created_at) values (?, ?, ?, ?, 'pending', ?)")
    .run(crypto.randomUUID(), userId, normalizedTargetType, JSON.stringify(payload), new Date().toISOString());

  return { ok: true };
}

export function getUserSuggestions(userId) {
  return getDb()
    .prepare("select id, target_type, payload_json, status, created_at from profile_suggestions where submitted_by = ? order by created_at desc limit 20")
    .all(userId)
    .map((row) => ({ ...row, payload: JSON.parse(row.payload_json) }));
}
