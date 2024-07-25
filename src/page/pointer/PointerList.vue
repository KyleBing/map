<template>
    <div class="route-list">
        <Toolbar>
            <template #left>
                <ElButton type="success" @click="addNewPointer" icon="Plus">新增点图</ElButton>
                <ElButton type="primary" @click="addNewPointerWidthMap" icon="Promotion">从地图中规划点图</ElButton>
            </template>
            <template #center>
                <div class="search-bar">
                    <ElForm inline>
                        <ElFormItem label="关键字" class="ml-4">
                            <ElInput clearable placeholder="检索词条、编码、注释" v-model="formSearch.keyword"></ElInput>
                        </ElFormItem>
                        <ElFormItem label="添加时间区间">
                            <ElDatePicker type="datetimerange" v-model="formSearch.dateRange"></ElDatePicker>
                        </ElFormItem>
                        <ElFormItem>
                            <ElButton type="primary" @click="search" icon="Filter">查询</ElButton>
                        </ElFormItem>
                    </ElForm>
                </div>
            </template>
            <template #right></template>
        </Toolbar>

        <ElRow :gutter="10">
            <ElCol :span="24">
                <ElTable
                    class="table-narrow"
                    size="small"
                    :height="store.contentInsets.heightContent"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <ElTableColumn width="50" prop="id" label="#"/>
                    <ElTableColumn width="200" prop="name" label="数据名"/>
                    <ElTableColumn align="center" width="60" prop="is_public" label="状态">
                        <template #default="scope">
                            <ElTag effect="dark" type="success" v-if="scope.row.is_public === 1">公开</ElTag>
                            <ElTag effect="dark" type="info" v-else>私有</ElTag>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="150" align="center" prop="area" label="地域"/>
                    <ElTableColumn width="100" align="center" prop="nickname" label="用户"/>
                    <ElTableColumn align="center" min-width="350px" label="操作">
                        <template #default="scope">
                            <ElButton class="btn-narrow" type="success"
                                       @click="showPointer(scope.row)" size="small" plain icon="View">地图中查看</ElButton>
                            <ElButton class="btn-narrow" type="success"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="editPointer(scope.row)" plain size="small" icon="Position">地图中编辑</ElButton>
                            <ElButton class="btn-narrow" type="primary"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="goEdit(scope.row)" plain size="small" icon="Edit">编辑</ElButton>
                            <ElButton class="btn-narrow" type="danger"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="goDelete(scope.row)" plain size="small" icon="Delete">删除</ElButton>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="center" width="50" prop="video_link" label="视频">
                        <template #default="scope">
                            <a class="link" v-if="scope.row.video_link" target="_blank" :href="scope.row.video_link"><i class="el-icon-video-camera"></i></a>
                            <span v-else>-</span>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="center" prop="pointers" label="数据点数量">
                        <template #default="scope">
                            <div>{{ scope.row.pointerArray.length }}</div>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="left" width="250" prop="note" label="备注">
                        <template #default="scope">
                            <i class="el-icon-minus" v-if="scope.row.note === ''"></i>
                            <ElPopover v-else
                                        placement="left"
                                        title=""
                                        width="400"
                                        trigger="hover"
                                        :content="scope.row.note">
                                <template #reference class="table-description">
                                    <i class="el-icon-tickets"></i> {{scope.row.note}}
                                </template>
                            </ElPopover>
                        </template>
                    </ElTableColumn>
<!--                    <ElTableColumn sortable align="center" width="60px" prop="thumb_up" label="赞"/>-->
                    <ElTableColumn sortable align="center" width="180px" prop="date_create" label="创建、编辑">
                        <template #default="scope">
                            <div class="table-date">
                                <div class="create-date">{{ scope.row.date_create }}</div>
                                <div class="modify-date">{{ scope.row.date_modify }}</div>
                            </div>
                        </template>
                    </ElTableColumn>
                </ElTable>

                <!--  PAGINATION  -->
                <FooterPagination
                    @pagerChange="pageChange"
                    :pager-option="pager"/>
            </ElCol>
        </ElRow>

        <!-- 编辑窗口-->
        <ElDialog
            center
            :title="modalTitle"
            v-model="isShowDialogEdit"
            width="40%"
            :before-close="closeModal">
            <ElForm
                :model="formPointer"
                :rules="pointerRules"
                size="default"
                ref="refForm" label-width="100px">
                <ElFormItem label="点图名" prop="name">
                    <ElInput v-model="formPointer.name"/>
                </ElFormItem>
                <ElFormItem label="地域" prop="area">
                    <ElInput v-model="formPointer.area"/>
                </ElFormItem>
                <ElFormItem label="是否公开" prop="is_public">
                    <ElRadio :label="1" v-model="formPointer.is_public">公开</ElRadio>
                    <ElRadio :label="0" v-model="formPointer.is_public">私有</ElRadio>
                </ElFormItem>
                <ElFormItem label="视频链接" prop="video_link">
                    <ElInput v-model="formPointer.video_link"/>
                </ElFormItem>
                <ElFormItem label="点位 json" prop="pointers">
                    <ElInput type="textarea" :rows="6" v-model="formPointer.pointers"/>
                </ElFormItem>
                <ElFormItem label="备注" prop="note">
                    <ElInput type="textarea" placeholder="支持 Markdown" :rows="5" v-model="formPointer.note"/>
                </ElFormItem>
            </ElForm>
            <template #footer class="dialog-footer">
                <ElButton @click="clearForm" type="warning" icon="RefreshLeft">清空</ElButton>
                <ElButton @click="closeModal" icon="Close">取 消</ElButton>
                <ElButton type="primary" @click="submit" icon="Check">{{ editingPointerId ? '修改' : '添加' }}</ElButton>
            </template>
        </ElDialog>
    </div>
</template>
<script lang="ts" setup>
import {Base64} from "js-base64"
import {useProjectStore} from "@/pinia";
import {dateFormatter} from "@/utility";
import {computed, onMounted, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {ElMessageBox, ElNotification, FormRules} from "element-plus";
import Toolbar from "@/layout/Toolbar.vue";
import pointerApi from "@/api/pointerApi";
import FooterPagination from "@/layout/FooterPagination.vue";
import {EntityPointer} from "@/page/pointer/Pointer.ts";

const store = useProjectStore()
const router = useRouter()

const refForm = ref()

const isLoading = ref(false)
const editingPointerId = ref(null)
const tableData = ref([])
const isShowDialogEdit = ref(false) // modal show or not

const formPointer = ref<EntityPointer>({
    name: '', // *点图名
    area: '', // *地域
    video_link: '', // 路径视频演示
    pointers: [], // *路径点
    note: '', // 备注
    thumb_up: 0, // *点赞数
    is_public: 1, // *是否公开
})

const pointerRules = reactive<FormRules<EntityPointer>>({
    name: [{required: true, message: '请填写点图钱', trigger: 'blur'},],
    area: [{required: true, message: '请填写地域', trigger: 'blur'},],
})

// pager
const pager = ref({
    pageSize: 20,
    pageNo: 1,
    total: 0
})
const formSearch = ref({
    keyword: '',
    dateRange: []
})

onMounted(()=>{
    getPointerList()
})

const modalTitle = computed(()=>{
        return editingPointerId.value ? '编辑点图' : '新增点图'
})

function search(){
    getPointerList()
}
function editPointer(pointerInfo: EntityPointer){
    router.push({
        name: "PointerEditor",
        query: {
            pointerId: pointerInfo.id
        }
    })
}

// 跳转到点图展示页面
function showPointer(pointerInfo: EntityPointer){
    router.push({
        name: "PointerViewer",
        query: {
            pointerId: pointerInfo.id
        }
    })
}

// route to pointer editor
function addNewPointerWidthMap(){
    router.push({
        name: 'PointerEditor'
    })
}
function addNewPointer() {
    isShowDialogEdit.value = true
    editingPointerId.value = null
    clearForm()
}
function clearForm() {
    formPointer.value = {
        name: '', // *点图名
        area: '', // *地域
        video_link: '', // 路径视频演示
        pointers: [], // *路径点
        note: '', // 备注
        thumb_up: 0, // *点赞数
        is_public: 1, // *是否公开
    }
}
function closeModal(done) {
    ElMessageBox.confirm('确认关闭？')
        .then(() => {
            editingPointerId.value = null
            isShowDialogEdit.value = false
            done();
        })
        .catch(() => {
        })
}

function submit() {
    refForm.value.validate(valid => {
        if (valid) {
            if (editingPointerId.value) {
                pointerModifySubmit()
            } else {
                pointerNewSubmit()
            }
        } else {
            console.log('error submit!!');
            return false;
        }
    })
}

// 编辑
function pointerModifySubmit() {
    // 为了断开最终数据与 formPointer 的关联
    let requestData = {}
    Object.assign(requestData, formPointer.value)
    requestData.pointers = Base64.encode(formPointer.value.pointers)
    pointerApi
        .modify(requestData)
        .then(res => {
            ElNotification({
                title: res.message,
                position: 'top-right',
                type: 'success',
                onClose() {
                }
            })
            editingPointerId.value = null
            isShowDialogEdit.value = false
            getPointerList()
        })
        .catch(err => {
        })
}

// 新增
function pointerNewSubmit() {
    // 为了断开最终数据与 formPointer 的关联
    let requestData = {}
    Object.assign(requestData, formPointer.value)
    requestData.pointers = Base64.encode(formPointer.value.pointers)
    pointerApi
        .add(requestData)
        .then(res => {
            ElNotification({
                title: res.message,
                position: 'top-right',
                type: 'success',
                onClose() {
                }
            })
            editingPointerId.value = null
            isShowDialogEdit.value = false
            getPointerList()
        })
}

// 获取点图列表
function getPointerList() {
    isLoading.value = true
    let requestData = {
        pageNo: pager.value.pageNo,
        pageSize: pager.value.pageSize,
        keyword: formSearch.value.keyword,
        dateRange: formSearch.value.dateRange
    }
    pointerApi
        .list(requestData)
        .then(res => {
            isLoading.value = false
            pager.value = res.data.pager
            tableData.value = res.data.list.map(item => {
                try  {
                    item.pointers = Base64.decode(item.pointers) || '[]'
                    item.pointerArray = JSON.parse(item.pointers)
                } catch (err) {
                    item.pointers = ''
                    item.pointerArray = []
                    console.log(err)
                }
                item.date_create = dateFormatter(new Date(item.date_create), 'yyyy/MM/dd hh:mm:ss')
                item.date_modify = dateFormatter(new Date(item.date_modify), 'yyyy/MM/dd hh:mm:ss')
                return item
            })
        })
        .catch(err => {
            isLoading.value = false
        })
}

// pagination
function pageChange() {
    getPointerList()
}


function goEdit(pointer: EntityPointer) {
    editingPointerId.value = pointer.uid
    Object.assign(formPointer.value, pointer)
    isShowDialogEdit.value = true
}
function goDelete(pointer: EntityPointer) {
    console.log(pointer)
    ElMessageBox.confirm(`删除点图 ${pointer.name} (${pointer.area})`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        let requestData = {
            id: pointer.id
        }
        pointerApi
            .delete(requestData)
            .then(res => {
                    getPointerList();
                    ElNotification({
                        title: res.message,
                        position: 'top-right',
                        type: 'success'
                    });
                }
            )
    })
}
</script>

<style lang="scss">
@import "../../scss/plugin";

.table-description{
    white-space: nowrap;
}


</style>
