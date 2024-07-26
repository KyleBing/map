const policyArray = [
    {label: '时间最少', key: 'LEAST_TIME', value: 0,},
    {label: '最少花费', key: 'LEAST_FEE', value: 1,},
    {label: '最短距离', key: 'LEAST_DISTANCE', value: 2,},
    {label: '考虑实时路况', key: 'REAL_TRAFFIC', value: 4,},
    {label: '综合考虑', key_service: 'MULTI_POLICIES', value: 5,},
    {label: '优先高速', key_service: 'HIGHWAY', value: 6,},
    {label: '经济且优先高速', key_service: 'FEE_HIGHWAY', value: 7,},
    {label: '经济并考虑交通情况', key_service: 'FEE_TRAFFIC', value: 8,},
    {label: '考虑交通并优先选择高速', key_service: 'TRAFFIC_HIGHWAY', value: 9,},
]

let policyMap = new Map()
policyArray.forEach(item => {
    policyMap.set(item.value, item.label)
})


export {
    policyArray, policyMap
}

// 更新于 2023-04-12
