import {request} from "./request";

function getUploadToken(params) {return request('get', params, null,false, '/image-qiniu/')}
export {
    getUploadToken
}
