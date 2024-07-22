import request from './request'
export default {
    add( requestData){return request('post', null, requestData, false, null, 'map-pointer/add')},
    list(requestData){return request('post', null, requestData, false,null,'map-pointer/list')},
    modify(requestData){return request('put', null, requestData, false, null,'map-pointer/modify')},
    delete(requestData){return request('delete', null, requestData, false, null, 'map-pointer/delete')},
    detail(params){return request('get', params, null, false, null, 'map-pointer/detail')},
}
