/**
 * Created by guoyang on 2016/10/31.
 */
var gulp = require('gulp');
var gulpSass = require('gulp-sass');
var browserSync = require('browser-sync');

gulp.task("scss", function () {
    gulp.src('app/src/css/*.+(scss|css)')
        .pipe(gulpSass())
        .pipe(gulp.dest('app/dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))

});
gulp.task("js", function () {
    gulp.src('app/src/js/*.js')
        .pipe(gulp.dest('app/dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
    gulp.src('app/src/js/service/*.js')
        .pipe(gulp.dest('app/dist/js/service'))
        .pipe(browserSync.reload({
            stream: true
        }))
    gulp.src('app/src/js/controller/*.js')
        .pipe(gulp.dest('app/dist/js/controller'))
        .pipe(browserSync.reload(
            {
                stream: true
            }
        ))
})
gulp.task("pages", function () {
    gulp.src('app/src/pages/*.html')
        .pipe(gulp.dest('app/dist/pages'))
        .pipe(browserSync.reload({
            stream: true
        }));
    gulp.src('app/src/*.html')
        .pipe(gulp.dest('app/dist'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

gulp.task("sync", function () {
    browserSync.init(
        {
            server: {
                baseDir: 'app/dist'
            }
        }
    )
})
gulp.task("watcher", ['sync', 'scss', 'js'], function () {
    gulp.watch("app/src/css/*.scss", ["scss"]);
    gulp.watch("app/src/**/*.html", ["pages"]);
    gulp.watch("app/src/js/*.js", ["js"]);
    // gulp.watch()
})
gulp.task('default', ['watcher']);
