var gulp = require('gulp');
var help = require('gulp-task-listing');
var cp = require('child_process');
var minifyCss = require('gulp-minify-css');
var notify = require("gulp-notify")
var sass = require('gulp-ruby-sass');
var bower = require('gulp-bower');
var replace = require('gulp-replace');
var browserSync = require('browser-sync');

var config = {
  sassPath: "./_sass",
  jsPath: "./_js",
  bowerDir: "./bower_components",
  assetDir: "./assets",
  outputDir: "./_site",
  distDir: "./_dist"
}

var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

gulp.task('help', help);

gulp.task('bower', function () {
  return bower()
    .pipe(gulp.dest(config.bowerDir))
});

gulp.task('jekyll-build', ['css', 'icons', 'bower'], function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('bundle', ['exec', 'jekyll', 'build'], {stdio: 'inherit'})
    .on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

gulp.task('icons', function () {
  return gulp.src(
    [
      config.bowerDir + "/fontawesome/fonts/**.*",
      config.bowerDir + "/bootstratp-sass/assets/fonts/bootstrap/**.*"]
    )
    .pipe(gulp.dest(config.assetDir + "/fonts"))
    .pipe(gulp.dest(config.outputDir + "/assets/fonts"));
});

gulp.task('css', function () {
  return sass(config.sassPath + "/main.scss", {
    style: "compressed",
    loadPath: [
      config.sassPath,
      "form/*.scss",
      config.bowerDir + "/bootstrap-sass/assets/stylesheets",
      config.bowerDir + "/font-awesome/scss"
    ],
    compass: true
  })
    .pipe(minifyCss())
    .pipe(gulp.dest(config.assetDir + "/css"))
    .pipe(gulp.dest(config.outputDir + "/assets/css"))
    .pipe(browserSync.stream());

});

gulp.task('js', function () {
  return gulp.src(
    [
      config.jsPath + "/**.*",
      config.bowerDir + "/bootstrap-sass/assets/javascripts/bootstrap.js",
      config.bowerDir + "/jquery/dist/jquery.min.js",
      config.bowerDir + "/moment/min/moment.min.js"
    ]
    )
    .pipe(gulp.dest(config.assetDir + "/js"))
    .pipe(gulp.dest(config.outputDir + "/assets/js"))
    .pipe(browserSync.stream());
});

gulp.task('build', ['bower', 'icons', 'css', 'js', 'jekyll-build']);

gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: "./_site"
    }
  });

  // Start a watch for rebuilds
  gulp.watch(['_sass/*.scss'], ['css']);
  gulp.watch(['_js/*.js'], ['js']);
  gulp.watch(
    [
      '**',
      '!.sass-cache/**',
      '!_site/**',
      '!assets/**',
      '!bower_components/**',
      '!node_modules/**',
      '!*.json',
      '!Gemfile*',
      '!gulpfile.js'
    ],
    ['jekyll-rebuild']);
});

gulp.task('jekyll-build-dist', ['css', 'icons', 'bower'], function () {
  return cp.spawn('bundle', ['exec', 'jekyll', 'build', '--config', '_config.yml,_baseurl.yml', '--destination', config.distDir], {stdio: 'inherit'});
});

gulp.task('dist', ['bower', 'icons', 'css', 'js', 'jekyll-build-dist']);

gulp.task('default', ['serve']);
