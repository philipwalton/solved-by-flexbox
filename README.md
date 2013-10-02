# Solved by Flexbox

A showcase of problems once hard or impossible to solve with CSS alone, now made trivially easy with Flexbox.

[View Site](http://philipwalton.github.io/solved-by-flexbox/)

## Viewing the Site Locally

Solved by Flexbox is built with [Jekyll](http://jekyllrb.com/) and written in Ruby. To preview the site locally you'll need Ruby and RubyGems installed.

Once they're installed, you can install the remaining dependencies with the following command:

```sh
bundle install
```

To preview the site in the browser, simply run the following rake task:

```sh
rake preview
```

This starts up a local server at port 4000. If you want to use a different port, you can pass the port number as an argument to the rake task:

```sh
rake preview[8080]
```

The `rake preview` command starts up the Jekyll server and watches for any HTML or Sass file changes. It automatically recompiles everything and runs the CSS through [autoprefixer](https://github.com/ai/autoprefixer).
