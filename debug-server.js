const http = require('http');

console.log('Starting Debug Server on port 3000...');

const server = http.createServer((req, res) => {
    console.log('--- Request Received ---');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        console.log('Body:', body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        console.log('--- End of Request ---\n');
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Debug Server listening on 0.0.0.0:3000');
});
