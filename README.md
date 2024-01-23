# 路书
骑行路线规划应用

一个基于 [高德地图API](https://lbs.amap.com/api/javascript-api-v2/documentation) 制作的地图 web 应用，可以分享路线、查看 gpx 路径、地图信息点分享、各市区县布局等。

路线分享  
<img width="2032" alt="Screenshot 2024-01-23 at 17 45 28" src="https://github.com/KyleBing/map/assets/12215982/19597ade-9f78-4fdc-a0db-b0fd78fca6b4">

gpx 展示  
<img width="2032" alt="Screenshot 2024-01-23 at 17 39 20" src="https://github.com/KyleBing/map/assets/12215982/a209cac9-4384-4983-b65c-3239c8f2ff2b">

数据点展示  
<img width="2032" alt="Screenshot 2024-01-23 at 17 39 57" src="https://github.com/KyleBing/map/assets/12215982/9ef18183-a004-4e51-a547-49bcb9fdfbd9">

范围标记  
<img width="2032" alt="Screenshot 2024-01-23 at 17 40 29" src="https://github.com/KyleBing/map/assets/12215982/6deab80c-ebcd-49db-a3d9-c4d178869682">

市内区县展示  
<img width="2032" alt="Screenshot 2024-01-23 at 17 40 42" src="https://github.com/KyleBing/map/assets/12215982/5a1603cb-1ecf-4782-a22d-5e684cfc3653">


## 一、使用

修改 `/src/mapConfig.js` 中的高德地图开发 key，获取地址： [https://console.amap.com/dev/key/app](https://console.amap.com/dev/key/app)

```js
export default {
    key_web_js: '', // web js key
    key_service: '',  // web服务 key
}
```

## 二、后台

后台：[https://github.com/KyleBing/portal](https://github.com/KyleBing/portal)


## 三、用到的技术
- vue2
- vue router
- vuex
- 高德 API 2.0
