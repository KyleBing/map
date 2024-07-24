import {request} from './request'

function routeAdd( requestData){return request('post', null, requestData, false, 'map-route/add')}
function routeList(requestData){return request('post', null, requestData, false, 'map-route/list')}
function routeModify(requestData){return request('put', null, requestData, false,  'map-route/modify')}
function routeDelete(requestData){return request('delete', null, requestData, false, 'map-route/delete')}
function routeDetail(params){return request('get', params, null, false, 'map-route/detail')}

export {
    routeAdd,
    routeList,
    routeModify,
    routeDelete,
    routeDetail,
}
