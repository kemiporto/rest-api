var util = require('util'),
    colors = require('colors'),
    http = require('http'),
    connect = require('connect')
    httpProxy = require('../../lib/http-proxy');

//
// Basic Connect App
//
connect.createServer(
  connect.compress({
    // Pass to connect.compress() the options
    // that you need, just for show the example
    // we use threshold to 1
    threshold: 1
  }),
  function (req, res) {
    proxy.web(req, res);
  }
).listen(8000);

//
// Basic Http Proxy Server
//
var proxy = httpProxy.createProxyServer({
  target: 'http://localhost:8888'
});

//
// Target Http Server
//
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9012);
// To print the message in different colors
util.puts('http proxy server'.blue + ' running '.green.bold + 'on port '.blue + '8000'.yellow);
util.puts('http server '.blue + 'running '.green.bold + 'on port '.blue + '8888 '.yellow);c
