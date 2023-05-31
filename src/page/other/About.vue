<template>
    <div class="content">
        <div class="card">
            <div class="company">
                <div class="company-logo">
                    <img src="../../assets/logo.png" alt="logo"/>
                    <h2>{{ copName }}</h2>
                </div>
                <p class="mt-2">一个可以分享行车路线的网站。</p>
                <p class="mt-1">建议电脑端浏览该网站。</p>
                <p class="description">请将疑问和建议发送邮件至
                    <a :href="`mailto:${email}`">{{ email }}</a>
                </p>
                <p>我的主页： <a :href="homepage">{{ homepage }}</a></p>
            </div>
        </div>
    </div>
</template>
<script>
import packageInfo from "../../../package.json"
import {AnimateHeartCanvas} from "animate-heart-canvas";

export default {
    name: 'About',
    data() {
        return {
            copName: '路书',
            email: packageInfo.author.email,
            animatedBg: null,
            homepage: packageInfo.author.homepage
        }
    },
    mounted() {
        this.animatedBg = new AnimateHeartCanvas(0, 360, 250, 20, 50, '')
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
    width: 500px;
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
