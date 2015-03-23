var autoprefixer = require('autoprefixer-core');
var browserify = require("browserify");
var gulp = require("gulp");
var postcss = require('gulp-postcss');
var sass = require("gulp-sass");
var transform = require("vinyl-transform");


gulp.task("styles", function () {
  gulp.src("./src/styles/*.scss")
    .pipe(postcss([ autoprefixer({ browsers: ["last 2 version"] }) ]))
    .pipe(sass())
    .pipe(gulp.dest("./css/"));
});

gulp.task("scripts", function () {
  var browserified = transform(function (filename) {
    var b = browserify({entries: filename, debug: false});
    return b.bundle();
  });

  return gulp.src("./src/scripts/app.js")
    .pipe(browserified)
    .pipe(gulp.dest("./js/"));
});

gulp.task("default", ["styles", "scripts"]);
