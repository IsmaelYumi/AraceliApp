import React from 'react';
import { Users, Server, Zap, Shield, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export interface DashboardPageProps {
  onNavigateToUsers: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToUsers }) => {
  const stats = [
    {
      title: 'Total Usuarios',
      value: '24',
      change: '+12% este mes',
      icon: Users,
      color: 'from-blue-600 to-cyan-500',
    },
    {
      title: 'Backend API NestJS',
      value: 'Online',
      change: 'REST endpoints activos',
      icon: Server,
      color: 'from-emerald-600 to-teal-500',
    },
    {
      title: 'Latencia Promedio',
      value: '42 ms',
      change: 'Optimizado con Axios',
      icon: Zap,
      color: 'from-amber-600 to-orange-500',
    },
    {
      title: 'Seguridad',
      value: 'JWT + RBAC',
      change: 'Interceptors activos',
      icon: Shield,
      color: 'from-purple-600 to-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Panel de Control
            </span>
            <Badge variant="success" size="sm" dot>
              Sistema Operativo
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Dashboard General
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Estructura modular con separación de responsabilidades y componentes reutilizables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={onNavigateToUsers}
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Gestionar Usuarios
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} hoverable className="relative overflow-hidden">
              <div className="p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <span className="text-emerald-400 font-medium">●</span> {stat.change}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-lg`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Architecture Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estructura y Separación de Conexiones</CardTitle>
            <CardDescription>
              Cómo fluyen los datos entre las capas de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-semibold text-brand-400 block mb-1">
                  1. Componentes (UI)
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Solo se encargan de la presentación visual y la interacción del usuario. Reutilizables en cualquier parte.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">
                  2. Custom Hooks
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contienen el estado reactivo, la lógica de negocio y las llamadas a los servicios desacoplados.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-semibold text-indigo-400 block mb-1">
                  3. Servicios & API
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gestionan Axios, endpoints, tokens de autorización, DTOs y peticiones HTTP sin tocar React.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-brand-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Ventajas de esta arquitectura:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>Si cambia la API o el Backend de NestJS, solo modificas <code className="text-brand-300 bg-slate-900 px-1 py-0.5 rounded">src/services</code>.</li>
                <li>Los componentes en <code className="text-brand-300 bg-slate-900 px-1 py-0.5 rounded">src/components/common</code> son 100% reutilizables en cualquier vista.</li>
                <li>Fácilmente testeable con pruebas unitarias y mocks aislados.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accesos directos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={onNavigateToUsers}
              leftIcon={<Users className="w-4 h-4 text-brand-400" />}
            >
              Ver Módulo de Usuarios
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.open('http://localhost:3000/api', '_blank')}
              leftIcon={<Server className="w-4 h-4 text-emerald-400" />}
            >
              Explorar API Backend
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
