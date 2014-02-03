$(document).ready(function () {
    var ROWS = 10;
    var COLS = 10;
    var players = [];
    var COLORS =  ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
                   "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
    var COLORSa = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
                   "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
                   "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
                   "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];
    var COLORSb = ["#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939",
                   "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39",
                   "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b",
                   "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"];
    var COLORSc = ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d",
                   "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476",
                   "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc",
                   "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"];
    var NAMES = ["Jane", "Joe", "Jude", "Jack", "Jill", "Jorge", "Jackie"];
    var settings = JSON.parse(localStorage.getItem("settings")) || {};
    var playerIndex = 1;
    
    $("#tabbar a[href='#grid']").on("shown.bs.tab", function () {
        location.hash = "#grid";
        showGrid();
    });
    $("#tabbar a[href='#settings']").on("shown.bs.tab", function () {
        location.hash = "#settings";
        populateValues();
        if ($("#player1").length === 0)
            addPlayer();
    });
    
    function addPlayer() {
        var id = "player" + playerIndex;
        $("#btn-new-player").remove();
        $("#player-input").append(d({
            class: "row", id: "player-row-" + playerIndex
        })
            .append(d({
                class: "player-row",
                style: "background-color: " +
                    COLORS[(playerIndex - 1) % COLORS.length]
            })
            .append($("<label>", { for: id, class: "col-sm-2 control-label" })
                .text("Player " + playerIndex))
            .append(d({ class: "col-sm-6" })
                .append($("<input>", {
                    class: "form-control player-name",
                    placeholder: NAMES[(playerIndex - 1) % NAMES.length],
                    id: id
                })))
            .append(d({ class: "col-sm-1" })
                .append($("<button>", {
                    class: "btn btn-default",
                    id: "btn-new-player"
                }).append($("<i>", { class: "fa fa-plus" })).click(addPlayer)))
            ));
        playerIndex++;
    }
    function populateValues() {
        for (var setting in settings) {
            var id = "#" + setting;
            if (setting.indexOf("player") === 0) {
                var rep = 0;
                while ($(id).length === 0 && rep < 2) {
                    addPlayer();
                    rep++;
                    
                }
            }
            (function (id, value) {
                var timeout = setInterval(function () {
                    if ($(id).length !== 0) {
                        $(id).val(value);
                        clearTimeout(timeout);
                    }
                }, 50);
            })(id, settings[setting]);
            
        }
    }
    $("#tabbar a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
    $("#reset-settings").click(function (e) {
        e.preventDefault();
        $("#settings-form")[0].reset();
        $("#player-input > .row").each(function () {
            if ($(this).attr("id").indexOf("player") === 0) {
                $(this).remove();
            }
        });
        playerIndex = 1;
        addPlayer();
        localStorage.removeItem("settings");
        localStorage.removeItem("boxes");
    });
    $("#save-settings").click(function (e) {
        e.preventDefault();
        $("#tabbar a[href='#grid-tab']").tab("show");
        $("#settings input.form-control").each(function () {
            var id = $(this).attr("id");
            settings[id] = inputVal($(this));
        });
        localStorage.setItem("settings", JSON.stringify(settings));
        updateGrid();
        $("a[href='#grid']").tab("show");
    });
    function d(options) {
        return $("<div>", options);
    }
    function inputVal(elem) {
        var value = elem.val();
        if (typeof(value) === undefined || value === null || value === "") {
            value = elem.attr("placeholder");
        }
        return value;
    }
    function getPlayers() {
        var players = [];
        for (var setting in settings) {
            if (setting.indexOf("player") === 0)
                players.push(settings[setting]);
        }
        return players;
    }
    function assignBoxes(players) {
        var num = ROWS * COLS;
        var nPlayers = players.length;
        var boxes = [];
        for (var i = 0; i < ROWS; i++) {
            for (var j = 0; j < COLS; j++) {
                boxes.push(players[(ROWS * i + j) % nPlayers]);
            }
        }
        for (var k = 0; k < num; k++) {
            var left = Math.floor(Math.random() * num);
            var right = Math.floor(Math.random() * num);
            var tmp      = boxes[left];
            boxes[left]  = boxes[right];
            boxes[right] = tmp;
        }
        return boxes;
    }
    function updateGrid() {
        players = getPlayers();
        var boxes = assignBoxes(players);
        localStorage.setItem("boxes", JSON.stringify(boxes));
    }
    function showGrid() {
        var boxes = JSON.parse(localStorage.getItem("boxes"));
        $("#grid").empty();
        if (boxes == null) {
            $("#grid").append(d({ class: "alert alert-warning" })
                .text("Boxes have not yet been assigned"));
            return;
        }
        $("#grid")
            .append(d({ class: "row" })
                .append(d({ class: "col-md-10 col-md-offset-1 team-name horizontal"})
                    .text(settings.nfcTeam)));
        var headRow = d({ class: "row" }).append(d({ class: "col-md-1" }));
        $("#grid").append(headRow);
        for (var i = 0; i < 10; i++) {
            headRow.append(d({ class: "col-md-1 box-head box-col" }).text(i));
        }
        
        $("#grid")
            .append(d({ class: "team-name vertical"})
                .text(settings.afcTeam));
            
        var Index = {};
        players = getPlayers();
        for (var i in players) {
            Index[players[i]] = i;
        }
        
        for (var i = 0; i < 10; i++) {
            var row = d({ class: "row" });
            row.append(d({
                class: "box-head box-row col-md-1 offset-md-1"
            }).text(i));
            for (var j = 0; j < 10; j++) {
                var player = boxes[ROWS * i + j];
                row.append(d({ class: "col-md-1 box" })
                    .text(player)
                    .css("background-color",
                        COLORS[Index[player] % COLORS.length]));
            }
            $("#grid").append(row);
        }
    }
    
    // NAVIGATION
    var tab = "settings";
    if (location.hash !== "") {
        tab = location.hash.substring(1);
    }
    $("#tabbar a[href='#" + tab + "']").click();
});