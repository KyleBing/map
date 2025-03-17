<template>
    <div class="circle-panel card">
        <table class="log">
            <thead>
                <tr>
                    <td>#</td>
                    <td>经纬</td>
                    <td>地点</td>
                    <td>半径</td>
                    <td>操作</td>
                </tr>
            </thead>
            <tbody>
            <tr>
                <td><i class="el-icon-aim"></i></td>
                <td>
                    <div class="lnglat" :data-clipboard-text="`[${lng}, ${lat}]`">
                        <div class="lng">经: {{lng || '--'}}</div>
                        <div class="lat">纬: {{lat || '--'}}</div>
                    </div>
                </td>
                <td><ElInput @keyup.native.enter="addNewCircle" clearable ref="refInputName" size="small" placeholder="标记名" v-model="name"></ElInput></td>
                <td><ElInput @keyup.native.enter="addNewCircle" ref="refInputRadius" size="small" placeholder="半径" v-model.number="radius" type="number"></ElInput></td>
                <td>
                    <ElButton size="small" type="success" @click="addNewCircle" icon="Plus">添加</ElButton>
                </td>
            </tr>
                <tr v-for="(item, index) in modelValue" :key="index">

                    <td>{{modelValue.length - index}}</td>
                    <td>
                        <div class="lnglat" :data-clipboard-text="`[${lng}, ${lat}]`">
                            <div class="lng">经: {{item.center[0]}}</div>
                            <div class="lat">纬: {{item.center[1]}}</div>
                        </div>
                    </td>
                    <td>{{item.name}}</td>
                    <td>{{item.radius}} km</td>
                    <td>
                        <div :class="['operation', {'align-items-start': index > 0}, {'align-items-end': index < modelValue.length - 1}]">
                            <div class="move">
                                <ElIcon v-if="index > 0"  @click="move(index, 'up')" size="12"><CaretTop /></ElIcon>
                                <ElIcon v-if="index < modelValue.length - 1" @click="move(index, 'down')" size="12"><CaretBottom /></ElIcon>
                            </div>
                            <div class="delete">
                                <ElIcon  @click="circleDelete(index)" size="15"><CircleClose /></ElIcon>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts" setup>
import ClipboardJS from 'clipboard'
import {onMounted, onUnmounted, ref, watch} from "vue";
import {ElMessage} from "element-plus";

const props = defineProps<{
    keyword: string,
    lng: number,
    lat: number,
}>()

const modelValue = defineModel<Array<any>>()

const name = ref('') // 当前点的地名
const radius = ref(1) // 半径：公里

const refInputName = ref()
const refInputRadius = ref()

let clipboard = null


onMounted(() => {
    clipboard = new ClipboardJS('.lnglat')
})
onUnmounted(() => {
    clipboard.destroy()
})

function addNewCircle(){
    if(validateInput()){
        modelValue.value.push({
            center: [props.lng, props.lat],
            radius: radius.value,
            name: name.value
        })
    }
}

function validateInput(){
    if (!props.lng || !props.lat){
        ElMessage({
            message: '坐标未选定',
            type: 'warning'
        })
        return false
    }
    if (!name.value){
        ElMessage({
            message: '地名未填写',
            type: 'warning'
        })
        refInputName.value.focus()
        return false
    }
    if (!radius.value){
        ElMessage({
            message: '半径未填写',
            type: 'warning'
        })
        refInputRadius.value.focus()
        return false
    }
    return true
}
function move(index: number, direction: 'up'|'down'){
    let indexExchange = direction === 'up'? index - 1 : index + 1
    let tempItem = modelValue.value[index]
    let preItem = modelValue.value[indexExchange]
    let tempData = modelValue.value // 临时数组
    tempData[indexExchange] = tempItem
    tempData[index] = preItem
    modelValue.value = [...tempData]
}
function circleDelete(index: number){
    modelValue.value.splice(index, 1)
}

watch(radius, newValue => {
    if (newValue < 0) {
        radius.value = 0
    }
})
watch(() => props.keyword, newValue => {
    name.value = newValue
})
</script>

<style scoped lang="scss">
@use 'sass:math';
@import "../../../../scss/plugin";

.circle-panel {
    width: 500px;
    padding: 0 !important;
}
.operation{
    display: flex;
}


.align-items-start{
    align-items: flex-start;
}
.align-items-end{
    align-items: flex-end;
}


.toolbar{
    border-top: 1px solid $border-normal;
    padding: 6px;
}

table{
    width: 100%;
}
thead{
    td {
        font-size: 0.8rem;
        color: $text-main;
        padding: 8px 2px 3px 5px;
        border-bottom: 1px solid $border-normal;
        &:last-child, &:first-child {
            text-align: center;
        }
        &:nth-child(1) {width: 10%;}
        &:nth-child(2) {width: 25%;}
        &:nth-child(3) {width: 30%;}
        &:nth-child(4) {width: 20%;}
        &:nth-child(5) {width: 15%;}
    }
}
tbody{
    tr:nth-child(2n + 1){
        background-color: #f2f2f2;
    }
    td{
        font-size: 0.7rem;
        padding: 2px 2px 2px 5px;
        &:last-child, &:first-child {
            text-align: center;
        }
    }
}

</style>
