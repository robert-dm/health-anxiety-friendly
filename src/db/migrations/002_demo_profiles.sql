alter table professionals add column is_demo integer not null default 0 check (is_demo in (0, 1));
alter table facilities add column is_demo integer not null default 0 check (is_demo in (0, 1));
-- These exact IDs belong to the original development seed, never real referrals.
update professionals set is_demo = 1, verification_status = 'incomplete', source_notes = 'Perfil ficticio de demostración; no es una recomendación.' where id in ('pro-maria-rivas', 'pro-laura-acosta');
update facilities set is_demo = 1, verification_status = 'incomplete', source_notes = 'Perfil ficticio de demostración; no es una recomendación.' where id in ('fac-diagnostico-haedo', 'fac-imagenes-caballito');
