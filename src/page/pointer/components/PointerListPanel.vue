<template>
    <div class="list-panel">
        <div class="list-title">点图列表</div>
        <div class="route-line-list">
            <div
                v-if="pointerList.length > 0"
                v-for="pointer in pointerList" :key="pointer.id"
                @click="emit('chosePointer', pointer.id)"
                :class="[
                'route-line-list-item',
                {active: Number(route.query.pointerId) === pointer.id}
            ]"
            >
                <div class="id">{{pointer.id}}</div>
                <div class="name">{{pointer.name}}</div>
                <div class="area">{{pointer.area}}</div>
            </div>
            <div v-else> 暂无数据</div>
        </div>
    </div>

</template>

<script setup lang="ts">

import {useProjectStore} from "@/pinia";
import {useRoute} from "vue-router";
import {ref} from "vue";

const store = useProjectStore()
const route = useRoute()


const emit = defineEmits()

defineProps<{
    pointerList: []
}>()

const showContent = ref(true)

function toggleContent(){
    showContent.value = !showContent.value
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
    width: 350px;
    .route-line-list-item{
        border-bottom: 1px solid $border-light;
        padding: 3px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: $fz-normal;
        @extend .btn-like;

        &:last-child{
            border-bottom: none;
        }
        &:hover{
            border-bottom-color: white;
            background-color: $bg-active;
        }
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
            width: 180px;
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
