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
import { formatDate } from '../../utils/formatters';

// Common reusable components
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import type { BadgeVariant } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/feedback/EmptyState';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  USER: 'Terapeuta',
  GUEST: 'Paciente',
};

const AVAILABLE_ROLES = [
  { id: 'ALL', label: 'Todos' },
  { id: 'ADMIN', label: 'Administradores' },
  { id: 'USER', label: 'Terapeutas' },
  { id: 'GUEST', label: 'Pacientes' },
];

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
          <Avatar
            src={item.avatarUrl}
            alt={item.nombre}
            size="sm"
            rounded="xl"
          />
          <div>
            <span className="font-semibold text-slate-800 block text-sm">{item.nombre}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-serenity-50 border border-serenity-200/60 text-xs font-semibold text-serenity-800">
          <Shield className="w-3.5 h-3.5 text-serenity-600" />
          <span>{ROLE_LABELS[item.rol] || item.rol}</span>
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
        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
          {item.telefono ? (
            <>
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {item.telefono}
            </>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha Registro',
      render: (item) => (
        <span className="text-xs text-slate-600 font-medium">{formatDate(item.createdAt)}</span>
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
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            title="Editar usuario"
            onClick={() => openEdit(item)}
            className="p-1.5 text-slate-400 hover:text-serenity-600 hover:bg-serenity-50 rounded-lg transition-colors cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            title="Eliminar usuario"
            onClick={() => deleteModal.open(item)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
            <span className="text-xs font-semibold uppercase tracking-wider text-serenity-700">
              Administración
            </span>
            <Badge variant="neutral" size="sm">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'Usuario' : 'Usuarios'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administración de cuentas y asignación de permisos para el personal y pacientes.
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

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-slate-100 shadow-soft-sm">
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
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 w-full md:w-auto overflow-x-auto">
            {AVAILABLE_ROLES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedRole(id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  selectedRole === id
                    ? 'bg-white text-serenity-800 font-semibold shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {label}
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
            <label className="text-xs font-semibold text-slate-700">Rol del Usuario</label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 outline-none focus:border-serenity-500 focus:ring-2 focus:ring-serenity-500/15 transition-all cursor-pointer shadow-sm"
            >
              <option value="USER">USER (Terapeuta)</option>
              <option value="ADMIN">ADMIN (Administrador)</option>
              <option value="GUEST">GUEST (Paciente / Tutor)</option>
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
            <label className="text-xs font-semibold text-slate-700">Rol del Usuario</label>
            <select
              value={editFormData.rol}
              onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value as UserRole })}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 outline-none focus:border-serenity-500 focus:ring-2 focus:ring-serenity-500/15 transition-all cursor-pointer shadow-sm"
            >
              <option value="USER">USER (Terapeuta)</option>
              <option value="ADMIN">ADMIN (Administrador)</option>
              <option value="GUEST">GUEST (Paciente / Tutor)</option>
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
        <p className="text-sm text-slate-600">
          ¿Estás seguro de que deseas eliminar al usuario{' '}
          <strong className="text-slate-900 font-bold">{deleteModal.data?.nombre}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default UsersPage;
