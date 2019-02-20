import Vue from 'vue'

export default {
    install:function(Vue,options){
        Vue.prototype.$checkInNative = function(){
            return navigator.userAgent === 'native-webview'
        }

        Vue.prototype.$native = function(methodPath,data,cb){
            let methodPathArr = methodPath.split('.')
            let bridgeName = methodPathArr[0]
            let methodName = methodPathArr[1]

            if(navigator.userAgent !== 'native-webview'){
                return false
            }
            let handlers = window.webkit.messageHandlers
            let handler = handlers[bridgeName]

            handler[methodName+'_callback'] = cb

            let obj = {
                method:methodName,
                data:JSON.stringify(data),
                cbName:'window.webkit.messageHandlers.'+ bridgeName + '.' + methodName+'_callback',
            }

            handler.postMessage(obj)
            return true
        }

        function proxy(foo,fooName){
            let ret = undefined
            if(typeof foo === 'function'){
                self = this
                ret = function(){
                    let res = foo.call(self,...arguments)
                    //call native
                    let obj = {
                        method:fooName,
                        data:JSON.stringify(res),
                    }
                    window.webkit.messageHandlers["_private_bridge"].postMessage(obj)
                }
            }
            return ret
        }

        Vue.prototype.$regist = function(callbackName,callback){
            window[callbackName] = proxy(callback,callbackName)
        }

        Vue.prototype.$revoke = function(callbackName){
            delete window[callbackName]
        }
    }
}