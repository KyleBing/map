<template>
    <div class="route-list p-2">
        <div class="tool-bar mb-2" v-if="!store.isInPortraitMode">
            <ElForm size="small" inline>
                <ElFormItem>
                    <ElButton type="success" @click="addNewRoute" icon="Plus">新增路线</ElButton>
                    <ElButton type="primary" @click="addNewRouteWidthMap" icon="Promotion">从地图中规划路线</ElButton>
                </ElFormItem>
                <ElFormItem label="关键字" class="ml-4">
                    <ElInput clearable placeholder="检索词条、编码、注释" v-model="formSearch.keyword"></ElInput>
                </ElFormItem>
                <ElFormItem label="添加时间区间">
                    <ElDatePicker type="datetimerange" v-model="formSearch.dateRange"></ElDatePicker>
                </ElFormItem>
                <ElFormItem>
                    <ElButton type="primary" @click="search" icon="Search">查询</ElButton>
                </ElFormItem>
            </ElForm>
        </div>

        <ElRow :gutter="10">
            <ElCol :span="24">
                <ElTable
                    class="table-narrow"
                    size="small"
                    :height="store.windowInsets.height - 170"
                    :max-height="store.windowInsets.height - 170"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <ElTableColumn width="50" prop="id" label="#"/>
                    <ElTableColumn width="150" prop="name" label="路线名"/>
                    <ElTableColumn align="center" width="50" prop="is_public" label="状态">
                        <template #default="scope">
                            {{ scope.row.is_public === 1 ? '公开' : '私有' }}
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="150" align="center" prop="area" label="地域"/>
                    <ElTableColumn width="70" align="center" prop="policy" label="规划策略">
                        <template #default="scope">
                            {{policyMap.get(scope.row.policy)}}
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="100" align="center" prop="nickname" label="用户"/>

                    <ElTableColumn align="center" width="450px" label="操作">
                        <template #default="scope">
                            <ElButton class="btn-narrow" type="success"
                                       @click="showRoute(scope.row)" size="small" plain icon="View">地图中查看</ElButton>
                            <ElButton class="btn-narrow" type="success"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="editRouteLine(scope.row)" plain size="small" icon="Position">地图中编辑</ElButton>
                            <ElButton class="btn-narrow" type="primary"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="goEdit(scope.row)" plain size="small" icon="Edit">编辑</ElButton>
                            <ElButton class="btn-narrow" type="danger"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="goDelete(scope.row)" plain size="small" icon="Delete">删除</ElButton>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="130" align="left" prop="seasons" label="适用季节"/>
                    <ElTableColumn width="200" align="left" prop="road_type" label="路线类型">
                        <template #default="scope">
                            <ElTag class="mr-1" size="small"
                                    v-for="item in scope.row.road_type.split('，')" :key="item">{{ item }}
                            </ElTag>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="center" width="50" prop="video_link" label="视频">
                        <template #default="scope">
                            <a class="link" v-if="scope.row.video_link" target="_blank" :href="scope.row.video_link"><i class="el-icon-video-camera"></i></a>
                            <span v-else>-</span>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="center" prop="paths" label="路线节点">
                        <template #default="scope">
                            <div v-if="scope.row.paths">{{ scope.row.pathArray.length }}</div>
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
                                <span class="table-description" slot="reference" >
                                    <i class="el-icon-tickets"></i> {{scope.row.note}}
                                </span>
                            </ElPopover>
                        </template>
                    </ElTableColumn>

<!--                    <ElTableColumn sortable align="center" width="60px" prop="thumb_up" label="赞"/>-->
                    <ElTableColumn sortable align="center" width="160px" prop="date_init" label="时间">
                        <template #default="scope">
                            <div>{{ scope.row.date_init }}</div>
<!--                            <div>{{ scope.row.date_modify }}</div>-->
                        </template>
                    </ElTableColumn>


                </ElTable>

                <!--  PAGINATION  -->
                <ElPagination
                    align="right"
                    class="mt-2"
                    size="small"
                    @size-change="pagerSizeChange"
                    @current-change="currentPageChange"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pager.total"
                    :page-sizes="[10, 15, 20, 25, 30, 40, 100]"
                    :current-page="pager.pageNo"
                    :page-size="pager.pageSize"/>
            </ElCol>
        </ElRow>

        <!-- 编辑窗口-->
        <ElDialog
            :title="modalTitle"
            :visible.sync="modalEdit"
            width="40%"
            :before-close="closeModal">
            <ElForm
                :model="formRoute"
                :rules="routeRules"
                size="small"
                ref="refForm" label-width="100px">
                <ElFormItem label="路线名" prop="name">
                    <ElInput v-model="formRoute.name"/>
                </ElFormItem>
                <ElFormItem label="地域" prop="area">
                    <ElInput v-model="formRoute.area"/>
                </ElFormItem>
                <ElFormItem label="路线类型" prop="road_type">
                    <ElInput v-model="formRoute.road_type"/>
                </ElFormItem>
                <ElFormItem label="规划策略" prop="policy">
                    <ElSelect v-model="formRoute.policy" placeholder="请选择">
                        <ElOption
                            v-for="item in policyArray"
                            :key="item.label"
                            :label="item.label"
                            :value="item.value">
                        </ElOption>
                    </ElSelect>
                </ElFormItem>
                <ElFormItem label="是否公开" prop="is_public">
                    <ElRadio :label="1" v-model="formRoute.is_public">公开</ElRadio>
                    <ElRadio :label="0" v-model="formRoute.is_public">私有</ElRadio>
                </ElFormItem>
                <ElFormItem label="适用季节" prop="seasons">
                    <ElCheckboxGroup v-model="formRoute.seasonsArray">
                        <ElCheckboxButton label="春"></ElCheckboxButton>
                        <ElCheckboxButton label="夏"></ElCheckboxButton>
                        <ElCheckboxButton label="秋"></ElCheckboxButton>
                        <ElCheckboxButton label="冬"></ElCheckboxButton>
                    </ElCheckboxGroup>
                </ElFormItem>
                <ElFormItem label="视频链接" prop="video_link">
                    <ElInput v-model="formRoute.video_link"/>
                </ElFormItem>
                <ElFormItem label="路线节点" prop="paths">
                    <ElInput type="textarea" :rows="6" v-model="formRoute.paths"/>
                </ElFormItem>
                <ElFormItem label="备注" prop="note">
                    <ElInput type="textarea" placeholder="支持 Markdown" :rows="5" v-model="formRoute.note"/>
                </ElFormItem>
            </ElForm>
            <div slot="footer" class="dialog-footer">
                <ElButton size="small" @click="clearForm" type="warning">清空</ElButton>
                <ElButton size="small" @click="closeModal">取 消</ElButton>
                <ElButton size="small" type="primary" @click="submit">{{ editingRouteId ? '修改' : '添加' }}</ElButton>
            </div>
        </ElDialog>
    </div>
</template>
<script lang="ts" setup>
import {Base64} from "js-base64"
import { policyArray, policyMap } from './DrivingPolicy'
import {useProjectStore} from "@/pinia";
import {dateFormatter} from "@/utility";
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessage, ElNotification, FormRules} from "element-plus";
import {EntityRoute} from "@/page/route/Route.ts";
import routeApi from "@/api/routeApi.ts";

const store = useProjectStore()
const route = useRoute()
const router = useRouter()

const refForm = ref()


const isLoading = ref(false)
const editingRouteId = ref(null)
const tableData = ref([])
const modalEdit = ref(false) // modal show or not

const formRoute = ref<EntityRoute>({
    name: '', // *路线名
    area: '', // *地域
    road_type: '', // *路面类型
    policy: 2, // 路线规划策略 默认为最短距离
    seasonsArray: [], // *[适用季节]
    video_link: '', // 路径视频演示
    paths: '', // *路径点
    note: '', // 备注
    thumb_up: 0, // *点赞数
    is_public: 1, // *是否公开
})

const routeRules = reactive<FormRules<EntityRoute>>({
    name: [{required: true, message: '请填写路线钱', trigger: 'blur'},],
    area: [{required: true, message: '请填写地域', trigger: 'blur'},],
    policy: [{required: true, message: '请选择路线规划策略', trigger: 'blur'},],
    road_type: [{required: true, message: '请填写路面类型', trigger: 'blur'},],
    seasonsArray: [{required: true, message: '请选择季节', trigger: 'blur'},],
})
// pager
const pager = ref({
    pageSize: 15,
    pageNo: 1,
    total: 0
})
const formSearch = ref({
    keyword: '',
    dateRange: []
})

onMounted(()=>{
    getRouteList()
})

const modalTitle = computed(()=>{
    return editingRouteId.value ? '编辑路线' : '新增路线'
})

function search(){
    getRouteList()
}
function editRouteLine(routeInfo: EntityRoute){
    router.push({
        name: "RouteEditor",
        query: {
            lineId: routeInfo.id
        }
    })
}
// 跳转到路经展示页面
function showRoute(routeInfo: EntityRoute){
    router.push({
        name: "RouteLine",
        query: {
            lineId: routeInfo.id
        }
    })
}
// route to line editor
function addNewRouteWidthMap(){
    router.push({
        name: 'RouteEditor'
    })
}
function addNewRoute() {
    modalEdit.value = true
    editingRouteId.value = null
    clearForm()
}
function clearForm() {
    formRoute.value = {
        name: '', // *路线名
        area: '', // *地域
        road_type: '', // *路面类型
        policy: 0, // 路线规划策略
        seasonsArray: [], // *[适用季节]
        video_link: '', // 路径视频演示
        paths: '', // *路径点
        note: '', // 备注
        thumb_up: 0, // *点赞数
        is_public: 1, // *是否公开
    }
}
function closeModal(done) {
    $confirm('确认关闭？')
        .then(() => {
            editingRouteId.value = null
            modalEdit.value = false
            done();
        })
        .catch(() => {
        })
}
function submit() {
    refForm.value.validate(valid => {
        if (valid) {
            if (formRoute.value.paths){
                try {
                    let convertObject = JSON.parse(formRoute.value.paths)
                } catch (err){
                    ElMessage.error('节点数据格式错误，请检查')
                    return false
                }
            }

            if (editingRouteId.value) {
                routeModifySubmit()
            } else {
                routeNewSubmit()
            }
        } else {
            console.log('error submit!!');
            return false;
        }
    })
}
// 编辑
function routeModifySubmit() {
    // 为了断开最终数据与 formPointer 的关联
    let requestData = {}
    Object.assign(requestData, formRoute.value)
    requestData.paths = Base64.encode(formRoute.value.paths)
    routeApi
        .modify(requestData)
        .then(res => {
            ElNotification({
                title: res.message,
                position: 'top-right',
                type: 'success',
                onClose() {
                }
            })
            editingRouteId.value = null
            modalEdit.value = false
            getRouteList()
        })
        .catch(err => {
        })
}
// 新增
function routeNewSubmit() {
    // 为了断开最终数据与 formPointer 的关联
    let requestData = {}
    Object.assign(requestData, formRoute.value)
    requestData.paths = Base64.encode(formRoute.value.paths)
    routeApi
        .add(requestData)
        .then(res => {
            ElNotification({
                title: res.message,
                position: 'top-right',
                type: 'success',
                onClose() {
                }
            })
            editingRouteId.value = null
            modalEdit.value = false
            getRouteList()
        })
}


// pagination
function pagerSizeChange(newPageSize: number) {
    pager.value.pageNo = 1
    pager.value.pageSize = newPageSize
    getRouteList()
}
function currentPageChange(newCurrentPage: number) {
    pager.value.pageNo = 1
    pager.value.pageNo = newCurrentPage
    getRouteList()
}

// 获取路线列表
function getRouteList() {
    isLoading.value = true
    let requestData = {
        isMine: "1", // 是否过滤自己的路线
        pageNo: pager.value.pageNo,
        pageSize: pager.value.pageSize,
        keyword: formSearch.value.keyword,
        dateRange: formSearch.value.dateRange
    }
    routeApi
        .list(requestData)
        .then(res => {
            isLoading.value = false
            pager.value = res.data.pager
            tableData.value = res.data.list.map(item => {
                item.paths = Base64.decode(item.paths) || ''

                item.pathArray = item.paths && JSON.parse(item.paths)
                item.seasonsArray = item.seasons.split('、').filter(item => item !== '')
                item.date_init = dateFormatter(new Date(item.date_init))
                item.date_modify = dateFormatter(new Date(item.date_modify))
                return item
            })
        })
        .catch(err => {
            isLoading.value = false
        })
}
function goEdit(routeLine: EntityRoute) {
    editingRouteId.value = routeLine.uid
    Object.assign(formRoute.value, routeLine)
    modalEdit.value = true
}
function goDelete(route: EntityRoute) {
    console.log(route)
    $confirm(`删除路线 ${route.name} (${route.area})`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        let requestData = {
            id: route.id
        }
        routeApi
            .delete(requestData)
            .then(res => {
                    getRouteList();
                    ElNotification({
                        title: res.message,
                        position: 'top-right',
                        type: 'success'
                    });
                }
            )
    })
}

watch (() => formRoute.value.seasonsArray, newValue => {
    formRoute.value.seasons = newValue.join('、')
})
</script>

<style lang="scss">
.table-description{
    white-space: nowrap;
}

</style>
