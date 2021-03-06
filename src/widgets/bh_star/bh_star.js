/**
 * 评分组件
 * @module bhStar
 *
 * @example
 * $('#starDiv').bhStar({
 *      score: 3
 * });
 */
(function ($) {
    /**
     * 定义一个插件
     */
    var Plugin;

    /**
     * 这里是一个自运行的单例模式。
     * @private
     */
    Plugin = (function () {

        /**
         * @alias bhStar
         */
        function Plugin(element, setting) {
            var space = this.space = {
                options: null,
                dom: null
            };
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.bhStar.defaults, setting);
            space.options = this.settings;
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            space.dom = this.$element;
            init(this);
        }
        /**
         * 获取评分
         * @inner
         * @method  getScore
         * @memberOf module:bhStar
         * @return {Number} 当前评分值
         * @example
         * $('#starDiv').bhStar('getScore');
         */
        Plugin.prototype.getScore = function() {
            return this.space.options.score;
        };
        return Plugin;

    })();

    function init(instance){
        var html = getStarHtml(instance);
        var $html = $(html);
        instance.space.dom.append($html);

        eventListen($html, instance);
    }

    function getStarHtml(instance){
        var space = instance.space;

        var score = parseInt(space.options.score, 10);
        var starItemStyle = '';
        if(space.options.size){
            starItemStyle = 'font-size: '+space.options.size+'px';
        }

        var starHtml = '<i class="iconfont icon-star" style="'+starItemStyle+'"></i><i class="iconfont icon-staroutline" style="'+starItemStyle+'"></i>';
        var html = '';
        for(var i=0; i<5; i++){
            if(i + 1 <= score){
                html += '<div class="bh-star-item bh-active">'+starHtml+'</div>';
            } else {
                html += '<div class="bh-star-item">'+starHtml+'</div>';
            }
        }

        html = '<div class="bh-star-list '+space.options.starClass+'">'+html+'</div>';

        var scoreNumHtml = '';
        if(space.options.isShowNum){
            scoreNumHtml = '<div class="bh-star-num '+space.options.textClass+'"><span bh-star-role="number">'+score+'</span><span>'+space.options.text+'</span></div>';
        }

        return '<div class="bh-star" bh-star-role="bhStar">'+ html + scoreNumHtml +'</div>';
    }

    function eventListen($starDom, instance){
        var space = instance.space;

        //点击星星的处理
        $starDom.on('click', '.bh-star-item', function(){
            var index = $(this).index() + 1;
            space.options.score = index;
            setStar4Hover($starDom, index, space);
        });
        //鼠标hover到星星的处理
        $starDom.on('mouseover', '.bh-star-item', function(){
            var index = $(this).index() + 1;
            setStar4Hover($starDom, index, space);
        });
        //鼠标离开星星的处理
        $starDom.on('mouseout','.bh-star-list' ,function(){
            var index = parseInt(space.options.score, 10);
            setStar4Hover($starDom, index, space);
        });
    }

    /**
     * 设置我的评分
     * @param $dom
     * @param index 选中星级的序号
     */
    function setStar4Hover($dom, index, space){
        $dom.find('div.bh-star-item').each(function(i){
            if(i < index){
                $(this).addClass('bh-active');
            }else{
                $(this).removeClass('bh-active')
            }
        });
        if(space.options.isShowNum){
            $dom.find('span[bh-star-role="number"]').html(index);
        }
    }

    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhStar = function (options, params) {
        var instance;
        instance = this.data('bhStar');
        /**
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('bhStar', new Plugin(this, options));
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
     * 组件初始化时设置的参数
     * @memberOf module:bhStar
     * @alias settings
     * @inner
     * @property {Number} [score=0] 分值
     * @property {Number} [size=0] 设置星的大小，单位按像素计算
     * @property {Boolean} [isShowNum=true] 是否显示数字
     * @property {String} [text=分] 在分数后面显示的文字
     * @property {String} [textClass] 给分数的父层添加样式类
     * @property {String} [starClass] 给星星的父层添加样式类
     */
    $.fn.bhStar.defaults = {
        score: 0, //可选，设置初始化分数，默认是0
        size: 0, //可选，设置星的大小，单位按像素计算
        isShowNum: true,//可选，是否显示数字，默认显示
        text: '分',//可选，在分数后面显示的文字，默认是“分”
        textClass: '',//可选，给分数的父层添加样式类
        starClass: '' //可选，给星星的父层添加样式类
    };
})(jQuery);