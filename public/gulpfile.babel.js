import gulp from 'gulp';
import sass from 'gulp-sass';

/***  Dev Process ***/

import htmlPartial from 'gulp-html-partial';
import postcss from 'gulp-postcss';
import reporter from 'postcss-reporter';
import syntax_scss from 'postcss-scss';
import stylelint from 'stylelint';

import {create as bsCreate} from 'browser-sync';
const browserSync = bsCreate();

// paths to various things...

const paths = {
  styles: {
    dev: 'dev/scss/**/*.scss',
    test: 'test/css/',
    dist: 'dist/css/',
    outfile: 'main.css'
  },
  scripts: {
    dev: 'dev/js/*.js',
    test: 'test/js/',
    dist: 'dist/js/'
  },
  images: {
    dev: 'src/scss/**/*.scss',
    test: 'test/css/',
    dist: 'dist/css/'
  },
  html: {
    dev: 'dev/*.html',
    partialPath: 'dev/html_partials/',
    test: 'test',
    dist: ''
  }
};

// watches for changes that should create a regeneration
// of test files and launches browserSync task

// export const watchstyles = gulp.series(lintscss, runsass);
// export const watchscripts = jscopy
// export const watchhtml = gulp.series(runHtmlPartials, watchstyles);

// export function watch() {
//     gulp.watch(paths.styles.dev, runsass());
//     //gulp.wat"ch(paths.html.dev, gulp.series(runHtmlPartials, lintscss, runsass));
//     //gulp.watch(paths.scripts.dev, jscopy);
//    //gulp.watch(paths.styles.dev, gulp.series(lintscss, runsass));
// }

// WILL CHANGE TO:

const watchstyles = gulp.watch(paths.styles.dev);
watchstyles.on('all', function(event, path, stats) {
  console.log('File ' + path + ' was ' + event + ', running tasks...');
});

// lint the scss files

export function lintscss() {
  // Stylelint config rules
   var stylelintConfig = {
     "extends": "stylelint-config-standard",
     "rules": {
       // custom / additional rules
       "block-no-empty": true,
       "color-no-invalid-hex": true,
       "declaration-colon-space-after": "always",
       "declaration-colon-space-before": "never",
     }
   }

   var processors = [
     stylelint(stylelintConfig),
     reporter({
       clearMessages: true,
       throwError: false
     })
   ];

   return gulp.src(paths.scripts.dev)
      .pipe(postcss(processors, {syntax: syntax_scss}));
  }

// generates a single css file from scss files

export function runsass() {
  return gulp.src(paths.styles.dev)
    .pipe(sass())
    .on('error', function(err) {
      console.log(err.toString());
      this.emit('end');
    })
    .pipe(gulp.dest(paths.styles.test))
    .pipe(browserSync.reload({
      stream: true
    }))
}

// generates html files in

export function runHtmlPartials() {
  return gulp.src(paths.html.dev)
      .pipe(htmlPartial({
          basePath: paths.html.partialPath
      }))
      .pipe(gulp.dest(paths.html.test))
      .pipe(browserSync.reload({
        stream: true
      }))
}

// copies JS over to testbed - TODO babel 

export function jscopy() {
  return gulp.src(paths.scripts.dev)
      .pipe(gulp.dest(paths.scripts.test));
}

//reloads stuff in browser(s)

gulp.task('browserSync', function(done) {
  browserSync.init({
    proxy: "localhost",
    open: false
  });
  done();
})

/***  Dist Process ***/

import log from 'fancy-log';
import {stream as critical} from 'critical';
import minify from 'gulp-minify';
import cleanCss from 'gulp-clean-css';
import concat from 'gulp-concat';

// export function distribute() {
//   ['critical','prepare-js','prepare-css'])

// }
//gulp.task('default', gulp.series(clean, gulp.parallel(scripts, styles)));



export function criticalcss() {
  return gulp.src('test/*.html')
      .pipe(critical({
        extract: false,
        base: 'test/',
        css: ['test/css/main.css'],
        inline: false,
        dimensions: [{
            height: 640,
            width: 320
        }, {
            height: 900,
            width: 1200
        }, {
            height: 1080,
            width: 1920
        }]
        }))
      .on('error', function(err) { log.error(err.message); })
      .pipe(gulp.dest('dist/css'));
}

 export function preparejs () {
  return gulp.src('test/js/*.js')
  .pipe(concat('bundle.js'))
  .pipe(minify())
  .pipe(gulp.dest('dist/js'));
}


export function preparecss () {
  return gulp.src(paths.styles.test)
		.pipe(concat('main.css'))
		.pipe(cleanCss())
    .pipe(gulp.dest(paths.styles.dist));
}