<template>
    <div class="content">
        <div class="card">
            <div class="company">
                <div class="company-logo">
                    <img src="../../assets/logo.png" alt="logo"/>
                    <h2>{{ projectName }}</h2>
                </div>
                <div class="about-content markdown" v-html="aboutHtmlContent"></div>

                <p class="description">请将疑问和建议发送邮件至： <i class="el-icon-message"></i>  <a :href="`mailto:${email}`">{{ email }}</a>
                </p>
                <p>我的主页： <i class="el-icon-house"></i> <a :href="homepage">{{ homepage }}</a></p>
            </div>
        </div>
    </div>
</template>
<script>
import packageInfo from "../../../package.json"
import {AnimateHeartCanvas} from "animate-heart-canvas";
import {marked} from "marked";

export default {
    name: 'About',
    data() {
        return {
            projectName: '路书',
            email: packageInfo.author.email,
            animatedBg: null,
            homepage: packageInfo.author.homepage,
            aboutMarkdownContent: `
#####  一个可以分享行车路线、地域信息的网站
建议电脑端浏览该网站

---

网站主要使用高德 API 实现
##### 开发中遇到的一些问题和经验分享
- [高德 web api 通过 adcode 获取地区实时天气信息，每天有30万次查询的免费额度](https://blog.csdn.net/KimBing/article/details/131437023)
- [高德API JS 高德地图获取多个坐标点的中心点](https://kylebing.blog.csdn.net/article/details/130991747)
- [如何使用高德地图 API 做一个路线规划应用，展示自定义路线](https://blog.csdn.net/KimBing/article/details/119915390)
- [高德地图 JS Web 添加自定义图标，自定义窗口标记](https://blog.csdn.net/KimBing/article/details/107761144)
- [高德地图 Vue 中 加载 数据可视化 Loca 的方式](https://blog.csdn.net/KimBing/article/details/118615489)
- [高德地图 绘制 gpx 地图路径 AMap.polyLine](https://blog.csdn.net/KimBing/article/details/135698526)
- [如何使用高德地图的 Loca 展示 gpx 文件的 3D 路径，Loca.LineLayer](https://blog.csdn.net/KimBing/article/details/138492842)

##### Github
- [高德地图 Loca 和 路线规划 vue 演示项目](https://github.com/KyleBing/map)

#####  高德官方开发文档

- [高德地图 WEB JSAPI 2.0 文档](https://lbs.amap.com/api/javascript-api-v2/documentation)
- [高德地图 WEB JSAPI 2.0 概述](https://lbs.amap.com/api/jsapi-v2/summary/)


---

            `,
            aboutHtmlContent: ''
        }
    },
    mounted() {
        this.animatedBg =
            new AnimateHeartCanvas(
                0,
                360,
                30,
                30,
                800,
                ''
            )
        this.aboutHtmlContent = marked.parse(this.aboutMarkdownContent)
    },
    beforeDestroy() {
        this.animatedBg.destroy()
    }
}
</script>

<style scoped lang="scss">
@import "../../scss/plugin";

$text-about: #666;
.bg {
    background-color: $border-normal;
}

.product-logo {
    font-weight: bold;
    display: flex;
    justify-content: center;
    font-size: 2rem;
    align-items: center;

    img {
        display: block;
        height: 50px;
        margin-right: 20px;
    }
}

.about-title {
    color: $text-about;
    padding-left: 15px;
    font-weight: bold;
    border-left: 3px solid $color-main;
    font-size: 1rem;
    line-height: 2;
}

.content {
    width: 600px;
    padding: 20px;
}

.card {
    color: $text-about;
    background-color: transparentize(white, 0.2);
    backdrop-filter: blur(5px) saturate(180%);
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.18);
    padding: 20px;
    -webkit-border-radius: 6px;
    -moz-border-radius: 6px;
    border-radius: 6px;
}

.company {
    font-size: 0.8rem;
    padding: 0 10px;
}

.company-logo {
    padding: 30px 0;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
        display: block;
        height: 50px;
    }

    h2 {
        margin-left: 20px;
        font-size: 1.5rem;
        letter-spacing: 1px;
    }
}

.info {
    margin-top: 20px;

    &-item {
        padding: 3px 0;
        display: flex;
        justify-content: flex-start;
    }
}

.description {
    margin-top: 20px;
}

a {
    color: $color-main;

    &:hover {
        text-decoration: underline
    }
}
</style>
