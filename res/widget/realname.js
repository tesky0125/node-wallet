/**
 * @author      lzx
 * @description Wallet V6.2
 */

define(['text!realname_html', 'Util', 'Message', 'Config'],
function (html, Util, Message, Config) {

    var STRING = {
        REALNAME_TITLE:'确认实名认证信息',
        REALNAME_TIP: '为了账户安全，后续提现只能提至此信息开户的银行卡'
    };
    var exports = function (param) {
        this._tpl = html;
        this.cstMsg = param.mask;
        this.cardHolder = param.cardHolder || '';
        this.cardType = param.cardType || '';
        this.cardTypeString = param.cardTypeString || '';
        this.cardNo = param.cardNo || '';
        this.realNameType=param.realNameType || 0;//实名弹出框类型样式 //-1:过时仅保留 v6.7 0:提现返现绑卡实名 v6.8 1：实名认证 v6.8 2：实名绑卡 v6.8
        this.realNameTitle=param.realNameTitle || STRING.REALNAME_TITLE;
        this.realNameTip = param.realNameTip || STRING.REALNAME_TIP;
        this._init();

        return this;
    };

    exports.prototype = {
        _init: function () {
            this.html = _.template(this._tpl, this);
            this.callback = function () { };
        },
        _bindEvent: function () {
            var that = this;
            var closeBtn = $('.J_Widget_RealName_Cancel');
            var selectItems = $('.J_Widget_RealName_Confirm');
            closeBtn.on('click', function (e) {
                that.callback(0);
                that.close();
            });

            selectItems.on('click', function (e) {
                that.hide();
                that.callback(1);
            });
        },
        /**
        * @description         show widget
        * @parame callback     set widget callback when itemclick
        */
        show: function (callback) {
            this.callback = callback ? callback : function () { };
            this.cstMsg.showMessage(this.html);
            this._bindEvent();
        },
        /**
        * @description         hide widget
        */
        hide: function () {
            this.cstMsg.hide();
        },
        /**
        * @description         close widget
        */
        close: function () {
            this.hide();
        }
    };

    return exports;
});