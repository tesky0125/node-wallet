/**
 * @author      wxm      Wallet V6.5
 * @description wallet plugin widget
 */

define(['WalletBasePlugin'],
function (WalletBasePlugin) {

    var tpl = '<ul class="walltbox mb20 mt15 J_IdxPI">' +
        '<li class="item2 J_MI">' +
            '<i class="icon6"></i>' +
            '<div>我的保障</div>' +
        '</li>' +
        '<li class="item2 J_SS">' +
            '<span class="loading J_LDING"></span>' +
            '<div class="J_LDING" style="height:6px"></div>' +
            '<i class="hidden J_SLI"></i>' +
            '<div>安全设置</div>' +
        '</li>' +
        '<li class="item2 J_FastPay">' +
            '<i class="icon5"></i>' +
            '<div>快捷支付设置</div>' +
        '</li>' +
    '</ul>';

    var tplFP = '<li class="item2 J_FP">' +
            '<i class="icon4"></i>' +
            '<div>指纹支付设置</div>' +
        '</li>';

    var tplMI = '<li class="item2 J_MI">' +
            '<i class="icon6"></i>' +
            '<div>我的保障</div>' +
        '</li>';

    var tplSvc = '<li class="item2 J_SVC">' +
            '<i class="service"></i>' +
            '<div>携程客服</div>' +
        '</li>';

    var tplNA = '<li class="item2 J_NA"></li>';

    var exports = new WalletBasePlugin({
        tpl: tpl,
        id: '.J_IdxPI',
        events: {
            'click .J_FastPay': function() {
                this.onFastPayClick();
            },
            'click .J_SS': function () {
                this.onSecurityLevelClick();
            },
            'click .J_FP': function () {
                this.onFpSettingClick();
            },
            'click .J_MI': function () {
                this.onMyInsrcClick();
            },
            'click .J_SVC': function () {
                this.onSvcClick();
            }
        },
        rendered: function (opt) {
            this.update(opt);
        },
        update: function (opt) {
            for (var field in opt.data) {
                switch (field) {
                    case 'supportFinger':
                        //supportFinger=0 支持指纹验证并且设置过指纹
                        //supportFinger=1 支持指纹验证但是未设置过指纹
                        //supportFinger=2 不支持指纹验证
                        if (opt.data.supportFinger === 0 || opt.data.supportFinger === 1) {
                            if (!opt.view.$el.find('.J_FP').length) { //avoid multiple icon
                                opt.view.$el.find('.J_SS').after($(tplFP));
                            }
                        } else {
                            if (opt.view.$el.find('.J_FP').length) {
                                opt.view.$el.find('.J_FP').remove();
                            }
                        }
                        break;
                    case 'seclevel':
                        this.slClass && opt.view.$el.find('.J_SLI').removeClass(this.slClass); //remove last style
                        if (typeof opt.data.seclevel == 'undefined') {
                            this.slClass = 'iconerro';
                        } else {
                            //0: '警告', 1: '低', 2: '中', 3: '高'
                            this.slClass = ['icon0', 'icon1', 'icon2', 'icon3'][opt.data.seclevel];
                        }
                        opt.view.$el.find('.J_LDING').addClass('hidden');
                        opt.view.$el.find('.J_SLI').removeClass('hidden');
                        opt.view.$el.find('.J_SLI').addClass(this.slClass);
                        break;
                    case 'showSvc':
                        //true:有
                        if (opt.data.showSvc) {
                            if (!opt.view.$el.find('.J_SVC').length) { //avoid multiple icon
                                opt.view.$el.find('.J_FastPay').after($(tplSvc));
                            }
                        } else {
                            if (opt.view.$el.find('.J_SVC').length) {
                                opt.view.$el.find('.J_SVC').remove();
                            }
                        }
                        break;
                }
            }
            this.ulClass && opt.view.$el.find(this.id).removeClass(this.ulClass); //remove last ul style
            opt.view.$el.find('.J_NA').remove();//remove paddings

            var child = opt.view.$el.find(this.id).children();
            var cnt = 0;
            for (var i = 0; i < child.length; i++) {
                if (!$(child[i]).hasClass('hidden')) {
                    cnt++;
                }
                //if (cnt >= 3) {
                //    break; //>=3, all have 33% width
                //}
            }
            var style = cnt >= 3 ? 3 : cnt;
            this.ulClass = 'menu' + style;
            opt.view.$el.find(this.id).addClass(this.ulClass);

            if (cnt > 3 && cnt % 3) {
                for (var m = 0; m < 3 - cnt % 3; m++) {
                    opt.view.$el.find(this.id).append($(tplNA));
                }
            }
        }
    });

    return exports;
});