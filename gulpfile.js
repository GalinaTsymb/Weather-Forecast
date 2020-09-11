
const { src, dest, parallel } = require('gulp');
const gulp          = require('gulp');
const sass          = require('gulp-sass');
const sourcemaps    = require('gulp-sourcemaps');
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');

const babelify      = require('babelify');
const browserify    = require('browserify');
//const uglify        = require('gulp-uglify');
const gutil         = require('gulp-util');
const source        = require('vinyl-source-stream');
const buffer        = require('vinyl-buffer');

sass.compiler = require("node-sass");

const paths = {
    styles: {
        src: 'scss/**/*.scss',
        dest: 'assets/styles/'
    },
    images: {
        src: 'images/**/*',
        dest: 'assets/images/',
    },
    scripts: {
        src: 'js',
        dest: 'assets/js/',
    },

};
/*
 * Define our tasks using plain functions
 */
function scssTransform() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass({ outputStyle: 'compressed' })
            .on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: "last 3 version"
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.styles.dest));
}


/*
 * Optimize images
 */
function optimizeImages() {
    return gulp.src(paths.images.src)
        .pipe(imagemin(
            [
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]
        ))
        .pipe(gulp.dest(paths.images.dest))
}

function js_compile(){

    let b = browserify({
        entries: 'js/script.js',
        debug: true
    }).transform("babelify", {
        presets: ["@babel/env"],
        plugins: [
            ["@babel/plugin-transform-runtime",
                {
                    "regenerator": true
                }
            ]
        ],
    });

    return b.bundle()
        .pipe(source('script.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.scripts.dest))
        .on('error', gutil.log);

}

// Watch files
function watch() {
    gulp.watch(paths.styles.src, scssTransform);
    gulp.watch(paths.images.src, optimizeImages);
    gulp.watch(paths.scripts.src, js_compile);
}

exports.watch = watch;