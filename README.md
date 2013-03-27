Node.js-style module loading on the browser, optimized for developer happiness.

Get the preferred CommonJS/Node.js style module loading (var module = require('module')) without requiring a build step.

Supports node_modules (via package.json) as well as files.

Inline scripting supported via `require.ready` callback similar to the `$.ready` jQuery callback

Multiple inline scripts on one page are sandboxed from each other

Supports the `data-main` attribute for development (like RequireJS)

Dependencies are determined on the fly - no need to state them up front

Nested dependency support

Module execution environment in the browser is very close to the server.

Build script is nearly identical to development script, leading to fewer differences between dev and deployment, but results in much faster load times.


Why did I make this?

I think the Node.js/CommonJS module style is superior to AMD, but RequireJS had some good insights about what a developer needs to be productive. The primary purpose of this is to mimic Node's module system as closely as possible, while allowing fast development with an ad-hoc script, as well as efficient deployment with a build script.