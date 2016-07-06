/**
 * 类似于纵向tab页签
 */
(function ($) {
    /**
     * 定义一个插件
     */
    var Plugin;

    var activeId,source,$linkContainer,$contentContainer,mode;
    /**
     * 这里是一个自运行的单例模式。
     */
    Plugin = (function () {

        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.bhMenu.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            init(this.settings, this.$element);
        }
        Plugin.prototype.enableItem = function(index) {
            enableByIndex(index);
        };
        Plugin.prototype.disableItem = function(index) {
            disableByIndex(index);
        };
        return Plugin;

    })();

    function init(options, dom){
        //初始化头部
        source = options.source;
        $linkContainer = dom;
        $contentContainer = options.contentContainer;
        mode = options.mode;
        var _html = getLinkDom(options.source);
        $linkContainer.html(_html);
        initActive(options.activeIndex);
        addEventListener(options);
    }

    function initActive(_index){
        var menuId = getIdByIndex(_index);
        setActive(menuId);
    }

    function setActive(menuId){
        if(menuId == null) return;
        var $menuItem = $linkContainer.find(".bh-menu-link-item[menuId='"+menuId+"']");
        //qiyu 2016-6-22 当activeChange事件返回false时，不要跳转tab页，需求人：吴涛
        // $menuItem.addClass("bh-active");
        var text = $menuItem.text();
        var title = $menuItem.attr("data-title");

        //qiyu 2016-6-22 当activeChange事件返回false时，不要跳转tab页，需求人：吴涛
        var flag = $linkContainer.triggerHandler("activeChange", [menuId, text, title, $menuItem]);
        if(flag === false)return false;

        if(activeId){
            $linkContainer.find(".bh-menu-link-item[menuId='"+activeId+"']").removeClass("bh-active");
            $contentContainer.find(".bh-menu-content[id='"+activeId+"']").hide();
        }
        activeId = menuId;

        $menuItem.addClass("bh-active");

        $contentContainer.find(".bh-menu-content[id='"+activeId+"']").show();
        //qiyu 2016-6-22 当activeChange事件返回false时，不要跳转tab页，需求人：吴涛
        //给菜单项绑定激活项改变事件，返回菜单id,text和该节点
        // $linkContainer.trigger("activeChange", [menuId, text, title, $menuItem]);
    }

    function getIdByIndex(_index){
        var id = null;
        if(source){
            id = source[_index]["id"];
        }
        return id;
    }
    function addEventListener(){
        $linkContainer.on("click",".bh-menu-link-item",function(){
            if($(this).hasClass("bh-disabled")) return false;
            if(mode == "link"){
                var _url = $(this).attr("menu-data-url");
                window.open(_url);
            }else{
                var menuId = $(this).attr("menuId");
                setActive(menuId);
            }
        });
    }
    function disableByIndex(_index){
        var _id = getIdByIndex(_index);
        $linkContainer.find(".bh-menu-link-item[menuId='"+_id+"']").addClass("bh-disabled");
    }
    function enableByIndex(_index){
        var _id = getIdByIndex(_index);
        $linkContainer.find(".bh-menu-link-item[menuId='"+_id+"']").removeClass("bh-disabled");
    }
    function getLinkDom(_data){
        var _html = '';
        if(_data){
            _html = '<div class="bh-menu-link">';
            for(var i=0,len=_data.length;i<len;i++){
                _html+=getLinkItemDom(_data[i]);
            }
            _html += '</div>';
        }
        return _html;
    }
    function getLinkItemDom(_data){
        var _html = '';
        if(_data){
            if(mode == "link"){
                _html = '<div class="bh-menu-link-item" menuId="'+_data.id+'" menu-data-url="'+_data.url+'" data-title="'+_data.title+'">';
            }else{
                _html = '<div class="bh-menu-link-item" menuId="'+_data.id+'" data-title="'+_data.title+'">';
            }
            _html += _data.title;
            _html += '</div>';
        }
        return _html;
    }
    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhMenu = function (options, params) {
        var instance;
        instance = this.data('bhMenu');
        /**
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('bhMenu', new Plugin(this, options));
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
    $.fn.bhMenu.defaults = {
        source:[], //菜单项的数据 id,title 如果是mode="link"需要传url
        activeIndex:0, //默认选中第几项
        contentContainer:$("body"), //内容所在的容器
        mode:"tab" //支持页面跳转还是tab页切换 支持两个值link/tab
    };
})(jQuery);