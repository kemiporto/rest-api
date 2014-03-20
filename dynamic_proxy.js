var httpProxy = require('./lib/http-proxy.js');
var proxy = httpProxy.createProxy();
var restify = require('restify');

//contains the routing information
var routeTable = {  
  'foo.com': 'http://localhost:8001',
}

var server = restify.createServer();

server.listen(8888);
//Inserted code for server time out
//server.setTimeout(function() {console.log(Date.now() }, 1000);
//TODO: put time limit on waiting response
var respondRouteTable = function(req, res) {
    res.send(routeTable);
};

server.get('/route ', respondRouteTable);

var respondRouteTableItem = function(req, res) {
    if(req.params.source in routeTable)
	res.send(routeTable[req.params.source]);
    else
	res.send('no route for: ' + req.params.source);
};

server.get('/route/:source', respondRouteTableItem);

var postRoute = function(req, res) {
    console.log(req.body);
    console.log(req.head);
    if(req.params.source in routeTable)
	//TODO: return a json object (for example: { "error": "route not found" }
	res.send('route already exist. Use put method to change it');
    else {
	routeTable[req.params.source] = req.params.dest;
	res.end('added route is:' + req.params.source + ' --> ' + req.params.dest);
    }
}

server.use(restify.bodyParser());
server.post('/route', postRoute);

var putRoute = function(req, res) {
    
    console.log(req.body);
    console.log(req.query.dest);
    if(req.params.source in routeTable) {
	routeTable[req.params.source] = req.query.dest;
	res.end('updated route ' + req.params.source);
    }
    else
	//TODO: return a json object (for example: { "error": "route does not exist" })
	res.end('route does not exist. Use post method');
}

server.use(restify.queryParser());
server.put('/route/:source', putRoute);

var deleteRoute = function(req, res) {
    console.log(req.params.source);
    if(req.params.source in routeTable) {
	delete routeTable[req.params.source];
	res.end(req.params.source + ' route deleted');
    }
    else
	//TODO: return a json object (for example: { "error": "route does not exist" })
	res.end('route does not exist.');
}

server.del('/route/:source', deleteRoute);

/*
 http://localhost:8888/route   will give you the routeTable content

 http://localhost:8888/route/foo.com   will give you the destination of foo.com

 http://localhost:8888/route/not_in_table   will give you the answer no route for not_in_table

resource: POST - /route
{"source" : "test.com",
 "dest" : "http://localhost:8002"} 
content-type: application/json
get on new route will return new route information
post on same route won't be allowed
put on new route should work

resource: PUT
http://localhost:8888/route/foo.com?dest=http://localhost:8002 will change the destination of foo.com to http://localhost:8002
get on route should have update information

resource: DELETE
http://localhost:8888/route/foo.com will delete route for foo.com
get on foo.com will return nothing
you can post to foo.com now
you cannot put on foo.com
*/

require('http').createServer(function(req, res) {  
    console.log(req.headers);
    if( req.headers.host != undefined && req.headers.host in routeTable)
	proxy.web(req, res, {
	    target: routeTable[req.headers.host]
	}, function (e) {console.log(e);});
    else
	//TODO: handle this error
	proxy.web(req,res, {target: req.headers.host});
}).listen(8000);

require('http').createServer(function(req, res) {  
  res.end('done@8001\n');
}).listen(8001);

require('http').createServer(function(req, res) {  
  res.end('done@8002\n');
}).listen(8002);

require('http').createServer(function(req, res) {  
  res.end('done@8080\n');
}).listen(8080);

require('http').createServer(function(req, res) {  
  res.end('done@8080\n');
}).listen(8081);
