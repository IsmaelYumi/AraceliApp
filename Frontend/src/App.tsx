import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { TherapistDetail } from './pages/Therapists/TherapistDetail';
import { UsersPage } from './pages/Users/UsersPage';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentRole, setCurrentRole] = useState<UserRoleType>('TERAPEUTA');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const mappedRole: UserRoleType = user.rol === 'ADMIN' ? 'ADMINISTRADOR' : 'TERAPEUTA';
      setCurrentRole(mappedRole);
      if (mappedRole === 'ADMINISTRADOR') {
        setActiveTab('terapeutas');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  const handleRoleChange = (role: UserRoleType) => {
    setCurrentRole(role);
    setSelectedPatientId(null);
    setSelectedTherapistId(null);
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

  const handleLogout = async () => {
    await logout();
  };

  const handleLoginSuccess = (role: UserRoleType) => {
    setCurrentRole(role);
    if (role === 'TERAPEUTA') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('terapeutas');
    }
  };

  // If user is not logged in, show login view
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const currentUserData = {
    nombre: user?.nombre || (currentRole === 'TERAPEUTA' ? 'Terapeuta' : 'Administrador'),
    email: user?.email || '',
    rol: currentRole,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <MainLayout
      activeNavId={activeTab}
      onNavigate={(id) => {
        if (id === 'nuevo-terapeuta') {
          setActiveTab('terapeutas');
          setSelectedTherapistId('new');
        } else if (currentRole === 'ADMINISTRADOR' && (id === 'citas' || id === 'configuracion')) {
          setActiveTab('terapeutas');
        } else if (id === 'configuracion') {
          setActiveTab(currentRole === 'ADMINISTRADOR' ? 'terapeutas' : 'dashboard');
        } else {
          setActiveTab(id);
        }
        if (id !== 'pacientes') {
          setSelectedPatientId(null);
        }
        if (id !== 'terapeutas' && id !== 'nuevo-terapeuta') {
          setSelectedTherapistId(null);
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
          <PatientsDirectory
            onSelectPatient={handleSelectPatient}
            canCreatePatient={currentRole === 'ADMINISTRADOR'}
          />
        )
      )}

      {/* 3. Agendamiento de Citas (Solo Terapeuta) */}
      {activeTab === 'citas' && currentRole === 'TERAPEUTA' && <AppointmentsCalendar />}

      {/* 4. Directorio y Expediente de Terapeutas (Módulo Administrador) */}
      {activeTab === 'terapeutas' && (
        selectedTherapistId ? (
          <TherapistDetail
            therapistId={selectedTherapistId}
            onBack={() => setSelectedTherapistId(null)}
          />
        ) : (
          <TherapistsDirectory
            onSelectTherapist={(id) => setSelectedTherapistId(id)}
            onOpenRegister={() => setSelectedTherapistId('new')}
          />
        )
      )}

      {/* 5. Directorio de Usuarios y Accesos (Módulo Administrador) */}
      {activeTab === 'usuarios' && <UsersPage />}
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
