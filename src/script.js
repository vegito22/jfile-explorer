    var jtree = null;

    function OEditor() {
        this.editor = null;
        this.current_file = null;
        this.modelist = null;
    }

    OEditor.prototype = {
        addEditor: function (edit) {
            this.editor = edit;
        },
        getEditor: function () {
            return this.editor;
        },

        updateCurrentFile: function (filename) {
            this.current_file = filename;
        },

        getCurrentFile: function () {
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
        }
    };

    var Editor = new OEditor();

    Editor.addEditor(ace.edit("editor"));
    Editor.getEditor().setTheme("ace/theme/cobalt");
    Editor.getEditor().setOptions({fontSize: "12pt"});
    Editor.addModelist(ace.require("ace/ext/modelist"));

    $(".dropdown-menu").on("click", "li", function(event) {
        var themename = "ace/theme/".concat($(this).text());
        console.log(editor.setTheme(themename));
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
            console.log(xhr);
            console.log(xhr.status);
            console.log(thrownError);
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
                    "max_children": 1,
                    "max_depth": 4,
                    "valid_children": ["root"]
                },
                "root": {
                    "icon": "/static/3.3.4/assets/images/tree_icon.png",
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
        if (data.node.type === "file") {
            var path = "file-content";
            var count = 0;
            var selected_node = jtree.get_selected(true)[0];

            for (var i = data.node.parents.length - 2; i >= 0; i--) {
                path = path + data.instance.get_node(data.node.parents[i]).text;
            }

            path = path + data.node.text;

            $(function () {
                $.ajax({
                    async: true,
                    type: "GET",
                    url: path,
                    dataType: "json",

                    success: function (data) {

                        $('#save').prop('disabled', false);
                        var content = null;
                        var mode = "";

                        filename = data["file-name"];
                        content =  data["content"];

                        mode = Editor.getFileMode(filename);
                        if (mode == "") {
                            mode = "ace/mode/text";
                        }
                        Editor.getEditor().getSession().setValue(content);
                        Editor.getEditor().getSession().setMode(mode);
                        Editor.updateCurrentFile(filename);
                    },

                    error: function (xhr, ajaxOptions, thrownError) {
                        $('#save').prop('disabled', true);
                        console.log(xhr);
                        console.log(xhr.status);
                        console.log(thrownError);
                        Editor.updateCurrentFile(null);
                    }
                });
            });
        }
    });

    $("#create").on("click", function(event) {
        var selected_node = jtree.get_selected(true)[0];
        var file_path = null;

        function node_create_cb(data) {
            jtree.edit(data, null, function(dnode, rename_status, edit_status) {
                // Will be called when newly created node is named
            });
        }

        if (selected_node.parent == "#") {
            console.log("Operation Not Allowed");
        } else if (selected_node.type === "file"){
            console.log("Operation Not Allowed");
        } else {
            jtree.create_node(selected_node, {"metadata":{"nource": "user"}}, "first", node_create_cb, false);
        }
    });

    $("#createf").on("click", function(event) {
        var selected_node = jtree.get_selected(true)[0];
        var file_path = null;

        function node_create_cb(data) {
            jtree.edit(data, null, function(dnode, rename_status, edit_status) {
                // Will be called when newly created node is named
            });
        }

        if (selected_node.parent == "#") {
            console.log("Operation Not Allowed");
        } else if (selected_node.type === "file"){
            console.log("Operation Not Allowed");
        } else {
            jtree.create_node(selected_node, {"type":"file", "metadata":{"nsource": "user"}}, "first", node_create_cb, false);
        }
    });

    $("#delete").on("click", function(event) {
        var selected_node = jtree.get_selected(true)[0];
        var node_source = selected_node.original.metadata.nsource;
        if (node_source === "system") {
            console.log("Operation not allowed");
        } else {
            jtree.delete_node(selected_node.id);
            console.log("Deleted")
        }
    });

    function save_file() {
        var ace_content = null;
        var data = null;
        var path = "/filesave";
        var filename = Editor.getCurrentFile();
        ace_content = Editor.getEditor().getSession().getValue();

        data = {"operation": "save",
                "file-name": filename,
                "content": ace_content};

        $.ajax({
            async: true,
            type: "POST",
            url: path,
            data: data,
            dataType: "text",

            success: function (returnValue) {
                console.log(returnValue);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr);
                console.log(xhr.status);
                console.log(thrownError);
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
