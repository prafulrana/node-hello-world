var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello 4!!!!\n');
}).listen(80);
console.log('Server running at httpaasdd!');
