import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './components/layout/MainLayout';
import type { UserRoleType } from './components/layout/Navbar';

// Clinical Pages
import { LoginView } from './pages/Auth/LoginView';
import { TherapistDashboard } from './pages/Therapist/TherapistDashboard';
import { PatientsDirectory } from './pages/Patients/PatientsDirectory';
import { PatientDetail } from './pages/Patients/PatientDetail';
import { AppointmentsCalendar } from './pages/Appointments/AppointmentsCalendar';
import { TherapistsDirectory } from './pages/Therapists/TherapistsDirectory';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/common/Card';
import { APP_CONFIG } from './constants/config';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRoleType>('TERAPEUTA');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleRoleChange = (role: UserRoleType) => {
    setCurrentRole(role);
    setSelectedPatientId(null);
    if (role === 'TERAPEUTA') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('terapeutas');
    }
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab('pacientes');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = (role: UserRoleType) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    if (role === 'TERAPEUTA') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('terapeutas');
    }
  };

  // If user logs out, show minimalist login card (PRD Section 4.1)
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const currentUserData = {
    nombre:
      currentRole === 'TERAPEUTA'
        ? 'Dr. Especialista'
        : 'Dirección Clínica Serenity',
    email:
      currentRole === 'TERAPEUTA'
        ? 'dr.especialista@serenitychildcare.org'
        : 'administracion@serenitychildcare.org',
    rol: currentRole,
  };

  return (
    <MainLayout
      activeNavId={activeTab}
      onNavigate={(id) => {
        if (id === 'nuevo-terapeuta') {
          setActiveTab('terapeutas');
        } else {
          setActiveTab(id);
        }
        if (id !== 'pacientes') {
          setSelectedPatientId(null);
        }
      }}
      currentUser={currentUserData}
      currentRole={currentRole}
      onRoleChange={handleRoleChange}
      onLogout={handleLogout}
    >
      {/* 1. Dashboard Terapeuta */}
      {activeTab === 'dashboard' && (
        <TherapistDashboard
          onNavigateToPatients={() => {
            setSelectedPatientId(null);
            setActiveTab('pacientes');
          }}
          onNavigateToAppointments={() => setActiveTab('citas')}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {/* 2. Pacientes (Directorio o Expediente Clínico Longitudinal) */}
      {activeTab === 'pacientes' && (
        selectedPatientId ? (
          <PatientDetail
            patientId={selectedPatientId}
            onBack={() => setSelectedPatientId(null)}
          />
        ) : (
          <PatientsDirectory onSelectPatient={handleSelectPatient} />
        )
      )}

      {/* 3. Agendamiento de Citas (Calendario con conteo unificado) */}
      {activeTab === 'citas' && <AppointmentsCalendar />}

      {/* 4. Directorio de Terapeutas (Módulo Administrador) */}
      {activeTab === 'terapeutas' && <TherapistsDirectory />}

      {/* 5. Configuración */}
      {activeTab === 'configuracion' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Preferencias clínicas y parámetros del centro.
            </p>
          </div>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100">
              <CardTitle>Entorno Clínico</CardTitle>
              <CardDescription>Parámetros de conexión y plataforma</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3 font-mono text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span>Centro:</span>
                <span className="font-bold text-serenity-800">{APP_CONFIG.APP_NAME}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span>API Endpoint:</span>
                <span className="font-bold text-serenity-800">{APP_CONFIG.API_BASE_URL}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}

export function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
