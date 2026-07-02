
import type { 
    Carrera, Comuna, Cupo, Directivo, Establecimiento, Estudiante, Ficha, NivelPractica, Tutor, SendEmailToEstablecimientoPayload, EmailSchema, FechaClave 
} from './definitions';

// Ensure you have NEXT_PUBLIC_API_URL in your .env.local file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const config = { ...options, ...defaultOptions };

    // For FormData, the browser sets the Content-Type, so we remove it.
    if ((config.body instanceof FormData)) {
        delete (config.headers as any)['Content-Type'];
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, { url, options, errorBody });
            throw new Error(`Error en la petición a la API: ${errorBody || response.statusText}`);
        }

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null; // No content
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/html')) {
            return response.text();
        }

        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        // Fallback for other types or missing content-type header
        return response.text();

    } catch (error) {
        console.error("Error de conexión con la API:", error);
        throw error;
    }
}

// Comuna API
export const getComunas = (): Promise<Comuna[]> => fetchAPI('/api/v1/comunas');
export const createComuna = (data: Omit<Comuna, 'id'>): Promise<Comuna> => fetchAPI('/api/v1/comunas', { method: 'POST', body: JSON.stringify(data) });
export const updateComuna = (id: number, data: Omit<Comuna, 'id'>): Promise<Comuna> => fetchAPI(`/api/v1/comunas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteComuna = (id: number): Promise<void> => fetchAPI(`/api/v1/comunas/${id}`, { method: 'DELETE' });

// Carrera API
export const getCarreras = (): Promise<Carrera[]> => fetchAPI('/api/v1/carreras');
export const createCarrera = (data: Omit<Carrera, 'id'>): Promise<Carrera> => fetchAPI('/api/v1/carreras', { method: 'POST', body: JSON.stringify(data) });
export const updateCarrera = (id: number, data: Omit<Carrera, 'id'>): Promise<Carrera> => fetchAPI(`/api/v1/carreras/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCarrera = (id: number): Promise<void> => fetchAPI(`/api/v1/carreras/${id}`, { method: 'DELETE' });

// Tutor API
export const getTutores = (): Promise<Tutor[]> => fetchAPI('/api/v1/tutores');
export const createTutor = (data: Omit<Tutor, 'id'>): Promise<Tutor> => fetchAPI('/api/v1/tutores', { method: 'POST', body: JSON.stringify(data) });
export const updateTutor = (id: number, data: Omit<Tutor, 'id'>): Promise<Tutor> => fetchAPI(`/api/v1/tutores/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTutor = (id: number): Promise<void> => fetchAPI(`/api/v1/tutores/${id}`, { method: 'DELETE' });

// Directivo API
export const getDirectivos = (): Promise<Directivo[]> => fetchAPI('/api/v1/directivos');
export const createDirectivo = (data: Omit<Directivo, 'id'>): Promise<Directivo> => {
    return fetchAPI(`/api/v1/directivos`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};
export const updateDirectivo = (id: number, data: Omit<Directivo, 'id'>): Promise<Directivo> => fetchAPI(`/api/v1/directivos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDirectivo = (id: number): Promise<void> => fetchAPI(`/api/v1/directivos/${id}`, { method: 'DELETE' });

// Establecimiento API
export const getEstablecimientos = (): Promise<Establecimiento[]> => fetchAPI('/api/v1/establecimientos');
export const createEstablecimiento = (data: Omit<Establecimiento, 'id'>): Promise<Establecimiento> => fetchAPI('/api/v1/establecimientos', { method: 'POST', body: JSON.stringify(data) });
export const updateEstablecimiento = (id: string, data: Omit<Establecimiento, 'id'>): Promise<Establecimiento> => fetchAPI(`/api/v1/establecimientos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEstablecimiento = (id: string): Promise<void> => fetchAPI(`/api/v1/establecimientos/${id}`, { method: 'DELETE' });

// NivelPractica API
export const getNivelesPractica = (): Promise<NivelPractica[]> => fetchAPI('/api/v1/nivelpractica');
export const createNivelPractica = (data: Omit<NivelPractica, 'id'>): Promise<NivelPractica> => fetchAPI('/api/v1/nivelpractica', { method: 'POST', body: JSON.stringify(data) });
export const deleteNivelPractica = (id: number): Promise<void> => fetchAPI(`/api/v1/nivelpractica/${id}`, { method: 'DELETE' });

// Estudiante API
export const getEstudiantes = (): Promise<Estudiante[]> => fetchAPI('/api/v1/estudiantes');
export const createEstudiante = (data: Omit<Estudiante, 'id'>): Promise<Estudiante> => fetchAPI('/api/v1/estudiantes', { method: 'POST', body: JSON.stringify(data) });
export const updateEstudiante = (id: number, data: Omit<Estudiante, 'id'>): Promise<Estudiante> => fetchAPI(`/api/v1/estudiantes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEstudiante = (id: number): Promise<void> => fetchAPI(`/api/v1/estudiantes/${id}`, { method: 'DELETE' });

// Cupo API
export const getCupos = (): Promise<Cupo[]> => fetchAPI('/api/v1/cupos');
export const createCupo = (data: Omit<Cupo, 'id'>): Promise<Cupo> => fetchAPI('/api/v1/cupos', { method: 'POST', body: JSON.stringify(data) });
export const deleteCupo = (id: number): Promise<void> => fetchAPI(`/api/v1/cupos/${id}`, { method: 'DELETE' });

// Ficha API
export const getFichas = (): Promise<Ficha[]> => fetchAPI('/api/v1/fichas');
export const createFicha = (data: Omit<Ficha, 'id'>): Promise<Ficha> => fetchAPI('/api/v1/fichas', { method: 'POST', body: JSON.stringify(data) });
export const updateFicha = (id: number, data: Omit<Ficha, 'id'>): Promise<Ficha> => fetchAPI(`/api/v1/fichas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFicha = (id: number): Promise<void> => fetchAPI(`/api/v1/fichas/${id}`, { method: 'DELETE' });

// FechaClave API
export const getFechasClave = (): Promise<FechaClave[]> => fetchAPI('/api/v1/fechasclave');
export const createFechaClave = (data: FechaClave): Promise<FechaClave> => fetchAPI('/api/v1/fechasclave', { method: 'POST', body: JSON.stringify(data) });
export const updateFechaClave = (nombre: string, data: FechaClave): Promise<FechaClave> => fetchAPI(`/api/v1/fechasclave/${encodeURIComponent(nombre)}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFechaClave = (nombre: string): Promise<void> => fetchAPI(`/api/v1/fechasclave/${encodeURIComponent(nombre)}`, { method: 'DELETE' });

// Email API
export const sendEmailToEstablecimiento = (establecimientoId: string, payload: SendEmailToEstablecimientoPayload): Promise<any> => {
    return fetchAPI(`/api/v1/email/send-email/stablishment?establecimiento_id=${establecimientoId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const sendEmailToStudent = (fichaId: number, payload: EmailSchema): Promise<any> => {
    return fetchAPI(`/api/v1/email/send-email/student?ficha_id=${fichaId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};


// Email Template API
export const getStudentEmailTemplate = (): Promise<string> => fetchAPI('/api/v1/email/email-template/student');
export const setStudentEmailTemplate = (html: string): Promise<any> => {
    const encodedHtml = encodeURIComponent(html);
    return fetchAPI(`/api/v1/email/email-template/student?html=${encodedHtml}`, { method: 'POST', body: '' });
};

export const getEstablishmentEmailTemplate = (): Promise<string> => fetchAPI('/api/v1/email/email-template/stablishment');
export const setEstablishmentEmailTemplate = (html: string): Promise<any> => {
    const encodedHtml = encodeURIComponent(html);
    return fetchAPI(`/api/v1/email/email-template/stablishment?html=${encodedHtml}`, { method: 'POST', body: '' });
};

// Carga Masiva API
export const uploadFile = (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchAPI('/api/v1/carga_masiva/', {
        method: 'POST',
        body: formData,
    });
};

export const clearDatabase = (): Promise<any> => fetchAPI('/api/v1/carga_masiva/vaciadoDB', { method: 'DELETE' });
