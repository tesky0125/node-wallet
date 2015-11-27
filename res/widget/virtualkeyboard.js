/**
* @module virtualkeyboard
* @author luzx
* @description its a global widgit. you can inherited walletpageview and call it 
* @version since Wallet V5.8 
*/

define([], function () {



    var template = [
    '<ul class="keyboard J_Vertual-keyboard hidden">',
    '<li data-num="1" class="J_Function-key J_Number">1</li>',
    '<li data-num="2" class="J_Function-key J_Number">2</li>',
    '<li data-num="3" class="J_Function-key J_Number">3</li>',
    '<li data-num="4" class="J_Function-key J_Number">4</li>',
    '<li data-num="5" class="J_Function-key J_Number">5</li>',
    '<li data-num="6" class="J_Function-key J_Number">6</li>',
    '<li data-num="7" class="J_Function-key J_Number">7</li>',
    '<li data-num="8" class="J_Function-key J_Number">8</li>',
    '<li data-num="9" class="J_Function-key J_Number">9</li>',
    '<li class="bgc2">&nbsp;</li>',
    '<li data-num="0" class="J_Function-key J_Number">0</li>',
    '<li class="J_Delete bgc2 J_Function-key delete"></li>',
    '</ul>'
    ].join('');

    /**
     * @description contructor
     * @param function onFinish 
     * @param function onChange  
     * @param function maxLength  max input number
     *
    */
    var exports = function (param) {
        this._onFinish = param.onFinish || function () { };
        this._onChange = param.onChange || function () { };
        this._maxLength = param.maxLength || 6;
        this._inputedNum = [];
        this._init();
    };

    exports.prototype = {
        _init: function () {
            var $v = $('.J_Vertual-keyboard');
            if (!$v[0]) {
                this._vKeyboard = $(template);
                $('body').append(this._vKeyboard);
            } else {
                this._vKeyboard = $v;
            }
            this._bindEvent();
            this._vKeyboardBtns = this._vKeyboard.find("li");
        },
        _onFinish: function () {/*abstract function*/ },
        _onChange: function () {/*abstract function*/ },
        _putNum: function (num) {
            num = parseInt(num);
            if (this._inputedNum.length < this._maxLength) {
                this._inputedNum.push(num);
                this._onChange(this._inputedNum);
                if (this._inputedNum.length == this._maxLength) {
                    this._onFinish();
                }
            }
        },
        _delNum: function () {
            if (this._inputedNum.length > 0) {
                this._inputedNum.length = this._inputedNum.length - 1;
                this._onChange(this._inputedNum);
            }
        },
        _bindEvent: function () {
            var that = this;
            this._vKeyboard.unbind();
            this._vKeyboard.on('click', function (e) {
                var $this = $(this);
                var $t = $(e.target);
                if ($t.hasClass("J_Function-key")) {
                    if ($t.hasClass("J_Number")) {
                        that._putNum($t.attr('data-num'));
                    } else if ($t.hasClass("J_Delete")) {
                        that._delNum();
                    }
                }

            })
        },
        /**
        * @description show key board
        */
        show: function () {
            this._vKeyboard.removeClass("hidden");
            this._vKeyboard.show();
        },
        /**
        * @description hide key board
        */
        hide: function () {
            this._vKeyboard.hide();
            this.clean();
        },
        /**
        * @description get value what you inputed.
        */
        getValue: function () {
            //for inputed num maybe is begin with zero, so return string.
            return this._inputedNum.length > 0 ? this._inputedNum.join("") : null;
        },
        /**
        * @description you shoule call it after page hide.
        */
        clean: function () {
            this._inputedNum.length = 0;
        }
    };

    return exports;
});

