/**
 * @module cerkeyboard
 * @author chen.yun
 * @version since Wallet V6.8
 */

define([], function() {
    var STRING = {
        IDENTITY: '身份证'
    };
    var template = '<section class="payment-cm-pop payment-cm-pop--num-keyboard" style=" position: fixed; left: 0px; bottom:-300px; z-index: 3012; display:none" >\
            <div class="payment-cm-pop-bd">\
                <div class="payment-cm-keyboard-bar"><span class="payment-btn-secondary js_ok">完成</span></div>\
                <ul class="payment-cm-keyboard-list js_num_item ">\
                    <li data-num="1" class="payment-item-num">1</li>\
                    <li data-num="2" class="payment-item-num">2</li>\
                    <li data-num="3" class="payment-item-num">3</li>\
                    <li data-num="4" class="payment-item-num">4</li>\
                    <li data-num="5" class="payment-item-num">5</li>\
                    <li data-num="6" class="payment-item-num">6</li>\
                    <li data-num="7" class="payment-item-num">7</li>\
                    <li data-num="8" class="payment-item-num">8</li>\
                    <li data-num="9" class="payment-item-num" >9</li>\
                    <li data-num="X" class="payment-item-num payment-cm-keyboard-null"></li>\
                    <li data-num="0" class="payment-item-num">0</li>\
                    <li class="payment-item-num payment-item-del js_item_del"><span class="payment-icon-del"></span></li>\
                </ul>\
            </div>\
        </section><div class="aidDiv" style="height: 300px; display:none"></div>';

    /**
     * @description contructor
     * @param function onFinish 
     * @param function onChange  
     * @param function maxLength  max input number
     *
     */
    var exports = function(param) {
        this._inputCallback = param.inputCallback || function() {};
        this._delCallback = param.delCallback || function() {};
        this._clearCallback = param.clearCallback || function() {};
        this._maxLength = param.maxLength || 18; //输入最大长度
        this._targetInput = param.targetInput || ''; //身份证输入INPUT
        this._targetClear = param.inputClear || ''; //身份证清除
        this._webViewInput = param.webViewInput || ''; //调用键盘页面的INPUT
        this.f_visible = false; //身份证键盘是否开启
        this.f_cursorIndex = 0; //光标位置
        this._curorStart = param.cursorStart;
        this.cerType = STRING.IDENTITY || "";
        this._init();
    };

    exports.prototype = {
        _init: function() {
            var $v = $('.payment-cm-pop--num-keyboard');
            if (!$v[0]) {
                this._vKeyboard = $(template);
                $('body').append(this._vKeyboard);

            } else {
                this._vKeyboard = $v;
            }
            this._targetInput.after('<div class="flight-identity-no"></div>');
            this._aidDiv = $(".aidDiv");
            this._ok = this._vKeyboard.find('.payment-cm-keyboard-bar'); //complete btn
            this._targetDiv = $('.flight-identity-no');
            this._vKeyboardBtns = this._vKeyboard.find("li");
            this._vKeyboardDel = this._vKeyboard.find(".js_item_del");
            this._bindEvent();
        },
        /*bind event*/
        _bindEvent: function() {
            var that = this;
            this._vKeyboard.unbind();
            this._vKeyboard.bind('touchmove', function(e) {
                e.preventDefault()
                e.stopPropagation()
            });
            this._vKeyboard.on('click', function(e) {
                var $this = $(this);
                var $t = $(e.target);
                if ($t.hasClass("payment-item-num")) {
                    if ($t.attr("data-num")) {
                        that._putNum($t.attr('data-num'));
                    }
                }
            });

            this._vKeyboardDel && this._vKeyboardDel.on('click', function() {
                that._delNum()
            });
            this._ok && this._ok.on('click', function() {
                that.hide();
            })
            this._targetClear && this._targetClear.on('click', function(e) {
                that.clean(e)
            })
            window.addEventListener('popstate', function(e) {
                if (history.state) {
                    that.cleanAll()
                }
            }, false);
            $('.main-viewport').unbind().bind('touchstart click', _.bind(this._cerEvent, this));
        },
        _cerEvent: function(e) {
            var isBtn = (e.target == this._targetDiv[0] || e.target == this._targetClear[0] || e.target.parentNode == this._targetClear[0]) && (this.cerType == STRING.IDENTITY)
            if (isBtn) { // 关闭身份证键盘
                if(this._targetClear&&this._targetInput.val()!=''){
                    this._targetClear.show();
                }
                this._inputBlur();
                this.show(e);
            } else {
                this.hide();
            }
        },
        /*clear other input blur to remove system keyboard*/
        _inputBlur: function() {
            var aEle = this._webViewInput;
            var iLen = aEle.length;
            for (i = 0; i < iLen; i++) {
                aEle[i].blur();
            }
        },
        /*num click event*/
        _putNum: function(val) {
            var num = this._targetInput.val();
            if (num.length < this._maxLength) {
                var preStr = num.substr(0, this.f_cursorIndex) + val.toString();
                var endStr = num.substr(this.f_cursorIndex);
                num = num.replace(/\s*/g, "");
                num = preStr + endStr;
                this._targetInput.val(num);
                this._targetClear && this._targetClear.show();
                this._targetDiv.html(preStr + '<span class="identity-cursor">|<span>');
                this.f_cursorIndex++;
            }
            this._inputCallback&&this._inputCallback()
            
        },
        /*del btn event*/
        _delNum: function() {
            if (this.f_cursorIndex > 0) {
                var num = this._targetInput.val();
                var preStr = num.substr(0, this.f_cursorIndex - 1);
                var endStr = num.substr(this.f_cursorIndex);
                num = num.replace(/\s*/g, "");
                num = preStr + endStr;
                this._targetInput.val(num);
                this._targetDiv.html(preStr + '<span class="identity-cursor">|<span>');
                this.f_cursorIndex--;
                this._delCallback&&this._delCallback();
            }
        },
        targetDivHide: function() {
            this._targetDiv.hide();
        },
        targetDivShow: function() {
            this._targetDiv.show();
        },
        getTargetDiv: function() {
            return this._targetDiv;
        },
        /*add cursor*/
        addCursor: function(e) {
            var curval = this._targetInput.offset().left;
            var cVal = this._curorStart || curval;
            var x = e.x || e.clientX || e.pageX;
            var cardNoStr = this._targetInput.val();
            var cursorIndex = (x - cVal > 0) ? parseInt((x - cVal) / 8) : 0;
            var cursorStr = '<span class="identity-cursor">|</span>';

            cursorIndex = cursorIndex >= cardNoStr.length ? cardNoStr.length : cursorIndex;

            this.f_cursorIndex = cursorIndex;
            this._targetDiv.html(cardNoStr.substr(0, cursorIndex) + cursorStr);
        },
        removeCursor: function() {
            this._targetDiv.html('');
        },
        clean: function() {
            this._targetDiv.html('<span class="identity-cursor">|</span>');
            this._targetInput.val('');
            this._targetClear && this._targetClear.hide();
            // 身份证输入光标复位
            this.f_cursorIndex = 0;
            this._clearCallback&&this._clearCallback();
        },
        /**
         * @description show key board
         */
        show: function(e) {
            var that = this;
            this._aidDiv.show();
            this.f_visible = true;
            this.addCursor(e);
            this._vKeyboard.show();
            this._vKeyboard.animate({
                bottom: '0px'
            }, 250);
            setTimeout(function() {
                that._scrollToVisible();
            }, 500)

        },
        _scrollToVisible: function() {
            var targetTop = this._targetInput.offset().top;
            var targetHeight = this._targetInput.offset().height;
            var innerHeight = window.innerHeight;
            var keyboardHeight = this._vKeyboard.offset().height;
            if (innerHeight - targetTop < keyboardHeight) {
                var scrollTop = targetTop - (innerHeight - keyboardHeight) + targetHeight + window.screenTop;
                window.scrollTo(0, parseInt(scrollTop));
            }
        },
        /**
         * @description hide key board
         */

        hide: function() {
            this._aidDiv.hide();
            this.f_visible = false;
            this._vKeyboard.css({
                bottom: '-300px'
            });
            this._vKeyboard.hide();
            this.removeCursor();
        },
        cleanAll: function() {
            this.hide();
            this._vKeyboard.remove();
            this._targetDiv.remove();
            $('.main-viewport').unbind();
        }

    };

    return exports;
});