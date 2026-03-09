# Desafio Jitterbit - API de Gerenciamento de Pedidos

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

Uma API REST desenvolvida em Node.js com Express e SQLite para o gerenciamento de pedidos e seus respectivos itens. 

## 🎯 Objetivo do Projeto

O objetivo deste projeto é fornecer uma interface robusta para operações CRUD (Criar, Ler, Atualizar, Deletar) de pedidos. Cada pedido contém informações como `numeroPedido`, `valorTotal` e `dataCriacao`, além de uma lista de itens associados (com `idItem`, `quantidadeItem` e `valorItem`). O sistema foi desenhado para ser simples de configurar, rápido e sem dependências de bancos de dados externos complexos, utilizando o SQLite embutido.

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas baseada no padrão **MVC (Model-View-Controller) simplificado** (sem a camada View, por ser uma API REST), o que garante boa separação de responsabilidades (Separation of Concerns).

A estrutura de diretórios é organizada da seguinte forma:

```text
/src
├── /controllers   # Lógica de controle e tratamento de requisições HTTP (Validações, mapping e respostas)
├── /database      # Configuração e inicialização do banco de dados SQLite (Criação de tabelas)
├── /models        # Lógica de persistência de dados (Queries SQL, transações e acesso ao BD)
├── /routes        # Definição e roteamento dos endpoints da API
└── server.js      # Ponto de entrada da aplicação, configuração do Express e middlewares
```

### Componentes Principais:
1. **Server (`server.js`)**: Configura o servidor Express, define os middlewares (como o parser JSON) e registra as rotas globais. Também possui tratamento básico de erros (erro 404 e 500 globais).
2. **Routes (`orderRoutes.js`)**: Mapeia as URLs base (`/order`) com seus respectivos verbos HTTP (GET, POST, PUT, DELETE) para os métodos do Controller correspondente.
3. **Controllers (`orderController.js`)**: Responsável por receber o `request` e `response`. Ele valida os dados de entrada, mapeia o corpo da requisição para o formato do banco de dados e chama os métodos do Model. Por fim, retorna a resposta serializada em JSON para o cliente.
4. **Models (`orderModel.js`)**: Encapsula as interações com o banco de dados. Utiliza o `better-sqlite3` para executar as operações de inserção, seleção, atualização e exclusão sincronamente. Utiliza *transactions* para garantir a consistência quando alteramos tabelas relacionadas simultaneamente (exemplo: ao inserir um pedido, insere os itens atrelados a ele).
5. **Database (`db.js`)**: Responsável por configurar a conexão com o arquivo do banco de dados `database.sqlite` (que é criado na raiz do projeto) e inicializar as tabelas `Order` e `Items` com suas `Foreign Keys` (e o mecanismo `ON DELETE CASCADE`).

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Ter o [Node.js](https://nodejs.org/) instalado em sua máquina (v16 ou superior recomendado).

### Passos para Execução

1. **Clone ou acesse o diretório do projeto**:
   Navegue até a pasta do projeto no seu terminal.
   ```bash
   cd caminho/para/o/projeto/Jitterbit
   ```

2. **Instale as dependências**:
   Execute o comando abaixo para instalar as bibliotecas necessárias listadas no `package.json` (como `express`, `better-sqlite3`, etc).
   ```bash
   npm install
   ```

3. **Inicie a aplicação**:
   Você tem duas opções para iniciar o servidor localmente:

   - **Modo Desenvolvimento (com auto-reload usando nodemon)**:
     ```bash
     npm run dev
     ```
   
   - **Modo Produção/Padrão**:
     ```bash
     npm start
     ```

4. **Acesse a API**:
   O servidor será iniciado por padrão na porta **3000** (ou na variável de ambiente `PORT`). 
   Você verá a mensagem: `🚀 Servidor rodando em http://localhost:3000`

   A API já estará pronta para receber requisições. O banco de dados SQLite (`database.sqlite`) será gerado magicamente na raiz do projeto logo na inicialização, sem a necessidade de intervenções manuais.

---

## 🔗 Endpoints da API

Abaixo estão as rotas disponíveis na aplicação:

- `GET /` - Retorna as informações básicas da API e os endpoints.
- `POST /order` - Cria um novo pedido junto de seus itens.
- `GET /order/list` - Lista todos os pedidos cadastrados e seus respectivos itens.
- `GET /order/:orderId` - Retorna um pedido específico e seus itens pelo `numeroPedido`.
- `PUT /order/:orderId` - Atualiza as informações (e limpa/recria os itens) de um pedido existente.
- `DELETE /order/:orderId` - Deleta um pedido específico (e automaticamente todos os seus itens associados devido ao cascade do banco).
