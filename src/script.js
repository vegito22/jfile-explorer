    var jtree = null;

    function node_to_filename (node) {
        var filename = "";
        for (var i = node.parents.length - 2; i >= 0; i--) {
            filename = filename + jtree.get_node(node.parents[i]).text;
        }
        filename = filename + node.text;
        return filename;
    }

    function OEditor() {
        this.editor = null;
        this.current_file = null;
        this.modelist = null;
        this.current_node = null;
        this.history = [];
    }

    OEditor.prototype = {
        addEditor: function (edit) {
            this.editor = edit;
        },
        getEditor: function () {
            return this.editor;
        },
        getFullFileName: function (current_node) {
            return this.current_file;
        },
        addModelist: function(list) {
            this.modelist = list;
        },
        getFileMode: function(filename) {
            if (filename && this.modelist) {
                return this.modelist.getModeForPath(filename).mode
            } else {
                return "ace/mode/text"
            }
        },
        updateCurrentNode: function(node, data) {
            var content = null;
            var mode = "";
            var filename = "";

            if (this.current_node) {
                this.addtoHistory(this.current_node);
            }
            this.current_node = node;
            if ((data != null) && (data != null)) {

                content =  data["content"];
                filename = node_to_filename(node);

                mode = this.getFileMode(filename);
                if (mode == "") {
                    mode = "ace/mode/text";
                }
                this.getEditor().getSession().setValue(content);
                this.getEditor().getSession().setMode(mode);
            } else {
                this.getEditor().getSession().setValue("");
            }
        },
        getCurrentNode: function() {
            return this.current_node;
        },
        addtoHistory: function (data) {
            if (this.history.length < 5) {
                this.history.unshift(data);
            } else {
                this.history.pop();
                this.history.push(data);
            }
        },
    };

    var Editor = new OEditor();

    Editor.addEditor(ace.edit("editor"));
    Editor.getEditor().setTheme("ace/theme/cobalt");
    Editor.getEditor().setOptions({fontSize: "12pt"});
    Editor.addModelist(ace.require("ace/ext/modelist"));
    Editor.getEditor().setReadOnly(true);

    $(".dropdown-menu").on("click", "li", function(event) {
        var themename = "ace/theme/".concat($(this).text());
        editor.setTheme(themename);
    });

    $.ajax({
        async: true,
        type: "GET",
        url: "/directory",
        dataType: "json",

        success: function (json) {
            createJSTrees(json);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr, thrownError);
        }
    });



    function createJSTrees(jsonData) {
        $("#directoryTree").jstree({
            "core": {
                "data": jsonData,
                "check_callback": true,
            },
            "types": {
                "#": {
                    "valid_children": ["root"]
                },
                "root": {
                    "valid_children": ["default"]
                },
                "default": {
                    "valid_children": ["default", "file"]
                },
                "file": {
                    "icon": "glyphicon glyphicon-file",
                    "valid_children": []
                }
            },
            "search": {
                "case_insensitive": true,
                },
            "plugins": [
                "search", "types"
            ]
        });
        jtree = $.jstree.reference('#directoryTree');
    }

    $("#directorySearch").keypress(function(event) {
        if (event.which == 13) {
            var searchString = $(this).val();
            $('#directoryTree').jstree('search', searchString);
        }

    });
    $("#directorySearch").keyup(function(event) {
        if (event.which == 8) {
            $('#directoryTree').jstree('close_all');
        }

    });

    $('#directoryTree').on("select_node.jstree", function (e, data) {
        Editor.getEditor().setReadOnly(true);

        if (data.node.type === "file") {
            var filename = "";
            var path = "file-content";

            filename = node_to_filename(data.node);
            path = path + filename;

            $('#filename-tab').html("<a href=\"#\">"+data.node.text +"</a>");
            $('#save').prop('disabled', false);

            if (data.node.original.metadata.saved) {
                $(function () {
                    $.ajax({
                        async: true,
                        type: "GET",
                        url: path,
                        dataType: "json",

                        success: function (returndata) {
                            Editor.getEditor().setReadOnly(false);
                            Editor.updateCurrentNode(data.node, returndata);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(xhr, ajaxOptions, thrownError);
                            Editor.updateCurrentNode(null, null);
                        }
                    });
                });
            } else {
                var returndata = {"content":"", "file-name":""};
                Editor.getEditor().setReadOnly(false);

                var mode = "";
                mode = Editor.getFileMode(filename);
                Editor.updateCurrentNode(data.node, returndata);
            }
        } else {
            $('#save').prop('disabled', true);
        }
    });

    $("#created").on("click", function(event) {
        var selected_node = jtree.get_selected(true)[0];
        var file_path = null;

        function node_create_cb(data) {
            jtree.edit(data, null, function(dnode, rename_status, edit_status) {
                // Will be called when newly created node is named
                if (!(dnode.text.endsWith("/"))) {
                    jtree.rename_node(dnode, dnode.text + '/');
                }
                jtree.select_node(dnode.id);
            });
        }
        if (selected_node.parent == "#") {
            console.log("Operation Not Allowed");
        } else if (selected_node.type === "file"){
            console.log("Operation Not Allowed");
        } else {
            jtree.create_node(selected_node, {"metadata":{"nsource": "user"}}, "first", node_create_cb, false);
        }
    });

    $("#createf").on("click", function(event) {
        var selected_node = jtree.get_selected(true)[0];
        var file_path = null;

        function node_create_cb(data) {
            jtree.edit(data, null, function(dnode, rename_status, edit_status) {
                // Will be called when newly created node is named
                jtree.select_node(dnode.id);
            });
        }
        if (selected_node.parent == "#") {
            console.log("Operation Not Allowed");
        } else if (selected_node.type === "file"){
            console.log("Operation Not Allowed");
        } else {
            jtree.create_node(selected_node, {"type":"file", "metadata":{"nsource": "user", "saved": false}}, "first", node_create_cb, false);
        }
    });

    $("#delete").on("click", function(event) {
        var selected_node = jtree.get_selected(true)[0];
        var node_source = selected_node.original.metadata.nsource;

        function delete_file(del_node) {
            var path = "/filedelete";
            var data = null;
            var filename = "";
            filename = node_to_filename(del_node);
            data = {"file-name": filename};

            $.ajax({
                async: true,
                type: "POST",
                url: path,
                data: data,
                dataType: "text",

                success: function (returnValue) {
                    jtree.delete_node(selected_node.id);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr, thrownError);
                }
            });
        }
        if (node_source === "system") {
            console.log("Operation not allowed");
        } else {
            if (selected_node.original.metadata.saved == false) {
                jtree.delete_node(selected_node.id);
            } else {
                delete_file(selected_node);
            }
        }
    });

    function save_file() {
        var ace_content = null;
        var data = null;
        var path = "/filesave";
        var filename = null;
        var current_node = Editor.getCurrentNode();

        filename = node_to_filename(current_node);
        ace_content = Editor.getEditor().getSession().getValue();
        data = {"operation": "save",
                "file-name": filename,
                "content": ace_content,
                "saved-status": current_node.original.metadata.saved};

        $.ajax({
            async: true,
            type: "POST",
            url: path,
            data: data,
            dataType: "text",

            success: function (returnValue) {
                jtree.get_node(current_node.id).original.metadata.saved = true;
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr, thrownError);
            }
        });
    }
    $("#save").click(function () {
        save_file();
    });

    $(window).bind('keydown', function(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (String.fromCharCode(event.which).toLowerCase()) {
            case 's':
                event.preventDefault();
                save_file();
            }
        }
    });
    $("#resizable").resizable({
            resize: function (event, ui) {
                editor.resize();
            }
     });

     Editor.getEditor().getSession().on('change', function() {
        console.log("Editor Changed");
     });