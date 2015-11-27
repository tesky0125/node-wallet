/**
 * @author      zc      Wallet V6.1
 * @description Select Item Widget
 */

define(['text!popupselect_html', 'Util', 'Message', 'Config'],
function (html, Util, Message, Config) {

    var PopupSelect = function (param) {
        this._tpl = html;
        this.cstMsg = param && param.mask;
        this.title = param && param.title;
        this.selItems = param && param.selItems;
        this.defaultValue = param && param.defaultValue;
        this.scope = param && param.scope;
        this._init();
    };

    PopupSelect.prototype = {
        _init: function () {
            this.html = _.template(this._tpl, this);
            this.callback = function () { };
        },
        _bindEvent: function () {
            var that = this;
            var closeBtn = $('.J_Widget_SelectClose');
            var selectItems = $('.J_Widget_PopupSelect');
            closeBtn.on('click', function (e) {
                that.close();
            });

            selectItems.on('click', function (e) {
                var value = {};
                value.id = $(this).attr("data-id");
                value.name = $(this).attr("data-value");
                that.hide();
                that.callback(value);
            });

            if (this.scope) {
                var $li = $('.J_PopupSelect li[data-id="' + this.defaultValue + '"]');

                if ($li[0]) {
                    $('.J_PopupSelect .J_List')[0].scrollTop = $li[0].offsetTop;
                }
            }

        },
        /**
        * @description         show widget
        * @parame callback     set widget callback when itemclick
        */
        show: function (callback) {
            this.callback = callback ? callback : function () { };
            this.cstMsg.showMessage(this.html, false, true, true);
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

    return PopupSelect;
});