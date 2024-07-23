<template>
    <div :class="['list-panel', {collapsed: !isShowPanel}] " v-loading="isLoading">
        <div class="list-panel-header">
            <div class="title">路线列表</div>
            <ElButton size="small" icon="Minus" type="info" @click="togglePanel">折叠/展开</ElButton>
            <ElButton size="small" icon="PriceTag" type="info" @click="toggleLabel">切换标签显示</ElButton>
        </div>
        <ElTabs
            v-if="isShowPanel"
            type="card"
            @tab-click="tabClick"
            v-model="currentTab">
            <ElTabPane label="我的" name="mine">
                <div class="route-line-list" :style="`max-height: ${store.windowInsets.height - 300}px`">
                    <div
                        @click="emit('choseLine', line.id)"
                        :class="[
                            'route-line-list-item',
                            {active: Number(route.query.lineId) === line.id}
                        ]"
                        v-for="line in routeLineListMine" :key="line.id"
                    >
                        <div class="id">{{line.id}}</div>
                        <div class="name">{{line.name}}</div>
                        <div class="area">{{line.area}}</div>
                    </div>
                </div>
            </ElTabPane>
            <ElTabPane label="其它公开路线" name="other">
                <div class="route-line-list" :style="`max-height: ${store.windowInsets.height - 300}px`">
                    <div
                        @click="emit('choseLine', line.id)"
                        :class="[
                            'route-line-list-item',
                            {active: Number(route.query.lineId) === line.id}
                        ]"
                        v-for="line in routeLineListPublic" :key="line.id"
                    >
                        <div class="id">{{line.id}}</div>
                        <div class="name">{{line.name}}</div>
                        <div class="area">{{line.area}}</div>
                    </div>
                </div>
            </ElTabPane>
        </ElTabs>
    </div>

</template>

<script lang="ts" setup>
import routeApi from "@/api/routeApi";
import {Base64} from "js-base64";
import {dateFormatter} from "@/utility";
import axios from "axios";
import {useProjectStore} from "@/pinia";
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {EntityRoute} from "@/page/route/Route.ts";

const store = useProjectStore()
const route = useRoute()
const router = useRouter()


const emit = defineEmits(['choseLine', 'labelToggle'])

const isShowContent = ref(true)
const currentTab = ref('mine') // 我的
const isLoading = ref(false)
const routeLineListPublic = ref<Array<EntityRoute>>([])
const routeLineListMine = ref<Array<EntityRoute>>([])

// pager
const pager = ref({
    pageSize: 100,
    pageNo: 1,
    total: 0
})
const isShowPanel = ref(true)

onMounted(()=>{
    getRouteList()
})

function togglePanel(){
    isShowPanel.value = !isShowPanel.value
}
function toggleLabel(){
    emit('labelToggle')
}
function tabClick(tab, event){
    // console.log(tab, event)
}
// 获取路线列表
function getRouteList() {
    isLoading.value = true

    let requestDataPublic = {
        isMine: "0", // 是否过滤自己的路线
        pageNo: pager.value.pageNo,
        pageSize: pager.value.pageSize
    }

    let requestDataMine = {
        isMine: "1", // 是否过滤自己的路线
        pageNo: pager.value.pageNo,
        pageSize: pager.value.pageSize
    }

    axios
        .all([
            routeApi.list(requestDataPublic),
            routeApi.list(requestDataMine),
        ])
        .then(response => {
            routeLineListPublic.value = []
            routeLineListMine.value = []

            let resPublic = response[0]
            let resMine = response[1]

            routeLineListPublic.value = resPublic.data.list.map(item => {
                item.paths = Base64.decode(item.paths) || ''
                item.pathArray = item.paths && JSON.parse(item.paths)
                item.seasonsArray = item.seasons.split('、')
                item.date_init = dateFormatter(new Date(item.date_init))
                item.date_modify = dateFormatter(new Date(item.date_modify))
                return item
            })
            routeLineListMine.value = resMine.data.list.map(item => {
                item.paths = Base64.decode(item.paths) || ''
                item.pathArray = item.paths && JSON.parse(item.paths)
                item.seasonsArray = item.seasons.split('、')
                item.date_init = dateFormatter(new Date(item.date_init))
                item.date_modify = dateFormatter(new Date(item.date_modify))
                return item
            })
            isLoading.value = false
        })
        .catch(err => {
            isLoading.value = false
        })
}
</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

.list-panel{
    @extend .card;
    padding: 0 0 10px;
    &.collapsed{
        padding: 0;
    }
}

.list-panel-header{
    padding: 8px 10px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .title{
        margin-right: 10px;
        font-weight: bold;
        text-align: center;
        font-size: $fz-title;
    }
}

.route-line-list{
    overflow-y: auto;
    min-height: 100px;
    background-color: white;
    width: 400px;
    .route-line-list-item{
        border-bottom: 1px solid $border-light;
        padding: 3px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: $fz-normal;
        &:last-child{
            border-bottom: none;
        }
        &:hover{
            border-bottom-color: white;
            background-color: $bg-active;
        }
        @extend .btn-like;
        .id{
            padding: 0 10px;
            text-align: right;
            color: $text-description;
            width: 50px;
        }
        .area{
            color: $text-subtitle;
        }
        .name{
            padding-left: 10px;
            width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow-ellipsis: ellipsis;
        }
        &.active{
            background-color: $color-main;
            color: white;
            .id{
                color: white;
            }
            .area{
                color: white;
            }
        }
    }
}


</style>
