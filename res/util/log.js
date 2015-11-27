/**
* @author wxm
* @desc:  Wallet V5.7, log utility
*/
	
define([], function () {
    var Log = {
        Info: function (msg) {
            console.log('<Wallet(Info) ' + this._time() + '>: ' + msg + '\n' + this._lineNum());
       },
        Warn: function (msg) {
            console.log('<Wallet(Warn) ' + this._time() + '>: ' + msg + '\n' + this._lineNum());
        },
        Error: function (msg) {
            console.log('<Wallet(Error) ' + this._time() + '>: ' + msg + '\n' + this._lineNum());
        },

        //local functions bellow
        _getErrorObject: function () {
            try { throw Error('') } catch (err) { return err; }
        },
        _lineNum: function () {
            try {
                var err = this._getErrorObject();
                var caller_line = err.stack.split("\n")[5];
                var index = caller_line.indexOf("at ");
                var ln = caller_line.slice(index + 2, caller_line.length);

                return ln;
            } catch (err) {
                console.log('Info: _lineNum parse fail');
                return '';
            }
        },
        _add0: function (m) {
            return m < 10 ? '0' + m : m;
        },
        _time: function () {
            var time = new Date();

            //var y = time.getFullYear();
            var m = time.getMonth() + 1;
            var d = time.getDate();
            var h = time.getHours();
            var mm = time.getMinutes();
            var s = time.getSeconds();
            return /*y + '-' +*/ this._add0(m) + '-' + this._add0(d) + ' ' + this._add0(h) + '.' + this._add0(mm) + '.' + this._add0(s);
        }
    };
    return Log;
});