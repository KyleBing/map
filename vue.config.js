const FileManagerPlugin = require('filemanager-webpack-plugin')
const Moment = require('moment')

module.exports = {
    publicPath: './',
    productionSourceMap: false, // 不产出 .map 文件
    outputDir: '../map',

    devServer: {
        proxy: {
            '': {
                // target: 'http://localhost:3000',
                target: 'http://kylebing.cn:3000',
                changeOrigin: true
            },
        }
    },


    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            let packTimeString = new Moment().format('YYYY-MM-DD') // 打包时间
            let plugins = []
            plugins.push(
                new FileManagerPlugin({
                    events: {
                        onEnd: {
                            mkdir: ['./archive'], // 新建 ./archive 目录
                            archive: [
                                // 打包 压缩包中不带 dist 外壳
                                {
                                    source: '../map',
                                    destination: `./archive/map-${packTimeString}.zip`,
                                    format: 'zip',
                                    options: {
                                        gzipOptions: {
                                            level: 1,
                                        },
                                    }
                                },
                            ]
                        }
                    }
                })
            )
            config.plugins = config.plugins.concat(plugins) // 将新建的 plugin 添加到原 config 中的 plugin 中
        }
    }
}
