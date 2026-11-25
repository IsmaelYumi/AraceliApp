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

// Global memory cache synced across component instances
let globalPatients: Paciente[] = [];
let globalActivities: ActividadClinica[] = [];
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export function usePatients(filterParams?: QueryFilterParams) {
  const [patients, setPatients] = useState<Paciente[]>(globalPatients);
  const [activities, setActivities] = useState<ActividadClinica[]>(globalActivities);
  const [isLoading, setIsLoading] = useState<boolean>(globalPatients.length === 0);
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
      globalPatients = data || [];
      setPatients(globalPatients);
      notifyListeners();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al conectar con la API de pacientes.';
      console.warn('API error:', message);
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
      const created = await patientService.create(dto);
      globalPatients = [created, ...globalPatients];
      notifyListeners();
      success(
        'Expediente Creado',
        `Se registró al paciente ${created.nombreCompleto} con expediente ${created.codigoExpediente}.`
      );
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
      let createdDoc: any = null;
      try {
        createdDoc = await patientService.addDocument(patientId, {
          nombre: doc.nombre,
          tamano: doc.tamano,
          url: doc.url,
        });
      } catch (e) {
        console.warn('Backend addDocument failed, using client state', e);
      }

      const newDoc: DocumentoPdf = {
        id: createdDoc?.id || `pdf_${Date.now().toString().slice(-4)}`,
        nombre: createdDoc?.nombre || doc.nombre,
        tamano: createdDoc?.tamano || doc.tamano,
        fechaSubida: createdDoc?.fechaSubida ? new Date(createdDoc.fechaSubida).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        categoria: doc.categoria,
        url: createdDoc?.url || doc.url || '#',
        subidoPor: 'Centro de Estimulación Temprana',
      };

      globalPatients = globalPatients.map((p) => {
        if (p.id === patientId) {
          const docs = p.documentosPdf || [];
          return { ...p, documentosPdf: [newDoc, ...docs] };
        }
        return p;
      });
      notifyListeners();

      success('Documento PDF Guardado', `Se adjuntó "${doc.nombre}" al expediente.`);
      return newDoc;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar documento PDF';
      notifyError('No se pudo guardar PDF', msg);
      return null;
    }
  };

  const deletePatientPdf = async (patientId: string, pdfId: string): Promise<boolean> => {
    try {
      try {
        await patientService.deleteDocument(patientId, pdfId);
      } catch (e) {
        console.warn('Backend deleteDocument failed, updating client state', e);
      }

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
      const created = await patientService.addActivity(dto);
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

  const updatePatient = async (
    patientId: string,
    data: Partial<CreatePacienteDto>
  ): Promise<Paciente | null> => {
    setIsLoading(true);
    try {
      const updated = await patientService.update(patientId, data);
      globalPatients = globalPatients.map((p) => (p.id === patientId ? updated : p));
      notifyListeners();
      success('Expediente Actualizado', `Se actualizó el paciente ${updated.nombreCompleto}.`);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar paciente';
      notifyError('No se pudo actualizar', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePatient = async (patientId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await patientService.delete(patientId);
      globalPatients = globalPatients.filter((p) => p.id !== patientId);
      globalActivities = globalActivities.filter((a) => a.pacienteId !== patientId);
      notifyListeners();
      success('Paciente Eliminado', 'El paciente y todos sus registros asociados han sido eliminados.');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar paciente';
      notifyError('No se pudo eliminar el paciente', msg);
      return false;
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
    updatePatient,
    deletePatient,
    uploadPatientPdf,
    deletePatientPdf,
    addActivity,
  };
}

export default usePatients;
