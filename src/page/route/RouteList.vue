<template>
    <div class="route-list p-2">
        <div class="tool-bar mb-2">
            <el-button v-if="isAdmin" size="small" type="success" @click="addNewRoute" icon="el-icon-plus">添加</el-button>
        </div>

        <el-row :gutter="10">
            <el-col :span="24">
                <el-table
                    class="table-narrow"
                    size="small"
                    :height="windowInsets.height - 150"
                    :max-height="windowInsets.height - 150"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <el-table-column width="60" prop="id" label="id"/>
                    <el-table-column width="100" prop="name" label="路线名"/>
                    <el-table-column width="100" align="center" prop="area" label="地域"/>
                    <el-table-column width="80" align="center" prop="road_type" label="路线类型"/>
                    <el-table-column align="center" prop="seasons" label="适用季节"/>
                    <el-table-column align="center" width="200px" prop="video_link" label="视频链接">
                        <template slot-scope="scope">
                            <a class="link" target="_blank" :href="scope.row.video_link">{{ scope.row.video_link }}</a>
                        </template>
                    </el-table-column>
                    <el-table-column align="right" prop="paths" label="路线">
                        <template slot-scope="scope">
                            <div v-if="scope.row.paths">{{ JSON.parse(scope.row.paths).length }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column sortable align="right" width="180px" prop="note" label="备注"/>
                    <el-table-column sortable align="right" width="80px" prop="thumb_up" label="点赞数"/>
                    <el-table-column sortable align="right" width="80px" prop="is_public" label="状态">
                        <template slot-scope="scope">
                            {{ scope.row.is_public === 1 ? '共享' : '私有' }}
                        </template>
                    </el-table-column>
                    <el-table-column sortable align="center" width="160px" prop="date_init" label="时间">
                        <template slot-scope="scope">
                            <div>{{ scope.row.date_init }}</div>
                            <div>{{ scope.row.date_modify }}</div>
                        </template>
                    </el-table-column>

                    <el-table-column align="center" width="200px" label="操作">
                        <template slot-scope="scope">
                            <el-button @click="goEdit(scope.row)" type="primary" plain size="mini">编辑</el-button>
                            <el-button @click="goDelete(scope.row)" type="danger" plain size="mini">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!--  PAGINATION  -->
                <el-pagination
                    align="right"
                    class="mt-2"
                    size="small"
                    @size-change="pagerSizeChange"
                    @current-change="currentPageChange"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pager.total"
                    :page-sizes="[30, 50, 100]"
                    :current-page="pager.pageNo"
                    :page-size="pager.pageSize"/>
            </el-col>
        </el-row>


        <!-- 编辑窗口-->
        <el-dialog
            :title="modalTitle"
            :visible.sync="modalEdit"
            width="30%"
            :before-close="closeModal">
            <el-form
                :model="formRoute"
                :rules="routeRules"
                size="small"
                ref="formRoute" label-width="100px">
                <el-form-item label="路线名" prop="name">
                    <el-input v-model="formRoute.name"/>
                </el-form-item>
                <el-form-item label="地域" prop="area">
                    <el-input v-model="formRoute.area"/>
                </el-form-item>
                <el-form-item label="路线类型" prop="road_type">
                    <el-input v-model="formRoute.road_type"/>
                </el-form-item>
                <el-form-item label="适用季节" prop="seasons">
                    <el-input v-model="formRoute.seasons"/>
                </el-form-item>
                <el-form-item label="视频链接" prop="video_link">
                    <el-input v-model="formRoute.video_link"/>
                </el-form-item>
                <el-form-item label="路线" prop="paths">
                    <el-input type="textarea" v-model="formRoute.paths"/>
                </el-form-item>
                <el-form-item label="备注" prop="note">
                    <el-input type="textarea" v-model="formRoute.note"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="clearForm" type="warning">清空</el-button>
                <el-button size="small" @click="closeModal">取 消</el-button>
                <el-button size="small" type="primary" @click="submit">{{ editingRouteId ? '修改' : '添加' }}</el-button>
            </div>
        </el-dialog>

    </div>

</template>

<script>

import utility from "@/utility";
import {mapState} from "vuex";
import routeApi from "@/api/routeApi";

export default {
    name: "RouteList",
    data() {
        return {
            isLoading: false,

            editingRouteId: null,

            tableData: [],
            modalEdit: false, // modal show or not
            isAdmin: false, // is administrator
            groupOptions: [
                {id: 1, name: '管理员'},
                {id: 2, name: '普通路线'},
            ],
            formRoute: {
                name: '', // *路线名
                area: '', // *地域
                road_type: '', // *路面类型
                seasons: '', // *适用季节
                video_link: '', // 路径视频演示
                paths: [], // *路径点
                note: '', // 备注
                thumb_up: 0, // *点赞数
                is_public: 1, // *是否共享
            },
            routeRules: {
                name: [{required: true, message: '请填写路线钱', trigger: 'blur'},],
                area: [{required: true, message: '请填写地域', trigger: 'blur'},],
                road_type: [{required: true, message: '请填写路面类型', trigger: 'blur'},],
                seasons: [{required: true, message: '请填写季节', trigger: 'blur'},],
            },
            // pager
            pager: {
                pageSize: 30,
                pageNo: 1,
                total: 0
            },
        }
    },
    mounted() {
        this.getRouteList()
        this.isAdmin = this.$utility.getAuthorization().email === 'kylebing@163.com'
    },
    methods: {
        addNewRoute() {
            this.modalEdit = true
            this.editingRouteId = null
            this.clearForm()
        },
        clearForm() {
            this.formRoute = {
                name: '', // *路线名
                area: '', // *地域
                road_type: '', // *路面类型
                seasons: '', // *适用季节
                video_link: '', // 路径视频演示
                paths: '', // *路径点
                note: '', // 备注
                thumb_up: 0, // *点赞数
                is_public: 1, // *是否共享
            }
        },
        closeModal(done) {
            this.$confirm('确认关闭？')
                .then(_ => {
                    this.editingRouteId = null
                    this.modalEdit = false
                    done();
                })
                .catch(_ => {
                });
        },
        submit() {
            this.$refs['formRoute'].validate((valid) => {
                if (valid) {
                    if (this.editingRouteId) {
                        this.routeModifySubmit()
                    } else {
                        this.routeNewSubmit()
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            })
        },
        // 编辑
        routeModifySubmit() {
            routeApi
                .modify(this.formRoute)
                .then(res => {
                    this.$notify({
                        title: res.message,
                        position: 'top-right',
                        type: 'success',
                        onClose() {
                        }
                    })
                    this.editingRouteId = null
                    this.modalEdit = false
                    this.getRouteList()
                })
        },
        // 新增
        routeNewSubmit() {
            routeApi
                .add(this.formRoute)
                .then(res => {
                    this.$notify({
                        title: res.message,
                        position: 'top-right',
                        type: 'success',
                        onClose() {
                        }
                    })
                    this.editingRouteId = null
                    this.modalEdit = false
                    this.getRouteList()
                })
        },


        // pagination
        pagerSizeChange(newPageSize) {
            this.pager.pageNo = 1
            this.pager.pageSize = newPageSize
            this.getRouteList()
        },
        currentPageChange(newCurrentPage) {
            this.pager.pageNo = 1
            this.pager.pageNo = newCurrentPage
            this.getRouteList()
        },

        // 获取路线列表
        getRouteList() {
            this.isLoading = true
            let requestData = {
                pageNo: this.pager.pageNo,
                pageSize: this.pager.pageSize
            }
            routeApi
                .list(requestData)
                .then(res => {
                    console.log(res)
                    this.isLoading = false
                    this.pager = res.data.pager
                    this.tableData = res.data.list.map(item => {
                        item.date_init = utility.dateFormatter(new Date(item.date_init))
                        item.date_modify = utility.dateFormatter(new Date(item.date_modify))
                        return item
                    })
                })
                .catch(err => {
                    this.isLoading = false
                })
        },
        goEdit(route) {
            this.editingRouteId = route.uid
            this.formRoute = route
            this.modalEdit = true
        },
        goDelete(route) {
            console.log(route)
            this.$confirm(`删除路线 ${route.name} (${route.area})`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let requestData = {
                    id: route.id
                }
                routeApi.delete(requestData)
                    .then(res => {
                            this.getRouteList();
                            this.$notify({
                                title: res.message,
                                position: 'top-right',
                                type: 'success'
                            });
                        }
                    )
            })
        }
    },
    computed: {
        ...mapState(['windowInsets']),
        modalTitle() {
            return this.editingRouteId ? '编辑路线' : '新增路线'
        }
    }
}
</script>

<style scoped lang="scss">
.tool-bar {
}

</style>
