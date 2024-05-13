module.exports = (resourceObject, cp, buildTime) => {
    return `
    (function (window) {
        var whir = {}, lastMdule
        if (window.IDM && window.IDM.module && window.IDM.module.queue && window.IDM.module.queue.moduleMain.length > 0) {
            lastMdule = window.IDM.module.queue.moduleMain[window.IDM.module.queue.moduleMain.length - 1]
        }
        var resource = ${JSON.stringify(resourceObject)}, doc = document,
            getPath = function () {
                var head = doc.getElementsByTagName('head')[0] || doc.head || doc.documentElement
                var js = head.getElementsByTagName('script'), jsPath = js[js.length - 1].src
                jsPath = document.currentScript.src || jsPath
                return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
            }()
        whir.res = {
            _cv: '', // 组件版本，用于更新
            _lk: '${cp}',
            loadJs: function (jsArr, cb) { //动态加载js文件并缓存
                function loadOneFile(cb) {
                    var fileName = jsArr.shift()
                    if(fileName) {
                        var url = getPath + fileName + '.js';
                        if (window.localStorage) {
                            var xhr, js = localStorage.getItem(url)
                            if (js == null || js.length == 0 || whir.res._cv != localStorage.getItem(whir.res._lk)) {
                                if (window.ActiveXObject) {
                                    xhr = new window.ActiveXObject('Microsoft.XMLHTTP')
                                } else if (window.XMLHttpRequest) {
                                    xhr = new XMLHttpRequest()
                                }
                                if (xhr != null) {
                                    xhr.open('GET', url)
                                    xhr.send(null)
                                    xhr.onreadystatechange = function () {
                                        if (xhr.readyState == 4 && xhr.status == 200) {
                                            js = xhr.responseText;
                                            try {
                                                localStorage.setItem(url, js)
                                                localStorage.setItem(whir.res._lk, whir.res._cv)
                                                js = js == null ? '' : js
                                                whir.res.writeJs(url, js)
                                            } catch (error) {
                                                console.error('存储js文件错误：%d', url)
                                                whir.res.linkJs(url)
                                            }
                                            if (cb != null) {
                                                loadOneFile(cb)
                                            }
                                        }
                                    }
                                }
                            } else {
                                whir.res.writeJs(url, js)
                                if (cb != null) loadOneFile(cb)
                            }
                        } else {
                            whir.res.linkJs(url)
                        }
                    }else {
                        if (cb != null) cb()
                    }
                }
                loadOneFile(cb)
            },
            loadCss: function (name, url) {
                if (window.localStorage) {
                    var xhr, css = localStorage.getItem(name),
                        replaceUrl = function (cssStr) {
                            cssStr = cssStr.replace(\/\\.\\/static\\/|\\.\\.\\/static\\/|\\.\\.\\/\\.\\.\\/static\\/\/g, function(str){
                                return getPath
                            })
                            return cssStr
                        }
                    if (css == null || css.length == 0 || whir.res._cv != localStorage.getItem(whir.res._lk)) {
                        if (window.ActiveXObject) {
                            xhr = new window.ActiveXObject('Microsoft.XNLHTTP')
                        } else if (window.XMLHttpRequest) {
                            xhr = new XMLHttpRequest()
                        }
                        if (xhr != null) {
                            xhr.open('GET', url)
                            xhr.send(null)
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState == 4 && xhr.status == 200) {
                                    try {
                                        css = replaceUrl(xhr.responseText)
                                        localStorage.setItem(name, css)
                                        css = css == null ? '' : css
                                        whir.res.writeCss(name, css)
                                    }catch (error) {
                                        console.error('存储css文件错误：%d', url)
                                        whir.res.linkCss(url)
                                    }
                                }
                            }
                        }
                    } else {
                        whir.res.writeCss(name, css)
                    }
                } else {
                    whir.res.linkCss(url)
                }
            },
            writeJs: function (url, text) {
                if(document.getElementById(url)) return
                var head = document.getElementsByTagName('HEAD').item(0)
                var link = document.createElement('script');
                link.type = 'text/javascript';
                link.setAttribute('id', url)
                link.innerHTML = text;
                head.appendChild(link);
            },
            writeCss: function (name, text) {
                if(document.getElementById(name)) return
                var head = document.getElementsByTagName('HEAD').item(0)
                var link = document.createElement('style')
                link.type = 'text/css'
                link.setAttribute('id', name)
                link.innerHTML = text
                head.appendChild(link)
            },
            linkJs: function (url) {
                var head = document.getElementsByTagName('HEAD').item(0)
                var link = document.createElement("script")
                link.type = "text/javascript"
                link.src = url
                head.appendChild(link)
            },
            linkCss: function (src, reload, fun) {//往页面引入css
                var head = document.getElementsByTagName('HEAD').item(0)
                var link = document.createElement("link")
                link.type = "text/css"
                link.rel = "stylesheet"
                link.media = "screen"
                link.href = src
                head.appendChild(link)
            }
        }
        var dateObj = new Date(${buildTime})
        whir.res._cv = dateObj.toLocaleDateString() + '-' + dateObj.toLocaleTimeString();
        resource.css && resource.css.forEach(function (item) {
            var url = getPath + item + '.css'
            whir.res.loadCss(url, url)
        })
        whir.res.loadJs(resource.js, function() {
            if (lastMdule && lastMdule.callback) {
                lastMdule.callback.call(this, lastMdule)
            }
        });
    })(window)
    `
}