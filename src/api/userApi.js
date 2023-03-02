import request from "./request";

export default {
    login(requestData) {return request('post', null, requestData, false, null, '/user/login')},
    register(requestData) {return request('post', {}, requestData, false, null, '/user/register')},


    add(requestData) {return request('post', {}, requestData, false, null, '/user/add')},
    delete(requestData) {return request('delete', {}, requestData, false, null, '/user/delete')},
    modify(requestData) {return request('put', {}, requestData, false, null, '/user/modify')},
    detail(params) {return request('get', params, null, false, null, '/user/detail')},
    list(requestData) {return request('post', null, requestData, false, null, '/user/list')},
    changePassword(requestData) {return request('put', null, requestData, false, null, '/user/change-password')},
}
