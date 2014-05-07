rest-api for Node-http-proxy Server

node-http-proxy server is a programmable proxy server and load balancer. However it lacks Rest APIs.

User-Stories:

1. As a user, I want to create a routing table to route all HTTP traffic from x.y.z.com:80 to 1.2.3.4:8080 by calling a REST API.

2.Added REST API to the node-http-proxy server to maintain dynamic routing table.

3.Implemented Sticky session

4.Implemented Load balancer to the node-http-proxy server using Round robin.

5.Implemented health check of the server by pinging the server in the interval of 15 sec.

6.Saving the both good and bad routing table in the disk.

7.Implemented URL validator to validate all the url mentioned by the client.

8.Deployed the code on AWS EC2 

9.Node-http-proxy server is a programmable proxy server and load balancer.

10.Proxy server is a server that acts as an intermediary for requests from clients seeking resources from other servers.


