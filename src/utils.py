import os
import json
import shutil
    
import mimetypes

class Util:
    id = 1
    root_path = "/var/"

    @staticmethod
    def walk_directory(rootDir, dict, pid):
        for lists in os.listdir(rootDir):
            Util.id = Util.id + 1
            path = rootDir + "/" +lists
            #print path
            if os.path.isdir(path):
                pname = lists + '/'
                dict.append({"id": Util.id, "parent": pid, "text": pname, "metadata":{"nsource": "system"}})
            # Append File
            if os.path.isfile(path):
                # Get the MIME Type
                mtype = mimetypes.guess_type(path)
                if mtype[0] != None:
                    # Add only if MIME type is text else we cannot open it in Editor
                    if 'text' in mtype[0]:
                        dict.append({"id": Util.id, "parent": pid, "text": lists, "type":"file",
                                     "metadata":{"nsource": "system", "saved": True}})
            if os.path.isdir(path):
                try:
                    Util.walk_directory(path, dict, Util.id)
                except:
                    pass


    @staticmethod
    def return_list():
        Util.id = 1
        tjson = [{"id":"1", "parent":"#", "text":Util.root_path}]
        Util.walk_directory(Util.root_path, tjson, Util.id )
        str_value = (json.dumps({"l":tjson})[5 : -1]).strip().rstrip()
        return str_value

    @staticmethod
    def delete_file(filename):
        if os.path.exists(filename):
            if os.path.isdir(filename):
                shutil.rmtree(filename)
            elif os.path.isfile(filename):
                os.remove(filename)

    @staticmethod
    def save_file(filename, file_content, file_saved_status):
        if file_saved_status == "true":
            try:
                with open(filename, "w") as f:
                    f.write(file_content)
            except Exception as E:
                print E
                return False
            return True
        else:
            last_index = filename.rfind('/')
            directory_name = filename[:last_index]
            directory_name = directory_name + '/'
            if os.path.exists(directory_name):
                if os.path.isdir(directory_name):
                    try:
                        with open(filename, "w") as f:
                            f.write(file_content)
                    except Exception as E:
                        print E
                        return False
                    return True
                else:
                    return False
            else:
                try:
                    os.makedirs(directory_name)
                    with open(filename, "w") as f:
                        f.write(file_content)
                except Exception as E:
                    return False
                return True