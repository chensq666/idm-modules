import Vue from 'vue'
let configJsonData = null
export class VueRegister {
    constructor(config, vueConfig = {}) {
        if(!config) {
            throw new Error('config is required')
        }
        configJsonData = config
        this.regComponents(vueConfig)
        this.render()
    }
    regComponents(vueConfig) {
        const defining = {}
        configJsonData &&
            configJsonData.module.forEach((item) => {
                const key = item.classId + '@' + configJsonData.version
                window[key] = defining[key] = function (moduleObject) {
                    // console.log("加载的组件：", moduleObject, item)
                    //把组件定义的属性返回给核心框架
                    moduleObject.compositeAttr = item.compositeAttr
                    //把组件定义的组件内属性返回给核心框架(如果有的话)
                    if (item.innerAttr) {
                        moduleObject.innerAttr = item.innerAttr
                    }
                    //组件内部容器组件的名称
                    if (item.innerComName) {
                        moduleObject.innerComName = item.innerComName
                    }
                    var vm = new Vue({
                        ...vueConfig,
                        render: (h) => h(window[`${process.env.CodeVar}`]),
                        data() {
                            return {
                                //这里使用本身自己定义的组件名称，从系统维护（moduleObject）取来的怕不准去
                                componentName: item.className + '@' + configJsonData.className + '-' + configJsonData.version,
                                moduleObject: moduleObject,
                                //需要把默认值传递
                                propData: moduleObject.props || {}
                            }
                        },
                        mounted() {
                            //加载完成回调
                            this.$nextTick(function () {
                                moduleObject.mountComplete && moduleObject.mountComplete(moduleObject)
                            })
                        }
                    }).$mount('#idm_' + moduleObject.id + (moduleObject.routerId ? moduleObject.routerId : ''))
                    // console.log("加载的VM对象：", vm)
                    moduleObject.idmProps = function (props) {
                        // console.log("实时更新的数据", props)
                        vm.propData = props
                        // console.log(vm)
                        vm.$children.length > 0 &&
                            vm.$children[0].$refs[vm.componentName] &&
                            vm.$children[0].$refs[vm.componentName].propDataWatchHandle &&
                            vm.$children[0].$refs[vm.componentName].propDataWatchHandle(props)
                    }
                    /**
                     * 接收消息的方法
                     * @param {
                     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
                     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
                     *  message:{发送的时候传输的消息对象数据}
                     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
                     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
                     * } object
                     */
                    moduleObject.idmBroadcastMessage = function (object) {
                        vm.$children.length > 0 &&
                            vm.$children[0].$refs[vm.componentName] &&
                            vm.$children[0].$refs[vm.componentName].receiveBroadcastMessage &&
                            vm.$children[0].$refs[vm.componentName].receiveBroadcastMessage(object)
                    }
                    /**
                     * 交互功能：设置组件的上下文内容值
                     * @param {
                     *  type:"定义的类型，已知类型：pageCommonInterface（页面统一接口返回值）"
                     *  Key:"数据key标识，页面每个接口设置的数据集名称，方便识别获取自己需要的数据"
                     *  data:"数据集，内容为：字符串 or 数组 or 对象"
                     * }
                     */
                    moduleObject.idmSetContextValue = function (object) {
                        vm.$children.length > 0 &&
                            vm.$children[0].$refs[vm.componentName] &&
                            vm.$children[0].$refs[vm.componentName].setContextValue &&
                            vm.$children[0].$refs[vm.componentName].setContextValue(object)
                    }
                    /**
                     * 交互功能：获取需要返回的值，返回格式如下
                     * @return {
                     *    key:"定义的key标识，一般组件定义了一个属性，然后获取指定属性填写的值，这样返回后就能识别对应的字段或者元数据",
                     *    data:{要返回的值，内容为：字符串 or 数组 or 对象}
                     * }
                     */
                    moduleObject.idmGetContextValue = function (object) {
                        if (
                            vm.$children.length > 0 &&
                            vm.$children[0].$refs[vm.componentName] &&
                            vm.$children[0].$refs[vm.componentName].getContextValue
                        ) {
                            return vm.$children[0].$refs[vm.componentName].getContextValue(object)
                        } else {
                            return null
                        }
                    }
                    //获取组件实例
                    moduleObject.getComponentVm = function(){
                        return vm.$children[0].$refs[vm.componentName];
                    }
                    // console.log("渲染的ID>>>>", moduleObject.id);
                }
            })
    }
    render() {
        setTimeout(function () {
            if (window.IDM && window.IDM.url.queryString('className')) {
                configJsonData &&
                    configJsonData.module.forEach((item) => {
                        if (item.className == window.IDM.url.queryString('className')) {
                            window[item.classId + '@' + configJsonData.version].call(this, {
                                id: 'module_demo'
                            })
                        }
                    })
            }
        }, 100)
    }
}