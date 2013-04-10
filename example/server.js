var connect = require('connect'),
	joules = require('../');

joules.hint('./static', function(err) {
	if(err) {
		throw err;
	}
	console.log("hinting file created");
});

connect.createServer(
    connect.static('./static')
).listen(8080);

console.log("listening on 8080");