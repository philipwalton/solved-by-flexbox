var assign = require('object-assign');
var frontMatter = require('front-matter');
var gulp = require('gulp');
var cssnext = require('gulp-cssnext');
var gutil = require('gulp-util');
var he = require('he');
var hljs = require('highlight.js');
var nunjucks = require('nunjucks');
var path = require('path');
var Remarkable = require('remarkable');
var rename = require('gulp-rename');
var through = require('through2');


var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var jshint = require('gulp-jshint');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var gulpIf = require('gulp-if');

function isProd(transform) {
  // Assume prod unless NODE_ENV starts with 'dev'.
  return gulpIf(!/^dev/.test(process.env.NODE_ENV), transform);
}

nunjucks.configure('templates', { autoescape: false });


var markdown = new Remarkable({
  html: true,
  breaks: false,
  typographer: true,
  highlight: function (code, lang) {
    return lang ? hljs.highlight(lang, code).value : he.escape(code);
  }
});


function extractFrontMatter() {
  return through.obj(function (file, enc, cb) {
    var data = frontMatter(file.contents.toString());
    var content = data.body.trim();
    file.data = data.attributes;
    file.contents = new Buffer(content);
    this.push(file);
    cb();
  });
}


function renderMarkdown() {
  return through.obj(function (file, enc, cb) {
    if (path.extname(file.path) == '.md') {
      file.contents = new Buffer(markdown.render(file.contents.toString()));
    }
    this.push(file);
    cb();
  });
}


function renderTemplate() {
  return through.obj(function (file, enc, cb) {
    var template = file.data.template;
    var templateData = assign({env: 'dev'}, file.data);
    var content = file.contents.toString();

    // Render the content with the local data before rendering the template
    // with the full site data.
    templateData.content = nunjucks.renderString(content, templateData);

    file.contents = new Buffer(nunjucks.render(template, templateData));
    this.push(file);
    cb();
  });
}



gulp.task('pages', function() {
  gulp.src(['*.html', './demos/**/*'], {base: process.cwd()})
      .pipe(extractFrontMatter())
      .pipe(renderMarkdown())
      .pipe(renderTemplate())
      .pipe(rename(function(path) {
        if (path.basename != 'index' && path.basename != '404') {
          path.dirname += '/' + path.basename;
          path.basename = 'index';
          path.extname = '.html';
        }
      }))
      .pipe(gulp.dest('./build/'));
});


gulp.task('images', function() {
  gulp.src('./assets/images/**/*')
      .pipe(gulp.dest('./build/images/'));
});


gulp.task('css', function() {
  gulp.src('./assets/css/main.css')
      .pipe(cssnext(/*{compress: true}*/))
      .pipe(gulp.dest('./build/'));
});


gulp.task('lint', function() {
  gulp.src('./assets/javascript/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(isProd(jshint.reporter('fail')));
});


gulp.task('javascript', function() {
  browserify('./assets/javascript/main.js', {debug: true}).bundle()
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(isProd(uglify()))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build/'));
});


var allTasks = ['css', 'images', 'javascript', 'pages', 'lint'];


gulp.task('watch', allTasks, function() {
  gulp.watch('./assets/css/**/*.css', ['css']);
  gulp.watch('./assets/images/*', ['images']);
  gulp.watch('./assets/javascript/*', ['javascript']);
  gulp.watch(['*.html', './demos/*', './templates/*'], ['pages']);
});


gulp.task('default', allTasks);
