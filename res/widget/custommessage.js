/**
 * @module custommessage
 * @author wxm
 * @description wallet input money page view, for pages with similar request like recharge
 * @version since Wallet V5.7
 * @history big change after Wallet V6.6, because lizard 2.1 not support cUIAbstractView any more
 */
define(['UIView', 'Util'], function(UIView, Util) {
    var instance = undefined;
    var CENTER_DIV = '<div class="cui-view cui-layer cui-toast center" style=" z-index:10100">{1}</div>';

    var ClsCustomMsg = _.inherit(UIView, {
        _adjustMaskHeight: function() {
            var ht = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight) + 44 + 'px';
            $(".J_MlBm").css('height', ht);
        },
        _bindEvent: function() {
            var that = this;
            this._adjustMaskHeight();
            if (this.slide) {
                $(".J_MlBm").bind('touchmove', function(e) {
                    e.preventDefault();
                });
            } else {
                this.$el.bind('touchmove', function(e) {
                    e.preventDefault();
                });
            }

            this.$el.on('click', function(e) {
                if (that.onTouch) {
                    if (typeof that.onTouch == 'function') {
                        that.onTouch(e);
                    }
                } else {
                    that.close();
                }
            });

            this._onRizeFunc = _.bind(function() {
                this._adjustMaskHeight();
            }, this);

            $(window).on('resize', this._onRizeFunc);

            this.cbOnShow && this.cbOnShow();
        },
        /**
         * @param msg body content of custommessage control
         * @param free true: not format msg text; false: will format msg with inner style
         * @param onTouch if override onTouch event
         * @description show and render custommessage control
         */
        showMessage: function(msg, free, onTouch, slide) {
            ///var alt = $('.cui-alert');
            /*var alt = $('.cui-layer');
            if (alt && alt.length) {
                for (var item = 0; item < alt.length; item++) {
                    //for (var item in alt) {
                    if ($(alt[item]).css('display') == 'block') {
                        return;//alert is showing, just quit
                    }
                }
            }*/
            //check framework alert is showing or not
            var alt = $('.cui-layer .cui-pop-box');
            if (alt && alt.length) {
                for (var item = 0; item < alt.length; item++) {
                    if ($(alt[item]).parent().css('display') == 'block' && (!$(alt[item]).parent().hasClass('cm-up-out'))) {
                        return; //alert is showing, just quit
                    }
                }
            }
            //check if self is showing or not
            var self = $('.J_MlBm');
            if (self && self.parent().css('display') == 'block') {
                return;
            }

            if (onTouch) {
                this.onTouch = onTouch;
            }

            if (slide) {
                this.slide = slide;
            }

            var reg = /^\s*<.*>.*<.*>\s*$/;

            if (free) {
                this.datamodel.contentHtml = msg;
            } else if (reg.test(msg)) {
                var div = Util.formatStr(CENTER_DIV, msg);
                this.datamodel.contentHtml = div;
            } else {
                var content = '<div class="paytips">' + msg + '</div>';
                var div = Util.formatStr(CENTER_DIV, content);

                this.datamodel.contentHtml = div;
            }

            this.template = _.template([
                '<%=contentHtml%>',
                '<div class="J_MlBm cui-view cui-mask cui-opacitymask" style="background:rgba(0,0,0,.7); position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 2499;"><div></div></div>'
            ].join(''));

            this.refresh();
            this.show();
        },
        propertys: function($super) {
            $super();
            this.datamodel = {};
            //this.events = {
            //    'click .J_MlBm': 'close'
            //};
            this.needRootWrapper = true;
        },
        initialize: function($super, opts) {
            $super(opts);
        },
        addEvent: function($super) {
            $super();
            this.on('onShow', function() {
                this._bindEvent();
            });
        },
        /**
         * @description close custommessage control
         */
        hide: function() {
            this.close();
        },
        close: function() {
            //this.$el.unbind('touchmove');
            //this.$el.off('click');
            $(window).off('resize', this._onRizeFunc);

            this.destroy();
            instance = undefined;
        },
        visible: function() {
            return this.status == 'show';
        },
        setCbOnShow: function(cb) {
            this.cbOnShow = cb;
        }
    });

    return function CustomMessage() {
        if (instance) {
            return instance;
        } else {
            return instance = new ClsCustomMsg();
        }
    }
});