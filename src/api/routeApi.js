import request from './request'
export default {
    add( requestData){return request('post', null, requestData, false, null, 'map-route/add')},
    list(requestData){return request('post', null, requestData, false,null,'map-route/list')},
    modify(requestData){return request('put', null, requestData, false, null,'map-route/modify')},
    delete(requestData){return request('delete', null, requestData, false, null, 'map-route/delete')},
    detail(params){return request('get', params, null, false, null, 'map-route/detail')},
}
