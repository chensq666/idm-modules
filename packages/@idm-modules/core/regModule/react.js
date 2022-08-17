import { createElement, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import config from '../../../../public/static/config.json'

export class ReactRegister {
    constructor() {
        this.comClassName = window.IDM && window.IDM.url.queryString('className')
        this.componentsMap = new Map()

        this.requireComponentsMap()
        this.regComponents()
        this.render()
    }

    requireComponentsMap() {
        const requireComponent = require.context('../../../../src/components', true, /[A-Z]\w+\.(jsx|tsx)$/)
        requireComponent.keys().forEach((fileName) => {
            const componentConfig = requireComponent(fileName)
            const componentName = fileName
                .split('/')
                .pop()
                .replace(/\.\w+$/, '')
            // 将全部组件放到一个Map里
            this.componentsMap.set(componentName, componentConfig.default || componentConfig)
        })
    }

    regComponents() {
        const defining = {}
        config &&
            config.module.forEach((item) => {
                const key = item.classId + '@' + config.version
                window[key] = defining[key] = (moduleObject) => {
                    // 把组件定义的属性返回给核心框架
                    moduleObject.compositeAttr = item.compositeAttr
                    //把组件定义的组件内属性返回给核心框架(如果有的话)
                    if (item.innerAttr) moduleObject.innerAttr = item.innerAttr
                    //组件内部容器组件的名称
                    if (item.innerComName) moduleObject.innerComName = item.innerComName
                    const rootElement = createRoot(
                        document.getElementById('idm_' + moduleObject.id + (moduleObject.routerId || ''))
                    )
                    rootElement.render(
                        createElement(() => {
                            const childCom = useRef()
                            // 编辑属性更新
                            moduleObject.idmProps = (props) => childCom.current.propDataWatchHandle(props.compositeAttr)
                            // reload
                            moduleObject.moduleReload = () => childCom.current.reload()
                            // 接收消息
                            moduleObject.idmBroadcastMessage = (object) =>
                                childCom.current.receiveBroadcastMessage(object)
                            // 交互功能：设置组件的上下文内容值
                            moduleObject.idmSetContextValue = (object) => childCom.current.setContextValue(object)
                            // 交互功能：获取需要返回的值
                            moduleObject.idmGetContextValue = () => {}
                            useEffect(() => {
                                // 挂载完成通知idm
                                moduleObject.mountComplete && moduleObject.mountComplete(moduleObject)
                                // 预览时数据传入
                                const propData = moduleObject.props && moduleObject.props.compositeAttr
                                if (propData) childCom.current.propDataWatchHandle(propData)
                            }, [])
                            return createElement(this.componentsMap.get(moduleObject.className || this.comClassName), {
                                ...moduleObject,
                                ref: childCom
                            })
                        })
                    )
                }
            })
    }
    render() {
        setTimeout(() => {
            if (this.comClassName) {
                config &&
                    config.module.forEach((item) => {
                        if (item.className === this.comClassName) {
                            window[item.classId + '@' + config.version]({ id: 'module_demo' })
                        }
                    })
            }
        }, 100)
    }
}
