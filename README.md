rest-api for Node-http-proxy Server

node-http-proxy server is a programmable proxy server and load balancer. However it lacks Rest APIs.

User-Stories:
1. As a user, I want to create a routing table to route all HTTP traffic from x.y.z.com:80 to 1.2.3.4:8080 by calling a REST API.
2. Implemented loadbalancer for the servers as per their availablity , proxy pings the server and takes the decision of selecting the server for answering the request. It is done in round robin fashion.
========
