# Desafio Jitterbit - API de Gerenciamento de Pedidos

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

Uma API REST desenvolvida em Node.js com Express e SQLite para o gerenciamento de pedidos e seus respectivos itens, com frontend web. 

| O frontend foi desenvolvido a parte com ferramentas de Inteligência Artificial já que para o desafio não era obrigatório.

## 🎯 Objetivo do Projeto

Fornecer uma interface robusta para operações CRUD (Criar, Ler, Atualizar, Deletar) de pedidos. Cada pedido contém `orderNumber`, `totalValue` e `creationDate`, além de uma lista de itens com `idItem`, `quantityItem` e `valueItem`. O sistema inclui um frontend web que consome a API diretamente pelo navegador.

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas baseada no padrão **MVC simplificado** (sem a camada View na API), com um frontend estático servido por um servidor separado.

```text
/
├── /src
│   ├── /controllers   # Lógica de controle e tratamento de requisições HTTP
│   ├── /database      # Configuração e inicialização do banco de dados SQLite
│   ├── /models        # Lógica de persistência de dados (queries SQL)
│   ├── /routes        # Definição dos endpoints da API
│   └── server.js      # Ponto de entrada da API (porta 3000)
├── /public
│   ├── index.html     # Interface web
│   ├── app.js         # Lógica do frontend
│   └── styles.css     # Estilos
├── frontend-server.js # Servidor do frontend + proxy para a API (porta 8080)
└── database.sqlite    # Banco de dados gerado automaticamente
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) v16 ou superior

### Passos

1. **Acesse o diretório do projeto**:
   ```bash
   cd caminho/para/o/projeto/Jitterbit
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie a aplicação**:

   | Comando | Descrição |
   |---|---|
   | `npm start` | Inicia a **API** (porta 3000) + **Frontend** (porta 8080) |
   | `npm run dev` | Igual ao `start`, mas com auto-reload via `nodemon` |
   | `npm run api` | Inicia somente a API |
   | `npm run frontend` | Inicia somente o frontend |

4. **Acesse**:
   - **Frontend:** [http://localhost:8080](http://localhost:8080)
   - **API direta:** [http://localhost:3000](http://localhost:3000)

   O banco de dados `database.sqlite` é criado automaticamente na raiz do projeto na primeira inicialização.

---

## 🔗 Endpoints da API

Base URL: `http://localhost:3000`

### `GET /`
Retorna informações básicas da API e lista de endpoints.

---

### `POST /order`
Cria um novo pedido com seus itens.

**Body:**
```json
{
  "orderNumber": "001",
  "totalValue": 150.00,
  "creationDate": "2024-03-09",
  "items": [
    {
      "idItem": "prod-1",
      "quantityItem": 2,
      "valueItem": 75.00
    }
  ]
}
```

**Resposta:** `201 Created` com o pedido criado.

---

### `GET /order/list`
Lista todos os pedidos cadastrados com seus respectivos itens.

**Resposta:** `200 OK` com array de pedidos.

---

### `GET /order/:orderId`
Retorna um pedido específico pelo `orderNumber`.

**Resposta:** `200 OK` com o pedido | `404 Not Found`

---

### `PUT /order/:orderId`
Atualiza as informações de um pedido existente (recria os itens).

**Body:**
```json
{
  "totalValue": 200.00,
  "creationDate": "2024-03-10",
  "items": [
    {
      "idItem": "prod-2",
      "quantityItem": 1,
      "valueItem": 200.00
    }
  ]
}
```

**Resposta:** `200 OK` com o pedido atualizado | `404 Not Found`

---

### `DELETE /order/:orderId`
Remove um pedido e todos os seus itens (cascade).

**Resposta:** `200 OK` com mensagem de confirmação | `404 Not Found`

