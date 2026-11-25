import 'dotenv/config';
import {
  PrismaClient,
  RolUsuario,
  EstadoUsuario,
  EstadoTerapeuta,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando ejecución de seeders...');

  // 1. Limpieza de cuentas demo de prueba o terapeutas anteriores
  await prisma.terapeuta.deleteMany({
    where: {
      email: {
        in: [
          'laura.mendoza@serenitychildcare.org',
          'carlos.herrera@serenitychildcare.org',
          'lourdeslibertador72@gmail.com',
        ],
      },
    },
  });
  await prisma.usuario.deleteMany({
    where: {
      email: {
        in: [
          'admin@serenitychildcare.org',
          'laura.mendoza@serenitychildcare.org',
          'carlos.herrera@serenitychildcare.org',
        ],
      },
    },
  });

  // 2. Limpieza de pacientes y registros clínicos asociados
  await prisma.actividadClinica.deleteMany({});
  await prisma.cita.deleteMany({});
  await prisma.documentoPdf.deleteMany({});
  await prisma.segundoContacto.deleteMany({});
  await prisma.tutorLegal.deleteMany({});
  await prisma.paciente.deleteMany({});
  console.log('🗑️ Pacientes y registros clínicos eliminados.');

  // ========================================================
  // 1. ADMINISTRADOR GENERAL DEL SISTEMA: Esmeralda Rodriguez
  // ========================================================
  const adminPassword = await bcrypt.hash('0914507215', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'lourdeslibertador72@gmail.com' },
    update: {
      nombre: 'Esmeralda Rodriguez',
      password: adminPassword,
      rol: RolUsuario.ADMIN,
      estado: EstadoUsuario.ACTIVE,
      telefono: '+593 992794602',
    },
    create: {
      nombre: 'Esmeralda Rodriguez',
      email: 'lourdeslibertador72@gmail.com',
      password: adminPassword,
      rol: RolUsuario.ADMIN,
      estado: EstadoUsuario.ACTIVE,
      telefono: '+593 992794602',
    },
  });
  console.log(`✅ Administrador creado: ${admin.email}`);

  // ========================================================
  // 2. TERAPEUTA 1: Paula Alexandra Rodríguez Claudett
  // ========================================================
  const emailPaula = 'paula.rodriguez@gmail.com';
  const terapeuta1Password = await bcrypt.hash('0818806506', 10);
  const userTerapeuta1 = await prisma.usuario.upsert({
    where: { email: emailPaula },
    update: {
      nombre: 'Paula Alexandra Rodríguez Claudett',
      password: terapeuta1Password,
      rol: RolUsuario.USER,
      estado: EstadoUsuario.ACTIVE,
      telefono: '',
    },
    create: {
      nombre: 'Paula Alexandra Rodríguez Claudett',
      email: emailPaula,
      password: terapeuta1Password,
      rol: RolUsuario.USER,
      estado: EstadoUsuario.ACTIVE,
      telefono: '',
    },
  });

  const terapeuta1 = await prisma.terapeuta.upsert({
    where: { cedulaProfesional: '0818806506' },
    update: {
      nombres: 'Paula Alexandra',
      apellidos: 'Rodríguez Claudett',
      nombreCompleto: 'Paula Alexandra Rodríguez Claudett',
      especialidad: '',
      email: emailPaula,
      telefono: '',
      usuarioId: userTerapeuta1.id,
    },
    create: {
      nombres: 'Paula Alexandra',
      apellidos: 'Rodríguez Claudett',
      nombreCompleto: 'Paula Alexandra Rodríguez Claudett',
      especialidad: '',
      cedulaProfesional: '0818806506',
      telefono: '',
      email: emailPaula,
      estado: EstadoTerapeuta.ACTIVO,
      usuarioId: userTerapeuta1.id,
    },
  });
  console.log(`✅ Terapeuta 1 creada: ${terapeuta1.nombreCompleto}`);

  // ========================================================
  // 3. TERAPEUTA 2: Laura Carolina Córdova Correa
  // ========================================================
  const emailLaura = 'lc674964@gmail.com';
  const lauraCloudinaryAvatar = 'https://res.cloudinary.com/mcoyf71d/image/upload/v1794198680/araceli_app/fotos/file_omcsax.jpg';
  const lauraEspecialidad = 'Estimulación Temprana y Terapia de Lenguaje Infantil';
  const terapeuta2Password = await bcrypt.hash('0950627224', 10);
  const userTerapeuta2 = await prisma.usuario.upsert({
    where: { email: emailLaura },
    update: {
      nombre: 'Laura Carolina Córdova Correa',
      password: terapeuta2Password,
      rol: RolUsuario.USER,
      estado: EstadoUsuario.ACTIVE,
      telefono: '',
      avatarUrl: lauraCloudinaryAvatar,
    },
    create: {
      nombre: 'Laura Carolina Córdova Correa',
      email: emailLaura,
      password: terapeuta2Password,
      rol: RolUsuario.USER,
      estado: EstadoUsuario.ACTIVE,
      telefono: '',
      avatarUrl: lauraCloudinaryAvatar,
    },
  });

  const terapeuta2 = await prisma.terapeuta.upsert({
    where: { cedulaProfesional: '0950627224' },
    update: {
      nombres: 'Laura Carolina',
      apellidos: 'Córdova Correa',
      nombreCompleto: 'Laura Carolina Córdova Correa',
      especialidad: lauraEspecialidad,
      email: emailLaura,
      telefono: '',
      avatarUrl: lauraCloudinaryAvatar,
      usuarioId: userTerapeuta2.id,
    },
    create: {
      nombres: 'Laura Carolina',
      apellidos: 'Córdova Correa',
      nombreCompleto: 'Laura Carolina Córdova Correa',
      especialidad: lauraEspecialidad,
      cedulaProfesional: '0950627224',
      telefono: '',
      email: emailLaura,
      avatarUrl: lauraCloudinaryAvatar,
      estado: EstadoTerapeuta.ACTIVO,
      usuarioId: userTerapeuta2.id,
    },
  });
  console.log(`✅ Terapeuta 2 creada: ${terapeuta2.nombreCompleto}`);

  // ========================================================
  // 4. TERAPEUTA 3: Urbaci Damber Vinces Alcívar
  // ========================================================
  const emailUrbaci = 'urbaci_2@hotmail.com';
  const terapeuta3Password = await bcrypt.hash('0913797528', 10);
  const userTerapeuta3 = await prisma.usuario.upsert({
    where: { email: emailUrbaci },
    update: {
      nombre: 'Urbaci Damber Vinces Alcívar',
      password: terapeuta3Password,
      rol: RolUsuario.USER,
      estado: EstadoUsuario.ACTIVE,
      telefono: '',
    },
    create: {
      nombre: 'Urbaci Damber Vinces Alcívar',
      email: emailUrbaci,
      password: terapeuta3Password,
      rol: RolUsuario.USER,
      estado: EstadoUsuario.ACTIVE,
      telefono: '',
    },
  });

  const terapeuta3 = await prisma.terapeuta.upsert({
    where: { cedulaProfesional: '0913797528' },
    update: {
      nombres: 'Urbaci Damber',
      apellidos: 'Vinces Alcívar',
      nombreCompleto: 'Urbaci Damber Vinces Alcívar',
      especialidad: '',
      email: emailUrbaci,
      telefono: '',
      usuarioId: userTerapeuta3.id,
    },
    create: {
      nombres: 'Urbaci Damber',
      apellidos: 'Vinces Alcívar',
      nombreCompleto: 'Urbaci Damber Vinces Alcívar',
      especialidad: '',
      cedulaProfesional: '0913797528',
      telefono: '',
      email: emailUrbaci,
      estado: EstadoTerapeuta.ACTIVO,
      usuarioId: userTerapeuta3.id,
    },
  });
  console.log(`✅ Terapeuta 3 creado: ${terapeuta3.nombreCompleto}`);

  console.log('✨ Seeders completados exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seeders:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
