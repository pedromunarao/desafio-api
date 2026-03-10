const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const FRONTEND_PORT = 8080;
const API_HOST = 'localhost';
const API_PORT = 3000;

const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url);

    if (parsed.pathname === '/api-status') {
        const ping = http.request({ hostname: API_HOST, port: API_PORT, path: '/', method: 'GET' }, (r) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ online: true, status: r.statusCode }));
        });
        ping.on('error', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ online: false }));
        });
        ping.end();
        return;
    }

    if (parsed.pathname.startsWith('/order')) {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: req.url,
            method: req.method,
            headers: { ...req.headers, host: `${API_HOST}:${API_PORT}` },
        };

        const proxy = http.request(options, (apiRes) => {
            res.writeHead(apiRes.statusCode, apiRes.headers);
            apiRes.pipe(res, { end: true });
        });

        proxy.on('error', () => {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API indisponível. Verifique se o servidor está rodando na porta 3000.' }));
        });

        req.pipe(proxy, { end: true });
        return;
    }

    let filePath = path.join(__dirname, 'public', parsed.pathname === '/' ? 'index.html' : parsed.pathname);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'public', 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(FRONTEND_PORT, () => {
    console.log(`\nFrontend rodando em \x1b[36mhttp://localhost:${FRONTEND_PORT}\x1b[0m`);
    console.log(`Proxy da API apontando para http://${API_HOST}:${API_PORT}\n`);
});
