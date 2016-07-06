(function ($) {
    'use strict';

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
            this.settings = $.extend({}, $.fn.bhTimePicker.defaults, options);
            this.settings.format = this.settings.format.replace(/mm/g, 'MM');
            //将dom jquery对象赋值给插件，方便后续调用
            this.$rootElement = $(element);
            init(this);
        }

        //外部获取时间数据
        Plugin.prototype.getValue = function() {
            var startTime = null;
            var endTime = null;
            if(!this.startTimeDom.jqxDateTimeInput('disabled')){
                startTime = this.startTimeDom.jqxDateTimeInput('getText');
            }
            if(!this.endTimeDom.jqxDateTimeInput('disabled')){
                endTime = this.endTimeDom.jqxDateTimeInput('getText');
            }
            return {startTime: startTime, endTime: endTime};
        };

        //外部设置时间数据
        Plugin.prototype.setValue = function(data) {
            var startTime = data.startTime ? timeStrToDate(data.startTime) : this.startTimeDom.jqxDateTimeInput('getDate');
            var endTime = data.endTime ? timeStrToDate(data.endTime) : this.endTimeDom.jqxDateTimeInput('getDate');
            setInputDateTime(this, startTime, endTime);
        };

        //外部设置组件禁用
        Plugin.prototype.setDisable = function() {
            this.$rootElement.children('div[bh-time-picker-role="rangeBox"]').append('<div class="bh-timePick-disable" bh-time-picker-role="disableBlock"></div>');
        };
        //外部设置组件启用
        Plugin.prototype.setEnable = function() {
            this.$rootElement.find('div[bh-time-picker-role="disableBlock"]').remove();
        };

        return Plugin;

    })();

    function init(options){
        var nowDate = new Date();
        //时间选择框html
        var rangeBoxHtml = drawRangeBox(options, nowDate);
        var $rangeBox = $(rangeBoxHtml);
        options.rangeBoxDom = $rangeBox;
        options.$rootElement.html($rangeBox);

        //时间选择框添加事件监听
        rangeBoxEventListen($rangeBox, options);

        //画弹框
        var selectBoxHtml = drawSelectBox(options, nowDate);
        var $selectBox = $(selectBoxHtml);
        options.popupBoxDom = $selectBox;
        var $body = $('body');
        $body.append($selectBox);
        //$selectBox.children('div[bh-time-picker-role="selectBoxTab"]').jqxTabs({ position: 'top'});
        //弹框的jqx组件初始化
        selectBoxJqxInit(options, nowDate);
        //弹框事件监听
        selectBoxEventListen(options);

        //点击body时，将弹出框隐藏
        $body.on('click', function(e){
            var $targetObj = $(e.target || e.srcElement);
            if($targetObj.closest('div[bh-time-picker-role="rangeBox"]').length > 0
                || $targetObj.closest('div[bh-time-picker-role="selectBoxCont"]').length > 0
                || $targetObj.closest('div.jqx-calendar').length > 0
                || $targetObj.closest('div.jqx-listbox').length > 0){
                //清除自己选择时间的标志
                $body.removeData('bhTimePick');
                return;
            }
            //var $rangeBox = $('div[bh-time-picker-role="rangeBox"]');
            var $rangeBox = options.rangeBoxDom;
            if($rangeBox.hasClass('bh-active')){
                //用于处理body被重复点击造成弹框被隐藏的问题
                if($body.data('bhTimePick')){
                    $body.removeData('bhTimePick');
                    return;
                }
                $rangeBox.find('div[bh-time-picker-role="rangeBoxSelectTime"]').click();
            }
        });
    }

    /**
     * 时间选择框
     * @param options
     * @param nowDate 当前时间对象
     * @returns {string}
     */
    function drawRangeBox(options, nowDate){
        var startTime, endTime;
        if(!options.settings.time.start || options.settings.time.start === 'today'){
            startTime = nowDate;
        }else{
            startTime = timeStrToDate(options.settings.time.start);
        }
        if(!options.settings.time.end || options.settings.time.end === 'today'){
            endTime = nowDate;
        }else{
            endTime = timeStrToDate(options.settings.time.end);
        }
        //拼接时间
        var timeStr = startTime.getFullYear() + '年' + numberLessThan10AddPre0(startTime.getMonth()+1) + '月'+ numberLessThan10AddPre0(startTime.getDate()) +'日' +
            '-' +
            endTime.getFullYear() + '年' + numberLessThan10AddPre0(endTime.getMonth()+1) + '月' + numberLessThan10AddPre0(endTime.getDate()) + '日';

        var _style = '';
        if(options.settings.width){
            _style = 'width: '+parseInt(options.settings.width,10)+'px;';
        }

        var disableHtml = '';
        if(options.settings.isDisable){
            disableHtml = '<div class="bh-timePick-disable" bh-time-picker-role="disableBlock"></div>';
        }

        var html =
            '<div class="bh-timePicker-rangeBox bh-clearfix" bh-time-picker-role="rangeBox" style="'+_style+'">' +
                '<div class="bh-timePicker-rangeBox-selectIcon bh-left" bh-time-picker-role="rangeBoxPre">&lt;</div>'+
                '<div class="bh-timePicker-rangeBox-time" bh-time-picker-role="rangeBoxSelectTime">'+timeStr+'</div>'+
                '<div class="bh-timePicker-rangeBox-selectIcon bh-right" bh-time-picker-role="rangeBoxNext">&gt;</div>'+
                disableHtml +
            '</div>' +
            '<div class="bh-clearfix"></div>';

        return html;
    }

    /**
     * 画弹出框
     * @param options
     * @param nowDate 当前时间对象
     * @returns {string}
     */
    function drawSelectBox(options, nowDate){
        //按月选择的月份html
        var monthHtml = getSelectMonthHtml(options, nowDate);
        /**
         * 设置按月选择的年份，
         * 当设置了最大选择范围，若最大的选择范围大于今年，则选用今年
         * 若小于今年，则使用最大范围的这一年
         * @type {number}
         */
        var year = 0;
        var nowYear = nowDate.getFullYear();
        if(!options.settings.range.max || options.settings.range.max === 'today'){
            year = nowYear;
        }else{
            year = timeStrToDate(options.settings.range.max).getFullYear();
            if(year > nowYear){
                year = nowYear;
            }
        }
        var html =
                '<div class="bh-timePick-selectBoxCont" bh-time-picker-role="selectBoxCont">' +
                    '<div class="bh-timePick-selectBox bh-card bh-card-lv2" bh-time-picker-role="selectBox">' +
                        '<ul class="bh-timePick-tab" bh-time-picker-role="selectTab">' +
                            '<li class="bh-timePick-tabItem bh-active">自定义选择</li>' +
                            '<li class="bh-timePick-tabItem">按月选择</li>' +
                        '</ul>' +
                        '<div class="bh-timePick-tabContent" bh-time-picker-role="selectTabContent">' +
                            '<div class="bh-timePick-custom bh-active">' +
                                '<div class="bh-timePick-customTime bh-clearfix" bh-time-picker-role="selectCustom">' +
                                    '<div class="bh-timePick-selectType" bh-time-picker-role="selectType"></div>' +
                                    '<div class="bh-timePick-selectStart" bh-time-picker-role="selectStart"></div>' +
                                    '<div class="bh-timePick-selectConnect"></div>' +
                                    '<div class="bh-timePick-selectEnd" bh-time-picker-role="selectEnd"></div>' +
                                '</div>' +
                                '<a class="bh-btn bh-btn-primary bh-btn-block" bh-time-picker-role="selectOk" href="javascript:void(0);">确定</a>' +
                            '</div>' +
                            '<div class="bh-timePick-selectMonthCont" bh-time-picker-role="selectMonthBlock">' +
                                '<div class="bh-timePick-selectMonth bh-timePicker-rangeBox bh-clearfix">' +
                                    '<div class="bh-timePicker-rangeBox-selectIcon bh-left" bh-time-picker-role="selectMonthPre">&lt;</div>'+
                                    '<div class="bh-timePicker-rangeBox-time" bh-time-picker-role="selectMonthYear">'+year+'年</div>'+
                                    '<div class="bh-timePicker-rangeBox-selectIcon bh-right" bh-time-picker-role="selectMonthNext">&gt;</div>'+
                                '</div>' +
                                '<div class="bh-timePicker-selectMonthList bh-clearfix" bh-time-picker-role="selectMonthList">' +
                                    monthHtml +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

        return html;
    }

    /**
     * 按月选择的月份html
     * @param options
     * @param nowDate 当前时间对象
     * @param type 选择上一年或下一年
     * @returns {string}
     */
    function getSelectMonthHtml(options, nowDate, type){
        var html = '';
        var nowYear = nowDate.getFullYear();
        var maxYear = 0;
        var maxMonth = 0;
        var minYear = 0;
        var minMonth = 0;
        if(options.settings.range.max){
            if(options.settings.range.max !== 'today'){
                var maxObj = timeStrToDate(options.settings.range.max);
                maxYear = maxObj.getFullYear();
                maxMonth = maxObj.getMonth();
            }else{
                maxYear = nowDate.getFullYear();
                maxMonth = nowDate.getMonth();
            }
        }

        if(options.settings.range.min){
            if(options.settings.range.min !== 'today'){
                var minObj = timeStrToDate(options.settings.range.min);
                minYear = minObj.getFullYear();
                minMonth = minObj.getMonth();
            }else{
                minYear = nowDate.getFullYear();
                minMonth = nowDate.getMonth();
            }
        }

        for(var i=0; i<12; i++){
            var month = i + 1;
            var typeClass = '';
            //当没有设置最大范围，则设置所有月份可点击
            if(maxYear && minYear){
                if(minYear !== maxYear){
                    if(minYear < nowYear && nowYear < maxYear){
                        typeClass = 'bh-pre';
                    }else if(minYear === nowYear){
                        if(i >= minMonth){
                            typeClass = 'bh-pre';
                        }
                    }else if(nowYear === maxYear){
                        if(i <= maxMonth){
                            typeClass = 'bh-pre';
                        }
                    }
                }else{
                    if(minMonth <= i && i <= maxMonth){
                        typeClass = 'bh-pre';
                    }
                }
            }else if(maxYear){
                /**
                 * 当设置了最大范围
                 * 若最大范围大于今年，则所有月份可点
                 * 若最大范围小于或等于今年，则大于最大范围的月份不可点
                 */
                if(maxYear > nowYear){
                    typeClass = 'bh-pre';
                }else{
                    if(i <= maxMonth){
                        typeClass = 'bh-pre';
                    }
                }
            }else if(minYear){
                if(minYear < nowYear){
                    typeClass = 'bh-pre';
                }else{
                    if(i >= minMonth){
                        typeClass = 'bh-pre';
                    }
                }
            }else{
                typeClass = 'bh-pre';
            }

            html += '<div class="bh-timePick-monthItem '+typeClass+'" data-month="'+month+'" bh-time-picker-role="selectMonthItem">'+month+'月</div>';
        }
        return html;
    }

    /**
     * 范围显示框的事件监听
     * @param $rangeBox
     */
    function rangeBoxEventListen($rangeBox, options){
        $rangeBox.on('click', function(e){
            options.$rootElement.removeData('selectType');
            var $targetObj = $(e.target || e.srcElement);
            var role = $targetObj.attr('bh-time-picker-role');
            switch (role){
                //上一个区域
                case 'rangeBoxPre':
                    selectRangeBox('pre', options);
                    break;
                //下一个区域
                case 'rangeBoxNext':
                    selectRangeBox('next', options);
                    break;
                //选择时间
                case 'rangeBoxSelectTime':
                    showTimePickerBox(options, $rangeBox);
                    break;
            }
        })
    }

    /**
     * 显示弹框
     * @param $rangeBox
     */
    function showTimePickerBox(options, $rangeBox){
        var $selectBoxCont = options.popupBoxDom;
        var $selectBox = $selectBoxCont.children('div[bh-time-picker-role="selectBox"]');
        if($rangeBox.hasClass('bh-active')){
            timePickerBoxToHide(options);
        }else{
            //获取当前显示框的位置
            var rangeBoxPosition = BH_UTILS.getElementPosition($rangeBox);
            //设置弹框的位置
            var defaultZindex = 9999;
            var boxCss = {"top": rangeBoxPosition.bottom, "left": rangeBoxPosition.left + 20, "display": "block"};
            var jqxWindowZindex = 0;
            $('body').find('.jqx-window').each(function(){
                var itemZindex = parseInt($(this).css('z-index'), 10);
                if(itemZindex > jqxWindowZindex){
                    jqxWindowZindex = itemZindex;
                }
            });
            if(jqxWindowZindex > defaultZindex){
                boxCss['z-index'] = jqxWindowZindex;
            }
            $selectBoxCont.css(boxCss);
            $rangeBox.addClass('bh-active');
            setTimeout(function(){
                $selectBox.addClass('bh-active');
            },10);
        }
    }

    function timePickerBoxToHide(options){
        var $selectBoxCont = options.popupBoxDom;
        var $selectBox = $selectBoxCont.children('div[bh-time-picker-role="selectBox"]');
        $selectBox.find('div[bh-time-picker-role="rangeBoxSelectTime"]').click();
        $selectBox.removeClass('bh-active');
        setTimeout(function(){
            $selectBoxCont.hide();
        }, 450);
        options.rangeBoxDom.removeClass('bh-active');
    }

    /**
     * 弹框的事件监听
     * @param $selectBox
     * @param options
     */
    function selectBoxEventListen(options){
        //tab切换
        options.popupBoxDom.on('click', '.bh-timePick-tabItem', function(){
            var $li = $(this);
            if(!$li.hasClass('bh-active')){
                var liIndex = $li.index();
                var $ul = $li.closest('ul');
                $ul.find('li').removeClass('bh-active');
                $li.addClass('bh-active');

                var $tabContents = options.popupBoxDom.children('div[bh-time-picker-role="selectBox"]').children('div[bh-time-picker-role="selectTabContent"]').children();
                $tabContents.removeClass('bh-active');
                $tabContents.eq(liIndex).addClass('bh-active');
            }
        });

        var $selectCustom = options.popupBoxDom.find('div[bh-time-picker-role="selectCustom"]');
        var $selectStart = $selectCustom.children('div[bh-time-picker-role="selectStart"]');
        var $selectEnd = $selectCustom.children('div[bh-time-picker-role="selectEnd"]');
        var $selectType = $selectCustom.find('div[bh-time-picker-role="selectType"]');
        //开始时间变化事件
        $selectStart.on('change', function (event){
            //判断是否要切换选择类型为自定义
            changeFixedSelectType(options, $selectCustom);
            //验证开始时间是否大于结束时间
            checkTimeOrder($selectCustom, 'start', options);
        });
        //结束事件变化事件
        $selectEnd.on('change', function (event){
            changeFixedSelectType(options, $selectCustom);
            checkTimeOrder($selectCustom, 'end', options);
        });

        //鼠标滑过时间组件时，清除选择类型的状态
        $selectStart.on('mouseover', function (event){
            options.$rootElement.removeData('selectType');
        });
        //鼠标滑过时间组件时，清除选择类型的状态
        $selectEnd.on('mouseover', function (event){
            options.$rootElement.removeData('selectType');
        });

        $selectType.on('change', function (event){
            var args = event.args;
            if (args) {
                var value = args.item.value;
                //添加选择类型状态，用于自己选择时间或按月选择时，将状态类型换成自定义
                options.$rootElement.data('selectType', 'fixed');
                setSelectTime({
                    value: value
                },options);
            }
        });

        //点击确定按钮
        options.popupBoxDom.on('click', '[bh-time-picker-role="selectOk"]', function(){
            //获取时间
            var startTime = $selectStart.jqxDateTimeInput('getDate');
            var endTime = $selectEnd.jqxDateTimeInput('getDate');
            var timeObj = options.getValue();
            var startTimeStr = timeObj.startTime;
            var endTimeStr = timeObj.endTime;
            //设置选择好的时间范围
            resetRangeBoxTime(options, startTime, endTime);
            //隐藏弹框
            timePickerBoxToHide(options);

            //事件回调
            options.$rootElement.trigger("selectedTime", [startTimeStr, endTimeStr]);
            if(typeof options.settings.selectedTime !='undefined' && options.settings.selectedTime instanceof Function){
                options.settings.selectedTime(startTimeStr, endTimeStr);
            }
        });

        //按月选择上一年
        options.popupBoxDom.on('click', '[bh-time-picker-role="selectMonthPre"]', function(){
            changeSelectMonthOfYear($(this).closest('div[bh-time-picker-role="selectMonthBlock"]'), 'pre', options);
        });
        //按月选择下一年
        options.popupBoxDom.on('click', '[bh-time-picker-role="selectMonthNext"]', function(){
            changeSelectMonthOfYear($(this).closest('div[bh-time-picker-role="selectMonthBlock"]'), 'next', options);
        });
        //按月选择选取了某一个月份
        options.popupBoxDom.on('click', '[bh-time-picker-role="selectMonthItem"]', function(){
            changeSelectMonth($(this), options);
        });
    }

    //初始化时间和下拉框组件
    function selectBoxJqxInit(options, nowDate){
        var $selectCustom = options.popupBoxDom.find('div[bh-time-picker-role="selectCustom"]');
        var $selectType = $selectCustom.find('div[bh-time-picker-role="selectType"]');
        var $selectStart = $selectCustom.find('div[bh-time-picker-role="selectStart"]');
        var $selectEnd = $selectCustom.find('div[bh-time-picker-role="selectEnd"]');
        options.startTimeDom = $selectStart;
        options.endTimeDom = $selectEnd;
        initSelectType($selectType, options);
        initSelectTime($selectStart, nowDate, 'start', options);
        initSelectTime($selectEnd, nowDate, 'end', options);
        setSelectTime({value: options.settings.defaultType}, options);
    }

    //初始化下拉框组件
    function initSelectType($selectType, options){
        var source = [
            {name: '自定义',value: 'custom'},
            {name: '全部',value: 'all'},
            {name: '本周',value: 'currentWeek'},
            {name: '上周',value: 'lastWeek'},
            {name: '本月',value: 'currentMonth'},
            {name: '上月',value: 'lastMonth'},
            {name: '本季度',value: 'currentQuarter'},
            {name: '上季度',value: 'lastQuarter'},
            {name: '今年',value: 'currentYear'},
            {name: '去年',value: 'lastYear'},
            {name: '近7天',value: 'last7Day'},
            {name: '近30天',value: 'last30Day'}
        ];
        var selectedIndex = 0;
        $.grep(source,function(item,i){
            if(options.settings.defaultType === item.value){
                selectedIndex = i;
                return true;
            }
        });
        $selectType.jqxDropDownList({width: '80px', source: source, selectedIndex: selectedIndex, autoDropDownHeight: true,valueMember: 'value', displayMember: 'name'});
    }

    //初始化时间组件
    function initSelectTime($timeDom, nowDate, type, options){
        var setValue;
        if(type === 'start'){
            //设置开始时间, 若未设置开始时间或时间是今天，则使用当前时间，否则用传入的时间
            if(!options.settings.time.start || options.settings.time.start === 'today'){
                setValue = nowDate;
            }else{
                setValue = timeStrToDate(options.settings.time.start);
            }
        }else{
            //设置结束时间
            if(!options.settings.time.end || options.settings.time.end === 'today'){
                setValue = nowDate;
            }else{
                setValue = timeStrToDate(options.settings.time.end);
            }
        }
        $timeDom.jqxDateTimeInput({value: setValue, width: '124px', culture: 'zh-CN', formatString: options.settings.format});
    }

    /**
     * 按类型选择时间的处理
     * @param data {type    index}
     */
    function setSelectTime(data, options){
        //24小时 * 60分 * 60秒 * 1000毫秒
        var oneDayTime = 24 * 60 * 60 * 1000;
        var nowDate = new Date();
        var nowDateObj = getDateObj(nowDate);
        var startTime = 0;
        var endTime = 0;
        var value = data.value;
        switch (value){
            //自定义 用于激活时间输入框
            case 'custom':
            break;
            //全部
            case 'all':
                startTime = null;
                endTime = null;
                break;
            //本周
            case 'currentWeek':
                //定位到星期一 = 当前时间戳 - （当前星期 - 1天）* 一天的毫秒数
                startTime = new Date(nowDateObj.time - (nowDateObj.week - 1) * oneDayTime);
                endTime = nowDate;
                break;
            //上周
            case 'lastWeek':
                //定位到这周的星期一
                var currentMondayTime = nowDateObj.time - (nowDateObj.week - 1) * oneDayTime;
                //再定位到上周一 = 本周一 减 7天的时间
                startTime = new Date(currentMondayTime - 7 * oneDayTime);
                //定位到上周末 = 本周一 减 1天的时间
                endTime = new Date(currentMondayTime - 1 * oneDayTime);
                break;
            //本月
            case 'currentMonth':
                //定位到本月1号 = 当前时间戳 - （当前日期 - 1天）* 一天的毫秒数
                startTime = new Date(nowDateObj.time - (nowDateObj.day - 1) * oneDayTime);
                endTime = nowDate;
                break;
            //上月
            case 'lastMonth':
                var preMonthData = getPreMonthData(nowDateObj);
                startTime = preMonthData.startTime;
                endTime = preMonthData.endTime;
                break;
            //本季度
            case 'currentQuarter':
                var currentQuarterData = getCurrentQuarterData(nowDateObj);
                startTime = currentQuarterData.startTime;
                endTime = nowDate;
                break;
            //上季度
            case 'lastQuarter':
                var preQuarterData = getPreQuarterData(nowDateObj);
                startTime = preQuarterData.startTime;
                endTime = preQuarterData.endTime;
                break;
            //今年
            case 'currentYear':
                startTime = timeStrToDate(nowDateObj.year+'/'+'1/1');
                endTime = nowDate;
                break;
            //去年
            case 'lastYear':
                startTime = timeStrToDate(parseInt(nowDateObj.year - 1)+'/'+'1/1');
                endTime = timeStrToDate(parseInt(nowDateObj.year - 1)+'/'+'12/31');
                break;
            //近7天
            case 'last7Day':
                startTime = new Date(nowDateObj.time - 7 * oneDayTime);
                endTime = nowDate;
                break;
            //近30天
            case 'last30Day':
                startTime = new Date(nowDateObj.time - 30 * oneDayTime);
                endTime = nowDate;
                break;
        }
        //设置开始和结束时间
        setInputDateTime(options, startTime, endTime);
    }

    /**
     * 设置开始和结束时间
     * 时间类型可能是对象，也可能是时间戳
     * @param startTime
     * @param endTime
     * @param isCallback 是否要执行回调
     */
    function setInputDateTime(options, startTime, endTime, isCallback){
        var $selectCustom = options.popupBoxDom.find('div[bh-time-picker-role="selectCustom"]');
        var $startTime = $selectCustom.children('div[bh-time-picker-role="selectStart"]');
        var $endTime = $selectCustom.children('div[bh-time-picker-role="selectEnd"]');
        var currentEndTime = $endTime.jqxDateTimeInput('getDate');
        if(!startTime || !endTime){
            if(startTime === null){
                $startTime.jqxDateTimeInput({disabled: true});
            }else{
                $startTime.jqxDateTimeInput({disabled: false});
            }
            if(endTime === null){
                $endTime.jqxDateTimeInput({disabled: true});
            }else{
                $endTime.jqxDateTimeInput({disabled: false});
            }
            if(!startTime && !endTime){
                var $rangeBoxSelectTime = options.$rootElement.find('div[bh-time-picker-role="rangeBoxSelectTime"]');
                var $selectType = options.popupBoxDom.find('div[bh-time-picker-role="selectCustom"] div[bh-time-picker-role="selectType"]');
                var selected = $selectType.jqxDropDownList('getSelectedItem');
                if('all' === selected.value){
                    $rangeBoxSelectTime.html(selected.label);
                    return;
                }
            }
        }
        if($startTime.jqxDateTimeInput('disabled')){
            $startTime.jqxDateTimeInput({disabled: false});
        }
        if($endTime.jqxDateTimeInput('disabled')){
            $endTime.jqxDateTimeInput({disabled: false});
        }
        //这个判断是为了避免校验开始时间大于结束时间导致的时间重置
        if(startTime > currentEndTime){
            $endTime.jqxDateTimeInput('setDate', endTime);
            $startTime.jqxDateTimeInput('setDate', startTime);
        }else{
            $startTime.jqxDateTimeInput('setDate', startTime);
            $endTime.jqxDateTimeInput('setDate', endTime);
        }

        var startTimeObj = $startTime.jqxDateTimeInput('getDate');
        var endTimeObj = $endTime.jqxDateTimeInput('getDate');
        var timeObj = options.getValue();
        var startTimeStr = timeObj.startTime;
        var endTimeStr = timeObj.endTime;
        resetRangeBoxTime(options, startTimeObj, endTimeObj);
        if(isCallback){
            //事件回调
            options.$rootElement.trigger("selectedTime", [startTimeStr, endTimeStr]);
            if(typeof options.settings.selectedTime !='undefined' && options.settings.selectedTime instanceof Function){
                options.settings.selectedTime(startTimeStr, endTimeStr);
            }
        }
    }

    //把日期分割成对象
    function getDateObj(time){
        var myDate = new Date(time);
        var dateObj = {};
        dateObj.year = myDate.getFullYear();
        dateObj.month = myDate.getMonth();
        dateObj.day = myDate.getDate();
        dateObj.hour = myDate.getHours();
        dateObj.minute = myDate.getMinutes();
        dateObj.second = myDate.getSeconds();
        dateObj.week = myDate.getDay();
        dateObj.time = myDate.getTime();
        return dateObj;
    }

    //判断是否闰年
    function isLeapYear(year){
        return (0 == year % 4 && ((year % 100 != 0) || (year % 400 == 0)));
    }

    //获取上个月的数据
    function getPreMonthData(nowDateObj){
        //月份是从0开始的
        var currentMonth = nowDateObj.month;
        var year = nowDateObj.year;
        var month = currentMonth - 1;
        if(currentMonth === 0){
            year = year - 1;
            month = 11;
        }
        var preMonthDays = getOneMonthDays(year, month + 1);
        var startTime = new Date(changeTimeObjToStr({year: year, month: month+1, day: 1}));
        var endTime = new Date(changeTimeObjToStr({year: year, month: month+1, day: preMonthDays}));
        return {startTime: startTime, endTime: endTime};
    }

    //把时间对象转换成字符串
    function changeTimeObjToStr(timeObj){
        return timeObj.year+'/'+timeObj.month+'/'+timeObj.day;
    }

    //获取该月份的天数
    function getOneMonthDays(year, month){
        var days = 0;
        if(month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12){
            days = 31;
        }else if(month === 4 || month === 6 || month === 9 || month === 11){
            days = 30;
        }else{
            if(isLeapYear(year)){
                days = 29;
            }else{
                days = 28;
            }
        }
        return days;
    }

    //获取该季度的时间对象
    function getCurrentQuarterData(nowDateObj){
        var monthData = getStartAndEndMonthOfQuarter(nowDateObj.month);
        var startTime = new Date(changeTimeObjToStr({year: nowDateObj.year, month: monthData.startMonth+1, day: 1}));
        return {startTime: startTime};
    }

    //获取上个季度的时间对象
    function getPreQuarterData(nowDateObj){
        var nowQuarterStartMonth = getStartAndEndMonthOfQuarter(nowDateObj.month).startMonth;
        var preQuarterMonth = nowQuarterStartMonth - 1;
        var year = nowDateObj.year;
        if(nowQuarterStartMonth === 0){
            preQuarterMonth = 11;
            year = year - 1;
        }
        var preQuarterData = getStartAndEndMonthOfQuarter(preQuarterMonth);
        var endTimeDay = getOneMonthDays(year, preQuarterData.endMonth + 1);
        var startTime = new Date(changeTimeObjToStr({year: year, month: preQuarterData.startMonth+1, day: 1}));
        var endTime = new Date(changeTimeObjToStr({year: year, month: preQuarterData.endMonth+1, day: endTimeDay}));;
        return {startTime: startTime, endTime: endTime};
    }

    //根据月份得到该月所在季度的起始月份和结束月份，月份从0开始
    function getStartAndEndMonthOfQuarter(month){
        var startMonth = 0;
        var endMonth = 2;
        if(month >= 9){
            startMonth = 9;
            endMonth = 11;
        }else if(month >= 6){
            startMonth = 6;
            endMonth = 8;
        }else if(month >= 3){
            startMonth = 3;
            endMonth = 5;
        }
        return {startMonth: startMonth, endMonth: endMonth};
    }

    //按月选择里的切换时间
    function changeSelectMonthOfYear($selectMonthBlock, type, options){
        var $selectMonthYear = $selectMonthBlock.find('div[bh-time-picker-role="selectMonthYear"]');
        var year = parseInt($selectMonthYear.text(), 10);
        var maxYear = 0;
        if(options.settings.range.max){
            maxYear = options.settings.range.max === 'today' ? new Date().getFullYear() : new Date(options.settings.range.max).getFullYear();
        }
        var minYear = 0;
        if(options.settings.range.min){
            minYear = options.settings.range.min === 'today' ? new Date().getFullYear() : new Date(options.settings.range.min).getFullYear();
        }
        //上一年
        if(type === 'pre'){
            if(year === minYear){
                return;
            }
            year--;
        }else{
            //下一年，若下一年比当前年大，则不做处理
            if(year === maxYear){
                return;
            }
            year++;
        }
        $selectMonthYear.html(year + '年');
        var monthHtml = getSelectMonthHtml(options, timeStrToDate(year+'/12/1'), type);
        $selectMonthBlock.find('div[bh-time-picker-role="selectMonthList"]').html(monthHtml);
    }

    /**
     * 切换选择的月份
     * @param $month
     * @param options
     */
    function changeSelectMonth($month, options){
        //若该月份比当前月份大，则点击无效
        if(!$month.hasClass('bh-pre')){
            return;
        }
        var $selectMonthBlock = $month.closest('div[bh-time-picker-role="selectMonthBlock"]');
        var year = parseInt($selectMonthBlock.find('div[bh-time-picker-role="selectMonthYear"]').text(), 10);
        var month = parseInt($month.attr('data-month'), 10);
        var endDay = getOneMonthDays(year, month);
        //移除状态标识
        options.$rootElement.removeData('selectType');
        //隐藏弹框
        options.rangeBoxDom.find('div[bh-time-picker-role="rangeBoxSelectTime"]').click();
        //设置开始和结束时间组件的时间
        setInputDateTime(options, new Date(year+'/'+month+'/1'), new Date(year+'/'+month+'/'+endDay), true);
    }

    //设置显示的时间范围
    function resetRangeBoxTime(options, startTime, endTime){
        var $rangeBoxSelectTime = options.$rootElement.find('div[bh-time-picker-role="rangeBoxSelectTime"]');
        var $selectType = options.popupBoxDom.find('div[bh-time-picker-role="selectCustom"] div[bh-time-picker-role="selectType"]');
        var selected = $selectType.jqxDropDownList('getSelectedItem');
        if('all' === selected.value){
            $rangeBoxSelectTime.html(selected.label);
            return;
        }
        var startTimeStr = getLocalDateStr(startTime);
        var endTimeStr = getLocalDateStr(endTime);
        $rangeBoxSelectTime.html(startTimeStr + '-' + endTimeStr);
    }

    function getLocalDateStr(time){
        return time.getFullYear() + '年' + numberLessThan10AddPre0(time.getMonth()+1) + '月' + time.getDate() + '日';
    }

    //将小于10的数字前面加上0，如01
    function numberLessThan10AddPre0(num){
        return num < 10 ? '0' + num : num;
    }

    /**
     * 判断选择状态是否要切换成自定义
     * 当selectType属性不存在时，切换成自定义
     * @param $selectCustom
     */
    function changeFixedSelectType(options, $selectCustom){
        var selectType = options.$rootElement.data('selectType');
        if(typeof selectType !== 'undefined' && selectType === 'fixed'){
            return;
        }
        $selectCustom.find('div[bh-time-picker-role="selectType"]').jqxDropDownList('selectIndex', 0 );
    }

    /**
     * 自己手动改变时间时，判断开始时间是否大于结束时间
     * 若大于则将两个时间设为相同的时间
     * 同时验证选取的时间是否在传入的范围内
     * 若不在，则开始时间以传入范围的最小时间算，结束时间按传入的最大时间算
     * @param $selectCustom
     * @param type
     */
    function checkTimeOrder($selectCustom, type, options){
        //设置自己选择时间的标志，用于处理body被重复点击造成弹框被隐藏的问题
        $('body').data('bhTimePick', 'selectTime');
        var $selectStart = $selectCustom.children('div[bh-time-picker-role="selectStart"]');
        var $selectEnd = $selectCustom.children('div[bh-time-picker-role="selectEnd"]');
        var startTime = $selectStart.jqxDateTimeInput('getDate');
        var endTime = $selectEnd.jqxDateTimeInput('getDate');
        if(startTime > endTime){
            //当选取的是结束时间，将结束时间设成和开始时间一样
            if(type === 'end'){
                var startDate = getDateObj(startTime);
                $selectEnd.jqxDateTimeInput('setDate', new Date(startDate.year, startDate.month, startDate.day));
            }else{
                //当选取的是开始时间，将开始时间设成和结束时间一样
                var endDate = getDateObj(endTime);
                $selectStart.jqxDateTimeInput('setDate', new Date(endDate.year, endDate.month, endDate.day));
            }
            return;
        }

        //判断开始时间是否在传入的时间范围内
        if(type === 'start'){
            if(options.settings.range.min){
                var minTime;
                if(options.settings.range.min !== 'today'){
                    minTime = new Date(options.settings.range.min);
                }else{
                    minTime = new Date();
                }

                if(startTime < minTime){
                    $selectStart.jqxDateTimeInput('setDate', minTime);
                }
            }
        }else{
            if(options.settings.range.max){
                var maxTime;
                if(options.settings.range.max !== 'today'){
                    maxTime = new Date(options.settings.range.max);
                }else{
                    maxTime = new Date();
                }

                if(endTime > maxTime){
                    $selectEnd.jqxDateTimeInput('setDate', maxTime);
                }
            }
        }
    }

    /**
     * 点击左右切换显示时间的处理
     * @param type pre或next
     */
    function selectRangeBox(type, options){
        var $selectBox = options.popupBoxDom.find('div[bh-time-picker-role="selectBox"]');
        var $rangeBox = options.$rootElement.find('div[bh-time-picker-role="rangeBox"]');
        if($rangeBox.hasClass('bh-active')){
            $rangeBox.find('div[bh-time-picker-role="rangeBoxSelectTime"]').click();
        }
        var time;
        //当点击的是上一个按钮，则以开始时间为基准
        if(type === "pre"){
            time = $selectBox.find('div[bh-time-picker-role="selectStart"]').jqxDateTimeInput('getDate');
        }else{
            //当点击的是下一个按钮，则以结束时间为基准
            time = $selectBox.find('div[bh-time-picker-role="selectEnd"]').jqxDateTimeInput('getDate');
        }
        var dateObj = getDateObj(time);
        var rangeDate;
        var oneDayTime = 24 * 60 * 60 * 1000;
        if(type === 'pre'){
            //点击上一个按钮，若开始时间是1月份，则调整为上一年的12月份，否则调整为上一个月
            if(dateObj.month === 0){
                dateObj.month = 11;
                dateObj.year = dateObj.year - 1;
            }else{
                dateObj.month = dateObj.month - 1;
            }
            //当有最小的时间范围时，判断选择的时间是否不在这个范围，不在则设置为这个最小时间
            if(options.settings.range.min){
                var minTime = options.settings.range.min === 'today' ? new Date() : timeStrToDate(options.settings.range.min);
                rangeDate = getDateObj(minTime);
                if(minTime > new Date(time.getTime() - (30 * oneDayTime))){
                    dateObj = rangeDate;
                }
            }
        }else{
            //点击的是下一个按钮
            //若不是今年的话，若选择的月是12月，则调整为下一年的1月份，否则调整为下个月
            if(dateObj.month === 11){
                dateObj.month = 0;
                dateObj.year = dateObj.year + 1;
            }else{
                dateObj.month = dateObj.month + 1;
            }

            //当有最大的时间范围时，判断选择的时间是否不在这个范围，不在则设置为这个最大时间
            if(options.settings.range.max){
                var maxTime = options.settings.range.max === 'today' ? new Date() : timeStrToDate(options.settings.range.max);
                rangeDate = getDateObj(maxTime);
                if(maxTime < new Date(time.getTime() + (30 * oneDayTime))){
                    dateObj = rangeDate;
                }
            }
        }

        var startTime = {};
        var endTime = {};
        //若年份不一致，则直接使用选取的时间
        if(!rangeDate || dateObj.year !== rangeDate.year){
            startTime = {year: dateObj.year, month: dateObj.month, day: 1};
            endTime = {year: dateObj.year, month: dateObj.month, day: getOneMonthDays(dateObj.year, dateObj.month + 1)};
        }else{
            //若选择的年份一致，若选取的月份不是当前月，则直接使用选取的时间，若是当前月则最后的日期使用今天的
            if(dateObj.month !== rangeDate.month){
                startTime = {year: dateObj.year, month: dateObj.month, day: 1};
                endTime = {year: dateObj.year, month: dateObj.month, day: getOneMonthDays(dateObj.year, dateObj.month + 1)};
            }else{
                if(type === 'pre'){
                    startTime = {year: dateObj.year, month: dateObj.month, day: rangeDate.day};
                    endTime = {year: dateObj.year, month: dateObj.month, day: getOneMonthDays(dateObj.year, dateObj.month + 1)};
                }else{
                    startTime = {year: dateObj.year, month: dateObj.month, day: 1};
                    endTime = {year: dateObj.year, month: dateObj.month, day: rangeDate.day};
                }
            }
        }

        var monthStr = dateObj.month + 1 < 10 ? '0' + parseInt(dateObj.month + 1, 10) : dateObj.month + 1;
        var startTimeStr = startTime.year + '/' + monthStr + '/' + numberLessThan10AddPre0(startTime.day);
        var endTimeStr = endTime.year + '/' + monthStr + '/' + endTime.day;
        setInputDateTime(options, timeStrToDate(startTimeStr), timeStrToDate(endTimeStr), true);
    }

    //时间字符串转成时间对象
    function timeStrToDate(DateStr){
        var converted = Date.parse(DateStr);
        var myDate = new Date(converted);
        if (isNaN(myDate)){
            //var delimCahar = DateStr.indexOf('/')!=-1?'/':'-';
            var arys= DateStr.split('-');
            myDate = new Date(arys[0],--arys[1],arys[2]);
        }
        return myDate;
    }

    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhTimePicker = function (options, params) {
        var instance;
        instance = this.data('bhTimePicker');
        /**
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('bhTimePicker', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        /**
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
     * 插件的默认值
     */
    $.fn.bhTimePicker.defaults = {
        defaultType: '',
        width: '',
        format: 'yyyy-MM-dd',//可选，时间格式，默认yyyy-MM-dd（年-月-日）
        range: { //可选，设置时间的可选范围
            max: '', //可选，设置最大时间，‘today’最大时间就是今天，或传入时间字符串‘2016/4/22’
            min: '' //可选，设置最小时间，‘today’最小时间就是今天，或传入时间字符串‘2016/4/22’
        },
        time: { //可选，设置初始化时间
            start: '', //可选，开始时间
            end: '' //可选，结束时间
        },
        isDisable: false, //可选，该组件是否禁用，默认false，不禁用
        selectedTime: null, //选取时间后的回调，返回开始时间和结束时间字符串
        ready: null //初始化完成回调
    };
})(jQuery);