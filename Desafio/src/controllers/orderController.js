const orderModel = require('../models/orderModel');

function mapRequestToOrder(body) {
    const { numeroPedido, valorTotal, dataCriacao, items } = body;

    const creationDate = new Date(dataCriacao).toISOString();

    const mappedItems = (items || []).map((item) => ({
        productId: String(item.idItem),
        quantity: Number(item.quantidadeItem),
        price: Number(item.valorItem),
    }));

    return {
        orderId: numeroPedido,
        value: Number(valorTotal),
        creationDate,
        items: mappedItems,
    };
}

function createOrder(req, res) {
    try {
        const { numeroPedido, valorTotal, dataCriacao, items } = req.body;

        if (!numeroPedido || valorTotal === undefined || !dataCriacao || !Array.isArray(items)) {
            return res.status(400).json({
                error: 'Campos obrigatórios ausentes: numeroPedido, valorTotal, dataCriacao, items',
            });
        }

        const existing = orderModel.getOrderById(numeroPedido);
        if (existing) {
            return res.status(409).json({ error: `Pedido com numeroPedido "${numeroPedido}" já existe.` });
        }

        const { orderId, value, creationDate, items: mappedItems } = mapRequestToOrder(req.body);
        const order = orderModel.createOrder(orderId, value, creationDate, mappedItems);

        return res.status(201).json(order);
    } catch (err) {
        console.error('Erro ao criar pedido:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function getOrder(req, res) {
    try {
        const { orderId } = req.params;
        const order = orderModel.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ error: `Pedido "${orderId}" não encontrado.` });
        }

        return res.status(200).json(order);
    } catch (err) {
        console.error('Erro ao buscar pedido:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function listOrders(req, res) {
    try {
        const orders = orderModel.getAllOrders();
        return res.status(200).json(orders);
    } catch (err) {
        console.error('Erro ao listar pedidos:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function updateOrder(req, res) {
    try {
        const { orderId } = req.params;
        const { valorTotal, dataCriacao, items } = req.body;

        if (valorTotal === undefined || !dataCriacao || !Array.isArray(items)) {
            return res.status(400).json({
                error: 'Campos obrigatórios ausentes para atualização: valorTotal, dataCriacao, items',
            });
        }

        const mapped = mapRequestToOrder({ numeroPedido: orderId, valorTotal, dataCriacao, items });
        const updated = orderModel.updateOrder(orderId, mapped.value, mapped.creationDate, mapped.items);

        if (!updated) {
            return res.status(404).json({ error: `Pedido "${orderId}" não encontrado.` });
        }

        return res.status(200).json(updated);
    } catch (err) {
        console.error('Erro ao atualizar pedido:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function deleteOrder(req, res) {
    try {
        const { orderId } = req.params;
        const deleted = orderModel.deleteOrder(orderId);

        if (!deleted) {
            return res.status(404).json({ error: `Pedido "${orderId}" não encontrado.` });
        }

        return res.status(200).json({ message: `Pedido "${orderId}" removido com sucesso.` });
    } catch (err) {
        console.error('Erro ao deletar pedido:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

module.exports = {
    createOrder,
    getOrder,
    listOrders,
    updateOrder,
    deleteOrder,
};
