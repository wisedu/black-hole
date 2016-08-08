/**
 * @fileOverview 字符截断组件
 * @example
$.bhCutStr({
    dom: { //可选，当要显示文本的dom结构已经存在，选用此方法
        selector: '', //必选，截断文本所在容器的jquery选择器
        line: 0, //必选，指定显示的文本行数
        content: '' //可选，传入的文本内容（若文本已经加载到dom里了，则此项可不加）
    },
    text: { //可选，纯粹的对字符串做截断处理,使用该方式显示更多的处理自能自己处理
        content: '', //必填，传入的文本内容
        number: 0 //要截断的字符个数
    },
    moreBtn: {
        content: '', //可选，更多按钮的文字
        url: '', //可选，超链接所指向的地址
        isOpenNewPage: true //可选，当url存在时，该选项才能生效，默认是打开新页面
    }
});
 */
(function($) {
  'use strict';
  /**
   * 这里是一个自运行的单例模式。
   * @module bhCutStr
   */
  $.bhCutStr = function(data) {
    /**
     * @memberof module:bhCutStr
     * @description 内置默认值
     * @prop {object}  data
     * 
     * @prop {object}  data.dom - 可选，当要显示文本的dom结构已经存在，选用此方法
     * @prop {$}       data.dom.selector - 必选，截断文本所在容器的jquery选择器
     * @prop {number}  data.dom.line - 必选，指定显示的文本行数
     * @prop {string}  data.dom.content - 可选，传入的文本内容（若文本已经加载到dom里了，则此项可不加）
     * 
     * @prop {object}  data.text - 可选，纯粹的对字符串做截断处理,使用该方式显示更多的处理
     * @prop {number}  data.text.line - 必选，要截断的字符个数
     * @prop {string}  data.text.content - 必填，传入的文本内容
     * 
     * @prop {object}  data.moreBtn - 可选，设置更多按钮
     * @prop {string}  data.moreBtn.content - 可选，更多按钮的文字
     * @prop {string}  data.moreBtn.url - 可选，超链接所指向的地址
     * @prop {boolean} data.moreBtn.isOpenNewPage - 可选，当url存在时，该选项才能生效，默认是打开新页面
     * 
     */
    var bhCutStrDefaults = {
      dom: { //可选，当要显示文本的dom结构已经存在，选用此方法
        selector: '', //必选，截断文本所在容器的jquery选择器
        line: 0, //必选，指定显示的文本行数
        content: '' //可选，传入的文本内容（若文本已经加载到dom里了，则此项可不加）
      },
      text: { //可选，纯粹的对字符串做截断处理,使用该方式显示更多的处理自能自己处理
        content: '', //必填，传入的文本内容
        number: 0 //要截断的字符个数
      },
      moreBtn: {
        content: '', //可选，更多按钮的文字
        url: '', //可选，超链接所指向的地址
        isOpenNewPage: true //可选，当url存在时，该选项才能生效，默认是打开新页面
      }
    };
    //将{}, bhCutStrDefaults, data进行合并，然后将合并结果返回给options
    var options = $.extend({}, bhCutStrDefaults, data);

    return init(options);
    /**
     * 初始化字符串截断函数
     * @param  options
     * @return string
     */
    function init(options) {
      var $objArr = options.dom ? options.dom.selector : "";
      if ($objArr.length > 0) {
        $objArr.each(function() {
          /*生成随机字符串*/
          var guid = BH_UTILS.NewGuid();
          var $obj = $(this);
          //在该dom下添加一个零时dom来获取这个块的font-size
          $obj.append(
            '<div id="' + guid + '">' +
            '<div id="chinese-' + guid + '" style="display: none;position: absolute;">是</div>' +
            '<div id="lower-english-' + guid + '" style="display: none;position: absolute;">w</div>' +
            '</div>');
          var tempObj = $obj.find('#' + guid);
          //中文字符和大写的英文的大小
          options.chineseFontSize = tempObj.find('#chinese-' + guid).width();
          //小写的英文和数字的大小
          options.lowerEnFontSize = tempObj.find('#lower-english-' + guid).width();
          tempObj.remove();

          //获取文本所在dom的宽度
          var objWidth = $obj.width();
          var objText = options.dom.content ? $.trim(options.dom.content) : $.trim($obj.text()); //获得字符串内容
          var textLen = objText.length; //实际字符个数

          //按所有文本都是中文字符计算出的文字个数
          var tempComputeTextLen = parseInt(objWidth * options.dom.line / options.chineseFontSize, 10);
          //当内容的字符数比计算出的字符数少，则不做任何处理
          if (textLen <= tempComputeTextLen) {
            return;
          }

          var url = 'javascript:void(0);';
          var target = 'target="blank"';
          var moreStr = '';
          var moreText = '';
          if (options.moreBtn) {
            url = !options.moreBtn.url || options.moreBtn.url.length === 0 ? 'javascript:void(0);' : options.moreBtn.url;
            target = !options.moreBtn.isOpenNewPage ? 'target="blank"' : '';
            moreText = options.moreBtn.content ? options.moreBtn.content : '';
            moreStr = '<a href="' + url + '" class="bh-cut-str-more" bh-cut-str-role="bhCutStr" ' + target + ' data-guid="' + guid + '" data-full-str="' + objText + '">' + moreText + '</a>';
          }

          //更多按钮的宽度
          var moreTextWidth = moreText ? getTextWidth(moreText) : 0;
          //省略号的宽度，按一个中文字符的宽度算
          var ellipsisWidth = options.chineseFontSize;
          //去掉更多按钮和省略号的剩余宽度和一个字符的偏差宽度
          var canUseWidth = objWidth * options.dom.line - moreTextWidth - ellipsisWidth - options.chineseFontSize;
          var computeTextLen = parseInt(canUseWidth / options.chineseFontSize, 10);
          var computeText = getCutText(canUseWidth, computeTextLen, objText);

          $obj.html(computeText + "..." + moreStr);

          if (moreStr) {
            moreTextEvent($obj.find('a[bh-cut-str-role="bhCutStr"]'));
          }
        });
      } else {
        var text = $.trim(options.text.content);
        var cutText = text;
        if (text.length > options.text.number) {
          cutText = text.substring(0, options.text.number) + '...';
        }

        var url = 'javascript:void(0);';
        var target = 'target="blank"';
        var moreStr = '';
        var moreText = '';
        if (options.moreBtn) {
          url = !options.moreBtn.url || options.moreBtn.url.length === 0 ? 'javascript:void(0);' : options.moreBtn.url;
          target = !options.moreBtn.isOpenNewPage ? 'target="blank"' : '';
          moreText = options.moreBtn.content ? options.moreBtn.content : '';
          moreStr = '<a href="' + url + '" class="bh-cut-str-more" bh-cut-str-role="bhCutStr" ' + target + ' data-full-str="' + text + '">' + moreText + '</a>';
        }

        cutText += moreStr;
        return cutText;
      }
    }
    /**
     * [getCutText 获取截断文本]
     * @param  {number} width   可以使用的宽度
     * @param  {number} textLen 计算后文本的字符数
     * @param  {string} text    字符串内容
     * @return {string}
     */
    function getCutText(width, textLen, text) {
      //按传入的长度截取字符
      var cutText = text.substring(0, textLen);
      //截取后剩余的字符
      var surplusText = text.substring(textLen, text.length);
      //获取该字符串的宽度
      var textWidth = getTextWidth(cutText);
      //当字符的宽度小于理论宽度，计算偏差字符
      var diffText = '';
      if (textWidth < width) {
        var diffWidth = width - textWidth;
        //当偏差的宽度大于1个中文字符时，继续截断
        if (diffWidth > options.chineseFontSize) {
          var diffTextLen = parseInt(diffWidth / options.chineseFontSize, 10);
          diffText = getCutText(diffWidth, diffTextLen, surplusText);
        }
      }
      return cutText + diffText;
    }
    /**
     * [getTextWidth 获取文本宽度]
     * @param  {type} text 目标文本
     * @return {type}
     */
    function getTextWidth(text) {
      //匹配中文
      var chinese = text.match(/[^\x00-\xff]/g);
      var chineseLen = chinese ? chinese.length : 0;
      //大写字母和@
      var capitalEn = text.match(/[A-Z@]/g);
      var capitalEnLen = capitalEn ? capitalEn.length : 0;
      var lowerEnLen = text.length - chineseLen - capitalEnLen;
      //大写字母按中文字符的宽度算
      var width = (chineseLen + capitalEnLen) * options.chineseFontSize + lowerEnLen * options.lowerEnFontSize;
      return width;
    }
    /**
     * [moreTextEvent 查看更多文本]
     * @param  {$} $moreStr jquery选择器
     *  
     */
    function moreTextEvent($moreStr) {
      $moreStr.on('mouseover', function() {
        var text = $moreStr.attr('data-full-str');
        var guid = $moreStr.attr('data-guid');

        var $textContainer = $moreStr.parent();
        var containerWidth = $textContainer.width();
        setAndShowPopBoxPosition($moreStr, containerWidth, text, guid);
      });
      $moreStr.on('mouseout', function() {
        var guid = $moreStr.attr('data-guid');
        var $box = $('#' + guid);
        moreBoxToHide($box);
      });
    }

    function moreBoxEvent($moreBox) {
      $moreBox.on('mouseover', function() {
        $moreBox.data('flag', 'show');
      });
      $moreBox.on('mouseout', function() {
        moreBoxToHide($moreBox);
      });
    }

    function moreBoxToHide($box) {
      $box.data('flag', 'hide');
      setTimeout(function() {
        if ($box.data('flag') === 'hide') {
          $box.removeClass('bh-active');
          setTimeout(function() {
            $box.remove();
          }, 250);
        }
      }, 150);
    }
    /**
     * [setAndShowPopBoxPosition 设置与展示气泡框的位置]
     * @param {$} $element 
     * @param {number} boxWidth 
     * @param {string} content  
     *      
     */
    function setAndShowPopBoxPosition($element, boxWidth, content, id) {
      var elementPosition = BH_UTILS.getElementPosition($element);
      var windowHeight = window.innerHeight;
      var halfWindowHeight = parseInt(windowHeight / 2, 10);
      var windowScrollTop = window.scrollY;
      var $content = '<div data-flag="content">' + content + '</div>';
      var frameHtml = '<div id="' + id + '" style="width: ' + boxWidth + 'px;" class="bh-cutStr-popBox bh-card bh-card-lv2 bh-animate-transform-base bh-animate-scale">' + $content + '</div>';
      var $frameHtml = $(frameHtml);
      $('body').append($frameHtml);

      //默认展开的起点是右上角
      var boxStyle = {
        left: elementPosition.right - boxWidth + 'px',
        top: elementPosition.bottom + 'px'
      };
      var boxOriginClass = 'bh-animate-origin-TR';
      var contentHeight = $frameHtml.outerHeight();
      var maxHeight = 0; //更多展示框的最大高度
      //查看当前位置高度，辨别是上部还是下部的可用空间较多
      var canShowHeight = 0;
      var diff = 8; //留出弹框距离页面的边距
      if (elementPosition.top - windowScrollTop > halfWindowHeight) {
        //当上部有更多展示空间的处理
        canShowHeight = elementPosition.top - windowScrollTop - $('header[bh-header-role="bhHeader"]').outerHeight() - diff;
        boxOriginClass = 'bh-animate-origin-BR';
        maxHeight = canShowHeight > contentHeight ? contentHeight : canShowHeight;
        boxStyle.top = elementPosition.top - maxHeight + 'px';
      } else {
        //当下部有更多展示空间的处理
        canShowHeight = windowHeight + windowScrollTop - elementPosition.bottom - $('footer[class="bh-footer"]').outerHeight() - diff;
        maxHeight = canShowHeight > contentHeight ? contentHeight : canShowHeight;
      }

      boxStyle['max-height'] = maxHeight + 'px';

      $frameHtml.css(boxStyle).addClass(boxOriginClass);
      setTimeout(function() {
        $frameHtml.addClass('bh-active');
      }, 10);
      moreBoxEvent($frameHtml);
    }
  }
})(jQuery);