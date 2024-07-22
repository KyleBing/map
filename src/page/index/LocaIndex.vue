<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader'
import ICON from "@/assets/icons"
import mapConfig from "../../mapConfig";
import {useProjectStore} from "@/pinia";

const POSITION = {
    daMingHu: [117.026217, 36.670921], // 大明湖
    quanChengGuangChang: [117.021226, 36.661487], // 泉城广场
    baoTuQuan: [117.015871, 36.661057], // 趵突泉
}
let AMap = null

export default {
    name: "LocaIndex",
    data() {
        return {
            store: useProjectStore(),

            isLoading: false,
            map: null,
            loca: null,
            currentLineId: 0,
            activeLineObj: null, // 当前 Line 对象
            currentRouting: null,  // 当前导航路线
        }
    },
    mounted() {
        AMapLoader
            .load({
                key: mapConfig.key_web_js, // 开发应用的 ID
                version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: [],
                Loca: {
                    version: '2.0.0',
                },
                AMapUI: {             // 是否加载 AMapUI，缺省不加载
                    version: '1.1',   // AMapUI 缺省 1.1
                    plugins: [],       // 需要加载的 AMapUI ui插件
                },

            })
            .then(map => {
                AMap = map
                this.map = new AMap.Map('container', {
                    viewMode: '3D',
                    zoom: 17,
                    center: POSITION.daMingHu,
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
                    // 俯仰角动画
                    pitch: {
                        value: 45, // 动画终点的俯仰角度
                        control: [[0, -60], [1, 45]], // 控制器，x是0～1的起始区间，y是pitch值
                        timing: [0.2, 0.2, 0.8, 0.8], // 这个值是线性过渡
                        duration: 8000,
                    },
                    // 缩放等级动画
                    zoom: {
                        value: 18, // 动画终点的地图缩放等级
                        control: [[0, 17], [1, 18]], // 控制器，x是0～1的起始区间，y是zoom值
                        timing: [0, 0, 1, 1],
                        duration: 8000,
                    },
                    // 旋转动画
                    rotation: {
                        value: 90, // 动画终点的地图旋转角度
                        control: [[0, 0], [1, 90]], // 控制器，x是0～1的起始区间，y是rotation值
                        timing: [0.4, 0.2, 0.5, 1],
                        duration: 8000,
                    }
                }], () => {
                    this.loca.viewControl.addAnimates([{
                        center: {
                            value: POSITION.quanChengGuangChang, // 动画终点的经纬度
                            control: [POSITION.daMingHu, POSITION.quanChengGuangChang], // 过渡中的轨迹控制点，地图上的经纬度
                            timing: [0.4, 0.2, 0.8, 1], // 动画时间控制点
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
                                timing: [0.6, 0.1, 0.2, 0.8], // 这个值是线性过渡
                                duration: 8000,
                            },
                            // 缩放等级动画
                            zoom: {
                                value: 17, // 动画终点的地图缩放等级
                                control: [[0, 17], [1, 18]], // 控制器，x是0～1的起始区间，y是zoom值
                                timing: [0.4, 0.1, 0.4, 1],
                                duration: 8000,
                            },
                        }])
                    })
                })


                this.map.on('complete', () => {
                    setTimeout(() => {
                        this.loca.animate.start()
                    }, 2000); // 给地图一个加载的时间
                })

            })
            .catch(e => {
                console.log(e)
            })
    },
    methods: {
        resizeMap() {
            let mapContainer = document.getElementById('container')
            mapContainer.style.height = window.innerHeight + "px"
            mapContainer.style.width = window.innerWidth + "px"
        },
    },
    watch: {

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
