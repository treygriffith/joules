
var $ = require('jquery');
var fs = require('fs-browser');

function loadScript() {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.text = 'require.ready(function() { ' + $("#code-editor").val() + '});';

	$("#body").contents().find('head')[0].appendChild(script);
}

fs.readFile('__hints.json', 'utf8', function(err, hints) {
	hints = JSON.parse(hints);
	hints.files.forEach(function(file) {
		if(!~file.indexOf("node_modules")) {
			$("#available-files").append('<a href="'+file+'">'+file+'</a><br>');
		}
	});
});

$(function() {
	$("#view-available").on("click", function(e) {
		e.preventDefault();
		$("#view-available").hide();
		$("#hide-available").show();
		$("#available-files").slideDown();
	});
	$("#hide-available").on("click", function(e) {
		e.preventDefault();
		$("#view-available").show();
		$("#hide-available").hide();
		$("#available-files").slideUp();
	});
});



$("#body").ready(function() {

	loadScript();

	var timer;

	$("#code-editor").on('keydown', function(e) {

		clearTimeout(timer);

		timer = setTimeout(function() {
			// reload
			var html = '<iframe id="body" src="' + $("#body").attr("src") + '"></iframe>';
			$("#body").remove();
			$(document.body).append(html);

			// reload js
			$("#body").load(function() {
				loadScript();
			});
		}, 1000);

	});
});



