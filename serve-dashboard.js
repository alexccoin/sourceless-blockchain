// Lightweight static file server (no external deps)
// Serves project static assets for local verification.
// Usage: node serve-dashboard.js  (defaults to port 8080)
// Optional: PORT=9090 node serve-dashboard.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const PORT = process.env.PORT || 8080;

const mime = {
    '.html': 'text/html; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function safeResolve(urlPath){
    const decoded = decodeURIComponent(urlPath.split('?')[0]);
    let p = decoded.replace(/\\/g,'/');
    if(p === '/' || p === '') return path.join(root, 'index.html');
    const resolved = path.join(root, p);
    if(!resolved.startsWith(root)) return null;
    return resolved;
}

function serveFile(filePath, res){
    fs.stat(filePath, (err, stat) => {
        if(err || !stat.isFile()){
            if(!path.extname(filePath)){
                const htmlTry = filePath + '.html';
                return fs.stat(htmlTry, (e2, st2) => {
                    if(!e2 && st2.isFile()) return streamFile(htmlTry, res);
                    notFound(res);
                });
            }
            return notFound(res);
        }
        streamFile(filePath, res);
    });
}

function streamFile(filePath, res){
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': type});
    fs.createReadStream(filePath).on('error', () => internalError(res)).pipe(res);
}

function notFound(res){
    res.writeHead(404, {'Content-Type':'text/plain'});
    res.end('404 Not Found');
}

function internalError(res){
    res.writeHead(500, {'Content-Type':'text/plain'});
    res.end('500 Internal Server Error');
}

const server = http.createServer((req,res) => {
    // Health endpoint for quick connectivity checks
    if (req.url === '/__health') {
        res.writeHead(200, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ status:'OK', time: Date.now() }));
    }
    if(req.method !== 'GET' && req.method !== 'HEAD'){
        console.warn('[Req] ' + req.method + ' ' + req.url + ' -> 405');
        res.writeHead(405, {'Content-Type':'text/plain'});
        return res.end('Method Not Allowed');
    }
    const filePath = safeResolve(req.url);
    if(!filePath){
        console.warn('[Req] ' + req.method + ' ' + req.url + ' -> 404 (path traversal)');
        return notFound(res);
    }
    fs.access(filePath, fs.constants.R_OK, (err) => {
        if(err){
            console.warn('[Req] ' + req.method + ' ' + req.url + ' -> 404 (missing)');
            return notFound(res);
        }
        console.log('[Req] ' + req.method + ' ' + req.url + ' -> 200');
        serveFile(filePath, res);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('▶ Static dashboard server running');
    console.log('   Root: ' + root);
    console.log('   Port: ' + PORT);
    console.log('   Health:     http://localhost:' + PORT + '/__health');
    console.log('   Hub:        http://localhost:' + PORT + '/');
    console.log('   Ultimate:   http://localhost:' + PORT + '/ultimate-superadmin-dashboard.html');
    console.log('   Vision:     http://localhost:' + PORT + '/vision-sourceless-dashboard.html');
    console.log('   IDE:        http://localhost:' + PORT + '/areslang-ide.html');
    console.log('   Wallet:     http://localhost:' + PORT + '/sourceless-ultimate-wallet.html');
});