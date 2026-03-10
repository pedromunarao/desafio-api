
'use strict';

const ApiService = (() => {
    const BASE = '';

    async function request(path, options = {}) {
        const res = await fetch(BASE + path, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    }

    return {
        checkStatus: () => fetch('/api-status', { signal: AbortSignal.timeout(3000) }).then(r => r.json()),
        listOrders: () => request('/order/list'),
        getOrder: (id) => request(`/order/${encodeURIComponent(id)}`),
        createOrder: (body) => request('/order', { method: 'POST', body }),
        updateOrder: (id, body) => request(`/order/${encodeURIComponent(id)}`, { method: 'PUT', body }),
        deleteOrder: (id) => request(`/order/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    };
})();


const Utils = (() => {
    const fmtCurrency = (val) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const fmtDate = (dateStr) => {
        const d = new Date(dateStr);
        return isNaN(d) ? dateStr : d.toLocaleString('pt-BR');
    };

    const toLocalDateInput = (dateStr) => {
        const d = new Date(dateStr);
        if (isNaN(d)) return '';
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    const jsonPretty = (obj) => JSON.stringify(obj, null, 2);

    const nowLocalInput = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return { fmtCurrency, fmtDate, toLocalDateInput, jsonPretty, nowLocalInput };
})();


const Toast = (() => {
    const ICONS = { success: '✅', error: '❌', info: 'ℹ️' };
    const AUTO_DISMISS_MS = 4100;
    const container = () => document.getElementById('toast-container');

    function show(msg, type = 'info') {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<span>${ICONS[type]}</span><span>${msg}</span>`;
        container().appendChild(el);
        setTimeout(() => el.remove(), AUTO_DISMISS_MS);
    }

    return { show };
})();


const Modal = (() => {
    const backdrop = () => document.getElementById('modal-backdrop');

    function show(title, body, onConfirm) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').textContent = body;
        backdrop().style.display = 'flex';
        document.getElementById('modal-confirm').onclick = () => { hide(); onConfirm(); };
        document.getElementById('modal-cancel').onclick = hide;
    }

    function hide() {
        backdrop().style.display = 'none';
    }

    return { show, hide };
})();


const StatusBar = (() => {
    const pill = () => document.getElementById('status-pill');
    const text = () => document.getElementById('status-text');

    async function update() {
        try {
            const data = await ApiService.checkStatus();
            if (data.online) {
                pill().className = 'status-pill online ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all';
                text().textContent = 'API Online';
            } else {
                throw new Error('offline');
            }
        } catch {
            pill().className = 'status-pill offline ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all';
            text().textContent = 'API Offline';
        }
    }

    return { update };
})();

const Navigation = (() => {
    function goTo(viewId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const isTarget = btn.dataset.view === viewId;
            btn.classList.toggle('active', isTarget);
        });
        document.querySelectorAll('.view').forEach(view => {
            const isTarget = view.id === `view-${viewId}`;
            view.classList.toggle('active', isTarget);
            view.style.display = isTarget ? 'flex' : 'none';
        });
    }

    function init() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => goTo(btn.dataset.view));
        });
        document.getElementById('view-list').style.display = 'flex';
    }

    return { init, goTo };
})();

const ItemBuilder = (() => {
    function addRow(containerId) {
        const container = document.getElementById(containerId);
        const emptyMsg = document.getElementById(`${containerId}-empty`);
        if (emptyMsg) emptyMsg.style.display = 'none';

        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="field-label">ID do Item</label>
        <input type="text" class="item-id field-input" placeholder="ex: ITEM-01" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="field-label">Quantidade</label>
        <input type="number" class="item-qty field-input" placeholder="1" min="1" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="field-label">Valor Unit. (R$)</label>
        <input type="number" class="item-val field-input" placeholder="0.00" step="0.01" min="0" />
      </div>
      <button class="btn-danger p-2 rounded-lg text-sm self-end h-[42px]" title="Remover item">✕</button>
    `;

        row.querySelector('button').addEventListener('click', () => removeRow(row, containerId));
        container.appendChild(row);
    }

    function removeRow(row, containerId) {
        row.remove();
        const container = document.getElementById(containerId);
        const emptyMsg = document.getElementById(`${containerId}-empty`);
        if (emptyMsg && container.querySelectorAll('.item-row').length === 0) {
            emptyMsg.style.display = 'block';
        }
    }

    function collectRows(containerId) {
        return Array.from(document.getElementById(containerId).querySelectorAll('.item-row'))
            .map(row => ({
                idItem: row.querySelector('.item-id').value.trim(),
                quantityItem: Number(row.querySelector('.item-qty').value),
                valueItem: Number(row.querySelector('.item-val').value),
            }));
    }

    function clearRows(containerId) {
        document.getElementById(containerId).innerHTML = '';
        const emptyMsg = document.getElementById(`${containerId}-empty`);
        if (emptyMsg) emptyMsg.style.display = 'block';
    }

    function populateRows(containerId, items) {
        clearRows(containerId);
        items.forEach(item => {
            addRow(containerId);
            const rows = document.getElementById(containerId).querySelectorAll('.item-row');
            const row = rows[rows.length - 1];
            row.querySelector('.item-id').value = item.productId;
            row.querySelector('.item-qty').value = item.quantity;
            row.querySelector('.item-val').value = item.price;
        });
    }

    return { addRow, collectRows, clearRows, populateRows };
})();

const Renderer = (() => {
    function orderDetailHtml(order) {
        const itemRows = (order.items && order.items.length)
            ? order.items.map(i => `
          <tr class="border-b border-border/50 hover:bg-surf2 transition-colors">
            <td class="px-4 py-3"><code class="text-accent-light text-xs">${i.productId}</code></td>
            <td class="px-4 py-3 text-slate-400">${i.quantity}</td>
            <td class="px-4 py-3 text-slate-400">${Utils.fmtCurrency(i.price)}</td>
            <td class="px-4 py-3 text-ok font-medium">${Utils.fmtCurrency(i.price * i.quantity)}</td>
          </tr>`).join('')
            : `<tr><td colspan="4" class="px-4 py-6 text-center text-slate-600 text-sm">Sem itens</td></tr>`;

        return `
      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <div class="p-6 border-b border-border">
          <p class="section-label mb-4"><span class="method-tag get">GET</span>Pedido encontrado</p>
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-bg border border-border rounded-lg p-4">
              <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Nº do Pedido</p>
              <p class="font-bold text-accent-light">${order.orderId}</p>
            </div>
            <div class="bg-bg border border-border rounded-lg p-4">
              <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Valor Total</p>
              <p class="font-bold text-ok">${Utils.fmtCurrency(order.value)}</p>
            </div>
            <div class="bg-bg border border-border rounded-lg p-4">
              <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Data de Criação</p>
              <p class="font-semibold text-sm">${Utils.fmtDate(order.creationDate)}</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <p class="section-label mb-3">Itens (${order.items ? order.items.length : 0})</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="border-b border-border">
                <th class="table-th">ID do Item</th>
                <th class="table-th">Qtd</th>
                <th class="table-th">Preço Unit.</th>
                <th class="table-th">Subtotal</th>
              </tr></thead>
              <tbody>${itemRows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
    }

    function orderTableRowHtml(order) {
        return `
      <tr class="border-b border-border/50 hover:bg-surf2 transition-colors" data-order-id="${order.orderId}">
        <td class="px-4 py-3.5"><code class="text-xs bg-surf2 text-accent-light px-2 py-1 rounded">${order.orderId}</code></td>
        <td class="px-4 py-3.5 font-semibold text-ok">${Utils.fmtCurrency(order.value)}</td>
        <td class="px-4 py-3.5 text-slate-400">${Utils.fmtDate(order.creationDate)}</td>
        <td class="px-4 py-3.5"><span class="text-xs bg-surf2 text-slate-400 px-2.5 py-1 rounded-full">${order.items ? order.items.length : 0} itens</span></td>
        <td class="px-4 py-3.5">
          <div class="flex gap-2">
            <button class="btn-ghost text-xs px-3 py-1.5 action-view">👁 Ver</button>
            <button class="btn-ghost text-xs px-3 py-1.5 action-edit">✏️ Editar</button>
            <button class="btn-danger text-xs px-3 py-1.5 action-delete">🗑️</button>
          </div>
        </td>
      </tr>`;
    }

    function setResponseBox(boxId, data, isError = false) {
        const box = document.getElementById(boxId);
        box.textContent = Utils.jsonPretty(data);
        box.style.color = isError ? '#ff5c6a' : '#3ecf8e';
        document.getElementById(boxId.replace('-box', '')).style.display = 'block';
    }

    return { orderDetailHtml, orderTableRowHtml, setResponseBox };
})();

const ListView = (() => {
    async function load() {
        document.getElementById('list-loading').style.display = 'flex';
        document.getElementById('list-content').style.display = 'none';

        try {
            const { ok, data } = await ApiService.listOrders();

            document.getElementById('list-loading').style.display = 'none';
            document.getElementById('list-content').style.display = 'block';

            const isEmpty = !ok || !Array.isArray(data) || data.length === 0;
            document.getElementById('list-empty').style.display = isEmpty ? 'block' : 'none';
            document.getElementById('list-table-wrap').style.display = isEmpty ? 'none' : 'block';
            document.getElementById('badge-count').textContent = isEmpty ? '0' : data.length;

            if (!isEmpty) {
                document.getElementById('orders-tbody').innerHTML = data.map(Renderer.orderTableRowHtml).join('');
                _bindTableActions();
            }
        } catch {
            document.getElementById('list-loading').style.display = 'none';
            document.getElementById('list-content').style.display = 'block';
            document.getElementById('list-empty').style.display = 'block';
            document.getElementById('list-empty').innerHTML = `
        <div class="text-4xl mb-3 opacity-40">⚠️</div>
        <p class="text-sm">Não foi possível conectar à API. Verifique se o servidor está rodando.</p>`;
            Toast.show('Erro ao conectar à API', 'error');
        }
    }

    function _bindTableActions() {
        document.querySelectorAll('#orders-tbody tr[data-order-id]').forEach(row => {
            const id = row.dataset.orderId;
            row.querySelector('.action-view').addEventListener('click', () => SearchView.searchById(id));
            row.querySelector('.action-edit').addEventListener('click', () => UpdateView.loadById(id));
            row.querySelector('.action-delete').addEventListener('click', () => DeleteView.confirmById(id));
        });
    }

    return { load };
})();

const SearchView = (() => {
    async function search() {
        const id = document.getElementById('search-id').value.trim();
        if (!id) { Toast.show('Informe o número do pedido', 'error'); return; }
        await searchById(id);
    }

    async function searchById(id) {
        Navigation.goTo('search');
        document.getElementById('search-id').value = id;

        try {
            const { ok, data } = await ApiService.getOrder(id);
            const resultEl = document.getElementById('search-result');
            resultEl.style.display = 'block';

            if (!ok) {
                resultEl.innerHTML = `
          <div class="bg-surface border border-danger/40 rounded-xl p-5 text-danger font-semibold">
            ❌ ${data.error || 'Pedido não encontrado'}
          </div>`;
                return;
            }
            resultEl.innerHTML = Renderer.orderDetailHtml(data);
        } catch {
            Toast.show('Erro ao conectar à API', 'error');
        }
    }

    return { search, searchById };
})();

const CreateView = (() => {
    function clear() {
        ['c-orderNumber', 'c-totalValue'].forEach(id => { document.getElementById(id).value = ''; });
        document.getElementById('c-creationDate').value = Utils.nowLocalInput();
        ItemBuilder.clearRows('create-items');
        document.getElementById('create-response').style.display = 'none';
    }

    async function submit() {
        const orderNumber = document.getElementById('c-orderNumber').value.trim();
        const totalValue = document.getElementById('c-totalValue').value;
        const creationDate = document.getElementById('c-creationDate').value;
        const items = ItemBuilder.collectRows('create-items');

        if (!orderNumber || totalValue === '' || !creationDate) {
            Toast.show('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        try {
            const { ok, data } = await ApiService.createOrder({ orderNumber, totalValue: Number(totalValue), creationDate, items });
            Renderer.setResponseBox('create-response-box', data, !ok);
            ok
                ? (Toast.show('Pedido criado com sucesso!', 'success'), ListView.load())
                : Toast.show(data.error || 'Erro ao criar pedido', 'error');
        } catch {
            Toast.show('Erro ao conectar à API', 'error');
        }
    }

    return { clear, submit };
})();

const UpdateView = (() => {
    async function loadById(id) {
        Navigation.goTo('update');
        document.getElementById('u-orderId').value = id;

        try {
            const { ok, data } = await ApiService.getOrder(id);
            if (!ok) { Toast.show('Pedido não encontrado', 'error'); return; }

            document.getElementById('u-totalValue').value = data.value;
            document.getElementById('u-creationDate').value = Utils.toLocalDateInput(data.creationDate);
            ItemBuilder.populateRows('update-items', data.items || []);

            const form = document.getElementById('update-form');
            form.style.display = 'flex';
            form.style.flexDirection = 'column';
            form.style.gap = '24px';
            document.getElementById('update-response').style.display = 'none';
            Toast.show(`Pedido "${id}" carregado`, 'info');
        } catch {
            Toast.show('Erro ao conectar à API', 'error');
        }
    }

    function cancel() {
        document.getElementById('update-form').style.display = 'none';
        document.getElementById('u-orderId').value = '';
        document.getElementById('update-response').style.display = 'none';
    }

    async function submit() {
        const orderId = document.getElementById('u-orderId').value.trim();
        const totalValue = document.getElementById('u-totalValue').value;
        const creationDate = document.getElementById('u-creationDate').value;
        const items = ItemBuilder.collectRows('update-items');

        if (!orderId || totalValue === '' || !creationDate) {
            Toast.show('Preencha todos os campos', 'error');
            return;
        }

        try {
            const { ok, data } = await ApiService.updateOrder(orderId, { totalValue: Number(totalValue), creationDate, items });
            Renderer.setResponseBox('update-response-box', data, !ok);
            ok
                ? (Toast.show('Pedido atualizado com sucesso!', 'success'), ListView.load())
                : Toast.show(data.error || 'Erro ao atualizar', 'error');
        } catch {
            Toast.show('Erro ao conectar à API', 'error');
        }
    }

    return { loadById, cancel, submit };
})();

const DeleteView = (() => {
    function confirm() {
        const id = document.getElementById('d-orderId').value.trim();
        if (!id) { Toast.show('Informe o número do pedido', 'error'); return; }
        confirmById(id);
    }

    function confirmById(id) {
        Navigation.goTo('delete');
        document.getElementById('d-orderId').value = id;
        Modal.show(
            '⚠️ Confirmar exclusão',
            `Tem certeza que deseja deletar o pedido "${id}"? Esta ação não pode ser desfeita e todos os itens serão removidos.`,
            () => _execute(id)
        );
    }

    async function _execute(orderId) {
        try {
            const { ok, data } = await ApiService.deleteOrder(orderId);
            Renderer.setResponseBox('delete-response-box', data, !ok);
            if (ok) {
                Toast.show(`Pedido "${orderId}" deletado!`, 'success');
                document.getElementById('d-orderId').value = '';
                ListView.load();
            } else {
                Toast.show(data.error || 'Erro ao deletar', 'error');
            }
        } catch {
            Toast.show('Erro ao conectar à API', 'error');
        }
    }

    return { confirm, confirmById };
})();

const App = (() => {
    const STATUS_POLL_MS = 10_000;

    function _bindEvents() {
        document.getElementById('btn-refresh').addEventListener('click', ListView.load);

        document.getElementById('btn-search').addEventListener('click', SearchView.search);
        document.getElementById('search-id').addEventListener('keydown', e => { if (e.key === 'Enter') SearchView.search(); });

        document.getElementById('btn-add-create-item').addEventListener('click', () => ItemBuilder.addRow('create-items'));
        document.getElementById('btn-clear-create').addEventListener('click', CreateView.clear);
        document.getElementById('btn-submit-create').addEventListener('click', CreateView.submit);

        document.getElementById('btn-load-update').addEventListener('click', () => {
            const id = document.getElementById('u-orderId').value.trim();
            if (id) UpdateView.loadById(id);
            else Toast.show('Informe o número do pedido', 'error');
        });
        document.getElementById('btn-add-update-item').addEventListener('click', () => ItemBuilder.addRow('update-items'));
        document.getElementById('btn-cancel-update').addEventListener('click', UpdateView.cancel);
        document.getElementById('btn-submit-update').addEventListener('click', UpdateView.submit);

        document.getElementById('btn-submit-delete').addEventListener('click', DeleteView.confirm);
        document.getElementById('d-orderId').addEventListener('keydown', e => { if (e.key === 'Enter') DeleteView.confirm(); });
    }

    function init() {
        Navigation.init();
        _bindEvents();

        document.getElementById('c-creationDate').value = Utils.nowLocalInput();

        StatusBar.update();
        ListView.load();

        setInterval(StatusBar.update, STATUS_POLL_MS);
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
