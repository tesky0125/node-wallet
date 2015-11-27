/**
* @module walletselectctrl
* @author wxm
* @description wallet select control: popup list menu with dropdown icon on a mask
* @version since Wallet V5.8
* @history big change after Wallet V6.6, because lizard 2.1 not support cUIAbstractView any more
*/

define(['cCoreInherit', 'UIView', 'Config', 'text!selectctrl_html'], function (cBase, UIView, Config, html) {
    var instance = undefined;

    var ClsSelct = _.inherit(UIView, {
        _adjustMaskHeight: function () {
            var htHead = $("#headerview").offset().height;
            //var htSelect = $(".J_Select").offset().height;
            var htMask = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight - htHead/* - htSelect*/) + 'px';
            var scrolltop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);

            $(".J_Ml").css('top', (scrolltop + htHead) + 'px');
            $(".J_Ml").css('height', htMask);
            if (Config.IS_INAPP) {//
                htHead = 0;//no head in app
            }
            $(".J_Select").css('top', (scrolltop + htHead) + 'px');
        },
        _bindEvent: function () {
            var that = this;

            this._adjustMaskHeight();

            var scrolltop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
            this._onScrll = (function (e) {
                document.body.scrollTop = scrolltop; //disable background view scroll
                this._adjustMaskHeight();
            }).bind(that);

            $(document).on("scroll", this._onScrll);

            this.$el.bind('touchmove', function (e) {
                e.preventDefault();
            });
            this.$el.on('click', function (e) {
                that.close();
            });
            $('.J_SelectItem').on('click', function (e) {
                var li = e.currentTarget;
                that.close();
                if (that.onItemSelect) {
                    that.onItemSelect($(li).attr('data-idx'));
                };
            });

            this.onHashChange = function () {
                this.close();
            };
            $(window).on('hashchange', $.proxy(this.onHashChange, this));
        },
        /**
        * @param msg select item string
        * @param focus focus item index
        * @param fnCb callback api on some item get selected
        * @param fnPop callback api on this select control is popped up or closed
        * @description toggle(show on hidden or hide on shown) this select control
        */
        toggleSelect: function (msg, focus, fnCb, fnPop) {
            this.onPop = fnPop;
            if (!this._shown) {
                this.onItemSelect = fnCb;
                this.datamodel.selItems = msg;
                this.datamodel.itemCheck = focus;

                this.onPop(true);
                this._shown = true;

                this.template = _.template(html);

                this.refresh();
                this.show();
            } else {
                this._shown = false;
                this.close();
            }
        },
        propertys: function ($super) {
            $super();
            this.datamodel = {};
            //this.events = {
            //    'click .J_MlBm': 'close'
            //};
            this.needRootWrapper = true;
        },
        initialize: function ($super, opts) {
            $super(opts);
        },
        addEvent: function ($super) {
            $super();
            this.on('onShow', function () {
                this._bindEvent();
            });
        },
        /**
        * @description close custommessage control
        */
        close: function () {
            if (instance) {
                $(document).off("scroll", this._onScrll);
                //this.$el.unbind('touchmove');
                //this.$el.off('click');
                //$('.J_SelectItem').off('click');

                $(window).off('hashchange', $.proxy(this.onHashChange, this));

                if (!Config.IS_INAPP) {//
                    var iArr = $('.arr_up');
                    iArr.removeClass('arr_up');
                    iArr.addClass('arr_down');
                }
                this.onPop(false);

                this.destroy();
            }
            instance = undefined;
        },
        visible: function () {
            return this.status == 'show';
        }
    });

    return function SelectCtrl() {
        if (instance) {
            return instance;
        } else {
            return instance = new ClsSelct();
        }
    }
});