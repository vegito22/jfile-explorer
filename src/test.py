import os
import json

id = 0

def Test2(rootDir, dict, pid):
    global id 
    for lists in os.listdir(rootDir):
	dict.append({"id": id, "parent": pid, "text": lists})
        path = rootDir + "/" +lists
	#print path
        if os.path.isdir(path): 
            Test2(path, dict, id)
	id += 1

tjson = []
Test2("/var/tmp", tjson, id)
str_value = (json.dumps({"l":tjson})[5 : -1]).strip().rstrip()
print str_value
