(function($) {
	'use strict';

	$.bhTip = function(data) {
		var bhTipDefaults = {
			content: '', // 必填，提示框的内容
			state: 'success', //必填，3种状态：成功success，警告warning，失败danger
			iconClass: '', //必填，提示图标的样式类
			options: [{ // 可选
				text: '', //a标签名称
				callback: null // 可选，点击按钮后的回调
			}],
			onClosed: function() {},
			animateTimes: 3000
		};
		var options = $.extend({}, bhTipDefaults, data);

		init(options);

		function init(options) {
			options = setDefaultIconClass(options);
			var $body = $('body');
			var tipCont = $body.find('div[bh-tip-role="bhTip"]');
			if (tipCont.length == 0) { // 判断当前是否已存在提示，已存在则点击按钮无作用
				var tipBtnHtml = '';
				var optionsArr = [];
				optionsArr = options.options;
				var optionsArrLen = optionsArr.length;
				if (optionsArrLen >= 1) { // 判断是否传参options，动态添加tip-btn
					for (var i = 0; i < optionsArrLen; i++) {
						tipBtnHtml += '<a href="javascript:void(0);" class="bh-tip-btn" bh-tip-btn-role="tipBtn">' + optionsArr[i].text + '</a>';
					}
					tipBtnHtml = '<div class="bh-tip-btn-group">' + tipBtnHtml + '</div>';
				}
				var tipHtml =
					'<div class="bh-tip bh-tip-animated" bh-tip-role="bhTip">' +
					'<div class="bh-tip-top-bar bh-tip-' + options.state + '" ></div>' +
					'<div class="bh-card bh-card-lv4">' +
					'<a class="bh-tip-closeIcon" bh-tip-btn-role="closeIcon">×</a>' +
					'<div class="bh-tip-content">' +
					'<i class="iconfont ' + options.iconClass + '" ></i> ' +
					'<span>' + options.content + '</span> ' +
					tipBtnHtml +
					'</div>' +
					'</div>' +
					'</div>';
				var $tipObj = $(tipHtml);
				var windowObj = $body.find('div.jqx-window');
				if (windowObj.length == 0) { // 不存在模态弹框时，提示在浏览器顶部显示
					$body.append($tipObj);
					$tipObj.css({
						"position": "fixed"
					});
				} else {
					var windowDialogDom = null;
					var dialogZindex = 0;
					windowObj.each(function() {
                        if(this.style.display !== 'none') {
							var zIndex = parseInt(this.style.zIndex,10);
							if(zIndex > dialogZindex){
								dialogZindex = zIndex;
								windowDialogDom = this;
							}
                        }
					});

					if(windowDialogDom){
						$(windowDialogDom).append($tipObj); // 提示在模态弹框中显示
						$tipObj.css({
							"position": "absolute"
						});
					}else{
						$body.append($tipObj);
						$tipObj.css({
							"position": "fixed"
						});
					}
				}

				// 设置提示条水平居中显示
				var tipWidth = $tipObj.width();
				var tipLeft = 'calc(50% - ' + tipWidth / 2 + 'px)';
				$tipObj.css({
					"left": tipLeft
				});

				// 动态控制文本居中
				setTipContentWidth($tipObj);
				$tipObj.prop('leaving', true);
				$tipObj.addClass("bh-tip-outDown");
				var initTime = +(new Date()); // 定义全局变量记录当前时间
				//  下滑后停留5000ms,再收起
				var stayId = setUpwardFold($tipObj, options.animateTimes);
				//  收起后删除该DOM节点
				var removeId = removeNode($tipObj, options.animateTimes + 450, options);
				//  点击关闭按钮
				closeIconClick($tipObj);
				// 点击按钮后的回调
				callbackListen($tipObj, options);

				mouseOverAndOut($tipObj, stayId, removeId, initTime, 5000, options);
			}
		}

		// 鼠标移入和移出的动作
		function mouseOverAndOut(obj, stayId, removeId, initTime, remainTime, opt) {
			var startTime = initTime; // 记录动画开始时间
			var hoverTime; //记录鼠标移入时间
			var leaveTime; // 记录鼠标移出时间
			var remainTime; //记录鼠标移出后，剩余停留时间	
			obj.off('mouseenter').on("mouseenter", function() {
				obj.prop('leaving', false); // 记录鼠标移入移出的状态
				hoverTime = +(new Date()); // 定义变量记录鼠标移入的时间
				// 停止收起动画和删除节点操作
				clearTimeout(stayId);
				clearTimeout(removeId);
				var timeDiff = hoverTime - startTime;
				if (timeDiff < remainTime) {
					remainTime = remainTime - timeDiff;
				}
			});

			obj.off('mouseleave').on("mouseleave", function() {
				obj.prop('leaving', true);
				leaveTime = +(new Date()); // 定义变量记录鼠标移出的时间
				setUpwardFold(obj, remainTime); //从剩余时间继续执行动画
				var removeTime = remainTime + 450; //等待收起动画经历450ms, 之后删除节点
				removeNode(obj, removeTime, opt);
				mouseOverAndOut(obj, stayId, removeId, leaveTime, remainTime, opt)
			});
		}

		// 设置不同状态下的默认图标样式
		function setDefaultIconClass(options) {
			var iconClass = '';
			switch (options.state) {
				case 'success':
					iconClass = 'icon-checkcircle';
					break;
				case 'warning':
					iconClass = 'icon-erroroutline';
					break;
				case 'danger':
					iconClass = 'icon-error';
					break;
			}
			options.iconClass = options.iconClass ? options.iconClass : iconClass;

			return options;
		}

		// 下滑后停留一定时间,再收起
		function setUpwardFold(obj, time) {
			var stayId = setTimeout(function() {
				if (!obj.prop('leaving')) {
					return;
				}
				obj.removeClass("bh-tip-outDown").addClass("bh-tip-inUp");
			}, time);
			return stayId;
		}

		// 收起后删除该DOM节点
		function removeNode(obj, time, options) {
			var removeId = setTimeout(function() {
				if (!obj.prop('leaving')) {
					return;
				}
				obj.remove();
				if (options.onClosed)
					options.onClosed();
			}, time);
			return removeId;
		}

		// 计算文本宽度设置水平居中
		function setTipContentWidth(obj) {
			var contentObj = obj.find(".bh-tip-content");
			var cardObj = obj.find(".bh-card");
			var objText = $.trim(contentObj.text()); //获得字符串内容
			var textLen = objText.length; //实际字符个数    
			var textWidth = textLen * 12 + 16 + 8; // 计算内容实际宽度：字符个数*每个字符宽度 + 图标宽 + 图标与文字的间距
			if (textWidth > 184) { // 184: 最小宽度240px下内容的最大宽度
				cardObj.css({
					"padding-right": "40px"
				});
			}
		}

		// 点击关闭按钮，立即收起，450ms
		function closeIconClick(obj) {
			obj.on("click", "a[bh-tip-btn-role=closeIcon]", function() {
				obj.removeClass("bh-tip-outDown").addClass("bh-tip-inUp");
				setTimeout(function() {
					obj.remove();
					if (options.onClosed)
						options.onClosed();
				}, 450);
			});
		}

		// 点击操作按钮后的回调
		function callbackListen(obj, option) {
			obj.on("click", "a[bh-tip-btn-role=tipBtn]", function(event) {
				var btnIndex = $(event.target).index(); // 获取当前点击按钮的索引
				var btnOptions = {};
				btnOptions = option.options[btnIndex];
				if (typeof btnOptions.callback != 'undefined' && btnOptions.callback instanceof Function) {
					btnOptions.callback();
				}
			});
		}
	}

})(jQuery);