var httpProxy = require('./lib/http-proxy.js');
var proxy = httpProxy.createProxy();
var restify = require('restify');

//contains the routing information
var routeTable = {  
  'foo.com': 'http://localhost:8001',
}

var server = restify.createServer();

server.listen(8888);

var respondRouteTable = function(req, res) {
    res.send(routeTable);
};

server.get('/route', respondRouteTable);

var respondRouteTableItem = function(req, res) {
    res.send(routeTable[req.params.source]);
};

server.get('/route/:source', respondRouteTableItem);

//http://localhost:8888/route   will give you the routeTable content
//http://localhost:8888/route/foo.com   will give you the destination of foo.com

require('http').createServer(function(req, res) {  
    console.log(req.headers);
  proxy.web(req, res, {
    target: routeTable[req.headers.host]
  }, function (e) {console.log(e);});
}).listen(8000);

require('http').createServer(function(req, res) {  
  res.end('done@8001\n');
}).listen(8001);

require('http').createServer(function(req, res) {  
  res.end('done@8002\n');
}).listen(8002);

require('http').createServer(function(req, res) {
  var query = require('url').parse(req.url, true).query;
  routeTable[query.src] = query.dst;
  res.end('ok');
}).listen(7238);
