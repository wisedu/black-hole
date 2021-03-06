/** Class bhHeader
 * @fileOverview 页头
 * @example
 $("#stepwizard").bhHeader({
    items: [
        { stepId: "step1", title: "步骤向导-1" },
        { stepId: "step2", title: "步骤向导-2" },
        { stepId: "step3", title: "步骤向导-3" }
    ],
    active: "step3",//可选, 当前激活项的stepId
    finished: ['step2'], //可选, 当前已完成项的stepId数组,默认值为[]
    change: function () { } //可选, 焦点项变化的回调,默认值为null
});
 */
(function ($) {
    var Plugin;
    //全局变量
    var space = {
        nav : [],//缓存菜单数据
        //默认用户头像的图片，用于当用户图片出错时的展示
        defaultUserImg: 'data:image/png;base64,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'
    };

    /**
     * 页头组件
     * @class
     * @param options{string} 初始化参数／方法名
     * @param params{object} 方法参数
     * @returns {*}
     */
    $.fn.bhHeader = function (options, params) {
        var instance;
        instance = this.data('bhHeader');
        /***
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('bhHeader', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        /***
         * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
         * 如 $('#id').plugin('doSomething') 则实际调用的是 $('#id).plugin.doSomething();
         * doSomething是刚才定义的接口。
         * 这种方法 在 juqery ui 的插件里 很常见。
         */
        if ($.type(options) === 'string'){
            return instance[options](params);
        }
        return this;
    };

    /**
     * @description 内置默认值
     * @prop {boolean} openTheme  打开换肤功能，默认false是不打开
     * @prop {boolean} showAsideNav  显示左侧边导航按钮，默认false是不显示
     * @prop {string} logo  logo图片路径
     * @prop {string} title  页面名称
     * @prop {Array} icons  右侧的icon列表， 需传入的是icon-xxx
     * @prop {string} img  右侧的小图片路径
     * @prop {boolean} isNavHide  隐藏头部菜单，默认false不隐藏
     * @prop {Array} nav  头部菜单 [{"title":"填写申请表", "active":true}]， active是表示该菜单高亮
     * @type {{ isNavHide: boolean, nav: Array, dropMenu: Array, userInfo: {}, feedback: boolean, feedbackData: {sourceId: string, sourceName: string, uploadImageUrl: string, submitUrl: string}, appDetail: boolean, appDetailData: {appId: string, rootPath: string}, ready: null}}
     */
    $.fn.bhHeader.defaults = {
        openTheme: false, //是否打开换肤功能，false是不打开
        showAsideNav: false, //是否显示左侧边导航
        logo: "", //logo路径
        title: "", //页面名称
        icons: [], //右侧的icon， 需传入的是icon-xxx
        img: "", //右侧的小图片
        isNavHide: false, //头部菜单是否隐藏，默认false不隐藏
        nav: [], //头部菜单 [{"title":"填写申请表", "active":true}]， active是表示该菜单高亮
        dropMenu: [], //头部的角色下拉菜单
        userInfo: {}, //用户详情 {"image": "", "info": ["xx", "xx"]},image:显示的图片， info：要显示的信息，一条信息一行
        feedback: false, //问题反馈是否打开的标志，true是打开
        feedbackData: {
            "sourceId": "", //应用的id
            "sourceName": "", //应用的名称
            "uploadImageUrl": "", //
            "submitUrl": ""
        },
        appDetail: false, //应用详情是否打开的标志，true是打开
        appDetailData: {
            "appId": "", //应用的id
            "rootPath": "" //应用所在的根路径
        },
        ready: null //初始化完成回调
    };

    Plugin = (function () {

        /***
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.bhHeader.defaults, options);
            space.nav = this.settings.nav;
            space.isNavHide = this.settings.isNavHide;
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            space.$dom = this.$element;
            init(this.settings, this.$element);
        }

        //重置导航高亮位置
        Plugin.prototype.resetNavActive = function (options) {
            options = $.extend({}, {
                activeIndex: NaN  //高亮位置从1开始算起
            }, options);
            resetNavActive(options, this.$element);
        };

        //显示导航菜单
        Plugin.prototype.showNav = function (options) {
            showOrHideNav('show');
        };
        //隐藏导航菜单
        Plugin.prototype.hideNav = function (options) {
            showOrHideNav('hide');
        };

        return Plugin;

    })();

    function init(options, dom){
        //初始化头部
        var _html = getHeaderHtml(options);
        dom.html(_html);

        //初始化用户详情
        userInfoInit(options);
        //头部事件监听
        headerEventInit(dom, options);

        if(typeof options.ready !='undefined' && options.ready instanceof Function){
            options.ready();
        }

        //监听头部图片加载完成，计算nav导航的可用宽度
        listenImgLoadComplete(dom);

        $('html').on('click', function(e){
            var $targetObj = $(e.target || e.srcElement);
            //隐藏角色选择
            if($targetObj.closest('div[bh-header-role="roleBox"]').length > 0 || $targetObj.closest('div[bh-header-role="roleSwitch"]').length > 0 ){

            }else{
                $("[bh-header-role=roleBox]").removeClass("bh-active");
            }

            //隐藏个人信息
            if($targetObj.closest('div[bh-header-role="bhHeaderBarInfoBox"]').length > 0 || $targetObj.closest('img[bh-header-role="bhHeaderUserInfoIcon"]').length > 0 ){

            }else{
                $("[bh-header-role=bhHeaderBarInfoBox]").removeClass("bh-active");
            }
        })
    }

    function getHeaderHtml(data){
        var headerContent = getHeaderContentHtml(data);
        var _html = '<header class="bh-header sc-animated" bh-header-role="bhHeader">'+headerContent+'</header>';
        _html += '<header class="bh-header-mini sc-animated" bh-header-role="bhHeaderMini">'+headerContent+'</header>';
        _html += '<header class="bh-header-bg sc-animated"></header>';
        if(data.openTheme){
            _html += getThemePopUpBoxHtml();
        }
        return _html;
    }

    function getHeaderContentHtml(data){
        var _html =
            '<div class="bh-headerBar">' +
                '<div class="bh-headerBar-content bh-clearfix">' +
                    '@asideNavIcon'+
                    '@logo' +
                    '@title' +
                    '<div class="bh-headerBar-menu">' +
                        '@userImage' +
                        '@dropMenu' +
                        '@themeIcon'+
                        '@icons' +
                        '@navigate' +
                    '</div>'+
                '</div>'+
            '</div>';

        return _html.replace("@logo", getHeaderLogoHtml(data)).replace("@title", getHeaderTitleHtml(data)).replace("@navigate", getHeaderNavigateHtml(data))
            .replace("@icons", getIconHtml(data)).replace("@userImage", getImageHtml(data)).replace("@dropMenu", getAndAddDropMenuBox(data))
            .replace("@asideNavIcon", getAsideNavIcon(data)).replace("@themeIcon", getThemeIcon(data));
    }

    function getAsideNavIcon(data){
        var isShowAsideNav = data.showAsideNav ? 'display: block;' : 'display: none;';
        var _html = '<div style="'+isShowAsideNav+'" class="bh-headerBar-asideMenu" bh-header-role="bhAsideNavIcon"><i class="iconfont icon-menu"></i></div>';

        return _html;
    }

    function getThemeIcon(data){
        var _html = '';
        if(data.openTheme){
            _html = '<div class="bh-headerBar-iconBlock" bh-theme-role="themeIcon"><i class="iconfont icon-pifu"></i></div>';
        }
        return _html;
    }

    function getHeaderLogoHtml(data){
        var _html = '';
        if(data.logo){
            _html =
                '<div class="bh-headerBar-logo">' +
                    '<img src="'+data.logo+'" />' +
                '</div>';
        }
        return _html;
    }

    function getHeaderTitleHtml(data){
        var _html = '';
        if(data.title){
            _html =
                '<div class="bh-headerBar-title">'+data.title+'</div>';
        }
        return _html;
    }

    function getHeaderNavigateHtml(data){
        var _html = '';
        var nav = data.nav;
        if(nav){
            _html =
                '<div class="bh-headerBar-nav-more"><i class="iconfont icon-keyboardcontrol"></i></div>'+
                '<div class="bh-headerBar-navigate @isHideClass">' +
                    '@content' +
                    '<div class="bh-headerBar-nav-bar bh-single-animate"></div>' +
                    '<div class="bh-headerBar-navBar-cover"></div>'+
                '</div>';

            var navContentHtml = "";
            var navLen = nav.length;
            for(var i = navLen-1; i>=0; i--){
                var guid = BH_UTILS.NewGuid();
                var navItem = nav[i];
                navItem.guid = guid;
                //当导航菜单只有一项的时候，默认让该项隐藏
                if(navLen === 1){
                    if(typeof navItem.hide !== "boolean"){
                        navItem.hide = true;
                    }
                }
                navContentHtml += getHeaderNavigateItemHtml(navItem);
            }

            var isHideClass = data.isNavHide ? 'bh-nav-hide' : '';
            _html = _html.replace("@content", navContentHtml).replace("@isHideClass", isHideClass);
        }
        return _html;
    }

    function getHeaderNavigateItemHtml(data){
        var _html = '<a class="@itemClass" href="@href" @target bh-header-role="@guid"><div class="bh-headerBar-nav-item @active" @attribute>@title</div></a>';
        var active = "";
        var attribute = "";
        var href = "javascript:void(0);";
        var target = '';
        var guid = 'nav-'+data.guid;
        if(data.active){
            active = "bh-active";
        }
        if(data.className){
            active += " "+data.className;
        }
        var attributeData = data.attribute;
        if(attributeData){
            var attrLen = attributeData.length;
            if(attrLen > 0){
                for(var i=0; i<attrLen; i++){
                    var key = attributeData[i].key;
                    var value = attributeData[i].value;
                    if(key && value){
                        attribute += key+'="'+value+'" ';
                    }
                }
            }
        }
        if(data.href){
            href = data.href;
            if(typeof data.isOpenNewPage === "boolean"){
                target = data.isOpenNewPage ? 'target="_blank"' : '';
            }else if(typeof data.isOpenNewPage === "string"){
                target = $.trim(data.isOpenNewPage) === 'true' ? 'target="_blank"' : '';
            }
        }
        var itemClass = '';
        if(data.hide){
            itemClass = 'bh-hide';
        }
        var title = data.title ? data.title : '';
        return _html.replace("@active", active).replace("@title", title).replace("@href", href)
            .replace("@attribute", attribute).replace("@itemClass", itemClass).replace("@target", target)
            .replace("@guid", guid);
    }

    function getIconHtml(data){
        var _html = '';
        var icons = data.icons;
        //添加问题反馈，应用说明
        if(data.feedback || data.appDetail){
            if(icons){
                icons.unshift({
                    "className": "icon-erroroutline",
                    "attrs": {"bh-header-role": "ampSwitch"}
                });
            }

            addAmpItemToBox(data);
        }
        //if(data.appDetail){
        //    if(icons){
        //        icons.unshift({
        //            "className": "icon-helpoutline",
        //            "attrs": {"bh-header-role": "appDetail"}
        //        });
        //    }
        //}
        if(icons){
            for(var i= 0, iconLen=icons.length; i<iconLen; i++){
                var iconData = icons[i];
                var iconClass = iconData.className;
                if(iconClass){
                    var iconAttr = iconData.attrs;
                    var attrStr = '';
                    var href = iconData.href ? iconData.href : 'javascript:void(0);';
                    if(iconAttr){
                        for(var key in iconAttr){
                            var value = iconAttr[key];
                            attrStr += key + '=' + value + ' ';
                        }
                    }
                    _html += '<div class="bh-headerBar-iconBlock" '+attrStr+'><a href="'+href+'"><i class="iconfont '+iconClass+'"></i></a></div>';
                }
            }
        }
        return _html;
    }

    function addAmpItemToBox(options){
        var ampItemsHtml = '';
        if(options.feedback){
            ampItemsHtml += '<div class="bh-headerBar-roleBox-title" bh-header-role="feedbackBox"><a href="javascript:void(0);"><i class="iconfont icon-assignmentlate"></i>问题反馈</a></div>';
        }
        if(options.appDetail){
            ampItemsHtml += '<div class="bh-headerBar-roleBox-title" bh-header-role="appDetailBox"><a href="javascript:void(0);"><i class="iconfont icon-helpoutline"></i>应用说明</a></div>';
        }
        var _html =
            '<div class="bh-headerBar-roleBox bh-card bh-card-lv3 bh-headerBar-popupBox-animate" bh-header-role="ampBox">' +
                ampItemsHtml +
            '</div>';

        $("body").append(_html);
    }

    function getImageHtml(data){
        var _html = '';
        var image = data.userImage;
        if(image){
            _html = '<div class="bh-headerBar-imgBlock"><img src="'+image+'" bh-header-role="bhHeaderUserInfoIcon" /></div>';
        }
        return _html;
    }

    function getThemePopUpBoxHtml(){
        var _html =
            '<div class="bh-header-themelist jqx-dropdownbutton-popup">' +
                '<ul>' +
                    '<li class="selected" title="blue">' +
                        '<span class="bh-header-colorCard-text">蓝色皮肤</span>' +
                        '<span class="bh-header-colorCard-blueTheme"></span>' +
                        '<span class="bh-header-colorCard-bluePrimary"></span>' +
                        '<span class="bh-header-colorCard-blueSuccess"></span>' +
                        '<span class="bh-header-colorCard-blueWarning"></span>' +
                        '<span class="bh-header-colorCard-blueDanger"></span>' +
                    '</li>' +
                    '<li title="purple">' +
                        '<span class="bh-header-colorCard-text">紫色皮肤</span>' +
                        '<span class="bh-header-colorCard-purpleTheme"></span>' +
                        '<span class="bh-header-colorCard-purplePrimary"></span>' +
                        '<span class="bh-header-colorCard-purpleSuccess"></span>' +
                        '<span class="bh-header-colorCard-purpleWarning"></span>' +
                        '<span class="bh-header-colorCard-purpleDanger"></span>' +
                    '</li>' +
                    '<li title="lightBlue">' +
                        '<span class="bh-header-colorCard-text">淡蓝色皮肤</span>' +
                        '<span class="bh-header-colorCard-lightBlueTheme"></span>' +
                        '<span class="bh-header-colorCard-lightBluePrimary"></span>' +
                        '<span class="bh-header-colorCard-lightBlueSuccess"></span>' +
                        '<span class="bh-header-colorCard-lightBlueWarning"></span>' +
                        '<span class="bh-header-colorCard-lightBlueDanger"></span>' +
                    '</li>' +
                    '<li title="green">' +
                        '<span class="bh-header-colorCard-text">绿色皮肤</span>' +
                        '<span class="bh-header-colorCard-greenTheme"></span>' +
                        '<span class="bh-header-colorCard-greenPrimary"></span>' +
                        '<span class="bh-header-colorCard-greenSuccess"></span>' +
                        '<span class="bh-header-colorCard-greenWarning"></span>' +
                        '<span class="bh-header-colorCard-greenDanger"></span>' +
                    '</li>' +
                '</ul>' +
            '</div>';
        return _html;
    }

    function userRoleBoxHtml(menuList){
        var _html = "";
        var dropItemsHtml = "";
        var activeData = "";
        if(menuList){
            var menuLen = menuList.length;
            if(menuLen > 0){
                for(var i=0; i<menuLen; i++){
                    var menuItem = menuList[i];
                    var text = menuItem.text ? menuItem.text : '';
                    var href = menuItem.href;
                    var id = menuItem.id ? menuItem.id : '';
                    if(!href){
                        href = "javascript:void(0);";
                    }
                    if(menuItem.active){
                        activeData = menuItem;
                    }
                    dropItemsHtml += '<div class="bh-headerBar-roleBox-title"><a id="'+id+'" href="'+href+'">'+text+'</a></div>';
                }

                _html =
                    '<div class="bh-headerBar-roleBox bh-card bh-card-lv3 bh-headerBar-popupBox-animate" bh-header-role="roleBox">' +
                        '<div class="bh-headerBar-roleBox-explain bh-headerBar-roleBox-title">选择角色</div>' +
                        dropItemsHtml +
                    '</div>';
            }
        }

        return {"html": _html, "active": activeData};
    }

    function getAndAddDropMenuBox(options){
        var headerRoleHtml = "";
        var menuList = options.dropMenu;
        if(menuList && menuList.length > 0){
            var dropMenuData = userRoleBoxHtml(menuList);
            $("body").append(dropMenuData.html);

            headerRoleHtml =
                '<div class="bh-headerBar-roleSwitch" bh-header-role="roleSwitch">' +
                    dropMenuData.active.text +
                '</div>';
        }

        return headerRoleHtml;
    }

    function headerEventInit(dom, options){
        //页面滚动时切换头部的normal和mini头
        scrollEvent(dom);
        //头部菜单事件监听
        navigateEvent(dom);
        //主题切换事件
        if(options.openTheme){
            themePopUpBoxInit(dom);
        }
        //角色切换事件
        roleSwitchEvent(dom, options);
        //平台组件绑定
        ampSwitchEvent(dom, options);
        //用户详情事件
        userInfoIconEvent(dom);
        //侧边栏导航事件
        asideNavEvent(dom);

        //nav菜单more的事件
        //moreEvent(dom);
    }

    function scrollEvent(dom){
        $(window).scroll(function (e) {
            var $window = $(window);
            var scrollTop = $window.scrollTop();
            var $headerBg = dom.find("header.bh-header-bg");
            var $miniHeader = dom.find("header.bh-header-mini");
            var $normalHeader = dom.find("header.bh-header");
            var operateHeight = 44;
            //使头部的底色高度变化
            if(scrollTop < operateHeight){
                $headerBg.addClass("bh-headerBg-show").removeClass("bh-headerBg-hide");
                $normalHeader.addClass("bh-normalHeader-show").removeClass("bh-normalHeader-hide");
                $miniHeader.addClass("bh-miniHeader-hide").removeClass("bh-miniHeader-show");
            }else if(scrollTop == operateHeight){
                $normalHeader.addClass("bh-normalHeader-show").removeClass("bh-normalHeader-hide");
                $miniHeader.addClass("bh-miniHeader-hide").removeClass("bh-miniHeader-show");
            }else{
                $headerBg.addClass("bh-headerBg-hide").removeClass("bh-headerBg-show");
                $normalHeader.addClass("bh-normalHeader-hide").removeClass("bh-normalHeader-show");
                $miniHeader.addClass("bh-miniHeader-show").removeClass("bh-miniHeader-hide");
            }
        });
    }

    function navigateBarInit(dom){
        var $navigate = dom.find(".bh-headerBar-navigate");
        var $activeItem = $navigate.find(".bh-active");
        if($activeItem.length > 0){
            var index = $activeItem.closest('a').index();
            //重置头部的高亮位置，避免路由跳转导致数据不对称
            dom.find(".bh-headerBar-navigate").data("nav-init-active-index", index);
            //设置菜单active条位置
            setHeadNavBarPosition($activeItem, $navigate);
        }
    }

    function navigateEvent(dom){
        var $navigate = dom.find(".bh-headerBar-navigate");
        var $navItems = $navigate.find(".bh-headerBar-nav-item");
        if($navItems.length > 0){
            //鼠标移入菜单单个节点的active条的处理
            $navigate.on("mouseenter", ".bh-headerBar-nav-item", function(){
                //鼠标移入时，记录当前nav是否处于不活动状态，若是则将状态缓存，并暂时将nav的bh-unActive去掉,让高亮条能显示出来
                if($navigate.hasClass('bh-unActive')){
                    $navigate.data('activeType', 'bh-unActive').removeClass('bh-unActive');
                }
                var $item = $(this);

                //记录移入前的active所在位置
                var activeIndex = $navigate.data("nav-init-active-index");
                if(!activeIndex){
                    if(activeIndex !== 0){
                        var index = $navigate.find(".bh-active").closest("a").index();
                        $navigate.data("nav-init-active-index", index);
                    }
                }

                setHeadNavBarPosition($item, $navigate);
            });
            //点击菜单active条的处理
            $navigate.on("click", ".bh-headerBar-nav-item", function(){
                //将缓存的nav状态去掉
                $navigate.removeData('activeType');
                var $item = $(this).closest("a");
                var index = $item.index();
                $navigate.find('.bh-active').removeClass('bh-active');
                $item.children().addClass('bh-active');
                $navigate.data("nav-init-active-index", index).removeClass('bh-unActive');
                //移除nav more菜单的高亮
                var $moreIcon = dom.find('div.bh-headerBar-nav-more');
                if($moreIcon.hasClass('bh-active')){
                    $moreIcon.removeClass('bh-active');
                    var $navMoreBox = $('div[bh-header-role="navMoreBox"]');
                    $navMoreBox.children('.bh-active').removeClass('bh-active');
                    $navMoreBox.children('div.bh-header-navMoreBox-bar').css({top: '-43px'});
                }
            });

            //鼠标移出菜单块，还原active条的位置
            $navigate.on("mouseleave", function(){
                //鼠标移除前判断nav是否处于不激活状态，是的话则还原状态
                if($navigate.data('activeType')){
                    $navigate.removeData('activeType').addClass('bh-unActive');
                }
                var index = $navigate.data("nav-init-active-index");
                var $itemList = $navigate.find(".bh-headerBar-nav-item");
                var $activeA = $itemList.closest("a").eq(index);
                var $activeItem = $activeA.find(".bh-headerBar-nav-item");

                setHeadNavBarPosition($activeItem, $navigate);
            });
        }
    }
    //侧边栏导航栏icon事件监听
    function asideNavEvent(dom){
        dom.on("click", "[bh-header-role=bhAsideNavIcon]", function(){
            $.bhAsideNav.show();
        });
    }

    //更多的事件绑定，在计算完宽度后才添加的
    function moreEvent($dom, $navMoreBox){
        //鼠标移入导航菜单的更多按钮的处理
        $dom.on('mouseover', 'div.bh-headerBar-nav-more', function(){
            var $more = $(this);
            //获取按钮的位置信息
            var morePosition = BH_UTILS.getElementPosition($more);
            var $navMoreBox = $('div[bh-header-role="navMoreBox"]');
            var navMoreBoxWidth = $navMoreBox.outerWidth();
            //获取缓存下来的更多菜单的高度
            var navHeight = 0;
            if($more.closest('header[bh-header-role="bhHeaderMini"]').length > 0){
                $navMoreBox.addClass('bh-header-navMoreBox-mini');
                navHeight = $navMoreBox.data('miniHeight');
            }else{
                $navMoreBox.removeClass('bh-header-navMoreBox-mini');
                navHeight = $navMoreBox.data('height');
            }

            //设置更多菜单的显示位置，并添加active属性（用于鼠标移走的处理）
            $navMoreBox.css({top: morePosition.bottom+'px', left: parseInt(morePosition.right - navMoreBoxWidth,10)+'px', height: navHeight+'px'})
                .data('active', true);
        });
        //鼠标移出导航菜单的更多按钮的处理
        $dom.on('mouseout', 'div.bh-headerBar-nav-more', function(){
            leaveMoreBox($dom);
        });

        //鼠标移入更多导航菜单块的处理
        $navMoreBox.on('mouseover', function(e){
            var $moreBox = $(this);
            //添加active属性（用于鼠标移走的处理）
            $moreBox.data('active', true);
            //设置更多菜单高亮条的位置
            setMoreBoxBarPosition($(e.target || e.srcElement), $moreBox, $dom);
        });
        //鼠标移出更多导航菜单的处理
        $navMoreBox.on('mouseout', function(){
            leaveMoreBox($dom);
        });

        //点击更多菜单项的处理
        $navMoreBox.on('click', function(e){
            var $moreBox = $(this);
            var $target = $(e.target || e.srcElement).closest('a');
            setMoreBoxActive($target, $moreBox, $dom);
        });
    }

    function setMoreBoxActive($navItem, $moreBox, $dom){
        if($navItem.length > 0){
            //给被点击的菜单添加高亮class
            $moreBox.children('a').removeClass('bh-active');
            $navItem.addClass('bh-active');
            //将更多菜单隐藏
            $moreBox.css({height: 0});
            //给更多按钮添加高亮
            $dom.find('div.bh-headerBar-nav-more').addClass('bh-active');
            $dom.find('div.bh-headerBar-navigate').find('div.bh-active').removeClass('bh-active');
        }
    }

    //鼠标移出更多导航菜单的处理
    function leaveMoreBox($dom){
        var $navMoreBox = $('div[bh-header-role="navMoreBox"]');
        //移除缓存的active属性，延迟判断这个属性是否还存在，当不存在时在隐藏更多菜单
        $navMoreBox.removeData('active');
        //鼠标移除时，设置更多菜单的高亮条位置
        setMoreBoxBarPosition($navMoreBox.children('.bh-active'), $navMoreBox, $dom);
        setTimeout(function(){
            if(!$navMoreBox.data('active')){
                $navMoreBox.css({height: 0});
            }
        },200);
    }

    //设置更多高亮条的位置
    function setMoreBoxBarPosition($item, $moreBox, $dom){
        var $activeItem = $item.length > 0 ? $item.closest('a') : [];
        var $moreActiveBar = $moreBox.children('div.bh-header-navMoreBox-bar');
        var $navBlock = $dom.find('div.bh-headerBar-navigate');
        var itemHeight = $moreBox.hasClass('bh-header-navMoreBox-mini') ? 24 : 43;
        if($activeItem.length > 0){
            //当该菜单不是隐藏项，则计算高亮条的top值，否则直接将高亮条设为负值，使其隐藏
            if(!$activeItem.hasClass('bh-hide')){
                var index = $activeItem.index();
                //找出该菜单前的隐藏项，将隐藏项排除后再计算top值
                $moreBox.children('a').each(function(itemIndex, item){
                    if(itemIndex < index){
                        var $item = $(item);
                        if($item.hasClass('bh-hide')){
                            index--;
                        }
                    }
                });
                var top = index * itemHeight + 1;
                $moreActiveBar.css({top: top + 'px'});
            }else{
                $moreActiveBar.css({top: '-'+itemHeight+'px'});
            }

            //将头部的高亮去掉
            $navBlock.addClass('bh-unActive');
        }else{
            $navBlock.removeClass('bh-unActive');
            $moreActiveBar.css({top: '-'+itemHeight+'px'});
        }
    }

    function setHeadNavBarPosition($item, $navigate){
        var index = $item.closest('a').index();
        $navigate.each(function(){
            var $navContent = $(this);
            var $navItem = $navContent.children('a').eq(index);
            var _width = $navItem.outerWidth();
            var _left = $navItem.offset().left;
            var navLeft = $navContent.offset().left;
            var barLeft = _left - navLeft;

            $navContent.find(".bh-headerBar-nav-bar").css({"left": barLeft+"px", "width": _width+"px"});
        });
    }
    //角色切换块事件监听
    function roleSwitchEvent(dom, options){
        dom.on("click", "[bh-header-role=roleSwitch]", function(){
            var $switch = $(this);
            var switchOffset = $switch.offset();
            var switchWidth = $switch.outerWidth();
            var switchHeight = $switch.outerHeight();
            var $roleBox = $("[bh-header-role=roleBox]");
            var roleBoxWidth = $roleBox.outerWidth();
            var roleBoxLeft = switchOffset.left + switchWidth - roleBoxWidth;
            var roleBoxTop = switchOffset.top + switchHeight + 8;
            $roleBox.css({"left": roleBoxLeft, "top": roleBoxTop}).toggleClass("bh-active");
        });

        $("[bh-header-role=roleBox]").on("click", ".bh-headerBar-roleBox-title", function(){
            var $item = $(this);
            if($item.hasClass("bh-headerBar-roleBox-explain")){
                return;
            }
            var text = $.trim($item.text());
            var id = $item.children('a').attr('id');
            dom.find("[bh-header-role=roleSwitch]").text(text);
            $item.closest("[bh-header-role=roleBox]").removeClass("bh-active");
            //给头部绑定change事件，返回text和该节点
            dom.trigger("headerRoleChange", [text, $item]);

            if(typeof options.dropMenuCallback !='undefined' && options.dropMenuCallback instanceof Function){
                var backItem = {"id": id, "text": text, "JDom": $item};
                options.dropMenuCallback(backItem);
            }
        });
    }

    function ampSwitchEvent(dom, options){
        //若AppDetail存在则先对应用详情进行初始化
        if(options.appDetail){
            $.ampAppDetail.init({
                appId: options.appDetailData.appId,
                rootPath: options.appDetailData.rootPath});
        }

        dom.on("click", "[bh-header-role=ampSwitch]", function(){
            var $switch = $(this);
            var switchOffset = $switch.offset();
            var switchWidth = $switch.outerWidth();
            var switchHeight = $switch.outerHeight();
            var $roleBox = $("[bh-header-role=ampBox]");
            var roleBoxWidth = $roleBox.outerWidth();
            var roleBoxLeft = switchOffset.left + switchWidth - roleBoxWidth;
            var roleBoxTop = switchOffset.top + switchHeight + 8;
            $roleBox.css({"left": roleBoxLeft, "top": roleBoxTop}).toggleClass("bh-active");
        });

        $("[bh-header-role=ampBox]").on("click", ".bh-headerBar-roleBox-title", function(){
            var $item = $(this);
            var flag = $item.attr('bh-header-role');
            if(flag === 'feedbackBox'){
                AmpFeedback.window(options.feedbackData);
            }else if(flag === 'appDetailBox'){
                $.ampAppDetail.show();
            }
        });
    }

    function userInfoIconEvent(dom){
        dom.on("click", "[bh-header-role=bhHeaderUserInfoIcon]", function(){
            var $box = $("[bh-header-role=bhHeaderBarInfoBox]");
            if($box.length === 0){
                return;
            }
            var $item = $(this);
            var itemOffset = $item.offset();
            var itemWidth = $item.outerWidth();
            var itemHeight = $item.outerHeight();
            var boxWidth = $box.outerWidth();
            var boxLeft = itemOffset.left + itemWidth - boxWidth;
            var boxTop = itemOffset.top + itemHeight + 8;
            $box.css({"left": boxLeft, "top": boxTop}).toggleClass("bh-active");
        });
    }

    function themePopUpBoxInit(dom){
        var $icon = dom.find("div[bh-theme-role=themeIcon]");
        var iconWidth = $icon.outerWidth();
        var iconHeight = $icon.outerHeight();
        var iconOffset = $icon.offset();
        var $themeList = dom.find(".bh-header-themelist");
        var themeTop = iconOffset.top + iconHeight;
        var themeLeft = iconOffset.left + iconWidth - 150;
        $themeList.css({"top": themeTop, "left": themeLeft});

        themePopUpBoxEvent($icon, $themeList);
    }

    function themePopUpBoxEvent($icon, $themeList){
        $icon.on("click",function(){
            $themeList.toggle();
        });

        //绑定点击事件,切换皮肤
        $themeList.on("click", "li",function(){
            $themeList.find(".bh-selected").removeClass("bh-selected");
            $(this).addClass("bh-selected");
            changeThemes({themesName:$(this).attr("title"),themesLink:$("#bhThemes")});
            changeThemes({themesName:$(this).attr("title"),themesLink:$("#bhScenceThemes")});
            $themeList.hide();
        });

        $themeList.find("li").hover(function(){
            $(this).addClass("bh-active");
        },function(){
            $(this).removeClass("bh-active");
        });
    }

    function changeThemes(options) {
        var _wisThemes = options.themesLink;
        var newUrl = getUrlByThemesName(options);
        if(newUrl != ""){
            _wisThemes.removeAttr('type');
            _wisThemes.attr('href', newUrl);
            _wisThemes.attr('type','text/css');
        }
    }
    function getUrlByThemesName(options){
        var _wisThemes = options.themesLink;
        var url = _wisThemes.attr('href');
        if(!url) return false;
        var urlArr = url.split("/");
        var newUrl = "";

        if(urlArr && urlArr.length>1){
            urlArr[urlArr.length - 2] = options.themesName;
            newUrl = urlArr.join("/");
        }
        return newUrl;
    }

    //添加用户详情
    function userInfoInit(options){
        var userInfo = options.userInfo;
        //当用户详情不存在时，不予添加
        if($.isEmptyObject(userInfo)){
            return;
        }
        //用户图片
        var image = userInfo.image;
        //显示详情，每条数据显示一行
        var info = userInfo.info;
        //退出登录的链接
        var logoutHtml = userInfo.logoutHref ? '<a class="bh-btn bh-btn-default bh-btn-small bh-btn-danger" href="'+userInfo.logoutHref+'">退出登录</a>' : '';
        var _html =
            '<div class="bh-headerBar-userIfon bh-headerBar-popupBox-animate bh-card bh-card-lv3" bh-header-role="bhHeaderBarInfoBox">' +
                '<div class="bh-headerBar-userInfo-img">' +
                    '<img src="@image" />' +
                '</div>' +
                '<div class="bh-headerBar-userInfo-detail">' +
                    '@detail' +
                '</div>' +
                    '@logoutHtml'+
            '</div>';

        var detailHtml = "";
        if(info){
            var infoLen = info.length;
            for(var i=0; i<infoLen; i++){
                if(i === 0){
                    detailHtml += '<div class="bh-headerBar-userIfon-name">'+info[i]+'</div>';
                }else{
                    if(info[i]){
                        detailHtml += '<div>'+info[i]+'</div>';
                    }
                }
            }
        }
        _html = _html.replace("@image", image).replace("@detail", detailHtml).replace("@logoutHtml", logoutHtml);
        $("body").append(_html);

        var $userImg = $('div[bh-header-role="bhHeaderBarInfoBox"]').find('img');
        BH_UTILS.checkImageLoadComplete($userImg)
            .fail(function(e, $imgDom){
                $imgDom.attr('src', space.defaultUserImg);
            });
    }

    function resetNavActive(options, $dom){
        if(options){
            var index = parseInt(options.activeIndex, 10);
            if(index){
                index = index - 1;
                var guid = space.nav[index].guid;
                var $nav = $dom.find(".bh-headerBar-navigate");
                $nav.find(".bh-active").removeClass("bh-active");
                var $navMoreBox = $('div[bh-header-role="navMoreBox"]');
                var activeIndex = $nav.children('a[bh-header-role="nav-'+guid+'"]').index();
                if(activeIndex >= 0){
                    var $activeItem = $nav.children("a").eq(activeIndex).find(".bh-headerBar-nav-item");
                    $activeItem.addClass("bh-active");
                    $nav.data("nav-init-active-index", activeIndex).removeClass('bh-unActive');
                    $dom.find('div.bh-headerBar-nav-more').removeClass('bh-active');

                    setHeadNavBarPosition($activeItem, $nav);
                    $navMoreBox.find('.bh-active').removeClass('bh-active');
                    setMoreBoxBarPosition([], $navMoreBox, $dom);
                }else{
                    var $moreActiveItem = $navMoreBox.children('a[bh-header-role="nav-'+guid+'"]');
                    $navMoreBox.find('.bh-active').removeClass('bh-active');
                    $moreActiveItem.addClass('bh-active');
                    setMoreBoxActive($moreActiveItem, $navMoreBox, $dom);
                    setMoreBoxBarPosition($moreActiveItem, $navMoreBox, $dom);
                }
            }
        }
    }

    function showOrHideNav(flag){
        var $nav = space.$dom.find('div.bh-headerBar-navigate');
        var $moreBtn = space.$dom.find('div.bh-headerBar-nav-more');
        if(flag === 'show'){
            $nav.removeClass('bh-nav-hide');
            if($('div[bh-header-role="navMoreBox"]').find('a').length > 0){
                $moreBtn.show();
            }
        }else{
            $nav.addClass('bh-nav-hide');
            $moreBtn.hide();
        }
    }

    //监听头部图片加载完成，计算nav导航的可用宽度
    function listenImgLoadComplete($dom){
        var $normalHead = $dom.find('header[bh-header-role="bhHeader"]');
        var imgs = $normalHead.find('img');
        var imgLen = imgs.length;
        if(imgLen > 0){
            var loadCount = 0;
            imgs.each(function(index, imgDom){
                BH_UTILS.checkImageLoadComplete($(imgDom))
                    .done(function(){
                        loadCount++;
                        if(loadCount === imgLen){
                            computeNavWidth($normalHead, $dom);
                        }
                    })
                    .fail(function(e, $imgDom){
                        if($imgDom.closest('.bh-headerBar-imgBlock').length > 0){
                            $imgDom.attr('src', space.defaultUserImg);
                        }
                        loadCount++;
                        if(loadCount === imgLen){
                            computeNavWidth($normalHead, $dom);
                        }
                    });
            });
        }else{
            computeNavWidth($normalHead, $dom);
        }
    }

    //计算nav的可用宽度
    function computeNavWidth($normalHead, $dom){
        var $headContent = $normalHead.find('div.bh-headerBar-content');
        //整个头部的宽度
        //右侧菜单的容器
        var $menuItem = null;
        //头部除了右侧菜单的所有节点的宽度
        var itemsWidth = 0;
        $headContent.children().each(function(){
            var $item = $(this);
            if(!$item.hasClass('bh-headerBar-menu')){
                itemsWidth += $item.outerWidth(true);
            }else{
                $menuItem = $item;
            }
        });
        //nav的容器
        var $nav = null;
        var navItemsWidth = 0;
        $menuItem.children().each(function(){
            var $item = $(this);
            if(!$item.hasClass('bh-headerBar-navigate')){
                navItemsWidth += $item.outerWidth(true);
            }else{
                $nav = $item;
            }
        });

        var navMarginRight = 16;
        //预设一个偏差距离
        var navWidthDiff = 148;
        var menuItemsWidth = 'calc(100% - '+parseInt(itemsWidth + navWidthDiff, 10)+'px)';
        var navBlockWidth = 'calc(100% - '+parseInt(navItemsWidth + navMarginRight, 10)+'px)';
        $menuItem.css({width: menuItemsWidth});
        $normalHead.find('div.bh-headerBar-navigate').css({width: navBlockWidth});

        var $miniHeader = $dom.children('header[bh-header-role="bhHeaderMini"]');
        $miniHeader.find('div.bh-headerBar-menu').css({width: menuItemsWidth});
        $miniHeader.find('div.bh-headerBar-navigate').css({width: navBlockWidth});

        //检查头部的nav项是否过多，过多则将超出的项放入more容器中
        checkNavItemIsMore($dom);
    }

    /**
     * 检查头部的nav项是否过多，过多则将超出的项放入more容器中
     * @param $dom
     */
    function checkNavItemIsMore($dom){
        var $normalNav = $dom.children('header[bh-header-role="bhHeader"]').find('div.bh-headerBar-navigate');
        var $miniNav = $dom.children('header[bh-header-role="bhHeaderMini"]').find('div.bh-headerBar-navigate');
        var navWidth = $normalNav.width();
        var navItemsWidth = 0;
        var $navItems = $normalNav.children('a');
        var $miniNavItems = $miniNav.children('a');
        var navItemsLen = $navItems.length;
        var moreIndex = 0;
        var isMoreFlag = false;
        var moreHtml = '';
        var moreItemsCount = 0;
        for(var i=navItemsLen-1; i>=0; i--){
            var item = $navItems[i];
            navItemsWidth += item.offsetWidth;
            if(navItemsWidth > navWidth){
                if(!isMoreFlag){
                    moreIndex = i;
                    isMoreFlag = true
                }
                moreHtml += item.outerHTML;
                $navItems.eq(i).remove();
                $miniNavItems.eq(i).remove();
                moreItemsCount++;
            }
        }

        $('body').append(
            '<div class="bh-header-navMoreBox" bh-header-role="navMoreBox">' +
                moreHtml+
                '<div class="bh-header-navMoreBox-bar bh-animate-fast bh-animate-top"></div>'+
            '</div>');
        //读取more的高度并保存起来，方便做动画
        var $navMoreBox = $('div[bh-header-role="navMoreBox"]');
        var navMoreBoxHeight = $navMoreBox.outerHeight();
        var navMoreBoxMiniHeight = moreItemsCount * 24;
        $navMoreBox.data('height', navMoreBoxHeight).data('miniHeight', navMoreBoxMiniHeight).css({height: 0, display: 'block'});
        if(moreItemsCount > 0){
            if(!space.isNavHide){
                $dom.find('div.bh-headerBar-nav-more').show();
            }
            //nav菜单more的事件
            moreEvent($dom, $navMoreBox);
        }

        var $moreActiveItem =  $navMoreBox.find('.bh-active').closest('a');
        if($moreActiveItem.length === 0){
            //设置头部菜单
            navigateBarInit($dom);
        }else{
            setMoreBoxActive($moreActiveItem, $navMoreBox, $dom);
            setMoreBoxBarPosition($moreActiveItem, $navMoreBox, $dom);
        }
    }



})(jQuery);