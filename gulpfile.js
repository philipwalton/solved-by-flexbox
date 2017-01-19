const argv = require('yargs').argv;
const assign = require('object-assign');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const connect = require('connect');
const del = require('del');
const envify = require('envify');
const eslint = require('gulp-eslint');
const frontMatter = require('front-matter');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const gutil = require('gulp-util');
const he = require('he');
const hljs = require('highlight.js');
const htmlmin = require('gulp-htmlmin');
const nunjucks = require('nunjucks');
const path = require('path');
const postcss = require('gulp-postcss');
const plumber = require('gulp-plumber');
const Remarkable = require('remarkable');
const rename = require('gulp-rename');
const serveStatic = require('serve-static');
const sh = require('shelljs');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const through = require('through2');
const uglify = require('gulp-uglify');

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


nunjucks.configure('templates', {autoescape: false});


function streamError(err) {
  gutil.beep();
  gutil.log(err instanceof gutil.PluginError ? err.toString() : err.stack);
}


function extractFrontMatter(options) {
  let files = [];
  let site = assign({demos: []}, options);
  return through.obj(
    function transform(file, enc, done) {
      let contents = file.contents.toString();
      let yaml = frontMatter(contents);

      if (yaml.attributes) {
        let slug = path.basename(file.path, path.extname(file.path));
        let permalink = site.baseUrl +
            (slug == 'index' ? '' : 'demos/' + slug + '/');

        file.contents = new Buffer(yaml.body);
        file.data = {
          site: site,
          page: assign({
            slug: slug,
            permalink: permalink
          }, yaml.attributes)
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
  );
}


function renderMarkdown() {
  let markdown = new Remarkable({
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
      let content = file.contents.toString();
      file.data.page.content = nunjucks.renderString(content, file.data);

      // Then render the page in its template.
      let template = file.data.page.template;
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

  let baseData = require('./config.json');
  let overrides = {
    baseUrl: isProd() ? '/' + REPO + '/' : '/',
    env: process.env.NODE_ENV || 'development'
  };
  let siteData = assign(baseData, overrides);

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
      .pipe(gulpIf(isProd(), htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true
      })))
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
  return gulp.src([
    'gulpfile.js',
    'assets/javascript/**/*.js'
  ])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});


gulp.task('javascript', ['lint'], function() {
  return browserify('./assets/javascript/main.js', {debug: true})
      .transform(babelify)
      .transform(envify)
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
  let port = argv.port || argv.p || 4000;
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
  sh.rm('-rf', '_tmp');
  sh.mkdir('_tmp');
  sh.cd('_tmp');
  sh.exec('git init');
  sh.exec('git remote add origin git@github.com:philipwalton/' + REPO + '.git');
  sh.exec('git pull origin gh-pages');

  // Delete all the existing files and add
  // the new ones from the build directory.
  sh.rm('-rf', './*');
  sh.cp('-rf', path.join('..', DEST, '/'), './');
  sh.exec('git add -A');

  // Commit and push the changes to
  // the gh-pages branch.
  sh.exec('git commit -m "Deploy site"');
  sh.exec('git branch -m gh-pages');
  sh.exec('git push origin gh-pages');

  // Clean up.
  sh.cd('..');
  sh.rm('-rf', '_tmp');
  sh.rm('-rf', DEST);

});
