//带页脚的弹框html
var hasFooterDialogHtml =
    '<article bh-layout-role="single">' +
    '<h2>标题</h2>' +
    '<section>内容</section>' +
    '<footer><a onclick="closeDialog();" class="bh-btn bh-btn-primary" href="javascript:void(0)">关闭</a></footer>' +
    '</article>';

//不带页脚的弹框html
var noFooterDialogHtml =
    '<article bh-layout-role="single">' +
    '<h2>标题</h2>' +
    '<section>内容</section>' +
    '</article>';

$('div.e2e-opt').on('click', 'button', function () {
    var action = $(this).attr('data-action');
    switch (action) {
        //没有页脚的弹框
        case "openNoFooter":
            $.bhPaperPileDialog.show({
                content: noFooterDialogHtml
            });
            break;
        //有页脚的弹框
        case "openHasFooter":
            $.bhPaperPileDialog.show({
                content: hasFooterDialogHtml
            });
            break;
        //没有关闭按钮的弹框
        case "noCloseIcon":
            $.bhPaperPileDialog.show({
                hideCloseIcon: true,
                content: hasFooterDialogHtml
            });
            break;
        case "openCallback":
            $.bhPaperPileDialog.show({
                content: hasFooterDialogHtml,
                render: function ($header, $section, $footer, $aside) {
                    alert('DOM加载完成,动画执行完毕前的回调');
                },
                ready: function($header, $section, $footer, $aside){
                    alert('动画执行完毕的回调');
                }
            });
            break;
        case "closeCallback":
            $.bhPaperPileDialog.show({
                content: hasFooterDialogHtml,
                closeBefore: function(){
                    return confirm('关闭弹框前的回调,返回false阻止弹框关闭,返回true弹框关闭');
                },
                close: function(){
                    alert('弹框关闭动画结束后的回调');
                }
            });
            break;
        case "dialogHeightChange":
            $.bhPaperPileDialog.show({
                content: hasFooterDialogHtml,
                ready: function($header, $section, $footer, $aside){
                    $section.append(
                        '<a onclick="addContent()" class="bh-btn bh-btn-warning" href="javascript:void(0);">点击添加内容</a>'+
                        '<a onclick="footerAdaptive()" class="bh-btn bh-btn-primary" href="javascript:void(0);">点击使页脚自适应</a>'
                    );
                }
            });
            break;
    }
});

//手动调用关闭弹框的方法
function closeDialog() {
    $.bhPaperPileDialog.hide();
}

//弹框高度变化时,手动使页脚自适应的方法
function footerAdaptive() {
    $.bhPaperPileDialog.resetPageFooter();
    $.bhPaperPileDialog.resetDialogFooter();
}

function addContent() {
    var contentHhtml = '填充内容<br>';
    for(var i=0; i<20; i++){
        contentHhtml += '填充内容<br>';
    }
    $('.bh-paper-pile-body').children('section').append(contentHhtml);
}