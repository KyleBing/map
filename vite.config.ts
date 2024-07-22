import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import zipPack from "vite-plugin-zip-pack" // make dist.zip file

import {resolve} from "path"
import {dateFormatter} from "./src/utility";

const timeStringNow = dateFormatter(new Date(), 'yyyy-MM-dd hh-mm')

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        zipPack({
            inDir: 'dist',
            outDir: 'archive',
            outFileName: `map-${timeStringNow}.zip`,
            pathPrefix: ''
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://kylebing.cn/portal/',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'),
            },
        }
    }
})
