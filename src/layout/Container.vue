<template>
    <div class="container" :style="`height: ${store.windowInsets.height}px; padding: ${props.padding}px`">
        <slot></slot>
    </div>

</template>

<script setup lang="ts">
import {useProjectStore} from "../pinia";
const store = useProjectStore()

const props = withDefaults(defineProps<{
    padding?: number
}>(),{
    padding: 0
})
</script>

<style lang="scss" scoped>
.container {
    padding: 0;
    position: relative;
    overflow: hidden;
    overflow-y: auto;
}

</style>
