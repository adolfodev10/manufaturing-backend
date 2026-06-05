import { FastifyInstance } from "fastify";

export const RootRoute = (app: FastifyInstance) => {
  app.get("/", async (_request, reply) => {
    reply.type("text/html").send(`
      <!DOCTYPE html>
      <html lang="pt-AO">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EKO API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333;
          }
          header {
            background: #022e03;
            color: white;
            padding: 16px 20px;
            text-align: center;
          }
          main {
            max-width: 900px;
            margin: 0 auto;
            padding: 24px 20px;
          }
          h1, h2 {
            color: #022e03;
          }
          header h1 {
            color: white;
          }
          ul {
            list-style-type: square;
          }
          footer {
            text-align: center;
            padding: 12px;
            background: #333;
            color: white;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>EKO API</h1>
        </header>
        <main>
          <h2>Descricao</h2>
          <p>A EKO API fornece os servicos de backend para a gestao integrada de operacoes comerciais, estoque, vendas, clientes, fornecedores, faturacao e configuracoes do sistema.</p>

          <h2>Tecnologias Utilizadas</h2>
          <ul>
            <li>Node.js e TypeScript</li>
            <li>Fastify com validacao Zod</li>
            <li>Prisma ORM</li>
            <li>MySQL / MariaDB</li>
            <li>JWT e bcrypt para autenticacao</li>
          </ul>

          <h2>Funcionalidades</h2>
          <ul>
            <li>Autenticacao, autorizacao e gestao de usuarios</li>
            <li>Gestao de produtos, estoque, vendas e dividas</li>
            <li>Gestao de clientes, fornecedores e faturas</li>
            <li>Perfis, permissoes e controlo de acesso</li>
            <li>Logs, backups e configuracoes do sistema</li>
            <li>Validacao de dados e migrations versionadas</li>
          </ul>

          <h2>Estado da API</h2>
          <p>API operacional, protegida por autenticacao JWT e integrada com a base de dados EKO.</p>
        </main>
        <footer>
          <p>&copy; 2026 EKO. Todos os direitos reservados.</p>
        </footer>
      </body>
      </html>
    `);
  });
};
