"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var server = require("browser-sync").create();
var run = require("run-sequence");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require("del");

gulp.task('common-js', function() {
	return gulp.src([
		'js/common.js',
		])
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('js'));
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		'js/libs/jquery/dist/jquery.min.js',
		'js/common.min.js', // Всегда в конце
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('build/js'))
	.pipe(server.reload({stream: true}));
});

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("html:copy", function() {
  return gulp.src("*.html")
    .pipe(gulp.dest("build"))
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
})

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
  ]))

  .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
  }))
  .pipe(rename("symbols.svg"))
  .pipe(gulp.dest("build/img"));
});

gulp.task("serve", function() {
  server.init({
    server: "build/"
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style", "html:update"]);
  gulp.watch("*.html", ["html:update"]);
  gulp.watch(['js/libs/**/*.js', 'js/common.js'], ['js']);
});

gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2,ttf}",
    "img/**",
    "js/**",
    "*.html"
  ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("build", function(fn) {
  run("clean", "copy", "style", "images", "symbols", 'js', fn);
});

gulp.task("clean", function() {
  return del("build");
});
