$(document).ready(function () {
	var ROWS = 10;
	var COLS = 10;
	var players = [];
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
		$("#player-input").append(d({ class: "row" })
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
			);
		playerIndex++;
	}
	function populateValues() {
		console.log("Settings", settings);
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
		$("#settings-form :input").each(function () {
			var id = $(this).attr("id");
			if (id.indexOf("player") === 0) {
				$(this).remove();
				$("#settings-form label[for='" + id + "']").remove();
			}
		});
		addPlayer();
		playerIndex = 1;
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
			.append(d({ class: "row" }))
				.append(d({ class: "col-md-10 offset-md-2"})).text(settings.nfcTeam);
		for (var i = 0; i < 10; i++) {
			var row = d({ class: "row" });
			row.append(d({ class: "box-head col-md-1 offset-md-1"}).text(i));
			for (var j = 0; j < 10; j++) {
				row.append(d({ class: "col-md-1 box" }).text(boxes[ROWS * i + j]));
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