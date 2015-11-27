/**
 * @author yanjj
 * @module page manager
 * @desc:  Wallet V5.9
 */
define(['cGuiderService','Stack','WalletStore','WalletSession','Util','Config'], function (cGuiderService, Stack, WalletStore, WalletSession, Util, Config) {

    var PageView = function(viewOpt){
        this.name=viewOpt.name;
        this.url = viewOpt.url;//index?from=xxx
        this.token=viewOpt.token;//token{from:''}
        //this.retpage=viewOpt.retpge;//replace by stack
        this.back=viewOpt.back;//back to default
        //this.referrer=viewOpt.referrer;
        this.redirect=viewOpt.redirect;
        this.toString = function(){
            return JSON.stringify({
                name:this.name,
                url:this.url,
                token:this.token,
                back:this.back,
                //referrer:this.referrer,
                redirect:this.redirect
            });
        };
    };

    var PageManager = function(){
        /******private constant******/
        var PAGE_REG = /([\/_a-zA-Z0-9]*).*/i;// /webapp/wallet/index?from=from -> /webapp/wallet/index

        /******public member******/
        this.VERSION = '201510301915';//log for clear user old storage

        /******private member******/
        var pageStack = new Stack();
        var pageStore = WalletStore.PageManagerStore.getInstance();
        var pageSession = WalletSession.PageManagerStore.getInstance();
        var context = null;


        /******public method******/
        /**
         * Bind page context and push stack, call it after page execute onShow
         * @param pageContext
         */
        this.bind = function(pageContext){
            context = pageContext;

            //get param from page
            var viewname = Util.getViewName();
            var viewurl = Util.getViewAndParam();
            var viewtoken = Util.getTokenFromUrl();
            var viewback = Util.getRetpage() || context.backToPage;
            //var viewreferrer = Util.getReferrerPage(context);
            var redirect = context.redirect;

            console.log('====================>');
            console.log('location.href:'+location.href);
            var view = this._searchView(viewname);
            if(view) {
                this._popViews(viewname);
                this._updateTopView({
                    name:viewname,
                    url:viewurl,
                    token:viewtoken,
                    back:viewback,
                    //referrer:viewreferrer
                    redirect:redirect
                });
            }
            if(!view){
                view = new PageView({
                    name:viewname,
                    url:viewurl,
                    token:viewtoken,
                    back:viewback,
                    //referrer:viewreferrer,
                    redirect:redirect
                });
                pageStack.push(view);
            }

            //update store when shown
            this._setStore();

            //TODO DEBUG
            pageStack.print();
        };

        /**
         *
         * @param view index?xx=xxx
         * @param recreate
         */
         //TODO set options 1.recreate 2.transitional/redirect 3.jump
         //1.recreate:to recall onCreate to clear old dom info, such as input.
         //2.transitional:for returnHandler, don't show in back flow, such as setpaypsd.
         //3.redirect:for returnHandler, just to redirect view, it has no view, such as chgpwd.
         //4.jump:go to other BU's view, for A->B->A flow, to create more than one stack in session.
        this.forward = function(view , recreate){
            this._forward(view , recreate);
        };

        /**
         *
         * @param view index
         */
        this.back = function(view){
            if(!!view) {
                var retview = this._searchView(view, true);
                if(retview){
                    //NOTE: View's redirect property is for those pages are transitional, such as chgpwd/setpaypsd
                    //If redirect is true, then back twice until view's redirect is false.
                    var redirect = retview.redirect;
                    if(redirect){
                        console.warn('PageManager: back by view redirect.');
                        this.back();
                    //END
                    }else{
                        console.warn('PageManager: back by view exist in stack.');
                        /*Begin Compatibility */
                        var url = retview.url;
                        if(url == ''){
                            url = retview.name;
                        }
                        /*End*/
                        this._back(url);                       
                    }

                }else{
                    console.warn('PageManager: back by view non-exist in stack.');
                    this._back(view);
                }

            }else {
                //No specified view, use default return logic.(token > back > stack > referrer > default)
                var curview = pageStack.pop();
                var viewname = curview.name;
                var viewurl = curview.url;
                var viewtoken = curview.token;
                var viewback = curview.back;
                //var viewreferrer = curview.referrer;

                console.log('====================>');
                console.log('viewtoken:'+viewtoken);
                console.log('viewback:'+viewback);

                if(viewtoken && viewtoken.from){//H5 will go outer
                    console.warn('PageManager: back by token.');
                    //TODO this do not call forward
                    context.jump2TokenUrl(viewtoken.from);
                    this._setStore();
                }else if(viewback){
                    console.warn('PageManager: back by back.');
                    var viewbackname = Util.getRetViewname(viewback);
                    this.back(viewbackname);
                }else if(!redirect && !pageStack.isEmpty()) {
                    console.warn('PageManager: back by stack.');
                    var retview = pageStack.top();
                    this.back(retview.name);
                }/*else if(viewreferrer){
                    console.warn('PageManager: back by referrer.');
                    this._back(viewreferrer);
                }*/else{
                    console.warn('PageManager: back by default.');
                    this._back();
                }

            }
        };
        this.exit = function(){
            console.log('====================>');
            console.log('PageManager: exit.');
            this._clearStore();        
            this._exit();
        };

        /******private method******/
        this._readStore = function(){
            console.log('====================>');
            console.log('PageManager: read store.');
            var that = this;
            var version = pageStore.getAttr('version');
            if(!version || version != this.VERSION){
                console.log('====================>');
                console.log('PageManager: version update from ' + version +' to ' + this.VERSION);
                this._clearStore(true);
                return;
            }

            var page_stack = pageSession.getAttr('stack');
            if (page_stack) {
                pageStack = pageStack.deserialize(page_stack);
            }

        };
        this._setStore = function(){
            console.log('====================>');
            console.log('PageManager: set store.');
            var that = this;
            pageStore.setAttr('version',that.VERSION);
            pageSession.setAttr('stack',pageStack.serialize());
        };
        this._clearStore = function(update){
            console.log('====================>');
            console.log('PageManager: clear store.');
            if(update){
                pageStore.remove();
            }
            pageSession.removeAttr('stack');
            pageStack.clear();
        };
        this._forward = function(view , recreate){
            //begin compatibility
            if(!Config.IS_HYBRID && view.indexOf('/webapp/wallet/') == -1){
                view = '/webapp/wallet/'+view;
            }
            //end
            var _view = view.replace(PAGE_REG, '$1');
            var forceCreateInstance = Util.getPageParam(context,view,'recreate');
            if(recreate !== undefined){
                forceCreateInstance = recreate;
            }
            Lizard.goTo(view, { "viewName": _view, forceCreateInstance: forceCreateInstance});
        };
        this._back = function(view){
            if (!!view) {
                //begin compatibility
                if(!Config.IS_HYBRID && view.indexOf('/webapp/wallet/') == -1){
                    view = '/webapp/wallet/'+view;
                }
                //end
                var _view = view.replace(PAGE_REG, '$1');
                Lizard.goBack(view, { "viewName": _view });
            } else {
                this.exit();
            }
        };
        this._exit = function() {
            if (Config.IS_INAPP) {
                cGuiderService.backToLastPage();
            } else {
                //Lizard.goBack();
                context.jump(Config.H5_MAIN_HOME_URL);
            }
        };
        /**
         * search view. whether pop views above it after find it
         * @param viewname
         * @param pop
         * @returns {*}
         */
        this._searchView = function(viewname, pop){
            var viewret = null;
            var tempStack = new Stack();

            var pageStackLen = pageStack.length();
            for(var i=0;i<pageStackLen;i++){
                var viewitem = pageStack.top();
                if(viewitem.name !== viewname){
                    console.warn('search view:'+viewitem.name);
                    tempStack.push(pageStack.pop());
                }else {
                    viewret = viewitem;
                    break;
                }
            }

            if(!pop) {
                var tempStackLen = tempStack.length();
                for (var i = 0; i < tempStackLen; i++) {
                    pageStack.push(tempStack.pop());
                }
            }
            tempStack = null;

            return viewret;
        };
        /**
         * pop above views and return the top view
         * @param viewname
         * @returns {*}
         */
        this._popViews = function(viewname){
            var viewret;
            var pageStackLen = pageStack.length();
            for(var i=0;i<pageStackLen;i++){
                viewret = pageStack.top();
                if(viewret.name !== viewname){
                    pageStack.pop();
                }else{
                    break;
                }
            }
            return viewret;
        };
        this._updateTopView = function(viewOpt){
            if(!pageStack.isEmpty()) {
                var view = pageStack.top();
                view.name=viewOpt.name;
                view.url = viewOpt.url;//index?from=xxx
                view.token=viewOpt.token;//token{from:''}
                view.back=viewOpt.back;//back to default
            }
        }
        this._isTopView = function(viewname){
            if(!pageStack.isEmpty()) {
                var view = pageStack.top();
                return view.name === viewname;
            }
            return false;
        };

        this._bindEvent = function(){
            if(Config.IS_WEBH5){
                window.addEventListener('popstate', (function(e){
                    console.log('PageManager: webview popstate!');
                    this.back();
                    return false;
                }).bind(this), false);
            }
            //NOTE:Keep refresh state in store, for reuse stack.
            //TODO how to distingush refresh and close webview
            //if can, gabage stack size in store
            window.addEventListener('unload', (function(e){
                console.log('PageManager: webview unload/refresh!');
                //this._setStore();
            }).bind(this), false);
        };

        this._initialize = function () {
            console.log('PageManager:initializing...')
            this._readStore();
            this._bindEvent();
        };

        this._initialize();
    };

    PageManager.getInstance = function () {
        if (this.instance instanceof this) {
            return this.instance;
        } else {
            return this.instance = new this;
        }
    };

    return PageManager;
});