/*!
 * gulp配置文件(ES6)
 * 1.压缩html
 * 2.react jsx编译
 * 3.es6转化
 * 4.合并&压缩js
 * 5.编译less
 * 6.合并&压缩css
 * 
 * @author 刘鑫<475212506@qq.com>
 */

'use strict';
import gulp from 'gulp';
import combiner from 'stream-combiner2';
import loadPlugins from 'gulp-load-plugins';
var $ = loadPlugins();

/**
 * 配置信息
 */
class Configs {
    constructor() {
        /**
         * gulp-connect端口号
         * @type {Number}
         */
        this.port = 8000;

        /**
         * 是否启用Sourcemaps
         * @type {Boolean}
         */
        this.isSourcemaps = true;

        /**
         * 源文件夹路径
         * @type {String}
         */
        this.srcDir = "src/";

        /**
         * 发布文件夹路径
         * @type {String}
         */
        this.distDir = "dist/";

        /**
         * 应用程序公共文件所在文件夹路径
         * @type {String}
         */
        this.commonDir = `${this.distDir}common/`;

        /**
         * js合并文件all.js所在路径
         * @type {String}
         */
        this.concatJs = `${this.commonDir}js/`;

        /**
         * css合并文件all.css所在路径
         * @type {String}
         */
        this.concatCss = `${this.commonDir}css/`;

        /**
         * html所在源文件夹
         * @type {String}
         */
        this.html = `${this.srcDir}**/*.html`;

        /**
         * js所在源文件夹
         * @type {String}
         */
        this.reactjs = `${this.srcDir}**/*.js`;

        /**
         * less所在源文件夹
         * @type {String}
         */
        this.less = `${this.srcDir}**/**.less`;

        /**
         * scss所在源文件夹
         * @type {String}
         */
        this.scss = `${this.srcDir}**/**.scss`;

        /**
         * css所在源文件夹
         * @type {String}
         */
        this.css = `${this.srcDir}**/**.css`;
    }
}

/**
 * 全局配置变量
 * @type {Configs}
 */
var configs = new Configs();

/**
 * 日志(输出到控制台)
 * @param {Object} path 被修改文件的路径信息
 * this.path:
 * {
        "srcFilename": "start.css",
        "distFilename": "start.css",
        "srcPath": "src\\demo-mdl\\css\\start.css",
        "srcDir": "src\\demo-mdl\\css",
        "distPath": "dist\\demo-mdl\\css\\start.css",
        "distDir": "dist\\demo-mdl\\css"
    }
 */
class Log {
    /**
     * @param {Object} event 文件被修改时发生的事件
     * @param {Boolean} isToDist 是否输出到Dist目录
     *
     * event
     * {
            "history": ["D:\\Developer\\Web\\react-demo\\src\\demo-mdl\\css\\start.css"],
            "cwd": "D:\\Developer\\Web\\react-demo",
            "base": "D:\\Developer\\Web\\react-demo\\src",
            "stat": {
                "dev": 1211568586,
                "mode": 33206,
                "nlink": 1,
                "uid": 0,
                "gid": 0,
                "rdev": 0,
                "ino": 844424930296236,
                "size": 0,
                "atime": "2017-04-28T07:54:27.751Z",
                "mtime": "2017-04-28T07:58:49.028Z",
                "ctime": "2017-04-28T07:58:49.028Z",
                "birthtime": "2017-04-28T07:48:38.550Z"
            },
            "_contents": {
                "type": "Buffer",
                "data": []
            },
            "_isVinyl": true,
            "event": "change"
        }
     */
    constructor(event, isToDist = true) {
        if (isToDist)
            this.path = $.watchPath(event, configs.srcDir, configs.distDir);
        else
            this.path = $.watchPath(event, configs.srcDir, configs.srcDir);
        console.log('\n');
        $.util.log($.util.colors.green(JSON.stringify(event.event)) + ": " + this.path.srcPath);
    }

    /**
     * 将被修改的文件的路径信息传递给回调函数
     * @param  {Function} fn 回调函数
     */
    cb(fn) {
        fn(this.path);
    }
}

/**
 * 在gulp执行过程中，不中断gulp并且输出错误信息到控制台
 */
class CombinerErrHandler {
    /**
     * 输出所有错误信息
     */
    common(err) {
        $.util.log($.util.colors.red(err));
    }

    /**
     * 输出react编译时产生的错误信息
     */
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

    /**
     * 输出less编译时产生的错误信息
     */
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

/**
 * Gulp任务
 */
class Task {
    constructor() {
        this.combinerErrHandler = new CombinerErrHandler();
    }

    /**
     * 刷新gulp-connect
     * @param {srcPath,distDir} p 被修改目标的路径信息
     */
    reload(p) {
        setTimeout(() => {
            gulp.src(p.srcPath)
                .pipe($.connect.reload());
        }, 300);
    }

    /**
     * 压缩html
     * @param {srcPath,distDir} p 压缩目标的路径信息
     */
    html(p) {
        if (configs.isSourcemaps)
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
        else
            combiner.obj([
                gulp.src(p.srcPath),
                $.htmlmin({
                    collapseWhitespace: true,
                    minifyJS: true
                }),
                gulp.dest(p.distDir),
                $.callback(() => {
                    this.reload(p);
                })
            ]).on('error', this.combinerErrHandler.common);
        return this;
    }

    /**
     * 编译&合并&压缩react&es6、
     * @param {srcPath,distDir} p reactjs文件的路径信息
     */
    react(p) {
        if (configs.isSourcemaps)
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
            ]).on('error', this.combinerErrHandler.react);
        else
            combiner.obj([
                gulp.src(p.srcPath),
                $.babel({
                    "presets": ['es2015', 'react']
                }),
                $.concat('all.js'),
                gulp.dest(p.distDir),
                $.uglify(),
                $.rename(p => {
                    p.extname = '.min.js';
                }),
                gulp.dest(p.distDir),
                $.callback(() => {
                    this.reload(p);
                })
            ]).on('error', this.combinerErrHandler.react);
        return this;
    }

    /**
     * 编译less文件
     * @param {srcPath,distDir} p less文件的路径信息
     */
    less(p) {
        if (configs.isSourcemaps)
            combiner.obj([
                gulp.src(p.srcPath),
                $.sourcemaps.init(),
                $.less(),
                $.sourcemaps.write('./'),
                gulp.dest(p.distDir),
                $.callback(() => {
                    this.reload(p);
                })
            ]).on('error', this.combinerErrHandler.less);
        else
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

    rubySass(p) {
        if (configs.isSourcemaps)
            combiner.obj([
                $.rubySass(p.srcPath, {
                    sourcemap: true
                }).on('error', $.rubySass.logError),
                $.sourcemaps.write('./'),
                gulp.dest(p.distDir),
                $.callback(() => {
                    this.reload(p);
                })
            ]);
        else
            combiner.obj([
                $.rubySass(p.srcPath).on('error', $.rubySass.logError),
                gulp.dest(p.distDir),
                $.callback(() => {
                    this.reload(p);
                })
            ]);
        return this;
    }

    sass(p) {
        if (configs.isSourcemaps)
            combiner.obj([
                gulp.src(p.srcPath),
                $.sourcemaps.init(),
                $.sass().on('error', $.sass.logError),
                $.sourcemaps.write('./'),
                gulp.dest(p.distDir),
                $.callback(() => {
                    this.reload(p);
                })
            ]);
        else
            combiner.obj([
                gulp.src(p.srcPath),
                $.sass().on('error', $.sass.logError),
                gulp.dest(p.distDir),
                $.callback(() => {
                    this.reload(p);
                })
            ]);
    }

    /**
     * 添加浏览器前缀&合并&压缩css
     * @param {srcPath,distDir} p css文件的路径信息
     */
    css(p) {
        let autoprefixer = require('autoprefixer');
        if (configs.isSourcemaps)
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
        else
            combiner.obj([
                gulp.src(p.srcPath),
                $.postcss([autoprefixer()]),
                $.concat('all.css'),
                gulp.dest(p.distDir),
                $.cleanCss({
                    compatibility: 'ie8'
                }),
                $.rename(p => {
                    p.extname = '.min.css';
                }),
                gulp.dest(p.distDir),
                $.callback(() => {
                    this.reload(p);
                })
            ]).on('error', this.combinerErrHandler.common);
        return this;
    }
}


gulp.task('watch', () => {
    $.watch(configs.reactjs, event => {
        new Log(event).cb(path => {
            new Task()
                .react({
                    srcPath: configs.reactjs,
                    distDir: configs.concatJs
                });
        });
    });

    $.watch(configs.html, event => {
        new Log(event).cb(path => {
            new Task()
                .html(path);
        });
    });

    $.watch(configs.less, event => {
        new Log(event, false).cb(path => {
            new Task()
                .less(path);
        });
    });

    $.watch(configs.scss, event => {
        new Log(event, false).cb(path => {
            new Task()
                .rubySass(path);
        });
    });

    $.watch(configs.css, event => {
        new Log(event).cb(path => {
            new Task()
                .css({
                    srcPath: configs.css,
                    distDir: configs.concatCss
                });
        });
    });
});

gulp.task('connect', () => {
    $.connect.server({
        port: configs.port,
        root: './',
        livereload: true
    });
});

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
        .rubySass({
            srcPath: configs.scss,
            distDir: configs.srcDir
        })
        .css({
            srcPath: configs.css,
            distDir: configs.concatCss
        });
});

gulp.task('default', ['connect', 'watch']);
