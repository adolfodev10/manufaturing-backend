#!/usr/bin/env node
// scripts/render-build.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Render...');
console.log('📁 Diretório:', process.cwd());
console.log('📦 Node:', process.version);
console.log('📦 npm:', execSync('npm -v').toString().trim());

try {
  // 1. Verificar se prisma/schema.prisma existe
  const prismaSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (!fs.existsSync(prismaSchemaPath)) {
    throw new Error('Schema do Prisma não encontrado: ' + prismaSchemaPath);
  }
  console.log('✅ Schema do Prisma encontrado');

  // 2. Instalar dependências de produção
  console.log('📦 Instalando dependências...');
  execSync('npm ci --only=production --ignore-scripts', { stdio: 'inherit' });

  // 3. Gerar Prisma Client
  console.log('🔧 Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 4. Build TypeScript
  console.log('🏗️  Compilando TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });

  // 5. Verificar se dist/server.js foi criado
  const serverPath = path.join(process.cwd(), 'dist', 'server.js');
  if (!fs.existsSync(serverPath)) {
    throw new Error('Arquivo dist/server.js não foi criado');
  }
  console.log('✅ Build concluído com sucesso!');

} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}