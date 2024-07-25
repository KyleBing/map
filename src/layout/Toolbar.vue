<template>
    <div class="tool-bar"  v-if="!store.isInPortraitMode">
        <div class="left">
            <slot name="left"/>
        </div>
        <div class="center">
            <slot name="center"/>
        </div>
        <div class="right">
            <slot name="right"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useProjectStore} from "@/pinia.ts";

const store = useProjectStore()

</script>


<style scoped lang="scss">
.tool-bar{
    padding: 0 20px;
    align-items: center;
    min-height: 50px;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    .left{
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        flex-shrink: 0;
    }
    .center{
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        flex-grow: 1;
        flex-shrink: 0;
    }
    .right{
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        flex-shrink: 0;
    }
}
</style>
