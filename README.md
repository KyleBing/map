# 路书
骑行路线规划应用

一个基于 高德地图 API 的 web 应用，可以查看骑行的路线规划。

![image](https://github.com/KyleBing/map/assets/12215982/0af7366c-eb08-43c3-a3c6-a98082270c73)

## 一、使用

修改 `/src/mapConfig.js` 中的高德地图开发 key，获取地址： [https://console.amap.com/dev/key/app](https://console.amap.com/dev/key/app)

```js
export default {
    key_web_js: '', // web js key
    key_service: '',  // web服务 key
}
```

## 二、后台

目前直接跑是跑不起来的
后台：[https://github.com/KyleBing/diary-portal](https://github.com/KyleBing/diary-portal)


## 三、用到的技术
- vue2
- vue router
- vuex
- 高德 API 2.0
