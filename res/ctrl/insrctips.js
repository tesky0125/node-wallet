/**
 * @author wxm
 * @desc:  Wallet V6.10
 */

define(['cGuiderService', 'text!insrctips_html', 'Util', 'Log', 'WalletPageView', 'WalletModel', 'Config', 'Message', 'ModelObserver'],
    function(cGuiderService, html, Util, Log, WalletPageView, WalletModel, Config, Message, ModelObserver) {

        var STRING = {
            PAGE_TITLE: '保险须知'
        };

        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            //backToPage: 'insrcactivity',
            model: {},
            events: {
                'click .J_INSRCPLC2': function() {
                    if (Config.IS_INAPP) {
                        CtripUtil.app_open_url(this.model.clauseaddr, 3);
                    } else {
                        window.open(this.model.clauseaddr, '保险条款');
                    }
                }
            },
            onCreate: function() {
                this.inherited(arguments);

                this.render();
                this.turning();
            },
            render: function() {
                this.$el.html(_.template(this.tpl));
                this.els = {
                    'tip': this.$el.find('.J_INSRCTIPS2')
                };
            },
            onShow: function() {
                this.inherited(arguments);

                ModelObserver.register({
                    scope: this,
                    refresh: false,
                    showLoading: true,
                    model: 'InsrcGetPrdInfo',
                    param: {
                        insrctype: parseInt(Lizard.P('p'))
                    },
                    cbSuc: function(data) {
                        if (data.rc === 0) {
                            this.els.tip.html(data.notes);
                            this.model.clauseaddr = data.clauseaddr;
                        } else {
                            this.onModelExecFail(data);
                        }
                    },
                    cbFail: function(data) {
                        this.onModelExecFail(data);
                    }
                });
            }
        });

        return View;
    });