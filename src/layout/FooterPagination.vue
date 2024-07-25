<template>
    <div class="page-footer">
        <ElPagination
            :current-page="pagerOption.pageNo"
            :page-size="pagerOption.pageSize"
            :page-sizes="[20, 50, 100, 200, 500]"
            :small="false"
            :disabled="false"
            :background="false"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagerOption.total"
            v-model:page-size="pagerOption.pageSize"
            v-model:current-page="pagerOption.pageNo"
            @update:current-page="emit('pagerChange')"
            @update:page-size="emit('pagerChange')"
        />
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['pagerChange'])

defineProps({
    pagerOption: {
        type: Object,
        default: {
            total: 0,
            pageNo: 1,
            pageSize: 20
        }
    }
})

</script>

<style scoped lang="scss">
.page-footer{
    padding: 0 10px;
    align-items: center;
    height: 50px;
    display: flex;
    justify-content: flex-end;
}
</style>
