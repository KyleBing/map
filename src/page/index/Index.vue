<template>
    <div class="map-container">
        <el-dialog
            center
            title="提示"
            :visible.sync="modalTip"
            width="400px">
            <p>如果界面卡死，不要大惊小怪，刷新页面即可</p>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="checkTip">OK</el-button>
            </div>
        </el-dialog>
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader'
import ICON from "@/assets/icons"
import {mapState} from "vuex"
import mapConfig from "../../mapConfig";

const POSITION = {
    daMingHu: [117.026217, 36.670921], // 大明湖
    quanChengGuangChang: [117.021226, 36.661487], // 泉城广场
    baoTuQuan: [117.015871, 36.661057], // 趵突泉
}
let AMap = null

export default {
    name: "Index",
    data() {
        return {
            isLoading: false,
            map: null,
            loca: null,
            currentLineId: 0,
            activeLineObj: null, // 当前 Line 对象
            currentRouting: null,  // 当前导航路线
            modalTip: false,
        }
    },
    mounted() {
        this.modalTip = !localStorage.getItem('map-has-checked-tip')

        AMapLoader.load({
            key: mapConfig.appId, // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [],
            Loca: {
                version: '2.0.0',
            },
            AMapUI: {             // 是否加载 AMapUI，缺省不加载
                version: '1.1',   // AMapUI 缺省 1.1
                plugins: [],       // 需要加载的 AMapUI ui插件
            },

        }).then(map => {
            AMap = map
            this.map = new AMap.Map('container', {
                viewMode: '3D',
                zoom: 17,
                center: POSITION.daMingHu,
                // mapStyle: 'amap://styles/45311ae996a8bea0da10ad5151f72979',
                showBuildingBlock: true, // 显示建筑物
                showLabel: false, // 不显示地名什么的
            })

            this.loca = new Loca.Container({
                map: this.map,
                /*                ambLight: {
                                    intensity: 2.2,
                                    color: '#babedc',
                                },
                                dirLight: {
                                    intensity: 0.46,
                                    color: '#d4d4d4',
                                    target: [0, 0, 0],
                                    position: [0, -1, 1],
                                },
                                pointLight: {
                                    color: 'rgb(15,19,40)',
                                    position: [MY_POSITION[0], MY_POSITION[1], 2600],
                                    intensity: 25,
                                    // 距离表示从光源到光照强度为 0 的位置，0 就是光不会消失。
                                    distance: 3900,
                                }*/
            })


            this.loca.viewControl.addAnimates([{
                /*                center: {
                                    value: POSITION.quanChengGuangChang, // 动画终点的经纬度
                                    control: [POSITION.quanChengGuangChangEast, POSITION.quanChengGuangChang], // 过渡中的轨迹控制点，地图上的经纬度
                                    timing: [0.42, 0, 0.4, 1], // 动画时间控制点
                                    duration: 2000, // 过渡时间，毫秒（ms）
                                },*/
                // 俯仰角动画
                pitch: {
                    value: 45, // 动画终点的俯仰角度
                    control: [[0, -60], [1, 45]], // 控制器，x是0～1的起始区间，y是pitch值
                    timing: [0.5, 0.2, 0.5, 0.8], // 这个值是线性过渡
                    duration: 8000,
                },
                /*                // 缩放等级动画
                                zoom: {
                                    value: 18, // 动画终点的地图缩放等级
                                    control: [[0, 17], [1, 18]], // 控制器，x是0～1的起始区间，y是zoom值
                                    timing: [0, 0, 1, 1],
                                    duration: 8000,
                                },*/
                // 旋转动画
                rotation: {
                    value: 90, // 动画终点的地图旋转角度
                    control: [[0, 0], [1, 90]], // 控制器，x是0～1的起始区间，y是rotation值
                    timing: [0, 0, 1, 1],
                    duration: 8000,
                }
            }], () => {
                this.loca.viewControl.addAnimates([{
                    center: {
                        value: POSITION.quanChengGuangChang, // 动画终点的经纬度
                        control: [POSITION.daMingHu, POSITION.quanChengGuangChang], // 过渡中的轨迹控制点，地图上的经纬度
                        timing: [0, 0, 1, 1], // 动画时间控制点
                        duration: 8000, // 过渡时间，毫秒（ms）
                    },

                }], () => {
                    this.loca.viewControl.addAnimates([{
                        center: {
                            value: POSITION.daMingHu, // 动画终点的经纬度
                            control: [POSITION.quanChengGuangChang, POSITION.daMingHu], // 过渡中的轨迹控制点，地图上的经纬度
                            timing: [0.5, 0.2, 0.5, 0.8], // 这个值是线性过渡
                            duration: 8000, // 过渡时间，毫秒（ms）
                        },
                        // 旋转动画
                        rotation: {
                            value: 0, // 动画终点的地图旋转角度
                            control: [[0, -90], [1, 0]], // 控制器，x是0～1的起始区间，y是rotation值
                            timing: [0.5, 0.2, 0.5, 0.8], // 这个值是线性过渡
                            duration: 8000,
                        }
                    }])
                })

            })

            this.map.on('complete', () => {
                setTimeout(() => {
                    this.loca.animate.start()
                }, 2000); // 给地图一个加载的时间
            })

        }).catch(e => {
            console.log(e)
        })
    },

    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        checkTip(){
            localStorage.setItem('map-has-checked-tip', 'true')
            this.modalTip = false
        },

        resizeMap() {
            let mapContainer = document.getElementById('container')
            mapContainer.style.height = window.innerHeight + "px"
            mapContainer.style.width = window.innerWidth + "px"
        },

        // 载入路线信息
        loadLine(map, line) {
            map.plugin('AMap.DragRoute', () => {
                // path 是驾车导航的起、途径和终点，最多支持16个途经点
                let path = []
                line.paths.forEach(point => {
                    path.push(point.position)
                })
                let route = new AMap.DragRoute(map, path, AMap.DrivingPolicy.LEAST_FEE, {
                    startMarkerOptions: {
                        offset: new AMap.Pixel(-13, -40),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(26, 40),
                            image: ICON.start,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(26, 40) // 指定图标的大小，可以压缩图片

                        }),
                    },
                    endMarkerOptions: {
                        offset: new AMap.Pixel(-13, -40),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(26, 40),
                            image: ICON.end,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(26, 40) // 指定图标的大小，可以压缩图片

                        }),
                    },
                    midMarkerOptions: {
                        offset: new AMap.Pixel(-5, -10),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(15, 15),
                            image: ICON.midIcon,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(15, 15) // 指定图标的大小，可以压缩图片

                        }),
                    },
                })
                // 查询导航路径并开启拖拽导航
                route.search()
                this.currentRouting = route
            })
        },


        // 添加路线 Label
        loadLineLabels(map, line) {
            line.paths.forEach(item => {
                this.addMarker(map, item)
            })
        },
        addMarker(map, item) {
            let marker = new AMap.Marker({
                position: item.position,
                content: `
               <div class="marker">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
               </div>`,
            })
            map.add(marker)
        }

    },
    watch: {
        '$route'(to, from) {
            if (this.currentRouting) {
                this.currentRouting.destroy() // 清除当前路线
                this.map.clearMap() // 删除所有 Marker
            }
            this.activeLineObj = this.lines[parseInt(this.$route.params.lineId) - 1]
            this.loadLine(this.map, this.activeLineObj)
            this.loadLineLabels(this.map, this.activeLineObj)
        },
    },
    beforeDestroy() {
        this.loca.destroy() // 需要先销毁 Loca 再销毁 Map
        this.map.destroy() // 销毁地图，释放内存
        this.map = null
    }
}
</script>

<style lang="scss" scoped>
.map-container {
    position: relative;
}

</style>
