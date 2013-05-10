## Node.js-style Requires in the Browser

Joules provides CommonJS/Node.js-style `require`s in the browser but without a build step. It provides the same convenience as Node, along with the rich community of packages available for install with `npm`.

### Getting Started

To get started with Joules, install the package with `npm`. Joules is targeted primarily at Node.js projects, although it is by no means required.

	$ npm install joules

Copy the joules.js file from the installation over to your javascript directory. In your html file, include a script reference to joules.js, and include a `data-main` attribute indicating the entry-point into your script.

	<script src="js/joules.js" data-main="js/app.js"></script>

Now, in app.js, start requiring files and modules!

	var $ = require('jquery');

	$(function() {
		console.log("I'm using jQuery.");
	});


