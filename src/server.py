import BaseHTTPServer
import re
import json
import sys
from BaseHTTPServer import *
import argparse

from Controllers import *

CONTROLLER_NAME = "controller-name"

class Router():

    def __init__(self, server):
	   self.__routes = []
	   self.__server = server
    
    def add_route(self, path, controller):
	   self.__routes.append({'path': path, CONTROLLER_NAME: controller})

    def get_route(self, path):
        for route in self.__routes:
            if re.search(route['path'], path):
                cls = globals()[route[CONTROLLER_NAME]]
                obj = cls(self.__server)
                func = cls.__dict__['show']
                func(obj, path)
                return
        self.__server.send_response(404)
        self.__server.end_headers()

    def post_route(self, path, rfile, headers):
        for route in self.__routes:
            if re.search(route['path'], path):
                cls = globals()[route[CONTROLLER_NAME]]
                obj = cls(self.__server)
                func = cls.__dict__['post']
                func(obj, path, rfile, headers)
                return
        self.__server.send_response(404)
        self.__server.end_headers()
        

	
class CustomRequestHandler(BaseHTTPRequestHandler):

    def __init__(self, request, client_address, server):

        routes = [
            {'regexp': r'^/directory', CONTROLLER_NAME: 'ListDirectoryController'},
            {'regexp': r'^/router', CONTROLLER_NAME: 'RouterController'},
            {'regexp': r'^/file-content', CONTROLLER_NAME: 'FileController'},
            {'regexp': r'^/rmqtt', CONTROLLER_NAME: 'MQTTController'},
            {'regexp': r'^/filesave', CONTROLLER_NAME: 'FilePostController'}
        ]
        
        self.__router = Router(self)
        for route in routes:
            self.__router.add_route(route['regexp'], route[CONTROLLER_NAME])

        BaseHTTPRequestHandler.__init__(self, request, client_address, server)
    
    def do_GET(self):
        self.__router.get_route(self.path)

    def do_POST(self):
        self.__router.post_route(self.path, self.rfile, self.headers)

def start_server(port = 8000):
    try:
        httpd = HTTPServer(('', port), CustomRequestHandler)
        httpd.serve_forever()
    except:
        print 'Server shutting down'
	httpd.socket.close()

if __name__ == "__main__":
    port_number = None
    parser = argparse.ArgumentParser(description='Lightweight File Explorer')
    parser.add_argument('--port', help="Port number to start server")
    args = parser.parse_args()
    try:
        port_number = int(args.port)
    except:
        sys.exit(1)
    start_server(port_number)
