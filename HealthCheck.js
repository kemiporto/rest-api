var serverCheck = function (req,res){
        var address =  routeTable[req.headers.host].shift();

http.get({host:routeTable[req.headers.host].shift()},function(res){
    for(i = 0; i < routeTable[req.headers.host].length && res.statusCode != 200;i++) {
        routeTable[req.headers.host].push(address);
          console.log("The server is down , kindly fix it " + address);
        address =  routeTable[req.headers.host].shift();
http.get({host:address},function(res){})
    } 
    return address;

}
http.createServer(function(req, res) {  
    var addressWorkingServer = serverCheck (req,chkServ);
    if(chkServ.statusCode!=200){
        console.log("This site is down");
        res.send("The site is temporarily down , Sorry for inconvenience");
        res.end();
    }
    console.log(req.headers);
    if( req.headers.host != undefined && req.headers.host in routeTable) {
	
	console.log(address);
	proxy.web(req, res, {
	    target: address
	}, function (e) {console.log(e);});
	routeTable[req.headers.host].push(address);
	console.log(routeTable);
    }
    else
	//Error handling
	proxy.web(req,res, {target: req.headers.host});
}).listen(8000);