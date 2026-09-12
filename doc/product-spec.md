# Health Anxiety Friendly — Product Specification v0.1

## 1. Objetivo

Crear una plataforma comunitaria para encontrar y evaluar profesionales de salud y centros de diagnóstico compatibles con pacientes con ansiedad por la salud, TOC relacionado con la salud/enfermedad, hipocondría y otras formas de ansiedad donde la comunicación médica sea especialmente importante.

La plataforma no pretende determinar si un profesional es “médicamente bueno” en términos absolutos. Su objetivo específico es ayudar a responder:

> ¿Este profesional o centro sabe atender a una persona con ansiedad por la salud sin generar innecesariamente más ansiedad, reaseguramiento o conductas compulsivas?

## 2. Principios del producto

### 2.1 Información objetiva ≠ experiencia del paciente

Cada perfil debe separar claramente:

**Información verificada**
- especialidad
- formación
- institución
- ubicación
- matrícula, cuando corresponda
- experiencia declarada
- información pública comprobable

**Experiencias de pacientes**
- ratings
- comentarios
- experiencias positivas y negativas

**Evaluación de la comunidad**
- puntuaciones específicas sobre comunicación y manejo de ansiedad por la salud

No mezclar estas tres categorías.

### 2.2 La plataforma no debe alimentar el trastorno

El producto no debe convertirse en una herramienta para buscar reaseguramiento.

Evitar:
- rankings del tipo “el médico que nunca encuentra nada”
- promesas de “te va a decir que no tenés nada”
- contenido que incentive repetir estudios
- mecanismos diseñados para tranquilización inmediata
- publicaciones buscando confirmar que un síntoma “no es nada”

La plataforma debe facilitar una mejor elección de atención, no proporcionar diagnóstico ni reaseguramiento.

## 3. Tipos de usuarios

### Visitante
Puede:
- buscar profesionales
- buscar centros
- ver perfiles
- leer ratings y experiencias

No puede publicar.

### Usuario registrado
Puede:
- valorar profesionales
- escribir experiencias
- agregar profesionales
- agregar centros
- guardar favoritos
- reportar contenido
- editar sus propias experiencias

### Profesional / institución
Puede:
- reclamar/verificar su perfil
- completar información
- responder públicamente a experiencias
- solicitar correcciones de información objetiva

No puede borrar libremente opiniones de pacientes.

### Administrador
Puede:
- verificar información
- moderar experiencias
- eliminar spam
- gestionar reportes
- bloquear usuarios
- administrar categorías
- gestionar profesionales y centros

## 4. Categorías principales

### Profesionales de salud mental
- Psicología
- Psiquiatría
- Otros profesionales relacionados

Especial atención a:
- TOC
- TOC de enfermedad
- ansiedad por la salud
- TCC
- EPR/ERP

### Médicos
- Clínica médica
- Cardiología
- Gastroenterología
- Dermatología
- Neurología
- Otorrinolaringología
- Endocrinología
- etc.

La plataforma debe permitir agregar nuevas especialidades.

### Centros de diagnóstico
- Ecografía
- Resonancia
- Tomografía
- Radiología
- Laboratorio
- Endoscopía
- Estudios cardiológicos
- Otros estudios

## 5. Página de un profesional

Ejemplo:

### Dra. María X
**Cardióloga**
CABA

⭐ 4,7 / 5 — 38 experiencias  
🟢 Compatibilidad con ansiedad por la salud: 4,6 / 5

### Valoraciones específicas
- Me escuchó sin invalidarme
- Comunicación sin alarmismo
- Evita reaseguramiento innecesario
- Respeta límites del paciente
- Indicación racional de estudios
- Ayuda a manejar la incertidumbre
- Entendió mi ansiedad por la salud/TOC

### Información profesional
- Especialidad
- Formación
- Ubicación
- Modalidad
- Obra social/prepaga, si está disponible
- Información pública relevante

### Experiencias
Cada experiencia muestra:
- rating
- fecha aproximada
- tipo de consulta
- comentario
- “esta experiencia me resultó útil”
- “reportar”

## 6. Página de un centro de diagnóstico

Ejemplo:

### Centro X
Ecografía · Resonancia · Tomografía  
CABA

⭐ 4,5 / 5

### Variables
- Comunicación durante el estudio
- Respeto de límites del paciente
- Evita comentar hallazgos innecesariamente
- Trato del personal
- Organización
- Claridad administrativa
- Experiencia general

Pregunta específica:

> ¿Durante el estudio el profesional comentó o interpretó imágenes/hallazgos antes del informe?

Respuestas:
- Nunca
- Casi nunca
- Algunas veces
- Frecuentemente
- Siempre

## 7. Sistema de ratings

No utilizar solamente una estrella general.

### Rating general
1 a 5 estrellas.

### Rating específico para profesionales
1. Me escuchó adecuadamente.
2. Fue respetuoso.
3. Explicó lo necesario sin alarmismo.
4. Evitó alimentar búsquedas de reaseguramiento.
5. Respetó mis límites.
6. Evitó estudios o intervenciones innecesarios según mi experiencia.
7. Me ayudó a manejar la incertidumbre.
8. Entendió mi ansiedad por la salud/TOC.

### Rating específico para centros
1. El personal fue respetuoso.
2. Respetaron mis preferencias de comunicación.
3. No comentaron innecesariamente los hallazgos.
4. Evitaron especulaciones durante el estudio.
5. Me permitieron realizar el estudio sin conversaciones que aumentaran mi ansiedad.
6. La experiencia general fue adecuada.

## 8. Experiencias de pacientes

Al seleccionar “Compartir experiencia”, el usuario deberá responder preguntas estructuradas antes del comentario libre.

Datos:
- Profesional o centro
- Tipo de consulta/estudio
- Mes/año aproximado
- Rating
- Preguntas específicas
- Comentario libre

Aviso:

> No publiques datos personales, historias clínicas, resultados de estudios ni información que pueda identificar a terceros.

El sistema debe permitir publicar como “Paciente anónimo” aunque el usuario esté registrado.

## 9. Agregar un profesional

Campos:
- Nombre
- Especialidad
- Institución
- Ciudad
- Barrio/zona
- Tipo de atención
- Información pública disponible
- ¿Por qué lo recomendás?
- ¿Trabaja específicamente con TOC/ansiedad por la salud?
- ¿Tuviste una experiencia positiva o negativa?
- ¿Querés dejar una valoración?

Estados:
- Propuesto
- Verificado
- Perfil reclamado por profesional
- Información incompleta
- Suspendido

## 10. Verificación

### ✓ Verificado
La información profesional básica fue comprobada mediante fuentes confiables.

### Comunidad
El perfil fue agregado por usuarios pero todavía no fue verificado.

### Perfil reclamado
El profesional/institución confirmó que administra el perfil.

La verificación no significa recomendación.

## 11. Moderación

Todo comentario debe poder ser reportado.

Motivos:
- spam
- publicidad
- lenguaje ofensivo
- información personal
- acusaciones no fundamentadas
- contenido médico peligroso
- reaseguramiento
- búsqueda explícita de diagnóstico
- fraude/manipulación de ratings

No eliminar una experiencia simplemente porque es negativa.

El profesional debe tener derecho a responder.

## 12. Reputación

Cada usuario tendrá internamente una puntuación de confiabilidad.

No mostrarla públicamente.

Factores:
- antigüedad de la cuenta
- cantidad de experiencias
- comportamiento
- reportes
- patrones anormales de votación

## 13. Búsqueda

Buscar:
- “Cardiólogo”
- “Psicólogo TOC”
- “Ecografía”
- “Resonancia”
- “Laboratorio”

Filtros:
- especialidad
- ubicación
- modalidad
- tipo de estudio
- rating
- compatibilidad con ansiedad por la salud
- cantidad de experiencias
- verificado/no verificado

## 14. Ranking

No ordenar solamente por estrellas.

Considerar:
- compatibilidad con ansiedad por la salud
- cantidad de experiencias
- confiabilidad de las experiencias
- rating general

Debe existir un sistema de confianza estadística que reduzca el peso de muestras muy pequeñas.

## 15. Preferencias de atención

El usuario podrá seleccionar preferencias personales.

Ejemplo:
- No recibir comentarios sobre hallazgos
- No ver las imágenes
- Recibir solamente instrucciones necesarias para realizar el estudio
- Recibir el resultado mediante el informe
- Que las preguntas clínicas sean las estrictamente necesarias

Esto no constituye una instrucción médica obligatoria.

## 16. Guías

Ejemplos:
- Cómo elegir un médico si tenés ansiedad por la salud
- Cómo elegir un centro de diagnóstico
- Qué podés pedir durante una ecografía
- Qué diferencia hay entre información médica y reaseguramiento
- Qué hacer con un informe médico sin caer en búsquedas compulsivas
- Por qué un buen profesional no necesariamente es el que más estudios pide

## 17. Modelo de confianza

Cada profesional/centro tendrá dos indicadores independientes:

### Calidad/Información
Basada en información objetiva disponible.

### Experiencia con ansiedad por la salud
Basada principalmente en experiencias de pacientes.

Nunca presentar:
> “Este es el mejor cardiólogo.”

Preferir:
> “Los pacientes con ansiedad por la salud lo valoran especialmente en comunicación y manejo de la consulta.”

## 18. MVP

La primera versión NO necesita:
- aplicación móvil
- chat
- reservas
- pagos
- publicidad
- inteligencia artificial
- mensajería entre pacientes

El MVP debe concentrarse en:
- usuarios
- perfiles
- búsqueda
- ratings
- experiencias
- agregar profesionales
- moderación

## 19. Stack tecnológico inicial

- Frontend: Next.js
- Lenguaje: TypeScript
- Router: App Router
- Estilos: Tailwind CSS
- Backend / Base de datos: Supabase / PostgreSQL
- Autenticación: Supabase Auth
- Hosting: Vercel
- Repositorio: GitHub

## 20. Modelo inicial de datos

### users
- id
- email
- display_name
- anonymous_name
- created_at
- status

### professionals
- id
- name
- specialty
- description
- city
- address
- website
- verification_status
- claimed_by
- created_at

### facilities
- id
- name
- type
- description
- city
- address
- website
- verification_status
- created_at

### reviews
- id
- user_id
- professional_id OR facility_id
- overall_rating
- comment
- visit_type
- visit_date
- anonymous
- status
- created_at

### review_scores
- id
- review_id
- category
- score

### reports
- id
- user_id
- review_id
- reason
- status
- created_at

### favorites
- user_id
- professional_id OR facility_id

### professional_suggestions
- id
- submitted_by
- name
- specialty
- location
- source
- status
- created_at

## 21. Primera geografía

MVP:
- CABA
- Gran Buenos Aires

Posteriormente:
- resto de Argentina
- Uruguay
- otros países

## 22. Nombre provisional

Health Anxiety Friendly

No es necesariamente el nombre comercial definitivo.

La marca deberá transmitir:
- confianza
- criterio
- salud
- comunidad
- ausencia de alarmismo

## 23. Principio fundamental

La plataforma no tiene que prometer:

> “Encontrá al médico que te va a tranquilizar.”

Tiene que ayudar a encontrar:

> Profesionales y centros capaces de ofrecer una atención médica adecuada sin convertir la atención en una fuente innecesaria de ansiedad o compulsión.
