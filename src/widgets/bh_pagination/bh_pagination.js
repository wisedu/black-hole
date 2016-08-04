/**
 * @fileOverview 分页组件
 * @example
 $selector.pagination({
    mode: 'simple'
 });
 */
(function() {
    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.pagination = function(options, params) {
        var instance = new Plugin(this, options);

        if (options === true) return instance;
        return this;
    };

    /**
     * @memberof module:pagination
     * @description 内置默认值
     * @prop {object}  defaults
     * @prop {string}  defaults.mode - 分页模式 支持advanced高级和simple简单两种模式
     * @prop {number}  defaults.pagesize - 每页显示条数
     * @prop {Array}  defaults.pageSizeOptions - 每页显示条数下拉选择框值
     * @prop {number}  defaults.selectedIndex - 每页显示条数下拉框默认值
     * @prop {number}  defaults.pagenum - 当前页码从0开始
     * @prop {number}  defaults.totalSize - 总条数
     * @prop {number}  defaults.pagerButtonsCount - 简单分页模式页码按钮数
     */
    $.fn.pagination.defaults = {
        mode: 'advanced',
        pagesize: 10,
        pageSizeOptions: [10, 20, 50, 100],
        selectedIndex: 0,
        pagenum: 0,
        totalSize: 0,
        pagerButtonsCount: 0,
    };

    var html_advanced = '<div class="bh-pager bh-hide">' +
        '<div class="bh-pull-left">' +
        '<a href="javascript:void(0);" class="bh-pager-btn waves-effect" pager-flag="prev">' +
        '<i class="iconfont icon-keyboardarrowleft bh-pager-left-arrow"></i>' +
        '</a>' +
        '<a href="javascript:void(0);" class="bh-pager-btn waves-effect" pager-flag="next">' +
        '<i class="iconfont icon-keyboardarrowright bh-pager-right-arrow"></i>' +
        '</a>' +
        '<span class="bh-pager-num" pager-flag="pageInfo"></span>' +
        '<label class="bh-pager-label">跳转至</label>' +
        '<input type="text" class="bh-form-control bh-pager-input" pager-flag="gotoPage"/>' +
        '<span>页</span>' +
        '</div>' +
        '<div class="bh-pull-right">' +
        '<div pager-flag="pagerOptionSel" class="bh-pull-right"></div>' +
        '<label class="bh-pull-right bh-pager-label bh-pager-right-text">每页显示</label>' +
        '</div>' +
        '</div>';

    var html_simple = '<div class="bh-pager bh-hide">' +
        '<div class="bh-pull-left">' +
        '<a href="javascript:void(0);" class="waves-effect bh-pager-simplePrev" pager-flag="simplePrev">' +
        '<i class="iconfont icon-keyboardarrowleft"></i>' +
        '</a>' +
        '<div class="bh-pageNum-con" pager-flag="pageNumEle"></div>' +
        '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleNext" pager-flag="simpleNext">' +
        '<i class="iconfont icon-keyboardarrowright"></i>' +
        '</a>' +
        '</div>' +
        '<div class="bh-pull-right">' +
        '<label class="bh-pull-right bh-pager-label bh-mh-16">共<span id="bh-pager-simple-total"></span>条</label>' +
        '</div>' +
        '</div>';


    /**
     * 定义一个插件
     */
    var Plugin;

    /**
     * 这里是一个自运行的单例模式。
     * @module bhPagination 
     */
    Plugin = (function() {

        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.pagination.defaults, options);
            //定位pageSizeOptions的selectedIndex
            var pagesize = options.pagesize;
            var pageSizeOptions = this.settings.pageSizeOptions;
            for (var i = 0; i < pageSizeOptions.length; i++) {
                if (pageSizeOptions[i] == pagesize) {
                    this.settings.selectedIndex = i;
                }
            }
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            _create(this);
        }

        return Plugin;
    })();

    Plugin.prototype.getPagenum = function() {
        /**
         * 方法内容
         */
        if (this.settings.mode == 'advanced') {
            return parseInt(this.$element.find('[pager-flag="gotoPage"]').val());
        } else if (this.settings.mode == 'simple') {
            if (this.pageSizeOptions == 0) {
                return parseInt(this.$element.find('[pager-flag="simpleOnliOne"]')[0].innerText);
            } else {
                return parseInt(this.$element.find('.bh-simplePager-active').text());
            }

        }
    };
    Plugin.prototype.getPagesize = function() {
        /**
         * 方法内容
         */
        if (this.settings.mode == 'advanced') {
            return this.$element.find('[pager-flag="pagerOptionSel"]').jqxDropDownList('val');
        } else if (this.settings.mode == 'simple') {
            return this.settings.pagesize;
        }
    };

    Plugin.prototype.getTotal = function() {
        /**
         * 方法内容
         */
        return this.settings.totalSize;
    };

    /**
     * 插件的私有方法
     */

    //生成dom
    function _create(instance) {
        var $element = instance.$element;
        var settings = instance.settings;
        switch (settings.mode) {
            case 'simple':
                $element.html(html_simple);
                _simpleAppend(instance);
                if (settings.pagerButtonsCount == 0) {
                    $element.find('[pager-flag="simpleOnliOne"]').text(settings.pagenum + 1);
                    if (settings.pagenum > 0) {
                        $element.find('[pager-flag="simplePrev"]').removeClass('bh-btn-disabled');
                    }
                }
                break;
            case 'advanced':
                $element.html(html_advanced);
                _advancedAppend($element, settings);

                break;
        }
        //跳转到第几页赋值
        $element.find('[pager-flag="gotoPage"]').val(settings.pagenum + 1);
        //当前分页条数及总条数
        _setCurrentPageRecordInfo(instance);
        $element.children('.bh-pager').removeClass('bh-hide');
        _eventListener(instance);
    }

    //生成具体的页码和填充具体的总数
    function _simpleAppend(instance) {
        var settings = instance.settings;
        var $element = instance.$element;
        var pagesize = settings.pagesize;
        var totalNum = instance.getTotal();
        var pagerButtonsCount = settings.pagerButtonsCount;
        var pageLen = Math.ceil(totalNum / pagesize);
        var $fixPageHtml = '';
        var onlyNumText = 0;
        var isButtonDis = pageLen == 1 || pageLen == 0;
        var isLastNum = settings.pagenum + 1 == pageLen;
        if (pagerButtonsCount == 0 || pageLen == 1 || pageLen == 0) {
            if (pageLen != 0) {
                onlyNumText = 1;
            }
            $fixPageHtml = '<div class="bh-pager-simple-numHtml" pager-flag="addNumBtn">' +
                '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn bh-simplePager-active" pager-flag="simpleOnliOne">' + onlyNumText + '</a>' +
                '</div>';
            $element.find('[pager-flag="pageNumEle"]').append($fixPageHtml);
            $element.find('[pager-flag="simplePrev"]').addClass('bh-btn-disabled');
            if (isButtonDis || isLastNum) {
                $element.find('[pager-flag="simpleNext"]').addClass('bh-btn-disabled');
            }

        } else {
            $fixPageHtml = '<div class="bh-pager-simple-numHtml" pager-flag="addNumBtn"></div>';
            $element.find('[pager-flag="pageNumEle"]').append($fixPageHtml);
            _addNumBtn(settings, $element, pageLen);
        }
        $element.find('#bh-pager-simple-total').text(totalNum);
    }
    //添加数字
    function _addNumBtn(settings, $element, pageLen) {
        var showEllipsisNum = pageLen - settings.pagerButtonsCount;
        var $totalElement;
        var pageNumText = 0;
        var $pageNumEle = '';
        if (showEllipsisNum > 2) {
            $totalElement = _getTotalElement(settings, $element, pageLen);
            $element.find('[pager-flag="addNumBtn"]').html($totalElement);
        } else {
            _addOnlyNumBtnCircle($element, pageLen - 1, pageLen);
        }
        var $numEle = $($element.find('[pager-flag=simpleGotoPage]'));
        var $activeEle = $numEle.filter(function(index) {
            return parseInt($numEle[index].innerText) == settings.pagenum + 1;
        });
        $activeEle.addClass('bh-simplePager-active');
        var activeNum = parseInt($activeEle.text());
        if (activeNum == 1) {
            $element.find('[pager-flag=simplePrev]').addClass('bh-btn-disabled');
        }
        if (activeNum == pageLen) {
            $element.find('[pager-flag=simpleNext]').addClass('bh-btn-disabled');
        }
    }
    // 获取有省略号的元素
    function _getTotalElement(settings, $element, pageLen) {
        var totalNumElement = '';
        var pageNumText = _getCircleFirstPageNum(settings);
        var pagerButtonsCount = settings.pagerButtonsCount;
        var currentPageNum = settings.pagenum;
        var showRightEll = pagerButtonsCount + currentPageNum < pageLen - 1;
        var showLeftEll = currentPageNum - 1 > 2;
        var firstNum = '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn" pager-flag="simpleGotoPage">1</a>';
        var lastNum = '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn" pager-flag="simpleGotoPage">' + pageLen + '</a>';
        var rightEllipsis = '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn ellipsis" pager-flag="changeRightEllipsis">...</a>';
        var leftEllipsis = '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn ellipsis" pager-flag="changeLeftEllipsis">...</a>';
        if (currentPageNum == 0 || currentPageNum <= pagerButtonsCount) {
            totalNumElement = firstNum + _addNumBtnCircle($element, settings.pagerButtonsCount + 1, pageLen) + rightEllipsis + lastNum;
        } else {
            var numberEle = _addNumBtnCircle($element, settings.pagerButtonsCount + 1, pageLen, pageNumText - 1);
            if (showLeftEll && showRightEll) {
                totalNumElement = firstNum + leftEllipsis + numberEle + rightEllipsis + lastNum;
            } else if (showLeftEll) {
                totalNumElement = firstNum + leftEllipsis + numberEle + lastNum;
            } else if (showRightEll) {
                totalNumElement = firstNum + numberEle + rightEllipsis + lastNum;
            }
        }
        return totalNumElement;
    }
    // 获取循环的第一个数字，根据不同的当前页码和pagerButtonCount的余数的不同，循环的第一个数字不一样
    function _getCircleFirstPageNum(settings) {
        var circleFirstText = 0;
        var pagerButtonsCount = settings.pagerButtonsCount;
        var currentPageNum = settings.pagenum + 1;
        var remainderNum = currentPageNum % pagerButtonsCount;
        var timeNum = parseInt(currentPageNum / pagerButtonsCount);
        if (remainderNum == 0) {
            circleFirstText = currentPageNum - Math.floor(pagerButtonsCount / 2);
        } else if (remainderNum == 1) {
            if (timeNum == 1) {
                circleFirstText = currentPageNum;
            } else {
                circleFirstText = currentPageNum - (pagerButtonsCount - 1);
            }
        } else if (remainderNum == 2) {
            circleFirstText = currentPageNum;
        } else if (remainderNum > 2) {

            circleFirstText = pagerButtonsCount * timeNum + 2;
        }
        return circleFirstText;
    }
    // 添加数字
    function _addNumBtnCircle($element, len, pageLen, pageNumText) {
        var pageNumber = 1;
        var $pageNumEle = '';
        if (pageNumText) {
            pageNumber = pageNumText;
        }
        for (var i = 1; i < len; i++) {
            pageNumber = pageNumber + 1;
            if (pageNumber == pageLen) {
                break;
            }
            $pageNumEle += '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn" pager-flag="simpleGotoPage">' + pageNumber + '</a>';
        }
        return $pageNumEle;
    }
    // 获取中间展示的数字，只有数字没有省略号
    function _addOnlyNumBtnCircle($element, len, pageLen) {
        var pageNumText = 0;
        var $pageNumEle = '';
        for (var i = 1; i < len; i++) {
            pageNumText = i + 1;
            $pageNumEle += '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn" pager-flag="simpleGotoPage">' + pageNumText + '</a>';
        }
        var $totalNumEle = '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn" pager-flag="simpleGotoPage">1</a>' + $pageNumEle + '<a href="javascript:void(0);" class="waves-effect bh-pager-simpleBtn" pager-flag="simpleGotoPage">' + pageLen + '</a>';
        $element.find('[pager-flag="addNumBtn"]').html($totalNumEle);
    }
    //生成每页显示条数下拉选择
    function _advancedAppend($element, settings) {
        $element.find('[pager-flag="pagerOptionSel"]').jqxDropDownList({
            source: settings.pageSizeOptions,
            selectedIndex: settings.selectedIndex,
            width: '60',
            height: '26',
            dropDownHeight: "100",
            enableBrowserBoundsDetection: true
        });
    }

    //事件监听
    function _eventListener(instance) {
        var $element = instance.$element;
        var settings = instance.settings;
        var mode = instance.settings.mode;
        //点击上一页
        $element.off('click', '[pager-flag="prev"]').on('click', '[pager-flag="prev"]', function() {
            var pagenum = instance.getPagenum();
            if (pagenum <= 1) return;
            _setPagenum(pagenum - 1, instance);
            _setCurrentPageRecordInfo(instance);
            _triggerEvent(instance, $(this));
        });
        //点击下一页
        $element.off('click', '[pager-flag="next"]').on('click', '[pager-flag="next"]', function() {
            var pagenum = instance.getPagenum();
            if (pagenum >= _getLastpagenum(instance)) return;
            _setPagenum(pagenum + 1, instance);
            _setCurrentPageRecordInfo(instance);
            _triggerEvent(instance, $(this));
        });
        //跳转第几页
        $element.off('keyup', '[pager-flag="gotoPage"]').on('keyup', '[pager-flag="gotoPage"]', function(e) {
            if (e.keyCode != 13) {
                return;
            }
            var pagenum = instance.getPagenum();
            if (pagenum < 1 || pagenum > _getLastpagenum(instance)) {
                _setPagenum(1, instance);
                return;
            }
            _setPagenum(pagenum, instance);
            _setCurrentPageRecordInfo(instance);
            _triggerEvent(instance, $(this));

        });
        //每页显示条数下拉选择框
        if (mode == 'advanced') {
            $element.off('select', '[pager-flag="pagerOptionSel"]').on('select', '[pager-flag="pagerOptionSel"]', function(e) {
                // var pagenum = instance.getPagenum();
                // if(pagenum < 1 || pagenum > _getLastpagenum(instance)) return;
                _setPagenum(0, instance);
                _setCurrentPageRecordInfo(instance);
                _triggerEvent(instance, $(this));
            });
        }
        //点击省略号，显示省略号代表的数字
        if (mode == 'simple') {
            var pageLen = Math.ceil(instance.getTotal() / settings.pagesize);
            var isNotOnlyOne = settings.pagerButtonsCount != 0;
            $element.off('click', '[pager-flag="changeRightEllipsis"]').on('click', '[pager-flag="changeRightEllipsis"]', function() {
                $element.find('.bh-simplePager-active').removeClass('bh-simplePager-active');
                var $numEle = $element.find('[pager-flag="changeRightEllipsis"]').prev();
                settings.pagenum = parseInt($numEle.text());
                _addNumBtn(settings, $element, pageLen);
                _triggerEvent(instance, $('[pager-flag="changeRightEllipsis"]', $element));
            });
            $element.off('click', '[pager-flag="changeLeftEllipsis"]').on('click', '[pager-flag="changeLeftEllipsis"]', function() {
                var $numEle = $element.find('[pager-flag="changeLeftEllipsis"]').next();
                var currentNum = parseInt($numEle.text());
                settings.pagenum = currentNum - settings.pagerButtonsCount;
                _addNumBtn(settings, $element, pageLen);
                $element.find('.bh-simplePager-active').removeClass('bh-simplePager-active');
                var $nextActiveEle = $element.find('[pager-flag=simpleGotoPage]')[settings.pagerButtonsCount];
                $($nextActiveEle).addClass('bh-simplePager-active');
                _triggerEvent(instance, $('[pager-flag="changeLeftEllipsis"]', $element));
            });
            //点击上一页
            $element.off('click', '[pager-flag="simplePrev"]').on('click', '[pager-flag="simplePrev"]', function() {
                var isRemoveNextDis = $element.find('[pager-flag="simpleNext"]').hasClass('bh-btn-disabled');
                var isRemovePreDis = $element.find('[pager-flag="simplePrev"]').hasClass('bh-btn-disabled');
                if (isRemovePreDis) {
                    return;
                }
                if (isRemoveNextDis) {
                    $element.find('[pager-flag="simpleNext"]').removeClass('bh-btn-disabled');
                }
                _clickPrev(settings, $element, pageLen);
                _triggerEvent(instance, $(this));
            });
            //点击下一页
            $element.off('click', '[pager-flag="simpleNext"]').on('click', '[pager-flag="simpleNext"]', function() {
                var isRemoveNextDis = $element.find('[pager-flag="simpleNext"]').hasClass('bh-btn-disabled');
                var isRemovePreDis = $element.find('[pager-flag="simplePrev"]').hasClass('bh-btn-disabled');
                if (isRemoveNextDis) {
                    return;
                }
                if (isRemovePreDis) {
                    $element.find('[pager-flag="simplePrev"]').removeClass('bh-btn-disabled');
                }
                _clickNext(settings, $element, pageLen);


                _triggerEvent(instance, $(this));
            });
            //点击数字，跳转
            $element.off('click', 'a[pager-flag="simpleGotoPage"]').on('click', 'a[pager-flag="simpleGotoPage"]', function() {
                var $pageItem = $(this);
                var pagenum = parseInt($pageItem.text());
                settings.pagenum = pagenum - 1;
                _addNumBtn(settings, $element, pageLen);
                var $eventEle = $element.find('a[pager-flag="simpleGotoPage"]').filter(function() {
                    return $(this).text() == pagenum;
                });
                _triggerEvent(instance, $eventEle);
            });

        }
    }
    //生成当前页条数信息
    function _genCurrentPageRecordInfo(instance) {
        var start = 1;
        var end = 1;
        var pagenum = instance.getPagenum();
        var total = instance.getTotal();
        var pagesize = instance.getPagesize();
        if (pagenum * pagesize < total) {
            end = pagenum * pagesize;
        } else {
            end = total;
        }
        start = pagesize * (pagenum - 1) + 1;
        if (total == 0) {
            start = 0;
            end = 0;
        }
        return start + '-' + end;
    }

    //设置当前分页条数和总条数信息
    function _setCurrentPageRecordInfo(instance) {
        //当前分页条数及总条数
        var currPageInfo = _genCurrentPageRecordInfo(instance);
        instance.$element.find('[pager-flag="pageInfo"]').html(currPageInfo + ' 总记录数 ' + instance.settings.totalSize);
    }

    //设置当前页码
    function _setPagenum(pagenum, instance) {
        if (isNaN(pagenum) || pagenum < 1) {
            pagenum = 1;
        }
        var lastPagenum = _getLastpagenum(instance);
        if (pagenum > lastPagenum) {
            pagenum = lastPagenum;
        }
        instance.$element.find('[pager-flag="gotoPage"]').val(pagenum);
    }

    //获取最后一页页码
    function _getLastpagenum(instance) {
        var total = instance.getTotal();
        var pagesize = instance.getPagesize();
        return Math.ceil(total / pagesize);
    }

    //点击上一页
    function _clickPrev(settings, $element, pageLen) {
        if (settings.pagerButtonsCount == 0) {
            var pagenum = parseInt($element.find('[pager-flag="simpleOnliOne"]')[0].innerText) - 1;
            $element.find('[pager-flag="simpleOnliOne"]').text(pagenum);
            if (pagenum == 1) {
                $element.find('[pager-flag="simplePrev"]').addClass('bh-btn-disabled');
            }
        } else {
            var $nowActiveEle = $element.find('.bh-simplePager-active');
            if ($nowActiveEle.prev().prev().hasClass('ellipsis')) {
                settings.pagenum = parseInt($nowActiveEle.text()) - Math.floor(settings.pagerButtonsCount / 2);
            } else {
                settings.pagenum = parseInt($nowActiveEle.text()) - settings.pagerButtonsCount + 1;
            }

            _addNumBtn(settings, $element, pageLen);
            $element.find('.bh-simplePager-active').removeClass('bh-simplePager-active');
            var $numEle = $element.find('[pager-flag=simpleGotoPage]');
            var $activeEle = $numEle.filter(function(index) {
                return parseInt($numEle[index].innerText) == parseInt($nowActiveEle.text()) - 1;
            });
            $activeEle.addClass('bh-simplePager-active');
            if (parseInt($activeEle.text()) == 1) {
                $element.find('[pager-flag=simplePrev]').addClass('bh-btn-disabled');
            }
        }
    }

    // 点击下一页
    function _clickNext(settings, $element, pageLen) {
        if (settings.pagerButtonsCount == 0) {
            var pagenum = parseInt($element.find('[pager-flag="simpleOnliOne"]')[0].innerText) + 1;
            $element.find('[pager-flag="simpleOnliOne"]').text(pagenum);
            if (pagenum == pageLen) {
                $element.find('[pager-flag="simpleNext"]').addClass('bh-btn-disabled');
            }
        } else {
            var nowActiveNum = $element.find('.bh-simplePager-active').text();
            settings.pagenum = parseInt(nowActiveNum);
            _addNumBtn(settings, $element, pageLen);
        }
    }

    //触发事件
    function _triggerEvent(instance, $selector) {
        var pagenum = instance.getPagenum() - 1;
        var pagesize = instance.getPagesize();
        var total = instance.getTotal();
        $selector.trigger('pagersearch', [pagenum, pagesize, total]);
    }
}).call(undefined);