
// Base entities
export type Comuna = {
  id: number;
  nombre: string;
};

export type Carrera = {
  id: number;
  nombre: string;
};

export type Tutor = {
  id: number;
  nombre: string;
  email: string;
};

// Main entities
export type Estudiante = {
  id: number;
  rut: string;
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  email: string;
  cond_especial?: string | null;
  carrera_id: number;
  comuna_id: number;
  tutor_id: number | null;
};

export type Establecimiento = {
  id: string; // UUID
  rbd: string;
  nombre: string;
  dependencia: string; // e.g., 'Municipal', 'Particular Subvencionado'
  comuna_id: number;
};

export type Directivo = {
  id: number;
  nombre: string;
  email: string;
  cargo: string;
  establecimiento_id: string; // UUID
};

export type NivelPractica = {
  id: number;
  nombre: string; // e.g., 'Práctica Profesional', 'Práctica Intermedia'
  carrera_id: number;
};

export type FechaClave = {
  nombre: string;
  fecha: string; // ISO date string (YYYY-MM-DD)
  descripcion?: string | null;
};

// Junction/relational entities
export type Cupo = {
  id: number;
  establecimiento_id: string; // UUID
  nivel_practica_id: number;
};

export type Ficha = {
  id: number;
  estudiante_id: number;
  establecimiento_id: string; // UUID
  cupo_id: number;
  fecha_inicio: string; // Date string
  fecha_termino?: string | null; // Date string
  fecha_envio?: string | null; // DateTime string
};

// API Payload Types
export type EmailSchema = {
  subject: string;
  email: string[];
};

export type DirectivoSchema = {
  nombre: string;
  cargo: string;
  email: string;
};

export type StudentMailSchema = {
  subject: string;
  directivo: DirectivoSchema;
  ficha_ids: number[];
  fecha_envio?: string | null;
};

export type StablishmentBody = {
  directivo?: Directivo | null;
  establecimiento?: Establecimiento | null;
  semana_inicio_profesional: string;
  semana_termino_profesional: string;
  numero_semanas_profesional: number;
  semana_inicio_pp: string;
  semana_termino_pp: string;
  numero_semanas_pp: number;
  fichas?: Ficha[];
};

export type SendEmailToEstablecimientoPayload = {
    email: EmailSchema;
    body: StablishmentBody;
};


// --- MOCK DATA (used for fallbacks or initial state before API load) ---

export const mockComunas: Comuna[] = [
  { id: 1, nombre: 'Concepción' },
  { id: 2, nombre: 'Talcahuano' },
  { id: 3, nombre: 'Chiguayante' },
  { id: 4, nombre: 'San Pedro de la Paz' },
  { id: 5, nombre: 'Coronel' },
  { id: 6, nombre: 'Hualpén' },
];

export const mockCarreras: Carrera[] = [
  { id: 1, nombre: 'Educación Parvularia' },
  { id: 2, nombre: 'Pedagogía en Matemática y Física' },
  { id: 3, nombre: 'Psicopedagogía' },
  { id: 4, nombre: 'Educación Básica' },
  { id: 5, nombre: 'Pedagogía en Inglés' },
  { id: 6, nombre: 'Pedagogía en Educación Diferencial' },
  { id: 7, nombre: 'Pedagogía en Educación Física' },
];

export const mockTutores: Tutor[] = [
    { id: 1, nombre: 'Dra. Isabel Soto', email: 'isoto@universidad.cl' },
    { id: 2, nombre: 'Dr. Mario Campos', email: 'mcampos@universidad.cl' },
    { id: 3, nombre: 'Mg. Carolina Reyes', email: 'creyes@universidad.cl' },
    { id: 4, nombre: 'Dr. Fernando Zúñiga', email: 'fzuniga@universidad.cl' },
];

export const mockEstudiantes: Estudiante[] = [
  { id: 1, rut: "20.111.222-3", nombre: "Elena", ap_paterno: "Valdés", ap_materno: "Rojas", email: "elena.valdes@example.com", carrera_id: 1, comuna_id: 1, tutor_id: 1 },
  { id: 2, rut: "19.222.333-4", nombre: "Javier", ap_paterno: "Mora", ap_materno: "Tapia", email: "javier.mora@example.com", carrera_id: 2, comuna_id: 2, tutor_id: 1 },
  { id: 3, rut: "21.333.444-5", nombre: "Camila", ap_paterno: "Silva", ap_materno: "Castro", email: "camila.silva@example.com", carrera_id: 3, comuna_id: 1, tutor_id: 2, cond_especial: "Requiere apoyo visual" },
  { id: 4, rut: "20.444.555-6", nombre: "Andrés", ap_paterno: "Pérez", ap_materno: "Luna", email: "andres.perez@example.com", carrera_id: 4, comuna_id: 3, tutor_id: 2 },
  { id: 5, rut: "19.555.666-7", nombre: "Sofía", ap_paterno: "González", ap_materno: "Ríos", email: "sofia.gonzalez@example.com", carrera_id: 5, comuna_id: 4, tutor_id: 1 },
];

export const mockEstablecimientos: Establecimiento[] = [
  { id: "e8a4a278-f68e-4a6f-9937-2d6a3b6c7d41", rbd: "12345-6", nombre: "COLEGIO POLIVALENTE DOMINGO PARRA CORVALÁN", dependencia: "Particular Subvencionado", comuna_id: 1 },
  { id: "b2c9e8d1-7f6a-4b8e-9c1d-3e5f7a9b8c2e", rbd: "23456-7", nombre: "LICEO ENRIQUE MOLINA GARMENDIA", dependencia: "Municipal", comuna_id: 1 },
  { id: "d3e1f2a9-9c8b-4a7d-8e6f-1b3d5c7a9e8f", rbd: "34567-8", nombre: "COLEGIO SALESIANO CONCEPCIÓN", dependencia: "Particular Pagado", comuna_id: 1 },
  { id: "a4b8c1d9-8e7f-4b6d-9c5a-2e4f6a8b7d3c", rbd: "45678-9", nombre: "COLEGIO INMACULADA CONCEPCIÓN", dependencia: "Particular Pagado", comuna_id: 2 },
];

export const mockDirectivos: Directivo[] = [
    { id: 1, establecimiento_id: 'e8a4a278-f68e-4a6f-9937-2d6a3b6c7d41', nombre: 'Arturo Ortega', email: 'aortega@dpcorvalan.cl', cargo: 'Jefe UTP' },
    { id: 2, establecimiento_id: 'b2c9e8d1-7f6a-4b8e-9c1d-3e5f7a9b8c2e', nombre: 'Beatriz Salamanca', email: 'bsalamanca@lemg.cl', cargo: 'Directora' },
    { id: 3, establecimiento_id: 'd3e1f2a9-9c8b-4a7d-8e6f-1b3d5c7a9e8f', nombre: 'Carlos Valenzuela', email: 'cvalenzuela@salesianosconcepcion.cl', cargo: 'Jefe UTP' },
    { id: 4, establecimiento_id: 'a4b8c1d9-8e7f-4b6d-9c5a-2e4f6a8b7d3c', nombre: 'Daniela Figueroa', email: 'dfigueroa@cic.cl', cargo: 'Coordinadora Académica' },
    { id: 5, establecimiento_id: 'e8a4a278-f68e-4a6f-9937-2d6a3b6c7d41', nombre: 'Mariela Paz', email: 'mpaz@dpcorvalan.cl', cargo: 'Orientadora' },
    { id: 6, establecimiento_id: 'b2c9e8d1-7f6a-4b8e-9c1d-3e5f7a9b8c2e', nombre: 'Roberto Fuentes', email: 'rfuentes@lemg.cl', cargo: 'Inspector General' },
];

export const mockNivelesPractica: NivelPractica[] = [
    { id: 1, nombre: 'Práctica Inicial', carrera_id: 1 },
    { id: 2, nombre: 'Práctica Intermedia', carrera_id: 1 },
    { id: 3, nombre: 'Práctica Profesional', carrera_id: 1 },
    { id: 4, nombre: 'Práctica Profesional', carrera_id: 2 },
    { id: 5, nombre: 'Práctica Profesional', carrera_id: 4 },
    { id: 6, nombre: 'Práctica de Observación', carrera_id: 5 },
    { id: 7, nombre: 'Práctica Profesional', carrera_id: 5 },
    { id: 8, nombre: 'Práctica Psicopedagógica', carrera_id: 3 },
    { id: 9, nombre: 'Práctica en NEE Transitorias', carrera_id: 6 },
    { id: 10, nombre: 'Práctica en NEE Permanentes', carrera_id: 6 },
];

export const mockCupos: Cupo[] = [
    { id: 1, establecimiento_id: 'e8a4a278-f68e-4a6f-9937-2d6a3b6c7d41', nivel_practica_id: 2 },
    { id: 2, establecimiento_id: 'e8a4a278-f68e-4a6f-9937-2d6a3b6c7d41', nivel_practica_id: 3 },
    { id: 3, establecimiento_id: 'e8a4a278-f68e-4a6f-9937-2d6a3b6c7d41', nivel_practica_id: 4 },
    { id: 4, establecimiento_id: 'e8a4a278-f68e-4a6f-9937-2d6a3b6c7d41', nivel_practica_id: 5 },
    { id: 5, establecimiento_id: 'd3e1f2a9-9c8b-4a7d-8e6f-1b3d5c7a9e8f', nivel_practica_id: 7 },
    { id: 6, establecimiento_id: 'a4b8c1d9-8e7f-4b6d-9c5a-2e4f6a8b7d3c', nivel_practica_id: 3 },
];
