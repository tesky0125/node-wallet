/**
* @module walletseesionmodel
* @author wxm, lzx, wwg
* @description wallet session storage store classes
*/

define(['cCoreInherit', 'cSessionStore', 'cModel', 'cUtilCryptBase64'], function (cBase, cSessionStore, cModel, cUtilCryptBase64) {

	var S = {};
	//abstract store
	var AbstractStore = new cBase.Class(cSessionStore, {
	    __propertys__: function () {
	        this.isUserData = true;
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    },
	    setObject: function (obj) {
	        for (var i in obj) {
	            this.setAttr(i, obj[i]);
	        }
	    },
	    setBase64: function (obj, val) {
	        if (val) {
	            val = this._formatBase64Val(val);
	            this.setAttr(obj, val);
	        } else {
	            for (var i in obj) {
	                var val = this._formatBase64Val(obj[i]);
	                this.setAttr(i, val);
	            }
	        }
	    },
	    getBase64: function (val) {
	        if (val) {
	        	var rt = this.getAttr(val);
	        	if(rt){
	        		return cUtilCryptBase64.Base64.decode(this.getAttr(val));
	        	}
	        	return;
	        }
	        var obj = this.get();
	        for (var i in obj) {
                if (!this._isEmpty(obj[i])) {
                    obj[i] = cUtilCryptBase64.Base64.decode(obj[i]);
                }
	        }
	        return obj;
	    },
	    _formatBase64Val: function (input) {
	        if (_.isNumber(input)) {
	            input += '';
	        }

	        if (_.isString(input)) {
	            return cUtilCryptBase64.Base64.encode(input);
	        } else {
	            return input;
	        }
	    },
        _isEmpty: function(str) {
            return _.isUndefined(str) || _.isNull(str) || _.isNaN(str) || _.isEmpty(str);
        }
	});
	S.PageManagerStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_PAGE_MANAGER';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
    
	return S;
});
