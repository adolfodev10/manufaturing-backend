#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Iniciando build para Render...");
console.log("Diretorio:", process.cwd());
console.log("Node:", process.version);
console.log("npm:", execSync("npm -v").toString().trim());

try {
  const prismaSchemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

  if (!fs.existsSync(prismaSchemaPath)) {
    throw new Error(`Schema do Prisma nao encontrado: ${prismaSchemaPath}`);
  }

  console.log("Schema do Prisma encontrado");

  console.log("Instalando dependencias...");
  execSync("npm ci --ignore-scripts", { stdio: "inherit" });

  console.log("Aplicando migrations...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  console.log("Gerando Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("Compilando TypeScript...");
  execSync("npm run build", { stdio: "inherit" });

  const serverPath = path.join(process.cwd(), "dist", "server.js");

  if (!fs.existsSync(serverPath)) {
    throw new Error("Arquivo dist/server.js nao foi criado");
  }

  console.log("Build concluido com sucesso");
} catch (error) {
  console.error("Erro no build:", error.message);
  process.exit(1);
}
