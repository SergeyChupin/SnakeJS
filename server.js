const http = require('http');
const nodeStatic = require('node-static');
const files = new nodeStatic.Server('.');

http.createServer(function (request, response) {
    files.serve(request, response);
}).listen(process.env.PORT || 5000);