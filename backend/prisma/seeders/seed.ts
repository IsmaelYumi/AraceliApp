import 'dotenv/config';
import {
  PrismaClient,
  RolUsuario,
  EstadoUsuario,
  EstadoTerapeuta,
  EstadoPaciente,
  GeneroPaciente,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando ejecución de seeders...');

  // ========================================================
  // 1. ADMINISTRADOR GENERAL DEL SISTEMA
  // ========================================================
  const adminPassword = await bcrypt.hash('Admin2025*', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@serenitychildcare.org' },
    update: {},
    create: {
      nombre: 'Dirección Clínica Serenity (Administrador)',
      email: 'admin@serenitychildcare.org',
      password: adminPassword,
      rol: RolUsuario.ADMIN,
      estado: EstadoUsuario.ACTIVE,
      telefono: '+52 55 0000 1111',
    },
  });
  console.log(`✅ Administrador creado: ${admin.email}`);

  // ========================================================
  // 2. TERAPEUTA 1 (Dra. Laura Mendoza Castillo)
  // ========================================================
  const terapeuta1Password = await bcrypt.hash('Terapeuta2025*', 10);
  const userTerapeuta1 = await prisma.usuario.upsert({
    where: { email: 'laura.mendoza@serenitychildcare.org' },
    update: {},
    create: {
      nombre: 'Dra. Laura Mendoza Castillo',
      email: 'laura.mendoza@serenitychildcare.org',
      password: terapeuta1Password,
      rol: RolUsuario.USER,
      estado: EstadoUsuario.ACTIVE,
      telefono: '+52 55 1234 5678',
    },
  });

  const terapeuta1 = await prisma.terapeuta.upsert({
    where: { email: 'laura.mendoza@serenitychildcare.org' },
    update: { usuarioId: userTerapeuta1.id },
    create: {
      nombres: 'Laura',
      apellidos: 'Mendoza Castillo',
      nombreCompleto: 'Dra. Laura Mendoza Castillo',
      especialidad: 'Fonoaudiología y Terapia del Lenguaje',
      cedulaProfesional: 'CED-FON-894120',
      telefono: '+52 55 1234 5678',
      email: 'laura.mendoza@serenitychildcare.org',
      estado: EstadoTerapeuta.ACTIVO,
      usuarioId: userTerapeuta1.id,
    },
  });
  console.log(`✅ Terapeuta 1 creada: ${terapeuta1.nombreCompleto} (${terapeuta1.especialidad})`);

  // ========================================================
  // 3. TERAPEUTA 2 (Lic. Carlos Herrera Delgado)
  // ========================================================
  const terapeuta2Password = await bcrypt.hash('Terapeuta2025*', 10);
  const userTerapeuta2 = await prisma.usuario.upsert({
    where: { email: 'carlos.herrera@serenitychildcare.org' },
    update: {},
    create: {
      nombre: 'Lic. Carlos Herrera Delgado',
      email: 'carlos.herrera@serenitychildcare.org',
      password: terapeuta2Password,
      rol: RolUsuario.USER,
      estado: EstadoUsuario.ACTIVE,
      telefono: '+52 55 8765 4321',
    },
  });

  const terapeuta2 = await prisma.terapeuta.upsert({
    where: { email: 'carlos.herrera@serenitychildcare.org' },
    update: { usuarioId: userTerapeuta2.id },
    create: {
      nombres: 'Carlos',
      apellidos: 'Herrera Delgado',
      nombreCompleto: 'Lic. Carlos Herrera Delgado',
      especialidad: 'Terapia Ocupacional e Integración Sensorial',
      cedulaProfesional: 'CED-TOC-741290',
      telefono: '+52 55 8765 4321',
      email: 'carlos.herrera@serenitychildcare.org',
      estado: EstadoTerapeuta.ACTIVO,
      usuarioId: userTerapeuta2.id,
    },
  });
  console.log(`✅ Terapeuta 2 creado: ${terapeuta2.nombreCompleto} (${terapeuta2.especialidad})`);

  // ========================================================
  // 4. PACIENTE 1 (Mateo Andrés González Rivas)
  // ========================================================
  const paciente1 = await prisma.paciente.upsert({
    where: { codigoExpediente: 'EXP-2025-001' },
    update: {},
    create: {
      codigoExpediente: 'EXP-2025-001',
      nombres: 'Mateo Andrés',
      apellidos: 'González Rivas',
      nombreCompleto: 'Mateo Andrés González Rivas',
      fechaNacimiento: new Date('2021-06-15'),
      genero: GeneroPaciente.masculino,
      grupoSanguineo: 'O+',
      diagnosticoPrincipal: 'Trastorno del Desarrollo del Lenguaje (TDL)',
      sala: 'Sala Azul (Estimulación)',
      frecuencia: '2 sesiones por semana',
      condicionesMedicas: 'Prematurez leve (35 semanas), sin antecedentes alérgicos',
      observacionesAdmision: 'Excelente respuesta al juego simbólico y actividades motrices',
      antecedentes: 'Embarazo controlado, parto por cesárea sin complicaciones mayores',
      estado: EstadoPaciente.ACTIVO,
      tutor: {
        create: {
          nombreCompleto: 'Carmen Rivas de González',
          parentesco: 'Madre',
          dni: 'DNI-09283741',
          telefono: '+52 55 9876 5432',
          email: 'carmen.rivas@gmail.com',
          direccion: 'Av. Las Palmas #240, Col. Del Valle',
        },
      },
    },
  });
  console.log(`✅ Paciente 1 creado: ${paciente1.nombreCompleto} [${paciente1.codigoExpediente}]`);

  // ========================================================
  // 5. PACIENTE 2 (Valentina Sofía Pérez Morales)
  // ========================================================
  const paciente2 = await prisma.paciente.upsert({
    where: { codigoExpediente: 'EXP-2025-002' },
    update: {},
    create: {
      codigoExpediente: 'EXP-2025-002',
      nombres: 'Valentina Sofía',
      apellidos: 'Pérez Morales',
      nombreCompleto: 'Valentina Sofía Pérez Morales',
      fechaNacimiento: new Date('2022-03-20'),
      genero: GeneroPaciente.femenino,
      grupoSanguineo: 'A+',
      diagnosticoPrincipal: 'Retraso Psicomotor Leve e Hipotonía Axial',
      sala: 'Sala Verde (Psicomotricidad)',
      frecuencia: '3 sesiones por semana',
      condicionesMedicas: 'Esquema de vacunación al día, sin contraindicaciones clínicas',
      observacionesAdmision: 'Requiere estimulación propioceptiva y refuerzo de control postural',
      antecedentes: 'Desarrollo motriz inicial con leve retraso en gateo y bipedestación',
      estado: EstadoPaciente.ACTIVO,
      tutor: {
        create: {
          nombreCompleto: 'Roberto Pérez Méndez',
          parentesco: 'Padre',
          dni: 'DNI-18273645',
          telefono: '+52 55 3344 5566',
          email: 'roberto.perez@gmail.com',
          direccion: 'Calle Independencia #105, Col. Centro',
        },
      },
    },
  });
  console.log(`✅ Paciente 2 creada: ${paciente2.nombreCompleto} [${paciente2.codigoExpediente}]`);

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
