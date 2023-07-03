<template>
    <div class="container">
        <el-row>
            <el-col :span="10" :offset="(24 - 10)/2">
                <div class="content"
                     :style="`min-height: ${windowInsets.height}px`"
                >
                    <div class="register-header">
                        <img src="../assets/logo.png" alt="LOGO">
                        <h2>注册</h2>
                    </div>
                    <el-form
                        label-position="top"
                        :model="formRegister"
                        :rules="userRules"
                        ref="register"
                        label-width="100px">
                        <el-form-item label="邀请码" prop="invitationCode">
                            <el-input autocomplete="off" v-model="formRegister.invitationCode"/>
                        </el-form-item>
                        <el-form-item label="邮箱" prop="email">
                            <el-input autocomplete="off" v-model="formRegister.email"/>
                        </el-form-item>
                        <el-form-item label="用户名" prop="username">
                            <el-input autocomplete="off" v-model="formRegister.username"/>
                        </el-form-item>
                        <el-form-item label="昵称" prop="nickname">
                            <el-input autocomplete="off" v-model="formRegister.nickname"/>
                        </el-form-item>
                        <el-form-item label="微信 (挪车使用)" prop="wx">
                            <el-input autocomplete="off" v-model="formRegister.wx"/>
                        </el-form-item>
                        <el-form-item label="手机 (挪车使用)" prop="phone">
                            <el-input autocomplete="off" v-model="formRegister.phone"/>
                        </el-form-item>
<!--                        <el-form-item label="高德组队码" prop="gaode">
                            <el-input autocomplete="off" v-model="formRegister.gaode"/>
                        </el-form-item>-->
                        <el-form-item label="主页" prop="homepage">
                            <el-input autocomplete="off" v-model="formRegister.homepage"/>
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input autocomplete="off" v-model="formRegister.password"/>
                        </el-form-item>
                        <el-form-item label="确认密码" prop="passwordrepeat">
                            <el-input autocomplete="off" v-model="formRegister.passwordrepeat"/>
                        </el-form-item>

                    </el-form>
                    <div class="submit">
                        <el-button style="width: 200px" type="primary" @click="submit">注册</el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import {mapState} from "vuex";
import userApi from "@/api/userApi";

export default {
    name: "Register",
    data() {
        const validatePassworDrepeat = (rule, value, callback) => {
            if (value !== this.formRegister.password) {
                callback(new Error("两次密码输入不一致"))
            } else {
                callback()
            }
        }
        return {
            isNewUser: false,
            formRegister: {
                username: '',
                nickname: '',
                wx: '',
                phone: '',
                homepage: '',
                // gaode: '',
                password: '',
                passwordrepeat: '',
                invitationCode: ''
            },
            userRules: {
                email: [
                    {required: true, message: '请填写邮箱', trigger: 'blur'},
                    {
                        validator: (rule, value, callback) => {
                            if (!/(\w|\d)+@(\w|\d)+\.\w+/i.test(value)){
                                callback(new Error("邮箱格式有误"))
                            } else {
                                callback()
                            }
                        }
                    }
                ],
                username: [
                    {required: true, message: '请填写用户名', trigger: 'blur'},
                    {
                        validator: (rule, value, callback) => {
                            if (!/^[a-z_]+$/.test(value)) {
                                callback(new Error("用户名只能是小写字母"))
                            } else {
                                callback()
                            }
                        }
                    }
                ],
                nickname: {required: true, message: '请填写昵称', trigger: 'blur'},
                wx: {required: true, message: '请填写微信', trigger: 'blur'},
                phone: {required: true, message: '请填写手机号', trigger: 'blur'},
                homepage: '',
                // gaode: '',
                password: {required: true, message: '请填写原密码', trigger: 'blur'},
                passwordrepeat: [
                    {required: true, message: '请再填写一次新密码', trigger: 'blur'},
                    {validator: validatePassworDrepeat, trigger: 'blur'}
                ],
                invitationCode: {required: true, message: '请输入邀请码', trigger: 'blur'},
            }
        }
    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        submit() {
            this.$refs['register'].validate((valid) => {
                if (valid) {
                    this.register();
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        register() {
            userApi
                .register(this.formRegister)
                .then(res => {
                    this.$notify({
                        title: res.message,
                        message: '请登录',
                        position: 'top-right',
                        type: 'success',
                        onClose() {
                        }
                    })
                    this.$router.push('/login')
                })
        },
    },
}
</script>

<style scoped lang="scss">
@import "../scss/plugin";
$height: 80px;

.container {
    background-color: $border-normal;
}

.content {
    padding: 100px 60px;
    background-color: white;
    @include box-shadow(1px 2px 5px rgba(0,0,0,0.1))
}

.register-header {
    margin-bottom: 30px;
    display: flex;
    justify-content: center;

    img {
        padding: 5px;
        margin-right: 20px;
        display: block;
        height: $height;
    }

    h2 {
        color: $text-main;
        line-height: $height;
    }
}

.submit {
    display: flex;
    justify-content: center;
}
</style>
