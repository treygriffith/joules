
loadModule('./', null, function(err, module) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.text = module.write();
	document.body.appendChild(script);
});