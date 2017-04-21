'use strict';
import gulp from 'gulp';
import combiner from 'stream-combiner2';
import loadPlugins from 'gulp-load-plugins';
var $ = loadPlugins();


class Configs {
    constructor() {
        this.port = "8000";
        this.srcDir = "src/";
        this.distDir = "dist/";
        this.commonDir = `${this.distDir}common/`;
        this.concatJs = `${this.commonDir}js/`;
        this.concatCss = `${this.commonDir}css/`;

        this.html = `${this.srcDir}**/*.html`;
        this.reactjs = `${this.srcDir}**/*.js`;

        this.less = `${this.srcDir}**/**.less`;
        this.css = `${this.srcDir}**/**.css`;
    }
}
var configs = new Configs();


class Log {
    constructor(event, isToDist = true) {
        if (isToDist)
            this.path = $.watchPath(event, configs.srcDir, configs.distDir);
        else
            this.path = $.watchPath(event, configs.srcDir, configs.srcDir);

        console.log('\n');
        $.util.log($.util.colors.green(JSON.stringify(event.type)) + ": " + this.path.srcPath);
    }

    cb(fn) {
        fn(this.path);
    }
}


class CombinerErrHandler {
    common(err) {
        $.util.log($.util.colors.red(err));
    }

    react(err) {
        var colors = $.util.colors;
        $.util.log(colors.red('Error!'));
        $.util.log('fileName: ' + colors.red(err.fileName));
        $.util.log('plugin: ' + colors.yellow(err.plugin));


        $.util.log('cause: ' + colors.red(err));

        // $.util.log('lineNumber: ' + colors.red(err.cause.line));
        // $.util.log('colNumber: ' + colors.red(err.cause.col));
        // $.util.log('message: ' + err.cause.message);
    }

    less(err) {
        var colors = $.util.colors;
        $.util.log(colors.red('Error!'));
        $.util.log('fileName: ' + colors.red(err.filename));
        $.util.log('lineNumber: ' + colors.red(err.line));
        $.util.log('colNumber: ' + colors.red(err.column.col));
        $.util.log('message: ' + err.message);
        $.util.log('plugin: ' + colors.yellow(err.plugin));
    }

}


class Task {
    constructor() {
        this.combinerErrHandler = new CombinerErrHandler();
    }

    reload(p) {
        gulp.src(p.srcPath)
            .pipe($.connect.reload());
    }

    html(p) {
        combiner.obj([
            gulp.src(p.srcPath),
            $.sourcemaps.init(),
            $.htmlmin({
                collapseWhitespace: true,
                minifyJS: true
            }),
            $.sourcemaps.write('./'),
            gulp.dest(p.distDir),
            $.callback(() => {
                this.reload(p);
            })
        ]).on('error', this.combinerErrHandler.common);
        return this;
    }

    react(p) {
        combiner.obj([
            gulp.src(p.srcPath),
            $.sourcemaps.init(),
            $.babel({
                "presets": ['es2015', 'react']
            }),
            $.concat('all.js'),
            gulp.dest(p.distDir),
            $.uglify(),
            $.rename(p => {
                p.extname = '.min.js';
            }),
            $.sourcemaps.write('./'),
            gulp.dest(p.distDir),
            $.callback(() => {
                this.reload(p);
            })
        ]).on('error', this.combinerErrHandler.react)
        return this;
    }


    less(p) {
        combiner.obj([
            gulp.src(p.srcPath),
            $.less(),
            gulp.dest(p.distDir),
            $.callback(() => {
                this.reload(p);
            })
        ]).on('error', this.combinerErrHandler.less);
        return this;
    }


    css(p) {
        let autoprefixer = require('autoprefixer');
        combiner.obj([
            gulp.src(p.srcPath),
            $.sourcemaps.init(),
            $.postcss([autoprefixer()]),
            $.concat('all.css'),
            gulp.dest(p.distDir),
            $.cleanCss({
                compatibility: 'ie8'
            }),
            $.rename(p => {
                p.extname = '.min.css';
            }),
            $.sourcemaps.write("./"),
            gulp.dest(p.distDir),
            $.callback(() => {
                this.reload(p);
            })
        ]).on('error', this.combinerErrHandler.common);
        return this;
    }
}


gulp.task('watch', () => {
    gulp.watch(configs.reactjs, event => {
        new Log(event).cb(path => {
            new Task()
                .react({
                    srcPath: configs.reactjs,
                    distDir: configs.concatJs
                });
        });
    });

    gulp.watch(configs.html, event => {
        new Log(event).cb(path => {
            new Task()
                .html(path);
        });
    });

    gulp.watch(configs.less, event => {
        new Log(event, false).cb(path => {
            new Task()
                .less(path);
        });
    });

    gulp.watch(configs.css, event => {
        new Log(event).cb(path => {
            new Task()
                .css({
                    srcPath: configs.css,
                    distDir: configs.concatCss
                });
        });
    });
})

gulp.task('connect', () => {
    $.connect.server({
        port: configs.port,
        root: './',
        livereload: true
    });
})

gulp.task('init', () => {
    new Task()
        .html({
            srcPath: configs.html,
            distDir: configs.distDir
        })
        .react({
            srcPath: configs.reactjs,
            distDir: configs.concatJs
        })
        .less({
            srcPath: configs.less,
            distDir: configs.srcDir
        })
        .css({
            srcPath: configs.css,
            distDir: configs.concatCss
        });
});

gulp.task('default', ['connect', 'watch']);