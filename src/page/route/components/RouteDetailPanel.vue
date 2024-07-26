<template>
    <div :class="['detail', 'card', {'closed': !showContent}, {'center': store.isInPortraitMode}]">
        <div class="title">
            <h1>{{line.name}} <i @click="toggleContent" v-if="showContent" class="ArrowDown"></i>
                <i @click="toggleContent" v-else class="ArrowUp"></i>
            </h1>
            <a v-if="line.video_link" target="_blank" class="video-link" :href="line.video_link">
                <ElIcon size="20"><VideoCameraFilled/></ElIcon>
            </a>
        </div>

        <div class="content" v-if="showContent">
            <div class="info-list">
                <div class="info" v-if="line.area">
                    <p class="info-title">路线区域</p><p class="info-value">{{line.area}}</p>
                </div>
                <div class="info">
                    <p class="info-title">公开状态</p><p class="info-value">{{line.is_public? '公开': '私有'}}</p>
                </div>
                <div class="info" v-if="line.pathArray && line.pathArray.length > 0">
                    <p class="info-title">节点数量</p><p class="info-value">{{line.pathArray.length}} 个</p>
                </div>
                <div v-if="line.policy !== undefined" class="info">
                    <p class="info-title">路线策略</p><p class="info-value">{{policyMap.get(line.policy)}}</p>
                </div>
                <div v-if="line.road_type" class="info">
                    <p class="info-title">路面类型</p><p class="info-value">{{line.road_type}}</p>
                </div>
                <div v-if="line.seasons" class="info">
                    <p class="info-title">推荐季节</p><p class="info-value">{{line.seasons}}</p>
                </div>
                <div v-if="line.distance" class="info">
                    <p class="info-title">距离/时间</p><p class="info-value">{{line.distance}} km / {{line.time}} min</p>
                </div>
                <div v-if="line.nickname" class="info">
                    <p class="info-title">创建用户</p><p class="info-value">{{line.nickname}}</p>
                </div>
            </div>
            <div class="note markdown" :style="`max-height: ${height}px`" v-if="line.note" v-html="contentHtml"></div>
            <div class="button-center"
                 v-if="store.isAdmin || (store.authorization && store.authorization.uid) === line.uid"
            >
                <ElButton
                    v-if="line.id !== undefined"
                    plain size="small"
                    @click="goToEditCurrentLine"
                    icon="EditPen">编辑</ElButton>
            </div>
<!--            <div class="button-center">
                <ElButton
                    type="text" size="small"
                    @click="$emit('openInGaodeApp')"
                    icon="el-icon-position">打开高德导航</ElButton>
            </div>-->
<!--            <div class="qr">-->
<!--                <img :src="qrImg" alt="">-->
<!--                <p>扫一扫，打开该页面</p>-->
<!--            </div>-->
        </div>
    </div>
</template>

<script lang="ts" setup>
// import * as QRCode from "../../../lib/qr.js"
import {policyMap} from "@/page/route/DrivingPolicy"
import {marked} from "marked";
import {useProjectStore} from "@/pinia";
import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {EntityRoute} from "@/page/route/Route.ts";

const props = defineProps<{
    line: EntityRoute,
    drivingInfo?: {}
}>()

const store = useProjectStore()
const route = useRoute()
const router = useRouter()


const showContent = ref(true)
const qrImg = ref('')
const height = ref(innerHeight * 0.5)

onMounted(()=>{
    // qrImg.value = QRCode.generatePNG(window.location.href)
})

const contentHtml = computed(() => {
    return marked.parse(props.line.note)
})

function toggleContent(){
    showContent.value = !showContent.value
}
function goToEditCurrentLine(){
    router.push({
        name: 'RouteEditor',
        query: {
            lineId: props.line.id
        }
    })
}

</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

i{
    @extend .unselectable;
}
.detail{
    z-index: 999;
    backdrop-filter: blur(3px) saturate(120%);
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 0 !important;
    width: 350px;
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
            &:hover{
                color: $color-main;
            }
            &:active{
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
    padding-bottom: 20px;
    @include transition(all 0.3s);
    color: $text-subtitle;
    font-size: 0.8rem;
}
.info-list{
    background-color: white;
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
    overflow-y: auto;
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
