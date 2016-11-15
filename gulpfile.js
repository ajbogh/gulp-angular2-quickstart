var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var pump = require('pump');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var vendorFiles = require('./config/vendor');
var browserSync = require("browser-sync").create();
var sourcemaps = require('gulp-sourcemaps');
var template = require('gulp-template');
var flatGlob = require('flatten-glob');
var cachebust = require('gulp-cache-bust');
var cleanCSS = require('gulp-clean-css');
var tagVersion = require('gulp-tag-version');
var bump = require('gulp-bump');
var git = require('gulp-git');
var filter = require('gulp-filter');
var argv = require('minimist')(process.argv.slice(2));
var env = argv.env || "dev";

gulp.task('less', function () {
    return gulp.src('./app/**/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('js', function(cb){
    pump([
            gulp.src('./app/**/*.js', {base: './app'}),
            gulp.dest('./build')
        ],
        cb
    );
});

gulp.task('vendorjs', function(cb){
    pump([
            gulp.src(vendorFiles.js),
            concat('vendor.js'),
            uglify({
                mangle: false
            }),
            gulp.dest('./build/assets/js')
        ],
        cb
    );
});

gulp.task('html', ['js', 'vendorjs'], function() {
    return gulp.src('./app/**/*.html', {base: './app'})
        .pipe(template({
            scripts: flatGlob.sync(['build/**/*.js', '!build/**/vendor.js']).map(function(x){ return x.replace(/^build\//, '') }),
            styles: flatGlob.sync('build/**/*.css').map(function(x){ return x.replace(/^build\//, '') }),
        }))
        // Adds a timestamp query string to the files in the html
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('./build'));
});


//////////////// BEGIN PACKAGE FUNCTIONS /////////////////////////

// copy files to the dist folder from the build folder, minifying JS and CSS
gulp.task('package', ['packageJS', 'packageHTML']);

gulp.task('packageJS', function(cb){
    pump([
        gulp.src('./build/**/*.js', {base: './build'}),
        concat('app.js'),
        uglify({
            mangle: false
        }),
        gulp.dest('./dist/assets/js')
    ], cb);
});

gulp.task('packageCSS', function(){
    return gulp.src('./build/**/*.css', {base: './build'})
        //minify
        .pipe(cleanCSS({compatibility: 'ie11'}))
        .pipe(concat('stylesheet.css'))
        .pipe(gulp.dest('./dist/assets/stylesheets'))
});

gulp.task('packageHTML', ['packageJS', 'packageCSS'], function(){
    return gulp.src('./app/**/*.html', {base: './app'})
        .pipe(template({
            scripts: flatGlob.sync('dist/**/*.js').map(function(x){ return x.replace(/^dist\//, '') }),
            styles: flatGlob.sync('dist/**/*.css').map(function(x){ return x.replace(/^dist\//, '') })
        }))
        // Adds a timestamp query string to the files in the html
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('./dist'));
});

/////////////////// END PACKAGE FUNCTIONS ///////////////////////

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */

function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./package.json'])
        // bump the version number in those files
        .pipe(bump({type: importance}))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // commit the changed version number
        .pipe(git.commit('bumps package version'))

        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tagVersion());
}

gulp.task('patch', function() { return inc('patch'); });
gulp.task('minor', function() { return inc('minor'); });
gulp.task('feature', ['minor']);
gulp.task('major', function() { return inc('major'); });

//after tagging, be sure to run git push, git push --tags, and npm publish

gulp.task('serve', ['less', 'js', 'vendorjs', 'html'], function() {

    browserSync.init({
        server: "./build"
    });

    //gulp.watch("app/scss/*.scss", ['sass']);
    //gulp.watch("app/*.html").on('change', browserSync.reload);
});

gulp.task('serveDist', ['package'], function(){
    browserSync.init({
        server: "./dist"
    });
});

gulp.task('default', ['serve']);