/**
 * @author yanjj
 * @module stack
 * @desc:  Wallet V5.9
 */
define([], function () {
    var STRING = {
        EMPTY_STACK:'Empty stack.'
    };
    var DEBUG = true;

    var Stack = function () {
        var stack = [];

        this.isEmpty = function () {
            return !stack.length;
        };
        this.push = function (elem) {
            stack.push(elem);
            //console.warn('Stack:push elem:'+elem);
        };
        this.pop = function () {
            if (this.isEmpty()) {
                throw new StackException(STRING.EMPTY_STACK);
            } else {
                var x = stack.pop();
                //console.warn('Stack:pop elem:'+x);
                return x;
            }
        };
        this.top = function () {
            if (this.isEmpty()) {
                throw new StackException(STRING.EMPTY_STACK);
            }else{
                var x = stack[this.length()-1];
                //console.warn('Stack:top elem:'+x);
                return x;
            }
        };
        this.clear = function () {
            stack = [];
        };
        this.length = function () {
            return stack.length;
        };

        this.print = function(){
            if(DEBUG) {
                console.log('====================>');
                console.warn(stack);
            }
        };

        this.serialize = function(){
            return JSON.stringify(stack);
        };

        this.deserialize = function(val){
            stack = JSON.parse(val);
            return this;
        }

    };
    var StackException = function (message) {
        this.name = "StackException";
        this.message = message;
        this.toString = function(){
            return this.name+":"+this.message;
        }
    };
    return Stack;
});