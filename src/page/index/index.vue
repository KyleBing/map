<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader'
import ICON from "@/page/route/icons"
import {mapState} from "vuex"

const POSITION = {
    hanyu: [117.148734, 36.659771],
    home: [117.119074, 36.675504],
    cityCenter: [117.120114, 36.652366],
    cityCenterEast: [117.12492, 36.652189],
    yinHe: [117.12972, 36.67326]
}
let AMap = null

export default {
    name: "RouteLine",
    data() {
        return {
            isLoading: false,
            contentHeight: 400,
            map: null,
            loca: null,
            currentLineId: 0,
            activeLineObj: null, // 当前 Line 对象
            currentRouting: null,  // 当前导航路线
        }
    },
    created() {
        this.contentHeight = window.innerHeight

        AMapLoader.load({
            key: "581591b581149549d9035d039e83e368", // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [],
            Loca:{
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
                center: POSITION.yinHe,
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
                    value: POSITION.cityCenter, // 动画终点的经纬度
                    control: [POSITION.cityCenterEast, POSITION.cityCenter], // 过渡中的轨迹控制点，地图上的经纬度
                    timing: [0.42, 0, 0.4, 1], // 动画时间控制点
                    duration: 2000, // 过渡时间，毫秒（ms）
                },*/
                // 俯仰角动画
                pitch: {
                    value: 45, // 动画终点的俯仰角度
                    control: [[0, -60], [1, 45]], // 控制器，x是0～1的起始区间，y是pitch值
                    timing: [0, 0, 1, 1], // 这个值是线性过渡
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
                    value: 120, // 动画终点的地图旋转角度
                    control: [[0, 0], [1, 120]], // 控制器，x是0～1的起始区间，y是rotation值
                    timing: [0, 0, 1, 1],
                    duration: 8000,
                }
            }],()=>{
                this.loca.viewControl.addAnimates([{
                    center: {
                        value: POSITION.cityCenter, // 动画终点的经纬度
                        control: [POSITION.yinHe, POSITION.cityCenter], // 过渡中的轨迹控制点，地图上的经纬度
                        timing: [0, 0, 1, 1], // 动画时间控制点
                        duration: 8000, // 过渡时间，毫秒（ms）
                    },

                }],()=>{
                    this.loca.viewControl.addAnimates([{
                        center: {
                            value: POSITION.yinHe, // 动画终点的经纬度
                            control: [POSITION.cityCenter, POSITION.yinHe], // 过渡中的轨迹控制点，地图上的经纬度
                            timing: [0, 0, 1, 1], // 动画时间控制点
                            duration: 8000, // 过渡时间，毫秒（ms）
                        },
                    }],()=>{
                        this.loca.viewControl.addAnimates([{
                            // 旋转动画
                            rotation: {
                                value: 180, // 动画终点的地图旋转角度
                                control: [[0, 120], [1, 180]], // 控制器，x是0～1的起始区间，y是rotation值
                                timing: [0, 0, 1, 1],
                                duration: 8000,
                            }
                        }],()=>{

                        })

                    })
                })

            })

            this.map.on('complete', ()=> {
                setTimeout(()=>{
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
        '$route'(to, from){
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
