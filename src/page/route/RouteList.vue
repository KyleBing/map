<template>
    <div class="user-list p-2">
        <div class="tool-bar mb-2">
            <el-button v-if="isAdmin" size="small" type="success" @click="addNewUser" icon="el-icon-plus">添加</el-button>
        </div>

        <el-row :gutter="10">
            <el-col :span="24">
                <el-table
                    class="table-narrow"
                    size="small"
                    :height="contentInsets.heightContent - 120"
                    :max-height="contentInsets.heightContent - 120"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <el-table-column width="60" prop="uid" label="UID"/>
                    <el-table-column width="250px" prop="email" label="Email"/>
                    <el-table-column width="150px" prop="nickname" label="昵称"/>
                    <el-table-column width="100" align="center" prop="username" label="用户名"/>
                    <el-table-column width="150" align="center" prop="phone" label="手机号"/>
                    <el-table-column align="center" prop="wx" label="微信"/>
                    <el-table-column align="center" width="200px" prop="homepage" label="主页"/>
                    <el-table-column align="right" prop="gaode" label="高德组队码"/>
                    <el-table-column sortable align="right" width="80px" prop="count_diary" label="日记"/>
                    <el-table-column sortable align="right" width="80px" prop="count_dict" label="码表"/>
                    <el-table-column sortable align="right" width="80px" prop="count_qr" label="二维码"/>
                    <el-table-column sortable align="right" width="80px" prop="count_words" label="词条"/>
                    <el-table-column sortable align="right" width="100px" prop="sync_count" label="同步次数"/>
                    <el-table-column sortable align="center" width="160px" prop="register_time" label="注册时间"/>
                    <el-table-column align="center" width="160px" prop="last_visit_time" label="最后访问时间"/>
                    <el-table-column align="right" width="60px" prop="group_id" label="组别">
                        <template slot-scope="scope">
                            {{ scope.row.group_id === 1 ? '管理员' : '普通' }}
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
                :rules="userRules"
                size="small"
                ref="formRoute" label-width="100px">
                <el-form-item label="邮箱" prop="email">
                    <el-input :disabled="!isAdmin" autocomplete="off" v-model="formRoute.email"/>
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                    <el-input :disabled="!isAdmin" autocomplete="off" v-model="formRoute.name"/>
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input autocomplete="off" v-model="formRoute.nickname"/>
                </el-form-item>
                <el-form-item label="微信" prop="wx">
                    <el-input autocomplete="off" v-model="formRoute.wx"/>
                </el-form-item>
                <el-form-item label="手机" prop="phone">
                    <el-input autocomplete="off" v-model="formRoute.phone"/>
                </el-form-item>
                <el-form-item label="高德组队码" prop="gaode">
                    <el-input autocomplete="off" v-model="formRoute.gaode"/>
                </el-form-item>
                <el-form-item label="组别" prop="group_id">
                    <el-select :disabled="!isAdmin" v-model="formRoute.group_id" placeholder="请选择">
                        <el-option
                            v-for="item in groupOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="主页" prop="homepage">
                    <el-input autocomplete="off" v-model="formRoute.homepage"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="clearForm" type="warning">清空</el-button>
                <el-button size="small" @click="closeModal">取 消</el-button>
                <el-button size="small" type="primary" @click="submit">{{ editingUid ? '修改' : '添加' }}</el-button>
            </div>
        </el-dialog>

    </div>

</template>

<script>

import userApi from "@/api/userApi";
import utility from "@/utility";
import {mapState} from "vuex";
import routeApi from "@/api/routeApi";

export default {
    name: "RouteList",
    data() {
        return {
            isLoading: false,

            editingUid: null,

            tableData: [],
            modalEdit: false, // modal show or not
            isAdmin: false, // is administrator
            groupOptions: [
                {id: 1, name: '管理员'},
                {id: 2, name: '普通用户'},
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
            userRules: {
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
        addNewUser() {
            this.modalEdit = true
            this.editingUid = null
        },
        clearForm(){
            this.formRoute = {
                name: '', // *路线名
                area: '', // *地域
                road_type: '', // *路面类型
                seasons: '', // *适用季节
                video_link: '', // 路径视频演示
                paths: [], // *路径点
                note: '', // 备注
                thumb_up: 0, // *点赞数
                is_public: 1, // *是否共享
            }
        },
        closeModal(done) {
            this.$confirm('确认关闭？')
                .then(_ => {
                    this.editingUid = null
                    this.modalEdit = false
                    done();
                })
                .catch(_ => {});
        },
        submit() {
            this.$refs['formRoute'].validate((valid) => {
                if (valid) {
                    if (this.editingUid) {
                        this.userModifySubmit()
                    } else {
                        this.userNewSubmit()
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            })
        },
        // 编辑
        userModifySubmit() {
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
                    this.editingUid = null
                    this.modalEdit = false
                    this.getRouteList()
                })
        },
        // 新增
        userNewSubmit() {
            userApi
                .add(this.formRoute)
                .then(res => {
                    this.$notify({
                        title: res.message,
                        position: 'top-right',
                        type: 'success',
                        onClose() {
                        }
                    })
                    this.editingUid = null
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

        // 获取用户列表
        getRouteList() {
            this.isLoading = true
            let params = {
                pageNo: this.pager.pageNo,
                pageSize: this.pager.pageSize
            }
            routeApi
                .list(params)
                .then(res => {
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
        goEdit(user) {
            this.editingUid = user.uid
            this.formRoute = user
            this.modalEdit = true
        },
        goDelete(user) {
            this.$confirm(`删除用户 ${user.nickname} (${user.username})`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let requestData = {
                    uid: user.uid
                }
                userApi.delete(requestData)
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
        ...mapState(['contentInsets']),
        modalTitle() {
            return this.editingUid ? '编辑用户' : '新增用户'
        }
    }
}
</script>

<style scoped lang="scss">
.tool-bar{}

</style>