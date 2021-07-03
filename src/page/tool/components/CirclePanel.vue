<template>
    <div class="circle-panel card">
        <el-button type="primary" @click="pickStart">开始拾取点</el-button>
        <el-button type="danger" @click="pickStop">结束拾取点</el-button>
<!--        <el-input v-model="location"></el-input>-->
        <pre>{{this.location.toString(',')}}</pre>
    </div>

</template>

<script>
import TableInserter from "@/components/tableInserter";
export default {
    props:{
        data: {
            type: Array
        },
        location: {
            type: Array
        }
    },
    name: "CirclePanel",
    components: {TableInserter},
    data(){
        return {
            // location: [] // 经纬度
        }
    },
    methods:{
        pickStart(){
            this.$emit('pickStart', null)
        },
        pickStop(){
            this.$emit('pickStop', null)
        }
    }
}
</script>

<style scoped lang="scss">
@import "../../../scss/plugin";

.circle-panel{
    width: 400px;
    position: absolute;
    left: 30px;
    top: 30px;
}
</style>