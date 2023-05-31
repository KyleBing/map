const policyArray = [
    {label: '时间最少', key: 'LEAST_TIME', value: 0,},
    {label: '最少花费', key: 'LEAST_FEE', value: 1,},
    {label: '最短距离', key: 'LEAST_DISTANCE', value: 2,},
    {label: '考虑实际路况', key: 'REAL_TRAFFIC', value: 4,},
    // {label: '', key: 'MULTI_POLICIES', value: 5,},
    // {label: '', key: 'HIGHWAY', value: 6,},
    // {label: '', key: 'FEE_HIGHWAY', value: 7,},
    // {label: '', key: 'FEE_TRAFFIC', value: 8,},
    // {label: '', key: 'TRAFFIC_HIGHWAY', value: 9,},
]

let policyMap = new Map()
policyArray.forEach(item => {
    policyMap.set(item.value, item.label)
})


export {
    policyArray, policyMap
}

// 更新于 2023-04-12
