import { getDb } from "./connection.js";
import { migrate } from "./migrate.js";

const now = new Date().toISOString();

function insertMany(db, sql, rows) {
  const statement = db.prepare(sql);
  for (const row of rows) statement.run(...row);
}

export function seed() {
  migrate();
  const db = getDb();

  const existing = db.prepare("select count(*) as count from specialties").get().count;
  if (existing > 0) {
    console.log("Seed data already exists");
    return;
  }

  insertMany(db, "insert into specialties (id, name, slug, category, active) values (?, ?, ?, ?, 1)", [
    ["spec-psicologia", "Psicologia", "psicologia", "mental_health"],
    ["spec-psiquiatria", "Psiquiatria", "psiquiatria", "mental_health"],
    ["spec-cardiologia", "Cardiologia", "cardiologia", "medical"],
    ["spec-clinica", "Clinica medica", "clinica-medica", "medical"],
    ["spec-dermatologia", "Dermatologia", "dermatologia", "medical"],
  ]);

  insertMany(db, "insert into study_types (id, name, slug, active) values (?, ?, ?, 1)", [
    ["study-eco", "Ecografia", "ecografia"],
    ["study-rmn", "Resonancia", "resonancia"],
    ["study-tac", "Tomografia", "tomografia"],
    ["study-lab", "Laboratorio", "laboratorio"],
    ["study-cardio", "Estudios cardiologicos", "estudios-cardiologicos"],
  ]);

  insertMany(db, "insert into locations (id, country_code, province, city, zone, neighborhood) values (?, 'AR', ?, ?, ?, ?)", [
    ["loc-palermo", "CABA", "CABA", "Norte", "Palermo"],
    ["loc-caballito", "CABA", "CABA", "Centro", "Caballito"],
    ["loc-haedo", "Buenos Aires", "Haedo", "Oeste", null],
    ["loc-moron", "Buenos Aires", "Moron", "Oeste", null],
  ]);

  insertMany(
    db,
    `insert into professionals (
      id, slug, first_name, last_name, display_name, bio, primary_specialty_id, institution,
      location_id, address_public, website_url, public_phone, care_modes, verification_status,
      source_notes, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      [
        "pro-maria-rivas",
        "dra-maria-rivas",
        "Maria",
        "Rivas",
        "Dra. Maria Rivas",
        "Cardiologa con enfoque de comunicacion clara y consultas ordenadas.",
        "spec-cardiologia",
        "Consultorio privado",
        "loc-caballito",
        "Caballito, CABA",
        "https://example.com",
        null,
        JSON.stringify(["in_person"]),
        "verified",
        "Informacion publica verificada para datos basicos.",
        now,
        now,
      ],
      [
        "pro-laura-acosta",
        "lic-laura-acosta",
        "Laura",
        "Acosta",
        "Lic. Laura Acosta",
        "Psicologa especializada en ansiedad, TOC y manejo de incertidumbre.",
        "spec-psicologia",
        "Centro terapeutico Palermo",
        "loc-palermo",
        "Palermo, CABA",
        null,
        null,
        JSON.stringify(["in_person", "virtual"]),
        "community",
        "Perfil agregado por la comunidad.",
        now,
        now,
      ],
    ],
  );

  insertMany(
    db,
    `insert into facilities (
      id, slug, name, description, facility_type, location_id, address_public, website_url,
      public_phone, verification_status, source_notes, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      [
        "fac-diagnostico-haedo",
        "diagnostico-haedo",
        "Diagnostico Haedo",
        "Centro de estudios por imagenes y laboratorio.",
        "diagnostic_center",
        "loc-haedo",
        "Haedo, Buenos Aires",
        null,
        null,
        "community",
        "Perfil agregado por la comunidad.",
        now,
        now,
      ],
      [
        "fac-imagenes-caballito",
        "imagenes-caballito",
        "Imagenes Caballito",
        "Centro de ecografia, resonancia y tomografia.",
        "diagnostic_center",
        "loc-caballito",
        "Caballito, CABA",
        null,
        null,
        "verified",
        "Informacion publica verificada para datos basicos.",
        now,
        now,
      ],
    ],
  );

  insertMany(db, "insert into facility_study_types (facility_id, study_type_id) values (?, ?)", [
    ["fac-diagnostico-haedo", "study-eco"],
    ["fac-diagnostico-haedo", "study-lab"],
    ["fac-imagenes-caballito", "study-eco"],
    ["fac-imagenes-caballito", "study-rmn"],
    ["fac-imagenes-caballito", "study-tac"],
  ]);

  insertMany(
    db,
    `insert into profile_rating_summaries (
      id, professional_id, facility_id, published_review_count, overall_average,
      anxiety_compatibility_average, confidence_score, score_breakdown_json, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ["sum-pro-maria-rivas", "pro-maria-rivas", null, 12, 4.7, 4.6, 0.78, JSON.stringify({ listening: 4.8, non_alarmist: 4.6 }), now],
      ["sum-pro-laura-acosta", "pro-laura-acosta", null, 3, 4.9, 4.8, 0.32, JSON.stringify({ uncertainty_support: 4.8 }), now],
      ["sum-fac-diagnostico-haedo", null, "fac-diagnostico-haedo", 5, 4.4, 4.3, 0.46, JSON.stringify({ no_unrequested_findings: 4.1 }), now],
      ["sum-fac-imagenes-caballito", null, "fac-imagenes-caballito", 18, 4.5, 4.4, 0.82, JSON.stringify({ organization: 4.5 }), now],
    ],
  );

  console.log("Seed data inserted");
}

seed();
