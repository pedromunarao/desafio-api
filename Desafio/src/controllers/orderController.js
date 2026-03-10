const orderModel = require('../models/orderModel');

function mapRequestToOrder(body) {
    const { orderNumber, totalValue, creationDate, items } = body;

    const formatDate = new Date(creationDate).toISOString();

    const normalizedItems = (items || []).map((item) => ({
        productId: String(item.idItem),
        quantity: Number(item.quantityItem),
        price: Number(item.valueItem),
    }));

    return {
        orderId: orderNumber,
        value: Number(totalValue),
        creationDate: formatDate,
        items: normalizedItems,
    };
}

function isValidOrderBody(body) {
    const { orderNumber, totalValue, creationDate, items } = body;
    return orderNumber && totalValue !== undefined && creationDate && Array.isArray(items);
}

function isValidUpdateBody(body) {
    const { totalValue, creationDate, items } = body;
    return totalValue !== undefined && creationDate && Array.isArray(items);
}

function createOrder(req, res) {
    try {
        if (!isValidOrderBody(req.body)) {
            return res.status(400).json({
                error: 'Campos obrigatórios ausentes: orderNumber, totalValue, creationDate, items',
            });
        }

        const existingOrder = orderModel.getOrderById(orderNumber);

        if (existing) {
            return res.status(409).json({ error: `Pedido com orderNumber "${orderNumber}" já existe.` });
        }

        const { orderId, value, formatDate, items: normalizedItems } = mapRequestToOrder(req.body);
        const createdOrder = orderModel.createOrder(orderId, value, formatDate, normalizedItems);

        return res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function getOrder(req, res) {
    try {
        const { orderId } = req.params;
        const foundOrder = orderModel.getOrderById(orderId);

        if (!foundOrder) {
            return res.status(404).json({ error: `Pedido "${orderId}" não encontrado.` });
        }

        return res.status(200).json(foundOrder);
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function listOrders(req, res) {
    try {
        const allOrders = orderModel.getAllOrders();
        return res.status(200).json(allOrders);
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function updateOrder(req, res) {
    try {
        const { orderId } = req.params;

        if (!isValidUpdateBody(req.body)) {
            return res.status(400).json({
                error: 'Campos obrigatórios ausentes para atualização: totalValue, creationDate, items',
            });
        }

        const { totalValue, creationDate, items } = req.body;
        const mappedOrder = mapRequestToOrder({ orderNumber: orderId, totalValue, creationDate, items });
        const updatedOrder = orderModel.updateOrder(orderId, mappedOrder.value, mappedOrder.creationDate, mappedOrder.items);

        if (!updatedOrder) {
            return res.status(404).json({ error: `Pedido "${orderId}" não encontrado.` });
        }

        return res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

function deleteOrder(req, res) {
    try {
        const { orderId } = req.params;
        const deletedOrder = orderModel.deleteOrder(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ error: `Pedido "${orderId}" não encontrado.` });
        }

        return res.status(200).json({ message: `Pedido "${orderId}" removido com sucesso.` });
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
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
