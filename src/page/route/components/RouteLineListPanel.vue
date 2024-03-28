<template>
    <div :class="['list-panel', {collapsed: !isShowPanel}] " v-loading="isLoading">
        <div class="list-panel-header">
            <div class="title">路线列表</div>
            <el-button size="mini" icon="el-icon-monitor" type="default" @click="togglePanel">折叠/展开</el-button>
            <el-button size="mini" icon="el-icon-price-tag" type="default" @click="toggleLabel">切换标签显示</el-button>
        </div>
        <el-tabs
            v-if="isShowPanel"
            type="card"
            @tab-click="tabClick"
            v-model="currentTab">
            <el-tab-pane label="我的" name="mine">
                <div class="route-line-list" :style="`max-height: ${windowInsets.height - 300}px`">
                    <div
                        @click="$emit('choseLine', line.id)"
                        :class="[
                            'route-line-list-item',
                            {active: Number($route.query.lineId) === line.id}
                        ]"
                        v-for="line in routeLineListMine" :key="line.id"
                    >
                        <div class="id">{{line.id}}</div>
                        <div class="name">{{line.name}}</div>
                        <div class="area">{{line.area}}</div>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="其它公开路线" name="other">
                <div class="route-line-list" :style="`max-height: ${windowInsets.height - 300}px`">
                    <div
                        @click="$emit('choseLine', line.id)"
                        :class="[
                            'route-line-list-item',
                            {active: Number($route.query.lineId) === line.id}
                        ]"
                        v-for="line in routeLineListPublic" :key="line.id"
                    >
                        <div class="id">{{line.id}}</div>
                        <div class="name">{{line.name}}</div>
                        <div class="area">{{line.area}}</div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>

</template>

<script>
import {mapGetters, mapState} from "vuex";
import routeApi from "@/api/routeApi";
import {Base64} from "js-base64";
import utility from "@/utility";
import axios from "axios";

export default {
    name: "PointerListPanel",
    data(){
        return {
            showContent: true,
            currentTab: 'mine', // 我的
            isLoading: false,
            routeLineListPublic: [],
            routeLineListMine: [],
            // pager
            pager: {
                pageSize: 100,
                pageNo: 1,
                total: 0
            },
            isShowPanel: true,
        }
    },

    computed:{
        ...mapState(['windowInsets']),
        ...mapGetters(['isInPortraitMode']),
    },
    mounted() {
        this.getRouteList()
    },
    methods: {
        togglePanel(){
            this.isShowPanel = !this.isShowPanel
        },
        toggleLabel(){
            this.$emit('labelToggle')
        },
        tabClick(tab, event){
            // console.log(tab, event)
        },
        // 获取路线列表
        getRouteList() {
            this.isLoading = true

            let requestDataPublic = {
                isMine: "0", // 是否过滤自己的路线
                pageNo: this.pager.pageNo,
                pageSize: this.pager.pageSize
            }

            let requestDataMine = {
                isMine: "1", // 是否过滤自己的路线
                pageNo: this.pager.pageNo,
                pageSize: this.pager.pageSize
            }

            axios
                .all([
                    routeApi.list(requestDataPublic),
                    routeApi.list(requestDataMine),
                ])
                .then(response => {
                    this.routeLineListPublic = []
                    this.routeLineListMine = []

                    let resPublic = response[0]
                    let resMine = response[1]

                    this.routeLineListPublic = resPublic.data.list.map(item => {
                        item.paths = Base64.decode(item.paths) || ''
                        item.pathArray = item.paths && JSON.parse(item.paths)
                        item.seasonsArray = item.seasons.split('、')
                        item.date_init = utility.dateFormatter(new Date(item.date_init))
                        item.date_modify = utility.dateFormatter(new Date(item.date_modify))
                        return item
                    })
                    this.routeLineListMine = resMine.data.list.map(item => {
                        item.paths = Base64.decode(item.paths) || ''
                        item.pathArray = item.paths && JSON.parse(item.paths)
                        item.seasonsArray = item.seasons.split('、')
                        item.date_init = utility.dateFormatter(new Date(item.date_init))
                        item.date_modify = utility.dateFormatter(new Date(item.date_modify))
                        return item
                    })
                    this.isLoading = false
                })
                .catch(err => {
                    this.isLoading = false
                })
        },
    },
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
        &:last-child{
            border-bottom: none;
        }
        border-bottom: 1px solid $border-light;
        padding: 3px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: $fz-normal;
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
