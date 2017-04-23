from  utils import Util
import json
import cgi

class Controller(object):

    def __init__(self, server):
        self.__server = server

    @property
    def server(self):
        return self.__server

class RouterController(Controller):

    def __init__(self, server):
        Controller.__init__(self, server)

    def show(self, path):
        self.server.send_response(200)
        self.server.send_header('Content-type', 'text/html')
        self.server.end_headers()
        with open('index.html') as f:
            temp = (f.read())
            self.server.wfile.write(temp)

class ListDirectoryController(Controller):

    def __init__(self, server):
        Controller.__init__(self, server)

    def show(self, path): 
        self.server.send_response(200)
        self.server.send_header('Content-type', 'application/json')
        self.server.end_headers()
        data = Util.return_list()
        self.server.wfile.write(data)

class FileReadController(Controller):

    def __init__(self, server):
        Controller.__init__(self, server)

    def show(self, path):
        file_path = path[13:]
        print file_path
        data = {}
        try:
            data["file-name"] = file_path
            with open(file_path, 'r') as f:
                data["content"] = f.read().encode('UTF-8')
            self.server.send_response(200)
            self.server.send_header('Content-type', 'application/json')
            self.server.end_headers()
            self.server.wfile.write(json.dumps(data))
        except Exception as e:
            print e
            self.server.send_response(403)
            self.server.send_header('Content-type', 'application/json')
            self.server.end_headers()
            
class FileSaveController(Controller):

    def __init__(self, server):
        Controller.__init__(self, server)

    def post(self, path, rfile, headers):
        form = cgi.FieldStorage(
            fp=rfile, 
            headers=headers,
            environ={'REQUEST_METHOD':'POST',
                     'CONTENT_TYPE':headers['Content-Type'],})
        filename = form.getvalue("file-name")
        content = form.getvalue("content")
        file_status = form.getvalue("saved-status")
        if Util.save_file(filename, content, file_status):
            self.server.send_response(200)
            self.server.send_header('Content-type', 'text/html')
            self.server.end_headers()
            self.server.wfile.write("Success")
        else:
            self.server.send_response(403)
            self.server.send_header('Content-type', 'application/json')
            self.server.end_headers()

class FileDeleteController(Controller):

    def __init__(self, server):
        Controller.__init__(self, server)

    def post(self, path, rfile, headers):
        form = cgi.FieldStorage(
            fp=rfile,
            headers=headers,
            environ={'REQUEST_METHOD':'POST',
                     'CONTENT_TYPE':headers['Content-Type'],})
        filename = form.getvalue("file-name")
        try:
            data = {"result" : "success"}
            Util.delete_file(filename)
            self.server.send_response(200)
            self.server.send_header('Content-type', 'application/json')
            self.server.end_headers()
            self.server.wfile.write(json.dumps(data))
        except Exception as E:
            print E
            self.server.send_response(403)
            self.server.send_header('Content-type', 'application/json')
            self.server.end_headers()