'use strict';

const browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    nunjucksRender = require('gulp-nunjucks-render'),
    plumber = require('gulp-plumber'),
    scss = require('gulp-sass'),
    terser = require('gulp-terser'),
    argv = require('yargs').argv,
    gulpif = require('gulp-if'),
    environment = argv.mode || 'development',
    isProduction = environment === 'production';

const paths = {
    source: {
        html: ['app/*.html'],
        scss: ["app/scss/main.scss"],
        scripts: ['app/js/**/*.js'],
        images: ['app/images/**/*.{jpg,png,gif}']
    },
    views: {
        templates: 'app/views/',
        source: 'app/views/**/*.njk'
    },
    production: {
        html: 'public/',
        scss: "public/css",
        scripts:'public/js',
        images: 'public/images'
    },
    development: {
        html:   'build/',
        scss: "build/css",
        scripts:'build/js',
        images: 'build/images'
    },
    serve: {
        baseDir: './build/',
        pathList: [
            'build/**/*.html',
            'build/css/**/*.css',
            'build/images/**/*',
            'build/js/**/*.js'
        ]
    }
}

/*
|--------------------------------------------------------------------------
| Nunjucks Tasks
|--------------------------------------------------------------------------
*/
gulp.task('nunjucks', done => {
    return gulp.src(paths.source.html)
    .pipe(plumber())
    .pipe(nunjucksRender({ path: paths.views.templates }))
    .pipe(gulpif(isProduction, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest(paths[environment].html));
    done();
});
/*
|--------------------------------------------------------------------------
| scss Tasks
|--------------------------------------------------------------------------
*/
gulp.task('scss', done => {
    gulp.src(paths.source.scss)
    .pipe(plumber())
    .pipe(gulpif(isProduction, scss({ compress: true }), scss()))
    .pipe(gulp.dest(paths[environment].scss));
    done();
});
/*
|--------------------------------------------------------------------------
| Uglify and Concat JS
|--------------------------------------------------------------------------
*/
gulp.task('js', () => {
    return gulp.src(paths.source.scripts)
    .pipe(plumber())
    .pipe(gulpif(isProduction, terser()))
    .pipe(concat('index.js'))
    .pipe(gulp.dest(paths[environment].scripts))
});
/*
|--------------------------------------------------------------------------
| Images Tasks
|--------------------------------------------------------------------------
*/
gulp.task('images', (done) => {
    gulp.src(paths.source.images)
    .pipe(plumber())
    .pipe(gulpif(isProduction, imagemin({ interlaced: true, progressive: true, optimizationLevel: 2 })))
    .pipe(gulp.dest(paths[environment].images));
    done();
});
/*
|--------------------------------------------------------------------------
| Watching Tasks
|--------------------------------------------------------------------------
|
| They look for the files changes and runs building tasks.
| We're watching each domain and recompiling separetly
| for better performance.
|
*/
gulp.task('watch', done => {
    gulp.watch(paths.source.html.concat(paths.views.source), gulp.parallel('nunjucks'));
    gulp.watch(paths.source.scss, gulp.parallel('scss'));
    gulp.watch(paths.source.scripts, gulp.parallel('js'));
    gulp.watch(paths.source.images, gulp.parallel('images'));
    done();
});
/*
|--------------------------------------------------------------------------
| Browsesync
|--------------------------------------------------------------------------
|
| BrowserSync and starts a localhost development. Compiled
| files are outputted into `public` directory, so we are
| telling BrowserSync to use it as a base.
|
*/
gulp.task('browser-sync', done => {
    browserSync({
        files: paths.serve.pathList,
        port: 8000,
        server: {
            baseDir: paths.serve.baseDir
        }
    });
    done();
});
/*
|--------------------------------------------------------------------------
| default task
|--------------------------------------------------------------------------
*/
gulp.task('default', gulp.series('nunjucks', 'scss', 'js', 'images', 'watch', 'browser-sync'));
/*
|--------------------------------------------------------------------------
| deploy
|--------------------------------------------------------------------------
*/
gulp.task('build', gulp.series('nunjucks', 'scss', 'js', 'images'));
