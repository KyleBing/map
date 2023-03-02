import request from './request'
export default {
    add(params, requestData){return request('post', params, requestData, false, null, './map-route/add')},
    list(params){return request('get', params, null, false,null,'./map-route/list')},
    modify(params, requestData){return request('put', params, requestData, false, null,'./map-route/modify')},
    delete(params){return request('delete', params, null, false, null, './map-route/delete')},
    detail(params){return request('get', params, null, false, null, './map-route/detail')},
}
