# Solved by Flexbox

A showcase of problems once hard or impossible to solve with CSS alone, now made trivially easy with Flexbox.

[View Site](http://philipwalton.github.io/solved-by-flexbox/)

## Viewing the Site Locally

The Solved by Flexbox site is built with [Jekyll](http://jekyllrb.com/) and depends on several other Ruby gems (e.g. [Sass](http://sass-lang.com/) and [Autoprefixer](https://github.com/ai/autoprefixer)).

There are also a few client-side dependencies, which are managed with [Bower](http://bower.io).

To install all the dependencies simply run the commands:

```sh
bundle install
bower install
```

Once all the dependencies are installed, you can preview the site locally with the following rake task:

```sh
rake preview
```

This starts up a local server at port 4000. If you want to use a different port, you can pass the port number as an argument to the rake task:

```sh
rake preview[8080]
```

In addition to building the site and serving it locally, the `rake preview` task will also listen for any changes and rebuild as needed. This allows you to play around with the code, refresh the browser, and see your changes instantly.

