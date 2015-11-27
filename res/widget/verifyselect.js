/**
* @author wwg      Wallet V6.3
* @description Psd Select Widget
*/

define([], function () {

    function VerifySelect() { };

    var HtmlContent = '<div class="cui-view cui-layer cui-alert" id="Div1" style="margin-left: -150px; margin-top: -90px; z-index: 3007; visibility: visible;">'+
                        '<div class="cui-pop-box" style=" background:#f0f0f0">'+
                            '<div class="cui-hd" style="background:#f0f0f0; color:#000; font-size:18px; text-align: center;" >选择验证方式<span class="printclose J_VerifySelectClose"></span></div>' +
                            '<div class="cui-bd">'+
                             '<ul class="printpass">'+
                             '<li class="J_VerifySelectFinger"><span class="pass1"></span>使用指纹支付</li>' +
                             '<li class="J_VerifySelectPassword"><span class="pass2"></span>输入密码验证</li>' +
                             '</ul>'+
                            '</div>'+
                          '</div>' +
                       '</div>';

    VerifySelect.prototype = {
        init: function (mask) {
            this.mask = mask;
        },
        show: function (callback) {
            this.callback = callback;

            this.mask.showMessage(HtmlContent, false, true, true);

            this._bindEvent();
        },
        _bindEvent: function () {
            var _that = this;
            var $close = $('.J_VerifySelectClose');
            var $finger = $('.J_VerifySelectFinger');
            var $password = $('.J_VerifySelectPassword');


            $close.on('click', function (e) {
                _that.close();
                if (_that.callback) {
                    _that.callback(0); // 0 关闭
                }
            });

            $password.on('click', function (e) {
                _that.close();
                if (_that.callback) {
                    _that.callback(1); // 1 密码验证
                }
            });

            $finger.on('click', function (e) {
                _that.close();
                if (_that.callback) {
                    _that.callback(2); //2 指纹验证
                }
            });


        },
        close: function () {
            this.mask.close();
        }
    };


    return new VerifySelect();
});