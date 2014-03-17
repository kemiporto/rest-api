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
    if(req.params.source in routeTable)
	res.send(routeTable[req.params.source]);
    else
	res.send('no route for ' + req.params.source);
};

server.get('/route/:source', respondRouteTableItem);

var postRoute = function(req, res) {
    console.log(req.body);
    if(req.params.source in routeTable)
	//TODO: return a json object (for example: { "error": "route not found" }
	res.send('route already exist. Use put method to change it');
    else {
	routeTable[req.params.source] = req.params.dest;
	res.end('added route ' + req.params.source + ' --> ' + req.params.dest);
    }
}

server.use(restify.bodyParser());
server.post('/route', postRoute);

/*
 http://localhost:8888/route   will give you the routeTable content

 http://localhost:8888/route/foo.com   will give you the destination of foo.com

 http://localhost:8888/route/not_in_table   will give you the answer no route for not_in_table

resource: POST - /route
{"source" : "test.com", "dest" : "http://localhost:8002" } 
content-type: application/json
*/

require('http').createServer(function(req, res) {  
    console.log(req.headers);
    if( req.headers.host != undefined && req.headers.host in routeTable)
	proxy.web(req, res, {
	    target: routeTable[req.headers.host]
	}, function (e) {console.log(e);});
    else
	//TODO: handle this error
	proxy.web(req,res);
}).listen(8000);

require('http').createServer(function(req, res) {  
  res.end('done@8001\n');
}).listen(8001);

require('http').createServer(function(req, res) {  
  res.end('done@8002\n');
}).listen(8002);