const express = require('express');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/order', orderRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'API de Gerenciamento de Pedidos',
        version: '1.0.0',
        endpoints: {
            'POST /order': 'Criar um novo pedido',
            'GET /order/list': 'Listar todos os pedidos',
            'GET /order/:orderId': 'Obter um pedido pelo número',
            'PUT /order/:orderId': 'Atualizar um pedido',
            'DELETE /order/:orderId': 'Deletar um pedido',
        },
    });
});

app.use((req, res) => {
    res.status(404).json({ error: `Rota "${req.method} ${req.path}" não encontrada.` });
});

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
