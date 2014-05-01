//importing the required node modules.The project uses nodejitsu/node-http-proxy as baseline project
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxy();
var restify = require('restify');
var validator = require('validator');

//contains the routing information. It has the default routing table
var routeTable = {  
    'foo.com': ['http://localhost:10001', 'http://localhost:10002', 'http://localhost:8081'],
    'remote.com' :['http://ec2-54-193-86-12.us-west-1.compute.amazonaws.com:10001', 'http://ec2-54-193-86-12.us-west-1.compute.amazonaws.com:10002']
}

// We are creating a Restify server using the Restify Framework
var server = restify.createServer();

// This is the proxy server which listens on port 8888
server.listen(8888);
//Inserted code for server time out
//server.setTimeout(function() {console.log(Date.now() }, 1000);
//TODO: put time limit on waiting response
//Server is active and listening on port 8888
console.log('Server running on port 8888');
var respondRouteTable = function(req, res) {
    console.log('Executing HTTP GET Request');
    res.send(routeTable);
};

server.get('/route ', respondRouteTable);

//If the destination is there in routing table then it will return it or else it will show a message to user
var respondRouteTableItem = function(req, res) {
    if(req.params.source in routeTable)
	res.send(routeTable[req.params.source]);
    else
	res.send('No Route for: ' + req.params.source);
};

server.get('/route/:source', respondRouteTableItem);
// create a new routing path if it doesn't exist already in routing table , if already exists then displays an message
var postRoute = function(req, res) {
    console.log(req.body);
    console.log(req.head);
    if(req.params.source in routeTable) {
    //return a message (for example: { "error": "route not found" }
        console.log('Warning !!! : Source provided already exists');
    res.send('route already exist. Use put method to change it');
    }
    // checks for empty input from user
    else {

    
    if(req.params.dest.length<1)
    {
res.end('Input destination array is empty');
console.log("Input destination array is empty");

    }

    else
    {
    var dest=[];
    var dest_invalid=[];
   // calling the validator for checking if the user input is correct or not
    for(var i=0;i<req.params.dest.length;i++)
    {

if(!validator.isURL(req.params.dest[i]))
{
console.log("URL: " + req.params.dest[i]+ " is not a valid URL");
dest_invalid.push(req.params.dest[i]);

//res.send("URL: " + req.params.dest[i]+ " is not a valid URL");

}
//if the route is in  valid format its added to the routing table
else
    {
       	dest.push(req.params.dest[i]);
console.log("URL: " + req.params.dest[i]+ " added to routing table");
//res.send("URL: " + req.params.dest[i]+ " added to routing table");

}


    }


console.log("valid URL");
routeTable[req.params.source] = dest;
    console.log("successfully added route in routing table"+dest);
    if(dest_invalid.length>=1)
    res.end('added route is:' + req.params.source + ' --> ' + dest + "\n"+"Following invalid URLs were not added to the routing table  ---> "+dest_invalid);
       else
             res.end('added route is:' + req.params.source + ' --> ' + dest );

}
   }
 }

server.use(restify.bodyParser());
server.post('/route', postRoute);
// checks if the route is present in the routing table , if presents then updpates it else gives message to user
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

//restify-queryParser is used to read multiple lines from the URl
server.use(restify.queryParser());
server.put('/route/:source', putRoute);

//checks if the route is present in the routing table , if presents then updpates it else gives message to user
var putAddRoute = function(req, res) {
    console.log(req.params.source);
    console.log(req.query);
    if(!(req.params.source in routeTable)) {
	res.end(" Error !!! Source address doesnt exist");
	//TODO: finish this part. show error to user. address doesnt exist (change message above) 
	console.log("Error !! Source does not exist ! Try again ....");
	
    }
    // checking conditions for put
    else {
	var addr = routeTable[req.params.source];
	if(req.query.add != undefined && routeTable[req.params.source].indexOf(req.query.add) != -1) {
	
	    console.log("Address already exists in routing table");
	    return res.send(req.query.add + " Address is already present");
	}
	//validating the url passed by user.
	else if(req.query.add != undefined) {
	    console.log("adding destination " + req.query.add + " on " + req.params.source);
	    routeTable[req.params.source].push(req.query.add);
	    if(validator.isURL(req.query.add)){
		console.log("valid URL");
	    }
	    else {
		console.log("invalid URL");
		res.send("URL: " + req.query.add + " is not a valid URL");
	    }
	    res.end(req.query.add  +" Address added in routing table");
	}
    }
}

server.put('/route/add/:source', putAddRoute);

//API for Delete operattion
var putDelRoute = function(req, res) {
    console.log(req.params.source);
    console.log(req.query);
    //checks if route exists in the routing table on not
    if(!req.params.source in routeTable) {
	//TODO: finish this partshow error to user. address doesnt exist (change message above)
	console.log("error: source doesn't exist");
	
    }
    //checks the user input before deletion
    else if(req.query.del != undefined && routeTable[req.params.source].indexOf(req.query.del) != -1) {
	console.log("deleting address " + req.query.del);
	routeTable[req.params.source].splice(routeTable[req.params.source].indexOf(req.query.del), 1);
	res.end("address deleted");
    }
    else if(req.query.del != undefined) {
	//TODO: finish this part. show error to user. route cannot be deleted because it doesnt exist for given address (change message above)
	console.log(req.query.del);
	console.log(routeTable[req.params.source]);
	console.log("cant delete unexistent address");
	res.end("error");
    }
}

server.put('/route/del/:source', putDelRoute);

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

http://localhost:8888/route/add/foo.com?add=http://localhost:8080 will add http://localhost:8080 destination to foo.com source in routeTable
get on route will have new address
if source doesn't exist or address to be added is already there, should return a error message

or

http://localhost:8888/route/del/foo.com?del=http://localhost:10001 will delete destination http://localhost:10001 from foo.com in routeTable
get on route will not have deleted address
if source doesn't exist or address to be removed is not a destination, should return a error
don't allow destination to be empty

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
