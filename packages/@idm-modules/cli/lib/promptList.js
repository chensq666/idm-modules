module.exports = {
    scaffoldList: [{
        type: 'list',
        name: 'scaffold',
        message: `Please choose the IDM component's development scaffold`,
        default: 'vue',
        choices: ['vue', 'react']
    }],
    vueUI: [
        {
            name: 'ui',
            message: 'UI framework:',
            type: 'list',
            choices: [
                { name: 'None', value: 'none' },
                { name: 'Ant Design Vue', value: 'ant-design-vue' },
                { name: 'Element', value: 'element-ui' },
                { name: 'Vant', value: 'vant' }
            ],
            default: 'none'
          },
    ],
    reactUI: [
        {
            name: 'ui',
            message: 'UI framework:',
            type: 'list',
            choices: [
                { name: 'None', value: 'none' },
                { name: 'Ant Design React', value: 'idm-react-antd' },
                { name: 'Antd-Mobile React', value: 'antd-mobile' },
            ],
            default: 'none'
          },
    ]
}
