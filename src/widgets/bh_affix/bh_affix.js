(function ($) {
    /**
     * 页面滚动，使元素块变浮动
     * @param data
     */
    $.bhAffix = function(data){
        var bhAffixDefaults = {
            hostContainer: "", //期望浮动元素在页面滚动到达该容器的top值时变成浮动的容器, 后面简称“父容器”
            header: $("header.sc-head"), //普通头部
            miniHeader: $("header.sc-head-mini"), //迷你头部
            fixedContainer: "", //浮动元素
            offset: {} //自己调节浮动块的偏移，top和left
        };
        var options = $.extend({}, bhAffixDefaults, data);

        if(options.fixedContainer.length > 0){
            if(options.fixedContainer.attr("bh-affix-role") !== "bhAffix"){
                $('body').on("scroll.bhAffix", function(){
                    setBlockPosition();
                });

                options.fixedContainer.attr("bh-affix-role", "bhAffix");
            }
        }

        function setBlockPosition(){
            if(options.fixedContainer.length > 0){
                var $window = $(window);
                var scrollTop = $window.scrollTop();

                var hostOffset = options.hostContainer.offset();
                //父容器的top
                var hostTop = hostOffset.top;
                //父容器的left
                var hostLeft = hostOffset.left;
                //普通头部的高
                var headHeight = options.header ? options.header.outerHeight() : 0;
                var fixedContOffset = options.fixedContainer.offset();
                //浮动元素的top
                var fixedContTop = fixedContOffset.top;
                //浮动元素的left
                var fixedLeft = fixedContOffset.left;
                //浮动元素距离父容器的距离
                var diffHeight = fixedContTop - hostTop;
                //自定义偏移的top值
                var offsetTop = options.offset.top ? parseInt(options.offset.top, 10) : 0;
                //浮动元素距离顶部的距离
                diffHeight = diffHeight + offsetTop;

                //当滚动高度大于期望高度的处理
                if(scrollTop >= hostTop - offsetTop - headHeight){
                    //获取之前存放在浮动元素上的style（是已经计算好的style，避免重复计算）
                    var fixedStyleData = options.fixedContainer.data("bhAffixStyleData");
                    if(!fixedStyleData){
                        if(options.offset.left){
                            fixedLeft = fixedLeft + parseInt(options.offset.left, 10);
                        }
                        var toFixedTop = diffHeight;
                        if(options.miniHeader){
                            toFixedTop += options.miniHeader.outerHeight();
                        }else{
                            toFixedTop += headHeight;
                        }
                        //计算后的浮动style
                        fixedStyleData = {"left": fixedLeft+"px", "position":"fixed", "top": toFixedTop};
                        //浮动元素初始的style（用户自己设定的style，将其缓存起来，避免清除浮动style时将用户的style清掉）
                        var _style = options.fixedContainer.attr("style");
                        //将计算的和元素的style存入浮动元素中
                        options.fixedContainer.data("beforeBhAffixStyle", _style).data("bhAffixStyleData", fixedStyleData);
                    }

                    options.fixedContainer.css(fixedStyleData).data("bhAffixFlag",true).addClass('bh-affix-fixedFlag');
                }else{
                    //取消元素浮动的处理，替换style为用户自己设定的style
                    var _style = options.fixedContainer.data("beforeBhAffixStyle");
                    var fixedFlag = options.fixedContainer.data("bhAffixFlag");
                    if(!_style){
                        _style = "";
                    }
                    if(fixedFlag){
                        options.fixedContainer.attr("style", _style);
                        options.fixedContainer.data("bhAffixFlag", false).removeClass('bh-affix-fixedFlag');
                    }
                }
            }
        }


    }
})(jQuery);