# Solved by Flexbox

A showcase of problems once hard or impossible to solve with CSS alone, now made trivially easy with Flexbox.

[View Site](http://philipwalton.github.io/solved-by-flexbox/)

## Viewing the Site Locally

The Solved by Flexbox site can be built with [io.js](https://iojs.org/) or [Node.js](http://nodejs.org/). If you have either of those installed on your system, you can run the following commands to build and serve a local copy.

```sh
# Clone the git repository and cd into the cloned directory.
git clone git@github.com:philipwalton/solved-by-flexbox.git
cd solved-by-flexbox

# Install the dependencies
npm install

# Build and serve the site at http://localhost:4000
npm start
```

This starts up a local server on port 4000. To view the site in your browser, navigate to [http://localhost:4000](http://localhost:4000). If you want to use a different port, you can pass the port number as an argument to `npm start`:

```sh
npm start -- -p 8080
```

In addition to building the site and serving it locally, this will also listen for any changes and rebuild the site as needed. This allows you to play around with the code, refresh the browser, and see your changes instantly.
