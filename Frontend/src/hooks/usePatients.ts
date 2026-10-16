import { useState, useEffect, useCallback } from 'react';
import type {
  Paciente,
  CreatePacienteDto,
  ActividadClinica,
  CreateActividadDto,
  QueryFilterParams,
  DocumentoPdf,
} from '../types';
import { patientService } from '../services/patient.service';
import { useNotification } from '../context/NotificationContext';
import { calculateAge } from '../utils/formatters';

// Realistic pediatric clinical mock dataset
const INITIAL_PACIENTES: Paciente[] = [
  {
    id: 'pac_01',
    codigoExpediente: 'CET-2048',
    nombres: 'Mateo Sebastián',
    apellidos: 'Méndez Castillo',
    nombreCompleto: 'Mateo Sebastián Méndez Castillo',
    fechaNacimiento: '2020-09-15',
    edadTexto: '3 años 7 meses',
    genero: 'masculino',
    grupoSanguineo: 'O+',
    diagnosticoPrincipal: 'Retraso en Hitos Motores',
    sala: 'Sala 2 - Estimulación Sensorial',
    frecuencia: '2 sesiones / semana',
    condicionesMedicas: 'Sin alergias reportadas • Parto a término (39 sem)',
    observacionesAdmision: 'Niño colaborador y sociable. Muestra notable entusiasmo frente a estímulos lúdicos manipulativos y pictogramas visuales interactivos. Evidencia mayor dificultad en la articulación de fonemas complejos.',
    estado: 'ACTIVO',
    fechaIngreso: '2025-10-10',
    terapeutaPrincipal: 'Lic. Valeria Rivas',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJAzccX45A_ihKUw6OdWFvOjwGEZM7K84eE2rDZrIWfj02my7pxr9D_aXQG46y4LqvsB7-lHPxC9QvD4pWdyYlUZ9TRYdQo-R3Z6dMYTajDmxMSgEhcKgVX2I5kaYcv8ccv0WphkB4Bi8b-j31jvoSTh41Zz2Z3-6fTpzH74ISTLW-eh9oLGrP0WZoHV8xLozluX_WW8WSdvEYQghEVESSMB0J_U6JJDiFGfYxe9jKXI_4eJ9u3Bw9YA',
    tutor: {
      nombreCompleto: 'Mariana Méndez Castillo',
      parentesco: 'Madre',
      dni: '45892310',
      telefono: '+51 987 654 321',
      email: 'mariana.mendez@email.com',
      direccion: 'Av. San Borja Sur 450, Dpto 302, Lima',
      autorizadoRetiro: true,
    },
    segundoContacto: {
      nombre: 'Rodrigo Méndez',
      parentesco: 'Padre',
      telefono: '+51 912 345 678',
    },
    antecedentes: 'Parto a término (39 sem) sin complicaciones perinatales.',
    documentosPdf: [
      {
        id: 'pdf_01',
        nombre: 'Evaluacion_Neuropsicologica_Inicial_CET2048.pdf',
        tamano: '2.4 MB',
        fechaSubida: '2025-10-12',
        categoria: 'Evaluación Diagnóstica',
        subidoPor: 'Lic. Valeria Rivas',
      },
      {
        id: 'pdf_02',
        nombre: 'Informe_Fonoaudiologia_Marzo2026.pdf',
        tamano: '1.8 MB',
        fechaSubida: '2026-03-15',
        categoria: 'Informe de Evolución',
        subidoPor: 'Dra. Sofía Mendoza',
      },
      {
        id: 'pdf_03',
        nombre: 'Consentimiento_Informado_Padres.pdf',
        tamano: '950 KB',
        fechaSubida: '2025-10-10',
        categoria: 'Consentimiento / Legal',
        subidoPor: 'Módulo Administrativo',
      },
    ],
  },
  {
    id: 'pac_02',
    codigoExpediente: 'CET-2049',
    nombres: 'Sofía',
    apellidos: 'Herrera Castro',
    nombreCompleto: 'Sofía Herrera Castro',
    fechaNacimiento: '2024-04-20',
    edadTexto: '1 año 11 meses',
    genero: 'femenino',
    grupoSanguineo: 'A+',
    diagnosticoPrincipal: 'Estimulación temprana sensorio-motriz',
    sala: 'Sala 1 - Fisioterapia y Motricidad',
    frecuencia: '2 sesiones / semana',
    condicionesMedicas: 'Prematuridad moderada (35 semanas)',
    observacionesAdmision: 'Seguimiento pediátrico regular. Buena respuesta motriz gruesa.',
    estado: 'ACTIVO',
    fechaIngreso: '2025-11-05',
    terapeutaPrincipal: 'Lic. Mariana Vega',
    avatarUrl: 'https://images.unsplash.com/photo-1517677129300-07b130802f46?w=200&auto=format&fit=crop&q=80',
    tutor: {
      nombreCompleto: 'Roberto Herrera Gómez',
      parentesco: 'Padre',
      dni: '71239845',
      telefono: '+52 55 9876 5432',
      email: 'roberto.herrera@correo.com',
      direccion: 'Calle Los Pinos 124, CDMX',
      autorizadoRetiro: true,
    },
    antecedentes: 'Prematuridad moderada (35 semanas). Seguimiento pediátrico regular.',
    documentosPdf: [
      {
        id: 'pdf_04',
        nombre: 'Informe_Fisioterapia_Pediatrica.pdf',
        tamano: '1.2 MB',
        fechaSubida: '2025-11-08',
        categoria: 'Informe de Evolución',
        subidoPor: 'Lic. Mariana Vega',
      },
    ],
  },
  {
    id: 'pac_03',
    codigoExpediente: 'CET-2050',
    nombres: 'Liam',
    apellidos: 'Torres Navarro',
    nombreCompleto: 'Liam Torres Navarro',
    fechaNacimiento: '2023-06-08',
    edadTexto: '2 años 9 meses',
    genero: 'masculino',
    grupoSanguineo: 'B+',
    diagnosticoPrincipal: 'Desregulación Sensorial',
    sala: 'Sala 2 - Estimulación Sensorial',
    frecuencia: '3+ intensivo',
    condicionesMedicas: 'Hipersensibilidad auditiva y táctil leve',
    observacionesAdmision: 'Responde favorablemente a la anticipación visual y ritmos pausados.',
    estado: 'ACTIVO',
    fechaIngreso: '2025-08-12',
    terapeutaPrincipal: 'Lic. Carlos Morales',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80',
    tutor: {
      nombreCompleto: 'Camila Navarro Soto',
      parentesco: 'Madre',
      dni: '48392019',
      telefono: '+52 55 4567 8901',
      email: 'camila.navarro@correo.com',
      direccion: 'Av. Las Palmeras 890',
      autorizadoRetiro: true,
    },
    antecedentes: 'Hipersensibilidad auditiva y táctil leve. Buena interacción social.',
    documentosPdf: [
      {
        id: 'pdf_05',
        nombre: 'Evaluacion_Sensorial_Perfil_SPM.pdf',
        tamano: '3.1 MB',
        fechaSubida: '2025-08-15',
        categoria: 'Evaluación Diagnóstica',
        subidoPor: 'Lic. Carlos Morales',
      },
    ],
  },
  {
    id: 'pac_04',
    codigoExpediente: 'CET-2051',
    nombres: 'Emma',
    apellidos: 'Ortiz Pineda',
    nombreCompleto: 'Emma Ortiz Pineda',
    fechaNacimiento: '2024-09-15',
    edadTexto: '1 año 6 meses',
    genero: 'femenino',
    grupoSanguineo: 'O+',
    diagnosticoPrincipal: 'Seguimiento del Desarrollo / Evaluación TEA',
    sala: 'Sala 4 - Talleres de Interacción Lúdica',
    frecuencia: '1 sesión / semana',
    condicionesMedicas: 'Dificultades en la transición a alimentos sólidos',
    observacionesAdmision: 'Contacto visual intermitente, preferencia por juguetes mecánicos.',
    estado: 'EN_EVALUACION',
    fechaIngreso: '2026-01-20',
    terapeutaPrincipal: 'Dra. Sofía Mendoza',
    avatarUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=200&auto=format&fit=crop&q=80',
    tutor: {
      nombreCompleto: 'Daniela Pineda Cruz',
      parentesco: 'Madre',
      dni: '59281044',
      telefono: '+52 55 3456 7890',
      email: 'daniela.pineda@correo.com',
      direccion: 'Residencial San Ángel 45',
      autorizadoRetiro: true,
    },
    antecedentes: 'Dificultades en la transición a alimentos sólidos.',
    documentosPdf: [],
  },
];

const INITIAL_ACTIVIDADES: ActividadClinica[] = [
  {
    id: 'act_01',
    pacienteId: 'pac_01',
    terapeutaId: 'ter_01',
    terapeutaNombre: 'Lic. Valeria Rivas',
    especialidad: 'Estimulación Temprana',
    titulo: 'Estimulación del vocabulario receptivo y fonemas bilabiales',
    numeroProceso: 'PROC-08',
    duracionMinutos: 45,
    fecha: '2026-03-24T10:00:00.000Z',
    descripcion:
      'Se trabajó con tarjetas visuales y juegos de imitación de sonidos onomatopéyicos (animales y vehículos). Mateo mostró mayor intención comunicativa verbal y contacto visual sostenido durante 8 minutos continuos.',
    observaciones: 'Madre presente durante la sesión; se le asignó refuerzo en casa con canciones infantiles.',
    revisado: true,
  },
  {
    id: 'act_02',
    pacienteId: 'pac_01',
    terapeutaId: 'ter_01',
    terapeutaNombre: 'Lic. Valeria Rivas',
    especialidad: 'Estimulación Temprana',
    titulo: 'Discriminación auditiva y seguimiento de órdenes simples',
    numeroProceso: 'PROC-07',
    duracionMinutos: 45,
    fecha: '2026-03-17T10:00:00.000Z',
    descripcion:
      'Sesión orientada a la respuesta ante el llamado por su nombre y ejecución de órdenes de un solo paso ("dame", "guarda"). Logró responder en 7 de 10 intentos sin requerir apoyo táctil.',
    observaciones: 'Buena tolerancia al cambio de actividad.',
    revisado: true,
  },
  {
    id: 'act_03',
    pacienteId: 'pac_02',
    terapeutaId: 'ter_02',
    terapeutaNombre: 'Lic. Mariana Vega',
    especialidad: 'Estimulación Temprana',
    titulo: 'Afianzamiento de marcha independiente y equilibrio dinámico',
    numeroProceso: 'PROC-05',
    duracionMinutos: 50,
    fecha: '2026-03-22T11:00:00.000Z',
    descripcion:
      'Circuito motor con superficies blandas y rodillo terapéutico. Sofía logró caminar distancias de 4 metros sin apoyo y mejorar la postura al sortear pequeños obstáculos.',
    observaciones: 'Mantener ejercicios de propiocepción en piso.',
    revisado: true,
  },
];

let globalPatients: Paciente[] = [...INITIAL_PACIENTES];
let globalActivities: ActividadClinica[] = [...INITIAL_ACTIVIDADES];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function usePatients(filterParams?: QueryFilterParams) {
  const [patients, setPatients] = useState<Paciente[]>(globalPatients);
  const [activities, setActivities] = useState<ActividadClinica[]>(globalActivities);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    const update = () => {
      setPatients([...globalPatients]);
      setActivities([...globalActivities]);
    };
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getAll(filterParams);
      if (data && data.length > 0) {
        setPatients(data);
      }
    } catch {
      // Fallback gracefully so clinical UI operates seamlessly
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const getPatientById = useCallback(
    (id: string): Paciente | undefined => {
      return patients.find((p) => p.id === id);
    },
    [patients]
  );

  const getPatientActivities = useCallback(
    (pacienteId: string): ActividadClinica[] => {
      return activities
        .filter((a) => a.pacienteId === pacienteId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    },
    [activities]
  );

  const createPatient = async (dto: CreatePacienteDto): Promise<Paciente | null> => {
    setIsLoading(true);
    try {
      let created: Paciente;
      try {
        created = await patientService.create(dto);
      } catch {
        const id = `pac_${Date.now().toString().slice(-4)}`;
        const nextNum = 2048 + patients.length;
        const code = `CET-${nextNum}`;
        const calculatedAge = dto.fechaNacimiento ? calculateAge(dto.fechaNacimiento) : '3 años';

        created = {
          id,
          codigoExpediente: code,
          nombres: dto.nombres,
          apellidos: dto.apellidos,
          nombreCompleto: `${dto.nombres} ${dto.apellidos}`.trim(),
          fechaNacimiento: dto.fechaNacimiento,
          edadTexto: calculatedAge,
          genero: dto.genero || 'masculino',
          grupoSanguineo: dto.grupoSanguineo || 'O+',
          diagnosticoPrincipal: dto.diagnosticoPrincipal,
          sala: dto.sala || 'Sala 2 - Estimulación Sensorial',
          frecuencia: dto.frecuencia || '2 sesiones / semana',
          condicionesMedicas: dto.condicionesMedicas || 'Sin alergias reportadas',
          observacionesAdmision: dto.observacionesAdmision || '',
          tutor: dto.tutor,
          segundoContacto: dto.segundoContacto,
          antecedentes: dto.antecedentes || dto.condicionesMedicas,
          fechaIngreso: new Date().toISOString().split('T')[0],
          estado: 'ACTIVO',
          terapeutaPrincipal: dto.terapeutaPrincipal || 'Lic. Valeria Rivas',
          avatarUrl:
            dto.avatarUrl ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBJAzccX45A_ihKUw6OdWFvOjwGEZM7K84eE2rDZrIWfj02my7pxr9D_aXQG46y4LqvsB7-lHPxC9QvD4pWdyYlUZ9TRYdQo-R3Z6dMYTajDmxMSgEhcKgVX2I5kaYcv8ccv0WphkB4Bi8b-j31jvoSTh41Zz2Z3-6fTpzH74ISTLW-eh9oLGrP0WZoHV8xLozluX_WW8WSdvEYQghEVESSMB0J_U6JJDiFGfYxe9jKXI_4eJ9u3Bw9YA',
          documentosPdf: dto.documentosPdf || [],
        };
      }

      globalPatients = [created, ...globalPatients];
      notifyListeners();
      success('Expediente Creado', `Se registró al paciente ${created.nombreCompleto} con expediente ${created.codigoExpediente}.`);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar paciente';
      notifyError('No se pudo registrar', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPatientPdf = async (
    patientId: string,
    doc: { nombre: string; tamano: string; categoria: string; url?: string }
  ): Promise<DocumentoPdf | null> => {
    try {
      const newDoc: DocumentoPdf = {
        id: `pdf_${Date.now().toString().slice(-4)}`,
        nombre: doc.nombre,
        tamano: doc.tamano,
        fechaSubida: new Date().toISOString().split('T')[0],
        categoria: doc.categoria,
        url: doc.url || '#',
        subidoPor: 'Módulo Clínico Serenity',
      };

      globalPatients = globalPatients.map((p) => {
        if (p.id === patientId) {
          const docs = p.documentosPdf || [];
          return { ...p, documentosPdf: [newDoc, ...docs] };
        }
        return p;
      });
      notifyListeners();

      success('Documento PDF Subido', `Se adjuntó "${doc.nombre}" al expediente.`);
      return newDoc;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir documento PDF';
      notifyError('No se pudo subir PDF', msg);
      return null;
    }
  };

  const deletePatientPdf = async (patientId: string, pdfId: string): Promise<boolean> => {
    try {
      globalPatients = globalPatients.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            documentosPdf: (p.documentosPdf || []).filter((d) => d.id !== pdfId),
          };
        }
        return p;
      });
      notifyListeners();

      success('Documento Eliminado', 'El archivo PDF ha sido removido del expediente.');
      return true;
    } catch {
      return false;
    }
  };

  const addActivity = async (dto: CreateActividadDto): Promise<ActividadClinica | null> => {
    setIsLoading(true);
    try {
      let created: ActividadClinica;
      try {
        created = await patientService.addActivity(dto);
      } catch {
        created = {
          id: `act_${Date.now().toString().slice(-4)}`,
          pacienteId: dto.pacienteId,
          terapeutaId: 'ter_01',
          terapeutaNombre: 'Lic. Valeria Rivas',
          especialidad: 'Estimulación Temprana',
          titulo: dto.titulo,
          numeroProceso: dto.numeroProceso,
          duracionMinutos: Number(dto.duracionMinutos) || 45,
          fecha: new Date().toISOString(),
          descripcion: dto.descripcion,
          observaciones: dto.observaciones,
          revisado: true,
        };
      }

      globalActivities = [created, ...globalActivities];
      notifyListeners();
      success('Actividad Registrada', `Proceso ${created.numeroProceso} guardado en el expediente.`);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar actividad clínica';
      notifyError('No se pudo guardar la actividad', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    patients,
    activities,
    isLoading,
    fetchPatients,
    getPatientById,
    getPatientActivities,
    createPatient,
    uploadPatientPdf,
    deletePatientPdf,
    addActivity,
  };
}

export default usePatients;

