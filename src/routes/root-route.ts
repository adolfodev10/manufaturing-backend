import { FastifyInstance } from "fastify";


export const RootRoute = (app: FastifyInstance) => {
  app.get('/', async (request, reply) => {
    reply.type('text/html').send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Judy Farma Backend</title>
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
            padding: 10px 20px;
            text-align: center;
          }
          main {
            padding: 20px;
          }
          h1, h2 {
            color: #022e03;
          }
          ul {
            list-style-type: square;
          }
          footer {
            text-align: center;
            padding: 10px;
            background: #333;
            color: white;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Bem-vindo ao Backend da Judy Farma</h1>
        </header>
        <main>
          <h2>Descrição</h2>
          <p>Este backend foi desenvolvido para suportar o sistema de gestão da farmácia, uma solução destinada a resolvar problema das farmácias.</p>
  
          <h2>Tecnologias Utilizadas</h2>
          <ul>
            <li>Node.js</li>
            <li>Fastify</li>
            <li>Prisma</li>
          </ul>
  
          <h2>Funcionalidades</h2>
          <ul>
            <li>Autenticação e autorização de usuários</li>
            <li>Gestão de dados de usuários e negócios</li>
            <li>APIs otimizadas para performance</li>
          </ul>
  
          <h2>Próximos Passos</h2>
          <p>Implementar integração com o frontend em React.js e realizar testes de desempenho.</p>
        </main>
        <footer>
          <p>&copy; 2023 Judy Farma. Todos os direitos reservados.</p>
        </footer>
      </body>
      </html>
    `);
  });
}