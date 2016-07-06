(function ($) {
    $.bhAsideNav = {
        //初始化方法
        /**
         * data数据格式
         {
             text: "应用管理",
             icon: "icon-viewmodule",
             href: " "
             children: [
                 {text: "收到的消息"}
             ]
         }
         */
        "init": function(options){
            var navDefaults = {
                title: "",  //标题
                iconFont: "", //字体图标的总类名
                data: [], //导航列表
                hide: null, //可选，点击关闭按钮的回调
                ready: null //可选，初始化并渲染完成的回调
            };
            options = $.extend({}, navDefaults, options);
            _init(options);
        },
        //显示侧边导航方法
        "show": function(options){
            _show();
        },
        //隐藏侧边导航方法
        "hide": function(options){
            var navDefaults = {
                hide: null //可选，点击关闭按钮的回调
            };
            options = $.extend({}, navDefaults, options);
            _hide(options);
        },
        //销毁侧边导航
        "destroy": function(options){
            _destroy();
        }
    };

    //动画执行基本时间
    function getAnimateTime(){
        return 450;
    }
    //每个li的高度
    function getLiHeight(){
        return 42;
    }

    function _init(options){
        //导航标题html
        var headerHtml = getNavHeaderHtml(options);
        //导航列表html
        var contentHtml = getNavContentHtml(options);
        //导航遮盖层html
        var backdropHtml = getNavModelBackdrop();
        //将导航添加到body
        $("body").append('<div class="bh-asideNav-container bh-animated bh-outLeft" style="display: none;" bh-aside-nav-role="bhAsideNav">' + headerHtml + contentHtml + '</div>'+backdropHtml);

        //导航事件监听
        navEventListen();
        //初始化完成的回调
        if(options && typeof options.ready !='undefined' && options.ready instanceof Function){
            options.ready();
        }
    }

    //导航遮盖层html
    function getNavModelBackdrop(){
        var _html = '<div class="bh-modal-backdrop bh-animated bh-asideNav-fadeOut" style="display: none;" bh-aside-nav-role="bhAsideNavBackdrop"></div>';
        return _html;
    }

    //导航标题html
    function getNavHeaderHtml(options){
        var _html =
            '<div class="bh-asideNav-top">' +
                '<h1>'+options.title+'</h1>' +
                '<div class="bh-asideNav-top-close">' +
                    '<i class="iconfont icon-close" bh-aside-nav-role="bhAsideNavCloseBtn"></i>' +
                '</div>' +
            '</div>';
        return _html;
    }

    //导航列表html
    function getNavContentHtml(options){
        var data = options.data;
        var dataLen = data.length;
        var iconFont = options.iconFont;

        var navHtml = "";
        if(dataLen > 0){
            for(var i=0; i<dataLen; i++){
                var dataGroup = data[i];
                var dataGroupLen = dataGroup.length;
                if(dataGroupLen>0){
                    //是否是组里的最末元素
                    var isLastItemInGroup = false;
                    for(var j=0;j<dataGroupLen;j++){
                        //最后一组不加分割线
                        if(i < dataLen-1){
                            if(j==dataGroupLen-1){
                                isLastItemInGroup = true;
                            }else{
                                isLastItemInGroup = false;
                            }
                        }
                        var dataItem = dataGroup[j];
                        var dataChild = dataItem.children;
                        //当存在子元素时，拼接子元素列表的html
                        if(dataChild && dataChild.length > 0){
                            var childsHtml = "";
                            var childLen = dataChild.length;
                            if(childLen > 0){
                                for(var k=0; k<childLen; k++){
                                    childsHtml += getNavLiHtml(dataChild[k], iconFont, "child", false);
                                }
                                childsHtml = '<ul class="bh-asideNav">' + childsHtml + '</ul>';
                            }
                            navHtml += getNavLiHtml(dataItem, iconFont, "", isLastItemInGroup).replace("@childContent", childsHtml);
                        }else{
                            navHtml += getNavLiHtml(dataItem, iconFont, "", isLastItemInGroup);
                        }
                    }
                }

            }
        }
        navHtml = '<div class="bh-asideNav-list"><ul class="bh-asideNav">' + navHtml + '</ul></div>';
        return navHtml;
    }

    //获取单个li的html
    function getNavLiHtml(dataItem, iconFont, flag, isLastItemInGroup){
        var text = dataItem.text;
        var icon = dataItem.icon;
        var href = dataItem.href;
        //li的class名
        var liClass = '';
        var hasChild = false;
        //当该节点是子元素时li的class为空
        if(flag === "child"){
            liClass = "";
        }else{
            //当该元素存在子元素的列名
            if(dataItem.children && dataItem.children.length > 0){
                liClass = 'bh-asideNav-dropdown';
                hasChild = true;
            }
        }

        if(!href){
            //当href没有的处理
            href = "javascript:void(0);"
        }
        if(isLastItemInGroup){
            liClass += " bh-asideNav-splite";
        }
        var _html =
            '<li class="@liClass">' +
                '<a href="@href">' +
                    '<div><i class="@iconFont @iconName"></i>@text</div>' +
                '</a>' +
                '@childContent' +
            '</li>';

        _html = _html.replace("@liClass", liClass).replace("@href", href).replace("@iconFont", iconFont)
            .replace("@iconName", icon).replace("@text", text);
        //当该节点没有子元素时，将子元素的占位符删掉
        if(!hasChild){
            _html = _html.replace("@childContent", "");
        }
        return _html;
    }

    function navEventListen(options){
        var $nav = $("[bh-aside-nav-role=bhAsideNav]");
        //点击关闭按钮
        $nav.on("click", "[bh-aside-nav-role=bhAsideNavCloseBtn]", function(){
            _hide(options);
        });
        var $backdrop = $("[bh-aside-nav-role=bhAsideNavBackdrop]");
        $backdrop.on("click", function(){
            _hide(options);
        });

        //点击有子元素的节点的打开和关闭处理
        $nav.on("click", ".bh-asideNav-dropdown > a", function () {
            var $li = $(this).parent();
            //当该元素是未打开状态，将所有有子元素的节点的高都设为默认高，然后再计算当前元素的高
            if (!$li.hasClass("bh-asideNav-open")) {
                $nav.find(".bh-asideNav-dropdown").css({"height": getLiHeight()+"px"});
                var $childNav = $li.find(".bh-asideNav");
                var $lis = $childNav.children("li");
                var liLen = $lis.length;
                var allLiLen = liLen + 1;
                var childNavHeight = getLiHeight() * allLiLen;
                $nav.find(".bh-asideNav-open").removeClass("bh-asideNav-open");
                $li.addClass("bh-asideNav-open").css({"height": childNavHeight+"px"});
            }else{
                //在其他状态下都将节点的高设为默认高
                var liHeight = getLiHeight();
                $li.removeClass("bh-asideNav-open").css({"height": liHeight+"px"});
            }
            setTimeout(function(){
                $(".bh-asideNav-container").getNiceScroll().resize();
            }, getAnimateTime());

        });

        //点击所有节点是否移除active的处理
        $nav.on("click", ".bh-asideNav li>a", function () {
            var $li = $(this).closest("li");
            $nav.find(".bh-asideNav-active").removeClass("bh-asideNav-active");
            $li.addClass("bh-asideNav-active");
            //当被点击的元素没有子元素时，将导航隐藏
            if(!$li.hasClass("bh-asideNav-dropdown")){
                _hide(options);
            }
        });

        $(".bh-asideNav-container").niceScroll({cursorborder:"none",hidecursordelay:10,autohidemode:"scroll"});
    }

    //显示导航栏
    function _show(){
        var $nav = $("[bh-aside-nav-role=bhAsideNav]");
        var $backdrop = $("[bh-aside-nav-role=bhAsideNavBackdrop]");
        $nav.removeClass("bh-outLeft").addClass("bh-intoLeft").show();
        $backdrop.removeClass("bh-asideNav-fadeOut").addClass("bh-asideNav-fadeIn").show();
        setTimeout(function(){
            $(".bh-asideNav-container").getNiceScroll().resize();
        }, getAnimateTime());

    }

    //隐藏导航栏，当有回调时只行回调
    function _hide(options){
        var $nav = $("[bh-aside-nav-role=bhAsideNav]");
        var $backdrop = $("[bh-aside-nav-role=bhAsideNavBackdrop]");
        $nav.removeClass("bh-intoLeft").addClass("bh-outLeft");
        $backdrop.removeClass("bh-asideNav-fadeIn").addClass("bh-asideNav-fadeOut");
        setTimeout(function(){
            $backdrop.hide();
            $(".bh-asideNav-container").getNiceScroll().resize();
            if(options && typeof options.hide !='undefined' && options.hide instanceof Function){
                options.hide();
            }
        }, getAnimateTime());
    }

    //销毁导航栏
    function _destroy(){
        $("[bh-aside-nav-role=bhAsideNav]").remove();
        $("[bh-aside-nav-role=bhAsideNavBackdrop]").remove();
    }
})(jQuery);

