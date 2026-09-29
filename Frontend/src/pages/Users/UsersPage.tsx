import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Trash2,
  Edit,
  Power,
  Shield,
} from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { useDebounce } from '../../hooks/useDebounce';
import { useModal } from '../../hooks/useModal';
import type { User, UserRole, CreateUserDto, UpdateUserDto } from '../../types';
import { formatDate, getInitials } from '../../utils/formatters';

// Common reusable components
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import type { BadgeVariant } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Alert } from '../../components/feedback/Alert';

export const UsersPage: React.FC = () => {
  // 1. Decoupled Business Logic Hook
  const {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
  } = useUsers();

  // 2. Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const debouncedSearch = useDebounce(searchTerm, 250);

  // Modals for Create and Edit
  const createModal = useModal<void>();
  const editModal = useModal<User>();
  const deleteModal = useModal<User>();

  // Form states for creation
  const [formData, setFormData] = useState<CreateUserDto>({
    nombre: '',
    email: '',
    rol: 'USER',
    telefono: '',
  });

  // Form states for editing
  const [editFormData, setEditFormData] = useState<UpdateUserDto>({
    nombre: '',
    email: '',
    rol: 'USER',
    telefono: '',
  });

  // Filtered users according to search & role
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (u.telefono && u.telefono.includes(debouncedSearch));

      const matchesRole = selectedRole === 'ALL' || u.rol === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, debouncedSearch, selectedRole]);

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.email.trim()) return;

    const created = await createUser(formData);
    if (created) {
      setFormData({ nombre: '', email: '', rol: 'USER', telefono: '' });
      createModal.close();
    }
  };

  // Open Edit Modal
  const openEdit = (user: User) => {
    setEditFormData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      telefono: user.telefono || '',
    });
    editModal.open(user);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.data) return;

    const updated = await updateUser(editModal.data.id, editFormData);
    if (updated) {
      editModal.close();
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModal.data) return;
    const ok = await deleteUser(deleteModal.data.id);
    if (ok) {
      deleteModal.close();
    }
  };

  // Status badge variant mapper
  const getStatusBadge = (estado: string) => {
    const map: Record<string, { label: string; variant: BadgeVariant }> = {
      ACTIVE: { label: 'Activo', variant: 'success' },
      INACTIVE: { label: 'Inactivo', variant: 'danger' },
      PENDING: { label: 'Pendiente', variant: 'warning' },
      BLOCKED: { label: 'Bloqueado', variant: 'danger' },
    };
    const current = map[estado] || { label: estado, variant: 'neutral' };
    return (
      <Badge variant={current.variant} size="sm" dot>
        {current.label}
      </Badge>
    );
  };

  // Columns definition for reusable Table component
  const columns: Column<User>[] = [
    {
      key: 'usuario',
      header: 'Usuario',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xs font-semibold text-slate-200">
            {getInitials(item.nombre)}
          </div>
          <div>
            <span className="font-medium text-slate-100 block text-sm">{item.nombre}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-500" />
              {item.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (item) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50 text-xs font-medium text-slate-300">
          <Shield className="w-3 h-3 text-brand-400" />
          <span>{item.rol}</span>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item) => getStatusBadge(item.estado),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (item) => (
        <span className="text-xs text-slate-400 flex items-center gap-1">
          {item.telefono ? (
            <>
              <Phone className="w-3 h-3 text-slate-500" />
              {item.telefono}
            </>
          ) : (
            '—'
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha Registro',
      render: (item) => (
        <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="text-right block">Acciones</span>,
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            title="Cambiar estado"
            onClick={() => toggleStatus(item.id)}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            title="Editar usuario"
            onClick={() => openEdit(item)}
            className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            title="Eliminar usuario"
            onClick={() => deleteModal.open(item)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Administración
            </span>
            <Badge variant="neutral" size="sm">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'Usuario' : 'Usuarios'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Componentes desacoplados conectados al servicio <code className="text-brand-300">userService</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => fetchUsers()}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refrescar
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => createModal.open()}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Info Alert about connection architecture */}
      <Alert type="info" title="Separación de Conexiones">
        Esta vista no ejecuta directamente peticiones HTTP. Toda la comunicación pasa por la capa de{' '}
        <strong className="text-slate-100">servicios</strong> y se consume a través del hook{' '}
        <code className="text-brand-300 font-mono">useUsers()</code>.
      </Alert>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
            {['ALL', 'ADMIN', 'MANAGER', 'USER'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedRole === role
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {role === 'ALL' ? 'Todos' : role}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table Data */}
      {filteredUsers.length === 0 && !isLoading ? (
        <EmptyState
          title="No se encontraron usuarios"
          description="Intenta cambiar los términos de búsqueda o crear un nuevo usuario en la plataforma."
          actionText="Crear Usuario"
          onAction={() => createModal.open()}
        />
      ) : (
        <Table<User>
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* CREATE MODAL */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Registrar Nuevo Usuario"
        description="Completa el formulario para registrar un usuario en la base de datos."
        footer={
          <>
            <Button variant="secondary" onClick={createModal.close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Guardar Usuario
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej. Sofía Hernández"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="usuario@araceli.app"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Rol del Usuario</label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
            >
              <option value="USER">USER (Estándar)</option>
              <option value="MANAGER">MANAGER (Gestor)</option>
              <option value="ADMIN">ADMIN (Administrador)</option>
            </select>
          </div>
          <Input
            label="Teléfono (Opcional)"
            placeholder="+34 600 000 000"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Editar Usuario"
        description={`Modificando información de ${editModal.data?.nombre || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={editModal.close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSubmit}
              isLoading={isLoading}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            required
            value={editFormData.nombre}
            onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            required
            value={editFormData.email}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Rol del Usuario</label>
            <select
              value={editFormData.rol}
              onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value as UserRole })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
            >
              <option value="USER">USER (Estándar)</option>
              <option value="MANAGER">MANAGER (Gestor)</option>
              <option value="ADMIN">ADMIN (Administrador)</option>
            </select>
          </div>
          <Input
            label="Teléfono"
            value={editFormData.telefono}
            onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
          />
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        size="sm"
        title="¿Eliminar Usuario?"
        description="Esta acción eliminará el registro de la base de datos."
        footer={
          <>
            <Button variant="secondary" onClick={deleteModal.close}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isLoading}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Eliminar Definitivamente
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          ¿Estás seguro de que deseas eliminar al usuario{' '}
          <strong className="text-white">{deleteModal.data?.nombre}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default UsersPage;
