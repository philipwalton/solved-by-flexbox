require('shelljs/global');

var argv = require('yargs').argv;
var assign = require('object-assign');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var connect = require('connect');
var cssnext = require('gulp-cssnext');
var del = require('del');
var frontMatter = require('front-matter');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var he = require('he');
var hljs = require('highlight.js');
var htmlmin = require('gulp-htmlmin');
var jshint = require('gulp-jshint');
var nunjucks = require('nunjucks');
var path = require('path');
var plumber = require('gulp-plumber');
var Remarkable = require('remarkable');
var rename = require('gulp-rename');
var serveStatic = require('serve-static');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var through = require('through2');
var uglify = require('gulp-uglify');

/**
 * The output directory for all the built files.
 */
const DEST = './build';

/**
 * The name of the Github repo.
 */
const REPO = 'solved-by-flexbox';


function isProd() {
  return process.env.NODE_ENV == 'production';
}


nunjucks.configure('templates', { autoescape: false });


function streamError(err) {
  gutil.beep();
  gutil.log(err instanceof gutil.PluginError ? err.toString() : err.stack);
}


function extractFrontMatter(options) {
  var files = [];
  var site = assign({demos: []}, options);
  return through.obj(
    function transform(file, enc, done) {
      var contents = file.contents.toString();
      var yaml = frontMatter(contents);

      if (yaml.attributes) {
        var slug = path.basename(file.path, path.extname(file.path));

        file.contents = new Buffer(yaml.body);
        file.data = {
          site: site,
          page: assign({slug: slug}, yaml.attributes)
        };

        if (file.path.indexOf('demos') > -1) {
          site.demos.push(file.data.page);
        }
      }

      files.push(file);
      done();
    },
    function flush(done) {
      files.forEach(function(file) { this.push(file); }.bind(this));
      done();
    }
  )
}


function renderMarkdown() {
  var markdown = new Remarkable({
    html: true,
    typographer: true,
    highlight: function (code, lang) {
      // Unescape to avoid double escaping.
      code = he.unescape(code);
      return lang ? hljs.highlight(lang, code).value : he.escape(code);
    }
  });
  return through.obj(function (file, enc, cb) {
    try {
      if (path.extname(file.path) == '.md') {
        file.contents = new Buffer(markdown.render(file.contents.toString()));
      }
      this.push(file);
    }
    catch (err) {
      this.emit('error', new gutil.PluginError('renderMarkdown', err, {
        fileName: file.path
      }));
    }
    cb();
  });
}


function renderTemplate() {
  return through.obj(function (file, enc, cb) {
    try {
      // Render the file's content to the page.content template property.
      var content = file.contents.toString();
      file.data.page.content = nunjucks.renderString(content, file.data);

      // Then render the page in its template.
      var template = file.data.page.template;
      file.contents = new Buffer(nunjucks.render(template, file.data));

      this.push(file);
    }
    catch (err) {
      this.emit('error', new gutil.PluginError('renderTemplate', err, {
        fileName: file.path
      }));
    }
    cb();
  });
}


gulp.task('pages', function() {

  var baseData = require('./config.json');
  var overrides = {
    baseUrl: isProd() ? '/' + REPO + '/' : '/',
    env: isProd() ? 'prod' : 'dev'
  };
  var siteData = assign(baseData, overrides);

  return gulp.src(['*.html', './demos/**/*'], {base: process.cwd()})
      .pipe(plumber({errorHandler: streamError}))
      .pipe(extractFrontMatter(siteData))
      .pipe(renderMarkdown())
      .pipe(renderTemplate())
      .pipe(rename(function(path) {
        if (path.basename != 'index' && path.basename != '404') {
          path.dirname += '/' + path.basename;
          path.basename = 'index';
          path.extname = '.html';
        }
      }))
      .pipe(htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true
      }))
      .pipe(gulp.dest(DEST));
});


gulp.task('images', function() {
  return gulp.src('./assets/images/**/*')
      .pipe(gulp.dest(path.join(DEST, 'images')));
});


gulp.task('css', function() {
  return gulp.src('./assets/css/main.css')
      .pipe(plumber({errorHandler: streamError}))
      .pipe(cssnext({
        browsers: '> 1%, last 2 versions, Safari > 5, ie > 9, Firefox ESR',
        compress: true,
        url: false
      }))
      .pipe(gulp.dest(DEST));
});


gulp.task('lint', function() {
  return gulp.src('./assets/javascript/**/*.js')
      .pipe(plumber({errorHandler: streamError}))
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(gulpIf(isProd(), jshint.reporter('fail')))
});


gulp.task('javascript', ['lint'], function() {
  return browserify('./assets/javascript/main.js', {debug: true})
      .transform(babelify)
      .bundle()
      .on('error', streamError)
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(gulpIf(isProd(), uglify()))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(DEST));
});


gulp.task('clean', function(done) {
  del(DEST, done);
});


gulp.task('default', ['css', 'images', 'javascript', 'pages']);


gulp.task('serve', ['default'], function() {
  var port = argv.port || argv.p || 4000;
  connect().use(serveStatic(DEST)).listen(port);

  gulp.watch('./assets/css/**/*.css', ['css']);
  gulp.watch('./assets/images/*', ['images']);
  gulp.watch('./assets/javascript/*', ['javascript']);
  gulp.watch(['*.html', './demos/*', './templates/*'], ['pages']);
});


gulp.task('deploy', ['default'], function() {

  if (process.env.NODE_ENV != 'production') {
    throw new Error('Deploying requires NODE_ENV to be set to production');
  }

  // Create a tempory directory and
  // checkout the existing gh-pages branch.
  rm('-rf', '_tmp');
  mkdir('_tmp');
  cd('_tmp');
  exec('git init');
  exec('git remote add origin git@github.com:philipwalton/' + REPO + '.git');
  exec('git pull origin gh-pages');

  // Delete all the existing files and add
  // the new ones from the build directory.
  rm('-rf', './*');
  cp('-rf', path.join('..', DEST, '/'), './');
  exec('git add -A');

  // Commit and push the changes to
  // the gh-pages branch.
  exec('git commit -m "Deploy site"');
  exec('git branch -m gh-pages');
  exec('git push origin gh-pages');

  // Clean up.
  cd('..');
  rm('-rf', '_tmp');
  rm('-rf', DEST);

});
