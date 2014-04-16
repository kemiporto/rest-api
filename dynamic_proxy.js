var httpProxy = require('./lib/http-proxy.js');
var proxy = httpProxy.createProxy();
var restify = require('restify');

//contains the routing information
var routeTable = {  
    'foo.com': ['http://localhost:10001', 'http://localhost:10002']
}

//TODO: messages on console.log so we know what the server is doing
var server = restify.createServer();

server.listen(8888);
//Inserted code for server time out
//server.setTimeout(function() {console.log(Date.now() }, 1000);
//TODO: put time limit on waiting response

console.log('running');
var respondRouteTable = function(req, res) {
    console.log('get request being executed');
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
    //TODO: make sure dest is not empty or undefined
    console.log(req.body);
    console.log(req.query.dest);
    if(req.params.source in routeTable) {
	routeTable[req.params.source] = req.params.dest;
	res.end('updated route ' + req.params.source);
    }
    else
	//TODO: return a json object (for example: { "error": "route does not exist" })
	res.end('route does not exist. Use post method');
}

server.use(restify.queryParser());
server.put('/route/:source', putRoute);

var putAddRoute = function(req, res) {
    console.log(req.params.source);
    console.log(req.query);
    if(!req.params.source in routeTable) {
	//show error to user. address doesnt exist (change message above)
	console.log("error: source doesn't exist");
	
    }
    else if(req.query.add != undefined && req.query.add in routeTable) {
	//show error to user. route already in table for this address (change message above)
	console.log("error add already in table");
    }
    else if(req.query.add != undefined) {
	console.log("adding destination " + req.query.add + " on " + req.params.source);
	routeTable[req.params.source].push(req.query.add);
	//TODO: improve message above
	res.end("address added");
    }
}
/*
    if(req.query.del != undefined && req.query.del in routeTable) {
	//improve message above
	console.log("deleting address" + req.query.del);
	routeTable[req.params.source].splice(routeTable.indexOf(req.params.source), 1);
    }
    else if(req.query.del != undefined) {
	//show error to user. route cannot be deleted because it doesnt exist for given address (change message above)
	console.log("cant delete unexistent address");
    }
*/
server.put('/route/add/:source', putAddRoute);

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
"dest" : ["http://localhost:8002", "http://localhost:8001"]} 
content-type: application/json
get on new route will return new route information
post on same route won't be allowed
put on new route should work

resource: PUT
http://localhost:8888/route/foo.com
{"dest" : ["http://localhost:10002", "http://localhost:10001"]} 
get on route should have update information

or

http://localhost:8888/route/foo.com?add=http://localhost:8080

resource: DELETE
http://localhost:8888/route/foo.com will delete route for foo.com
get on foo.com will return nothing
you can post to foo.com now
you cannot put on foo.com
*/

require('http').createServer(function(req, res) {  
    console.log(req.headers);
    if( req.headers.host != undefined && req.headers.host in routeTable) {
	var address =  routeTable[req.headers.host].shift();
	console.log(address);
	proxy.web(req, res, {
	    target: address
	}, function (e) {console.log(e);});
	routeTable[req.headers.host].push(address);
	console.log(routeTable);
    }
    else
	//TODO: handle this error
	proxy.web(req,res, {target: req.headers.host});
}).listen(8000);

require('http').createServer(function(req, res) {  
  res.end('done@10001\n');
}).listen(10001);

require('http').createServer(function(req, res) {  
  res.end('done@10002\n');
}).listen(10002);

require('http').createServer(function(req, res) {  
  res.end('done@8080\n');
}).listen(8080);

require('http').createServer(function(req, res) {  
  res.end('done@8081\n');
}).listen(8081);
