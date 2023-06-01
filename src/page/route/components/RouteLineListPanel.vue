<template>
    <div class="list-panel">
        <div class="list-title">路径列表</div>
        <div class="route-line-list">
            <div
                @click="$emit('choseLine', line.id)"
                :class="[
                'route-line-list-item',
                {active: Number($route.query.lineId) === line.id}
            ]"
                v-for="line in routeLineList" :key="line.id"
            >
                <div class="id">{{line.id}}</div>
                <div class="name">{{line.name}}</div>
                <div class="area">{{line.area}}</div>
            </div>
        </div>
    </div>

</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "PointerListPanel",
    props:{
        routeLineList: []
    },
    data(){
        return {
            showContent: true
        }
    },
    computed:{
        ...mapGetters(['isInPortraitMode']),
    },
    methods: {
        toggleContent(){
            this.showContent = !this.showContent
        }
    },
}
</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

.list-panel{
    @extend .card;
    padding: 0 0 10px;
}
.list-title{
    padding: 8px 10px;
    border-bottom: 1px solid $border-normal;
    //background-color: $bg-second;
    font-weight: bold;
    text-align: center;
    font-size: $fz-title;
}
.route-line-list{
    min-height: 100px;
    //@include border-radius($radius);
    overflow: hidden;
    background-color: white;
    width: 300px;
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
            width: 150px;
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
