<template>
    <div class="login-bg" :style="`height:${height}px`">
        <div class="logo">
            <img src="../assets/logo.png" alt="LOGO">
        </div>
        <div class="login-panel">
            <div class="login-title">
                <h2>路书</h2>
            </div>
            <el-form
                :model="formLogin"
                :rules="loginRules"
                ref="login" label-width="0">
                <el-form-item label="" class="mb-3" prop="email">
                    <el-input autocomplete="off" placeholder="邮箱" v-model="formLogin.email"/>
                </el-form-item>
                <el-form-item label="" class="mb-5" prop="password">
                    <el-input type="password" autocomplete="off" @keydown.enter.native="submit" placeholder="密码" v-model="formLogin.password"/>
                </el-form-item>
                <el-form-item align="center">
                    <el-button :loading="isInLoginProcess" class="login-btn" type="primary" @click="submit">登录</el-button>
                </el-form-item>
            </el-form>
            <div class="register-link">
                <a target="_blank" href="https://kylebing.cn/diary/#/register">注册</a>
            </div>
        </div>
    </div>
</template>

<script>
import {mapMutations, mapState} from "vuex"
import userApi from "@/api/userApi";
import {AnimatedCanvasBG} from "animate-bg-canvas"

export default {
    name: "Login",
    data() {
        return {
            height: 600,
            formLogin: {
                email: '',
                password: ''
            },
            loginRules: {
                email: {required: true, message: '请填写用户名', trigger: 'blur'},
                password: {required: true, message: '请填写密码', trigger: 'blur'},
            },
            isInLoginProcess: false, // 登录中状态展示
            animatedBg: null,

        }
    },
    mounted() {
        this.height = innerHeight
        this.animatedBg = new AnimateHeartCanvas(0, 360, 150, 10, 50, '#3d3d3d')
    },
    beforeDestroy() {
        this.animatedBg.destroy()
    },
    methods: {
        submit() {
            this.$refs['login'].validate((valid) => {
                if (valid) {
                    this.login();
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        login() {
            this.isInLoginProcess = true
            userApi
                .login(this.formLogin)
                .then(res => {
                    console.log(res)
                    console.log('Login success')
                    this.isInLoginProcess = false
                    this.$utility.setAuthorization(
                        res.data.nickname,
                        res.data.uid,
                        res.data.email,
                        res.data.phone,
                        res.data.avatar,
                        res.data.password,
                        res.data.group_id,
                        res.data.city,
                        res.data.geolocation,
                    )
                    this.$message.success( '欢迎用户 ' + res.data.username)
                    this.$router.push({name: 'Index'})
                })
                .catch(err => {
                    this.isInLoginProcess = false
                })
        },
    },
}
</script>

<style scoped lang="scss">
@import "../scss/plugin";
.login-bg {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column nowrap;
    background-size: cover;
    //background: url('../assets/bg.jpg') no-repeat;
}

.logo{
    z-index: 10;
    display: flex;
    justify-content: center;
    flex-flow: row nowrap;
    img{
        display: block;
        height: 100px;
    }
    transform: translateY(-50px);
}

.login-title{
    text-align: center;
    font-size: 1.2rem;
    margin-bottom: 40px;
    color: white;
}

.login-panel{
    z-index: 10;
    background-color: transparentize(white, 0.8);
    @include backdrop-filter(saturate(110%) blur(5px));
    padding: 30px 50px;
    @include border-radius(15px);
    width: 450px;
}

.login-btn{
    display: block;
    width: 100%;
}

.register-link{
    font-size: 13px;
    text-align: center;
}
</style>
