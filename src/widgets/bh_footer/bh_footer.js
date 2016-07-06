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
            this.settings = $.extend({}, $.fn.bhHeader.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            init(this.settings, this.$element);
        }
        return Plugin;

    })();

    function init(options, dom){
        var _html = getFooterHtml(options);
        dom.html(_html).attr("bh-footer-role", "footer").addClass("bh-footer");
    }

    function getFooterHtml(options){
        var _html = '<div class="bh-footer-content">'+options.text+'</div>';
        return _html;
    }

    function setFooterOnBottom(dom, options){

    }


    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhFooter = function (options) {
        return this.each(function () {
            return new Plugin(this, options);
        });
    };

    /**
     * 插件的默认值
     */
    $.fn.bhFooter.defaults = {
        text: ""
    };
})(jQuery);