<template>
    <div class="table-inserter">
        <el-table :data="dataSource" class="mb-10">
            <el-table-column v-for="(label, identifier) in dataModal" :key="label" :prop="identifier" :label="label">
                <template slot-scope="scope">
                    <el-input :placeholder="label"
                              size="small"
                              v-model="dataSource[scope.$index][identifier]"
                              v-if="scope.row.isEdit"></el-input>
                    <span v-else>{{ scope.row[identifier] }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.isEdit" @click="handleSave(scope.$index)" type="text" size="small">保存</el-button>
                    <div v-else>
                        <el-button @click="handleEdit(scope.$index)" type="text" class="text-primary" size="small">编辑</el-button>
                        <el-button @click="handleDelete(scope.$index)" type="text" class="text-danger" size="small">删除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-row>
            <el-col :span="24">
                <el-button class="btn-add" type="plain" :round="false" @click="handleAdd">添加</el-button>
            </el-col>
        </el-row>
    </div>


</template>

<script>
export default {
    name: "tableInserter",
    props: {
        dataModal: {
            type: Object,
            required: true
        },
        dataSource: {
            type: Array,
            required: true
        }
    },
    mounted() {
    },
    data() {
        return {
        }
    },
    methods: {
        handleSave(index) {
            this.dataSource[index].isEdit = false
        },
        handleEdit(index) {
            this.dataSource[index].isEdit = true
        },
        handleDelete(index) {
            this.dataSource.splice(index, 1)
        },
        handleAdd() {
            this.dataSource.push({isEdit: true})
        }
    }
}
</script>

<style lang="scss" scoped>
.table-inserter{
    border: 1px solid #eee;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    overflow: hidden;
}
.btn-add{
    -webkit-border-radius: 0;
    -moz-border-radius: 0;
    border-radius: 0;
    display: block;
    border: none;
    width: 100%;
}
.text-danger{color: #F56C6C;}
.text-primary{color: #409EFF;}
.text-danger{color: #F56C6C;}
</style>
