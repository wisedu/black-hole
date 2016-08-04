import gulp from 'gulp';
import browserSync from 'browser-sync';
import minifyCSS from 'gulp-minify-css';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import sass from 'gulp-sass';
import fs from 'fs';
import uglify from 'gulp-uglify';
import path from 'path';
import os from 'os';
var exec = require('child_process').exec;

//全局配置项
var gulpConfig = {
    //添加前缀
    prefixerScheme: ['> 1%', 'last 2 versions', 'Android >= 4.0', 'iOS >= 8'],
    //bh css编译路径
    cssWritePath: './build/css/',
    //widget的css编译路径
    cssWidgetWritePath: './build/widgets/',
    //widget的js编译路径
    jsWidgetWritePath: './build/widgets/',
    //bh js的编译路径
    jsWritePath: './build/js/',
    //皮肤列表
    skins: [
        'blue', 'colorE', 'green', 'lightBlue', 'purple'
    ]
};


////////////////////////////////////////
// browser-sync
////////////////////////////////////////
gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: __dirname,
            index: 'index.html',
            directory: true
        },
        files: [],
        watchOptions: {
            //debounceDelay: 400
        },
        ghostMode: false,
        notify: false
    });
});



////////////////////////////////////////
// 编译样式
////////////////////////////////////////
gulp.task('style', ['css-all', 'css-widget'], function() {});

//编译bh样式,不包括场景样式
gulp.task('css-all', function() {
    var skins = gulpConfig.skins;
    var skinsLen = gulpConfig.skins.length;

    //多套皮肤编译
    for (var k = 0; k < skinsLen; k++) {
        var skin = skins[k];
        var writePath = gulpConfig.cssWritePath + skin;
        gulp.src([
                './src/sass/skins/' + skin + '/*.scss',
                './src/sass/base/global.scss',
                './src/sass/mixins/*.scss',
                './src/sass/base/reset.scss',
                './src/sass/base/utils.scss',
                './src/sass/bh/*.scss',
                './src/widgets/**/*.scss'
            ])
            .pipe(concat('bh-2.0.scss'))
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: gulpConfig.prefixerScheme
            }))
            .pipe(gulp.dest(writePath))
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(minifyCSS())
            .pipe(gulp.dest(writePath))
    }
});

//单独编译widget样式
gulp.task('css-widget', function() {
    var widgets = scanFolder('./src/widgets');
    var files = widgets.files;
    var filesLen = files.length;

    var skins = gulpConfig.skins;
    var skinsLen = gulpConfig.skins.length;
    //多套皮肤编译
    for (var k = 0; k < skinsLen; k++) {
        var skin = skins[k];
        //单个widget样式编译
        for (var i = 0; i < filesLen; i++) {
            var fileItem = files[i];
            if (!/\.scss$/.test(fileItem)) {
                continue;
            }
            var srcList = [
                './src/sass/skins/' + skin + '/*.scss',
                './src/sass/base/global.scss',
                './src/sass/mixins/*.scss',
                fileItem
            ];
            var fileName = fileItem.substring(fileItem.lastIndexOf('/') + 1, fileItem.length);

            var fileNameIndex = fileItem.indexOf(fileName);
            var folderName = fileItem.substring(fileItem.lastIndexOf('/', fileNameIndex - 2) + 1, fileNameIndex - 1);
            var writePath = gulpConfig.cssWidgetWritePath + folderName + '/' + skin;
            gulp.src(
                    srcList
                )
                .pipe(concat(fileName))
                .pipe(sass().on('error', sass.logError))
                .pipe(autoprefixer({
                    browsers: gulpConfig.prefixerScheme
                }))
                .pipe(gulp.dest(writePath))
                .pipe(rename({
                    suffix: '.min'
                }))
                .pipe(minifyCSS())
                .pipe(gulp.dest(writePath))
        }
    }

});

//循环获取所有的文件
function scanFolder(path) {
    var fileList = [],
        folderList = [],
        walk = function(path, fileList, folderList) {
            var files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '/' + item,
                    stats = fs.statSync(tmpPath);

                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, folderList);
                    folderList.push(tmpPath);
                } else {
                    fileList.push(tmpPath);
                }
            });
        };

    walk(path, fileList, folderList);

    console.log('扫描' + path + '成功');

    return {
        'files': fileList,
        'folders': folderList
    }
}


//编译js
gulp.task('script', ['js_all', 'js_widget'], function() {

});


//编译bh js
gulp.task('js_all', function() {
    gulp.src([
            './src/js/bh.js',
            './src/widgets/**/*.js'
        ])
        .pipe(concat('bh-2.0.js')) //合并所有js到bh.js
        .pipe(gulp.dest(gulpConfig.jsWritePath)) //输出到文件夹
        .pipe(rename({
            suffix: '.min'
        })) //rename压缩后的文件名
        .pipe(uglify()) //压缩
        .pipe(gulp.dest(gulpConfig.jsWritePath));
});

//编译单个widget js
gulp.task('js_widget', function() {
    var widgets = scanFolder('./src/widgets');
    var files = widgets.files;

    var filesLen = files.length;
    for (var i = 0; i < filesLen; i++) {
        var fileItem = files[i];
        if (!/\.js$/.test(fileItem)) {
            continue;
        }
        var fileName = fileItem.substring(fileItem.lastIndexOf('/') + 1, fileItem.length);

        var fileNameIndex = fileItem.indexOf(fileName);
        var folderName = fileItem.substring(fileItem.lastIndexOf('/', fileNameIndex - 2) + 1, fileNameIndex - 1);
        gulp.src(
                fileItem
            )
            .pipe(gulp.dest(gulpConfig.jsWidgetWritePath + folderName)) //输出到文件夹
            .pipe(rename({
                suffix: '.min'
            })) //rename压缩后的文件名
            .pipe(uglify()) //压缩
            .pipe(gulp.dest(gulpConfig.jsWidgetWritePath + folderName));
    }
});

//监听文件变化,执行编译动作
gulp.task('watch', function() {
    //监听js文件,并编译
    gulp.watch(['./src/js/**/*.js', './src/widgets/**/*.js'], ['script']);
    gulp.watch(['./src/widgets/**/*.js'], ['jsdoc']);
    gulp.watch(['./src/sass/**/*.scss', './src/widgets/**/*.scss'], ['style']);
    gulp.watch(['./src/fixture/**/*.{js,html}'], ['compile_example']);
});


//编译jsdoc
gulp.task('jsdoc', function() {
    var _cmd = 'jsdoc -c jsdoc-config.json -r';
    if (os.platform().indexOf('win') !== -1) {
        _cmd = 'jsdoc -c jsdoc-config-win.json -r';
    }
    exec(_cmd, function(err, stdout, stderr) {
        if (err) {
            console.log('jsdoc 出错了:' + stderr);
        } else {
            console.log('jsdoc 创建完成了 !');
        }
    });
});

//编译示例
gulp.task('example', ['get_template', 'compile_example'], function() {

});

//获取外框html
gulp.task('get_template', function() {
    getTemplateHtml();
});

//合并和编译示例文件
gulp.task('compile_example', function() {
    var widgets = scanFolder('./src/fixture');
    var files = widgets.files;
    var filesLen = files.length;

    for (var k = 0; k < filesLen; k++) {
        var filePath = files[k];
        //忽略template下的文件
        if (/\/template\//.test(filePath)) {
            continue;
        }

        //html文件处理
        if (/\.html$/.test(filePath)) {
            compileExampleFile(filePath);
        } else if (/\.js$/.test(filePath)) {
            //js文件处理
            var writePath = filePath.replace('./src/fixture', './examples');
            writePath = writePath.substring(0, writePath.lastIndexOf('/'));
            gulp.src(
                filePath
            ).pipe(gulp.dest(writePath))
        }
    }
});

//获取外框的html文件并缓存
function getTemplateHtml() {
    gulpConfig.templateHtml = fs.readFileSync("./src/fixture/template/template.html", 'utf-8');
}

//读取示例文件,然后进行写操作
function compileExampleFile(filePath) {
    fs.readFile(filePath, 'utf-8', function(err, data) {
        if (err) {
            console.log("error");
        } else {
            writeExampleFile(data, filePath)
        }
    });
}

//将读取到的示例文件与模板文件合并,然后写入example文件夹
function writeExampleFile(content, filePath) {
    var templateHtml = gulpConfig.templateHtml;
    var newContent = templateHtml.replace('<!--body-->', content);
    var writePath = filePath.replace('./src/fixture', './examples');

    mkdirsSync(writePath.substring(0, writePath.lastIndexOf('/')), '0777');

    fs.writeFile(writePath, newContent, function(err) {
        if (err)
            console.log("fail " + err);
        else
            console.log("写入文件ok");
    });
}

//根据路径检查和创建文件夹
//mode '0777'是读写权限
function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            } else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}

gulp.task('default', ['style', 'script', 'jsdoc', 'example', 'watch', 'browser-sync'], function() {
    gulp.watch([
        './build/**/*.{js,css,html}',
        './examples/**/*.{js,css,html}',
        './scenes/**/*.{js,css,html}',
        './docs/**/*.{js,css,html}'
    ]).on('change', function(changedFile) {
        gulp.src(changedFile.path)
            .pipe(browserSync.reload({
                stream: true,
                once: true
            }));
    });
});