import request from "./request";

export default {
    getUploadToken(params) {return request('get', params, null,false, null,  '/image-qiniu/')},
}
