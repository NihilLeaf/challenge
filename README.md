### Contexto do projeto
Trata-se de uma api que provisiona conteúdos de diversos tipos.
O projeto está feito em NestJs, TypeOrm e Graphql.

### Decisões
Decidi criar uma factory de content juntamente com o enum para tornar o processo de adição de novos tipos de conteúdo muito mais fácil.

Além do mais, verifiquei o company id do usuário logado na query para buscar por content id, assim não sendo possível buscar conteúdos de outra empresa. E removi o SQL INJECTION da query.

Criei uma criptografia para gerar a url assinada do arquivo.

Para adicionar o tipo de texto, criei uma tabela que relaciona com um content, sendo assim, possível colocar um arquivo de texto por url e também um texto salvo direto no banco. (Aumentando as possibilidades)

### Setup do projeto de backend

### Pré-requisitos

O que você precisa para configurar o projeto:

- [NPM](https://www.npmjs.com/)
- [Node](https://nodejs.org/en/) `>=22.0.0` (Instale usando [NVM](https://github.com/nvm-sh/nvm))
- [Docker Compose](https://docs.docker.com/compose/)

### Setup

1. **Instale o Docker e o Docker Compose**, caso ainda não tenha.
2. Suba os serviços necessários (PostgreSQL e Redis) com:
   ```bash
   docker-compose up -d
   ```
3. Instale as dependências do projeto:
   ```bash
   nvm use && npm install
   ```
4. Configure o banco de dados:
   ```bash
   npm run db:migrate && npm run db:seed
   ```
5. Inicie o servidor:
   ```bash
   npm run start:dev
   ```
6. Acesse o **Playground do GraphQL**:
   - 👉 [http://localhost:3000/graphql](http://localhost:3000/graphql)
  
7. Opcional: para gerar alguns contents do tipo texto de exemplo, rode:
   - npm run db:seedTextContent

### Tests

Para rodar os testes:

```bash
npm run test
```

### Migrations

Caso precise criar novas migrations, utilize o comando:

```bash
npm run db:create_migration --name=create-xpto-table
```
