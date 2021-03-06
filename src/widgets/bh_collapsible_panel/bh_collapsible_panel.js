/**
 * 可折叠面板
 *
 */
(function ($) {
    /**
     * 定义一个插件
     */
    var Plugin;

    /**
     * 这里是一个自运行的单例模式。
     */
    Plugin = (function () {

        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.bhCollapsiblePanel.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            init(this.settings, this.$element);
        }

        //展开面板
        Plugin.prototype.expandPanel = function () {
            var switchBtn = this.$element.find('[bh-collapsible-panel-flag="switch"]');
            expandPanel(switchBtn,this.settings);
        };
        //收缩面板
        Plugin.prototype.collapsePanel = function () {
            var switchBtn = this.$element.find('[bh-collapsible-panel-flag="switch"]');
            collapsePanel(switchBtn,this.settings);
        };

        return Plugin;

    })();

    function init(options, dom){
        var content = dom.html();
        //初始化头部
        var _html = getPanelHtml(options);
        dom.html(_html);
        var $block = $(".bh-collapsible-panel-content",dom);
        $block.append(content);
        dom.show();
        $block.data("height",$block.outerHeight());
        $block.css("height",0).hide();
        addEventListener(dom,options);
    }

    function addEventListener(dom,options){
        dom.on("click",'.bh-collapsible-panel',function(e){
            e = e || window.event;
            var targetNode = e.target || e.srcElement;
            if($(targetNode).attr("bh-collapsible-panel-flag") == "switch"){
                if($(targetNode).attr("bh-collapsible-panel-role") == "expand"){
                    expandPanel($(targetNode),options);
                }else{
                    collapsePanel($(targetNode),options);
                }
            }else if($(targetNode).hasClass("bh-collapsible-panel")) {
                var switchBtn = $(this).find('[bh-collapsible-panel-flag="switch"]');
                if(switchBtn.attr("bh-collapsible-panel-role") == "expand"){
                    expandPanel(switchBtn,options);
                }
            }else if($(targetNode).closest(".bh-collapsible-panel-toolbar").length == 0){
                var $parent = $(targetNode).closest(".bh-collapsible-panel");
                var switchBtn = $parent.find('[bh-collapsible-panel-flag="switch"]');
                if(switchBtn.attr("bh-collapsible-panel-role") == "expand"){
                    expandPanel(switchBtn,options);
                }
            }
        });
    }

    function getPanelHtml(options){
        var panelClass = "bh-collapsible-panel";
        if(options.hasBorder){
            panelClass+=" has-border";
        }
        var _html ='<div class="'+panelClass+'">'+
            '<h3 class="bh-collapsible-panel-title">'+options.title+'</h3>'+
            options.tag+
            '<div class="bh-text-caption bh-caption-default">'+options.caption+'</div>'+
            '<div class="bh-collapsible-panel-toolbar">'+
            options.toolbar +
            '<a href="javascript:void(0);" class="bh-btn-link" bh-collapsible-panel-flag="switch" bh-collapsible-panel-role="expand">展开</a>'+
            '</div>'+
            '<div class="bh-collapsible-panel-content bh-collapsible-panel-animate">'+
            '</div>'+
            '</div>';
        return _html;
    }

    function collapsePanel(target,options){
        if(options && options.beforeCollapse){
            options.beforeCollapse(target);
        }
        var $block = $(target).closest(".bh-collapsible-panel").find(".bh-collapsible-panel-content");
        $block.css({"height": 0});
        var $card = $block.parent();
        setTimeout(function(){
            $block.hide();
            $card.removeClass("bh-card bh-card-lv2");
        }, getAnimateTime());
        var switchBtn = $card.find("[bh-collapsible-panel-flag='switch']");
        switchBtn.text("展开");
        switchBtn.attr("bh-collapsible-panel-role","expand");
        if(options && options.afterCollapse){
            setTimeout(function(){
                options.afterCollapse(target);
            }, getAnimateTime());
        }
    }
    function expandPanel(target,options){
        if(options && options.beforeExpand){
            options.beforeExpand(target);
        }
        var $block = $(target).closest(".bh-collapsible-panel").find(".bh-collapsible-panel-content");
        var $card = $block.parent();
        //给自己加阴影
        $card.addClass("bh-card bh-card-lv2");

        var height = $block.data("height");
        $block.show();
        setTimeout(function(){
            $block.css({"height": height});
        }, 1);
        $(target).text("收起");
        $(target).attr("bh-collapsible-panel-role","collapse");
        if(options && options.afterExpand){
            setTimeout(function(){
                options.afterExpand(target);
            }, getAnimateTime());
        }
    }
    /**
     * 动画的执行的基础时间
     * @returns {number}
     */
    function getAnimateTime(){
        return 450;
    }
    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhCollapsiblePanel = function (options, params) {
        var instance;
        instance = this.data('bhCollapsiblePanel');
        /**
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('bhCollapsiblePanel', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        /**
         * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
         * 如 $('#id').plugin('doSomething') 则实际调用的是 $('#id).plugin.doSomething();
         * doSomething是刚才定义的接口。
         * 这种方法 在 juqery ui 的插件里 很常见。
         */
        if ($.type(options) === 'string') instance[options](params);
        return this;
    };

    /**
     * 插件的默认值
     */
    $.fn.bhCollapsiblePanel.defaults = {
        title:"", //大标题内容，可以是传纯文本或html
        tag:"", //标签html
        caption:"", //小标题内容，可以是传纯文本或html
        toolbar:"", //工具栏的DOM的Html
        hasBorder:true, //是否显示边框
        beforeExpand:null, //展开面板前的回调
        afterExpand:null, //展开面板后的回调
        beforeCollapse:null, //收缩面板前的回调
        afterCollapse:null //收缩面板后的回调
    };
})(jQuery);