var exec = require('child_process').exec;

exec("jsdoc -c jsdoc-config.json -r", function(err,stdout,stderr) {
    if(err) {
        console.log('jsdoc 出错了:'+stderr);
    } else {
        console.log('jsdoc 创建完成了 !');
    }
});
