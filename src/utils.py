import os
import json
    
import mimetypes

id = 1 

def walk_directory(rootDir, dict, pid):
    global id
    for lists in os.listdir(rootDir):
        id = id + 1
        #dict.append({"id": id, "parent": pid, "text": lists})
        path = rootDir + "/" +lists
        #print path
        if os.path.isdir(path):
            pname = lists + '/'
            dict.append({"id": id, "parent": pid, "text": pname, "metadata":{"nsource": "system"}})
        # Append File
        if os.path.isfile(path):
            # Get the MIME Type
            mtype = mimetypes.guess_type(path)
            if mtype[0] != None:
                # Add only if MIME type is text else we cannot open it in Editor
                if 'text' in mtype[0]: 
                    dict.append({"id": id, "parent": pid, "text": lists, "type":"file", "metadata":{"nsource": "system"}})
        if os.path.isdir(path):
            try:
                walk_directory(path, dict, id)
            except:
                pass



def return_list():
    global id 
    id = 1
    tjson = [{"id":"1","parent":"#","text":"/var/"}]
    walk_directory("/var/", tjson, id )
    str_value = (json.dumps({"l":tjson})[5 : -1]).strip().rstrip()
    return str_value
