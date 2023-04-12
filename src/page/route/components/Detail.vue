<template>
    <div :class="['detail', 'card', {'closed': !showContent}, {'center': isInPortraitMode}]">
        <div class="title">
            <h1>{{line.name}} <i @click="toggleContent" v-if="showContent" class="el-icon-arrow-down"></i>
                <i @click="toggleContent" v-else class="el-icon-arrow-up"></i>
            </h1>
            <a v-if="line.video_link" target="_blank" class="video-link" :href="line.video_link"><i class="el-icon-video-camera"></i></a>
        </div>

        <div class="content" v-if="showContent">
            <div class="info-list">
                <div class="info" v-if="line.area">
                    <p class="info-title">路线区域</p><p class="info-value">{{line.area}}</p>
                </div>
                <div class="info">
                    <p class="info-title">路线策略</p><p class="info-value">{{policyMap.get(line.policy)}}</p>
                </div>
                <div class="info" v-if="line.road_type">
                    <p class="info-title">路面类型</p><p class="info-value">{{line.road_type}}</p>
                </div>
                <div class="info" v-if="line.seasons">
                    <p class="info-title">推荐季节</p><p class="info-value">{{line.seasons}}</p>
                </div>
                <div v-if="line.distance" class="info">
                    <p class="info-title">距离/时间</p><p class="info-value">{{line.distance}} km</p>
                </div>
                <div v-if="line.time" class="info">
                    <p class="info-title">行驶时间</p><p class="info-value">{{line.time}} min</p>
                </div>
            </div>
            <div class="note" v-if="line.note && line.note.length > 0">
                <p v-for="line in line.note.split('\n')">{{line}}</p>
            </div>
            <div class="button-center"
                 v-if="isAdmin || (authorization && authorization.uid) === line.uid"
            >
                <el-button
                    type="text" size="mini"
                    @click="goToEditCurrentLine"
                    icon="el-icon-edit-outline">编辑</el-button>
            </div>
<!--            <div class="button-center">
                <el-button
                    type="text" size="mini"
                    @click="$emit('openInGaodeApp')"
                    icon="el-icon-position">打开高德导航</el-button>
            </div>-->

            <div class="qr">
                <img :src="qrImg" alt="">
                <p>扫一扫，打开该页面</p>
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import QRCode from "./qr.js"
import DrivingInfo from "@/page/route/components/DrivingInfo.vue";
import {policyMap} from "@/page/route/DrivingPolicy"
export default {
    name: "Detail",
    components: {DrivingInfo},
    props:{
        line:{
            type: Object
        },
        drivingInfo: {
            type: Object
        }
    },
    data(){
        return {
            showContent: true,
            qrImg: '',
            policyMap,
        }
    },
    mounted() {
        this.qrImg = QRCode.generatePNG(window.location.href)

    },
    computed:{
        ...mapGetters(['isInPortraitMode', 'isAdmin', ]),
        ...mapState(['authorization', 'isShowingMenuToggleBtn'])
    },
    methods: {
        toggleContent(){
            this.showContent = !this.showContent
        },
        goToEditCurrentLine(){
            this.$router.push({
                name: 'RouteEditor',
                query: {
                    lineId: this.line.id
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

i{
    @extend .unselectable;
}
.detail{
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 0;
    width: 250px;
    .title{
        position: relative;
        text-align: center;
        padding: 10px 0 15px;
        font-size: 1rem;
        color: $text-main;
        border-bottom: 1px solid $border-normal;
        .video-link{
            display: block;
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            ::after{
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                height: 30px;
                width: 30px;
                transform: translateX(-50%) translateY(-50%);
                @include border-radius(100px);
            }
            &:hover{
                color: $color-main;
                ::after{
                    background-color: transparentize($color-main, 0.9);
                }
            }
            &:active{
                ::after{
                    background-color: transparentize($color-main, 0.7);
                }
            }
        }
    }
    &.closed{
        .title{
            padding: 10px 0 10px;
            border: none;
        }
    }
    &.center{
        left: 50%;
        transform: translateX(-50%);
    }
}

.content{
    @include transition(all 0.3s);
    color: $text-subtitle;
    font-size: 0.8rem;
}
.info-list{
    font-size: 12px;
    padding: 10px 20px;
}
.info{
    width: 100%;
    line-height: 1.5;
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    p{
        z-index: 10;
        background-color: white;
    }
    &-title{
        padding-right: 10px;
        color: $text-main;
    }
    &-value{
        padding-left: 10px;
    }

    &::after{
        width: 100%;
        height: 1px;
        position: absolute;
        bottom: 50%;
        left: 0;
        content: '';
        border-bottom: 1px dashed $border-normal;
    }
}
.note{
    padding: 10px 20px;
    border-top: 1px solid $border-normal;
    line-height: 1.5;
    color: $text-main;
}

.qr{
    flex-flow: column nowrap;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 15px;
    img{
        display: block;
        width: 120px;
    }
    p{
        font-size: $fz-small;
    }
}

@media (max-width: $screen-width-threshold) {
    .detail{
        &.center{
            top: 10px;
        }
    }
}
</style>
