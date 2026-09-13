const now = () => new Date().toISOString();

function run(db, sql, params = []) {
  db.prepare(sql).run(...params);
}

function insertSpecialty(db, id, name, slug, category) {
  run(db, `insert into specialties (id, name, slug, category, active)
    values (?, ?, ?, ?, 1)
    on conflict(slug) do nothing`, [id, name, slug, category]);
}

function insertLocation(db, row) {
  run(db, `insert into locations (id, country_code, province, city, zone, neighborhood)
    values (?, 'AR', ?, ?, ?, ?)
    on conflict(id) do nothing`, [row.id, row.province, row.city, row.zone ?? null, row.neighborhood ?? null]);
}

function insertProfessional(db, row) {
  run(db, `insert into professionals (
      id, slug, first_name, last_name, display_name, bio, primary_specialty_id,
      license_number, institution, location_id, address_public, website_url,
      public_phone, care_modes, verification_status, source_notes, created_at,
      updated_at, is_demo
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?, 0)
    on conflict(slug) do nothing`, [
      row.id, row.slug, row.firstName ?? null, row.lastName ?? null, row.displayName,
      row.bio ?? null, row.specialtyId, row.licenseNumber ?? null, row.institution ?? null,
      row.locationId ?? null, row.address ?? null, row.website ?? null, row.phone ?? null,
      JSON.stringify(row.careModes ?? []), row.sourceNotes, now(), now()
    ]);
}

function insertFacility(db, row) {
  run(db, `insert into facilities (
      id, slug, name, description, facility_type, location_id, address_public,
      website_url, public_phone, verification_status, source_notes, created_at,
      updated_at, is_demo
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?, 0)
    on conflict(slug) do nothing`, [
      row.id, row.slug, row.name, row.description ?? null, row.facilityType,
      row.locationId ?? null, row.address ?? null, row.website ?? null,
      row.phone ?? null, row.sourceNotes, now(), now()
    ]);
}

/**
 * Curated public directory.
 *
 * IMPORTANT: `verified` here means the public identity/basic professional or
 * institutional information was checked against the cited public source.
 * It does NOT mean Health Anxiety Friendly endorses the provider or guarantees
 * any particular bedside manner. Compatibility ratings must come from users.
 */
export function importCuratedDirectory(db) {
  // Remove only the repository's explicitly fictitious demo records.
  run(db, `delete from professional_specialties where professional_id in (select id from professionals where is_demo = 1)`);
  run(db, `delete from facility_study_types where facility_id in (select id from facilities where is_demo = 1)`);
  run(db, `delete from professionals where is_demo = 1`);
  run(db, `delete from facilities where is_demo = 1`);

  [
    ['spec-psicologia', 'Psicologia', 'psicologia', 'mental_health'],
    ['spec-psiquiatria', 'Psiquiatria', 'psiquiatria', 'mental_health'],
    ['spec-cardiologia', 'Cardiologia', 'cardiologia', 'medical'],
    ['spec-clinica', 'Clinica medica', 'clinica-medica', 'medical'],
    ['spec-gastro', 'Gastroenterologia', 'gastroenterologia', 'medical'],
    ['spec-dermatologia', 'Dermatologia', 'dermatologia', 'medical'],
    ['spec-neurologia', 'Neurologia', 'neurologia', 'medical'],
    ['spec-otorrino', 'Otorrinolaringologia', 'otorrinolaringologia', 'medical'],
    ['spec-endocrino', 'Endocrinologia', 'endocrinologia', 'medical'],
    ['spec-gineco', 'Ginecologia', 'ginecologia', 'medical'],
    ['spec-urologia', 'Urologia', 'urologia', 'medical'],
    ['spec-oftalmo', 'Oftalmologia', 'oftalmologia', 'medical'],
  ].forEach((s) => insertSpecialty(db, ...s));

  [
    { id: 'loc-palermo-curated', province: 'CABA', city: 'CABA', zone: 'Norte', neighborhood: 'Palermo' },
    { id: 'loc-recoleta-curated', province: 'CABA', city: 'CABA', zone: 'Norte', neighborhood: 'Recoleta' },
    { id: 'loc-belgrano-curated', province: 'CABA', city: 'CABA', zone: 'Norte', neighborhood: 'Belgrano' },
    { id: 'loc-nunez-curated', province: 'CABA', city: 'CABA', zone: 'Norte', neighborhood: 'Nunez' },
    { id: 'loc-quilmes-curated', province: 'Buenos Aires', city: 'Quilmes', zone: 'Sur', neighborhood: 'Quilmes Centro' },
    { id: 'loc-caba-curated', province: 'CABA', city: 'CABA', zone: null, neighborhood: null },
  ].forEach((l) => insertLocation(db, l));

  const professionals = [
    {
      id: 'pro-ricardo-perez-rivera', slug: 'dr-ricardo-perez-rivera', firstName: 'Ricardo', lastName: 'Perez Rivera',
      displayName: 'Dr. Ricardo Perez Rivera', specialtyId: 'spec-psiquiatria', institution: 'TOC Argentina',
      locationId: 'loc-palermo-curated', address: 'Bulnes 1937, 1 B, CABA', phone: '+54 9 11 6405-9055',
      website: 'https://www.tocargentina.com.ar/DrPerezRivera.html', careModes: ['in_person'],
      bio: 'Psiquiatra y director de TOC Argentina, centro dedicado al TOC y trastornos relacionados, incluida la hipocondria/ansiedad por la salud.',
      sourceNotes: 'Fuente: TOC Argentina. El centro declara tratamiento de TOC, trastornos relacionados e hipocondria mediante abordaje cognitivo-conductual y farmacologico cuando corresponde. Verificado 2026-09-13. La verificacion no implica recomendacion ni garantiza compatibilidad individual.'
    },
    {
      id: 'pro-camila-steigmeier', slug: 'lic-camila-steigmeier', firstName: 'Camila', lastName: 'Steigmeier',
      displayName: 'Lic. Camila Steigmeier', specialtyId: 'spec-psicologia', licenseNumber: 'MN 54309', institution: 'TOC Argentina',
      locationId: 'loc-palermo-curated', address: 'Palermo, CABA', website: 'https://www.tocargentina.com.ar/equipo.html',
      phone: '+54 9 11 6405-9055', careModes: ['in_person'],
      bio: 'Psicologa especializada en TOC, certificada BTTI por la International OCD Foundation.',
      sourceNotes: 'Fuente: equipo TOC Argentina. Especialista en TOC, certificacion BTTI IOCDF y formacion TCC especifica. Verificado 2026-09-13.'
    },
    {
      id: 'pro-agnese-parisi', slug: 'lic-agnese-parisi', firstName: 'Agnese', lastName: 'Parisi',
      displayName: 'Lic. Agnese Parisi', specialtyId: 'spec-psicologia', licenseNumber: 'MN 69344', institution: 'TOC Argentina',
      locationId: 'loc-palermo-curated', address: 'Palermo, CABA', website: 'https://www.tocargentina.com.ar/equipo.html',
      phone: '+54 9 11 6405-9055', careModes: ['in_person'],
      bio: 'Psicologa con especializacion en psicologia clinica/TCC, trastornos de ansiedad y formacion especifica en TOC.',
      sourceNotes: 'Fuente: equipo TOC Argentina. Declara formacion en TOC y tratamiento cognitivo-conductual del TOC, junto con formacion en trastornos de ansiedad. Verificado 2026-09-13.'
    },
    {
      id: 'pro-florencia-portero', slug: 'lic-florencia-portero', firstName: 'Maria Florencia', lastName: 'Portero',
      displayName: 'Lic. Maria Florencia Portero', specialtyId: 'spec-psicologia', licenseNumber: 'MN 53389', institution: 'TOC Argentina',
      locationId: 'loc-palermo-curated', address: 'Palermo, CABA', website: 'https://www.tocargentina.com.ar/equipo.html',
      phone: '+54 9 11 6405-9055', careModes: ['in_person'],
      bio: 'Psicologa infantojuvenil y de adultos, especialista en psicoterapia cognitivo-conductual integrativa y diplomada en TOC y espectro.',
      sourceNotes: 'Fuente: equipo TOC Argentina. Diplomada en TOC y Espectro por TOC Argentina y formada en terapias contextuales. Verificado 2026-09-13.'
    },
    {
      id: 'pro-carola-wainhaus', slug: 'dra-carola-wainhaus', firstName: 'Carola', lastName: 'Wainhaus',
      displayName: 'Dra. Carola Wainhaus', specialtyId: 'spec-psiquiatria', licenseNumber: 'MN 172033', institution: 'TOC Argentina',
      locationId: 'loc-palermo-curated', address: 'Palermo, CABA', website: 'https://www.tocargentina.com.ar/equipo.html',
      phone: '+54 9 11 6405-9055', careModes: ['in_person'],
      bio: 'Medica psiquiatra del equipo de TOC Argentina, con posgrado en trastornos de ansiedad y psicofarmacologia.',
      sourceNotes: 'Fuente: equipo TOC Argentina. Medica psiquiatra y admisora en TOC Argentina; posgrado en trastornos de ansiedad (AATA). Verificado 2026-09-13.'
    },
    {
      id: 'pro-leonel-galeppi', slug: 'lic-leonel-galeppi', firstName: 'Leonel', lastName: 'Galeppi',
      displayName: 'Lic. Leonel Galeppi', specialtyId: 'spec-psicologia', licenseNumber: 'MN 60173 / MP 62403', institution: 'TOC Argentina',
      locationId: 'loc-quilmes-curated', address: 'Quilmes Centro, Buenos Aires', website: 'https://www.tocargentina.com.ar/equipo.html',
      phone: '+54 9 11 6405-9055', careModes: ['in_person'],
      bio: 'Psicologo de ninos, adolescentes y adultos, con entrenamiento clinico en TOC por International OCD Foundation.',
      sourceNotes: 'Fuente: equipo TOC Argentina. Entrenamiento clinico en TOC por IOCDF y formacion en trastornos de ansiedad. Verificado 2026-09-13.'
    },
    {
      id: 'pro-romina-raffo', slug: 'lic-romina-raffo', firstName: 'Romina', lastName: 'Raffo',
      displayName: 'Lic. Romina Raffo', specialtyId: 'spec-psicologia', licenseNumber: 'MN 37484', institution: 'TOC Argentina',
      locationId: 'loc-nunez-curated', address: 'Nunez, CABA', website: 'https://www.tocargentina.com.ar/equipo.html',
      phone: '+54 9 11 6405-9055', careModes: ['in_person'],
      bio: 'Psicologa clinica con orientacion TCC y formacion/docencia en TOC y espectro obsesivo-compulsivo.',
      sourceNotes: 'Fuente: equipo TOC Argentina. Orientacion TCC, workshop y actividad docente de posgrado en TOC y espectro. Verificado 2026-09-13.'
    },
    {
      id: 'pro-marcos-irrazabal', slug: 'lic-marcos-irrazabal', firstName: 'Marcos', lastName: 'Irrazabal',
      displayName: 'Lic. Marcos Irrazabal', specialtyId: 'spec-psicologia',
      locationId: 'loc-recoleta-curated', address: 'Av. Gral. Las Heras 2670, CABA', website: 'https://iocdf.org/providers/irrazabal-marcos/',
      phone: '+54 11 7655-1184', careModes: ['virtual'],
      bio: 'Psicologo BTTI entrenado por IOCDF. Ofrece Exposicion y Prevencion de Respuesta (ERP) para pacientes con TOC.',
      sourceNotes: 'Fuente: International OCD Foundation. Listado autoinformado; IOCDF indica que verifica licencia y finalizacion de BTTI. El perfil declara aproximadamente 100 pacientes con TOC/trastornos relacionados y uso de ERP. Verificado 2026-09-13.'
    },
    {
      id: 'pro-daniela-gilotti', slug: 'lic-daniela-belen-gilotti', firstName: 'Daniela Belen', lastName: 'Gilotti',
      displayName: 'Lic. Daniela Belen Gilotti', specialtyId: 'spec-psicologia', locationId: 'loc-caba-curated',
      website: 'https://iocdf.org/es/proveedores/gilotti-daniela-belen/', phone: '+54 11 3044-2054', careModes: ['in_person', 'virtual'],
      bio: 'Psicologa BTTI entrenada por IOCDF, con una parte sustancial de su practica dedicada a evaluacion y tratamiento de TOC y trastornos relacionados mediante TCC con EPR.',
      sourceNotes: 'Fuente: International OCD Foundation. IOCDF indica que verifica licencia y finalizacion BTTI. El perfil declara 50-60% de practica clinica dedicada a TOC/trastornos relacionados y uso principal de TCC con EPR. Verificado 2026-09-13.'
    },
    {
      id: 'pro-noelia-mayen-poclaba', slug: 'lic-noelia-mayen-poclaba', firstName: 'Noelia', lastName: 'Mayen Poclaba',
      displayName: 'Lic. Noelia Mayen Poclaba', specialtyId: 'spec-psicologia', licenseNumber: 'Ministerio de Salud verificado por Psychology Today',
      locationId: 'loc-caba-curated', address: 'Viamonte 1592, CABA', website: 'https://www.psychologytoday.com/ar/psicologos/noelia-mayen-poclaba-buenos-aires-ba/1275763',
      careModes: ['in_person', 'virtual'],
      bio: 'Psicologa UBA con orientacion TCC/DBT que declara especializacion en TOC y trabajo con EPR.',
      sourceNotes: 'Fuente: Psychology Today. Perfil profesional verificado por el directorio; declara trabajo con TOC mediante Exposicion y Prevencion de Respuesta. Verificado 2026-09-13.'
    },
    {
      id: 'pro-victoria-tomeo', slug: 'lic-victoria-tomeo', firstName: 'Victoria', lastName: 'Tomeo',
      displayName: 'Lic. Victoria Tomeo', specialtyId: 'spec-psicologia', locationId: 'loc-caba-curated',
      website: 'https://www.doctoraliar.com/perfil/victoria-tomeo-4', careModes: ['in_person', 'virtual'],
      bio: 'Psicologa que declara experiencia en trastornos de ansiedad, TOC y fobias, utilizando ERP, ACT y mindfulness.',
      sourceNotes: 'Fuente: Doctoralia. El perfil declara experiencia en ansiedad, TOC y fobias y uso de ERP/ACT. Verificado 2026-09-13.'
    },
    {
      id: 'pro-ana-paula-rodriguez-villegas', slug: 'dra-ana-paula-rodriguez-villegas', firstName: 'Ana Paula', lastName: 'Rodriguez Villegas',
      displayName: 'Dra. Ana Paula Rodriguez Villegas', specialtyId: 'spec-psiquiatria', locationId: 'loc-belgrano-curated',
      address: 'La Pampa 2477, Piso 11 A, CABA', website: 'https://www.topdoctors.com.ar/trastorno-obsesivo-compulsivo/buenos-aires-capital-caba/', careModes: ['in_person'],
      bio: 'Psiquiatra listada con experiencia en TOC, ansiedad y ataques de panico.',
      sourceNotes: 'Fuente: Top Doctors Argentina. Figura como psiquiatra experta en TOC y ansiedad. Verificado 2026-09-13. La fuente no demuestra especificamente manejo de ansiedad por la salud; requiere experiencias de la comunidad.'
    },
    {
      id: 'pro-vanesa-ordines', slug: 'dra-vanesa-ordines', firstName: 'Vanesa', lastName: 'Ordines',
      displayName: 'Dra. Vanesa Ordines', specialtyId: 'spec-psiquiatria', locationId: 'loc-caba-curated',
      website: 'https://www.topdoctors.com.ar/trastorno-obsesivo-compulsivo/buenos-aires-capital-caba/', careModes: ['virtual'],
      bio: 'Psiquiatra listada con experiencia en TOC, ataques de panico y ansiedad; atencion por telemedicina.',
      sourceNotes: 'Fuente: Top Doctors Argentina. Figura como experta en TOC y ansiedad. Verificado 2026-09-13. La fuente no demuestra especificamente manejo de ansiedad por la salud; requiere experiencias de la comunidad.'
    },
    {
      id: 'pro-alicia-portela', slug: 'dra-alicia-andrea-portela', firstName: 'Alicia Andrea', lastName: 'Portela',
      displayName: 'Dra. Alicia Andrea Portela', specialtyId: 'spec-psiquiatria', locationId: 'loc-recoleta-curated',
      address: 'Junin 977, 5 C, CABA', website: 'https://www.topdoctors.com.ar/trastorno-obsesivo-compulsivo/buenos-aires-capital-caba/', careModes: ['in_person'],
      bio: 'Psiquiatra listada con experiencia en TOC y psicofarmacologia.',
      sourceNotes: 'Fuente: Top Doctors Argentina. Figura como experta en TOC. Verificado 2026-09-13. Requiere experiencias de la comunidad para valorar compatibilidad con ansiedad por la salud.'
    }
  ];

  professionals.forEach((p) => insertProfessional(db, p));

  const facilities = [
    {
      id: 'fac-toc-argentina', slug: 'toc-argentina', name: 'TOC Argentina', facilityType: 'clinic',
      locationId: 'loc-palermo-curated', address: 'Bulnes 1937, 1 B, CABA', website: 'https://www.tocargentina.com.ar/',
      phone: '+54 9 11 6405-9055',
      description: 'Centro psicologico y psiquiatrico dedicado al TOC y trastornos relacionados, incluida la hipocondria/ansiedad por la salud.',
      sourceNotes: 'Fuente institucional: TOC Argentina. Declara explicitamente tratamiento de hipocondria/trastornos de sintomas somaticos, TOC y trastornos relacionados con TCC y abordaje psiquiatrico. Verificado 2026-09-13.'
    },
    {
      id: 'fac-instituto-realize', slug: 'instituto-realize', name: 'Instituto Realize', facilityType: 'clinic',
      locationId: 'loc-caba-curated', website: 'https://toctaniaborda.com/instituto-realize-2/',
      description: 'Instituto de psicologia y psiquiatria con trayectoria en investigacion y tratamientos de TOC y trastornos relacionados.',
      sourceNotes: 'Fuente institucional: Instituto Realize / Tania Borda. El instituto declara mas de veinte anos de trayectoria en investigacion y tratamientos de psicologia y psiquiatria y continuidad de la ex filial argentina del Bio Behavioral Institute. Verificado 2026-09-13.'
    }
  ];

  facilities.forEach((f) => insertFacility(db, f));
}
