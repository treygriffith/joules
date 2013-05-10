module.exports = function(href) {
	var ss = document.createElement("link");
	ss.type = "text/css";
	ss.rel = "stylesheet";
	ss.href = href;
	window.document.getElementsByTagName("head")[0].appendChild(ss);
};
