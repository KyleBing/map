const key_web_js = '581591b581149549d9035d039e83e368' // web js key
const key_service = '401d946dc1152f0e1f110928ecc07a13'  // web服务 key
// 管理地址在：https://console.amap.com/dev/key/app

// 七牛云 与 《标题日记》共用一个 仓库
// 地址： https://portal.qiniu.com/kodo/overview
const qiniu_img_base_url = 'http://apple-image.kylebing.cn/' // 空间域名，最后面带 `/`
const qiniu_bucket_name = 'apple-image' // 七牛云对象存储空间的名称
const thumbnail200_suffix = 'thumbnail_200px' // 七牛云缩略图样式名  200x200px 质量75
const thumbnail600_suffix = 'thumbnail_600px' // 七牛云缩略图样式名  600x600px 质量75
const thumbnail1000_suffix = 'thumbnail_1000px' // 七牛云缩略图样式名  1000x1000px 质量75
const thumbnail1500_suffix = 'thumbnail_1500px' // 七牛云缩略图样式名  1500x1500px 质量75

export {
    key_web_js,
    key_service,
    qiniu_img_base_url,
    qiniu_bucket_name,
    thumbnail200_suffix,
    thumbnail600_suffix,
    thumbnail1000_suffix,
    thumbnail1500_suffix,
}
