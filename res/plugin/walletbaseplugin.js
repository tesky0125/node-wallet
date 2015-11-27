/**
 * @author      wxm      Wallet V6.5
 * @description wallet plugin widget
 */

define(['Util'],
function (Util) {

    var WalletBasePlugin = function (opt) {
        _.extend(this, opt);
    };

    WalletBasePlugin.prototype = {
        render: function (opt) {
            this.remove(opt);
            //if (!opt.view.$el.find(this.id).length) {
            if (!$(this.id).length) {
                $(_.template(this.tpl, opt.data))[opt.action](opt.selector);
                _.extend(opt.view.events, this.events);
                opt.view.delegateEvents();

                Util.preprocEvents(opt.view);

                if (typeof this.rendered == 'function') {
                    this.rendered(opt); //called after plugin is rendered
                }
            }
        },
        update: function (opt) {
        },
        remove: function (opt) {
            //var item = opt.view.$el.find(this.id);
            var item = $(this.id);
            item && item.length && item.remove();
        }
    };

    return WalletBasePlugin;
});