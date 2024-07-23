interface EntityPointer {
    id: number, // 'ID
    name: string, // 标题
    po: number, // 地点信息数组数据
    note: string, // 简介
    uid: number, // 创建人
    date_create: string, // 创建时间
    date_modify: string, // 编辑时间
    area: string, // 地域
    thumb_up: number, // 点赞数量
    is_public: number, // COMMENT '公开与否
    visit_count: number, // 访问次数
}

export {
    type EntityPointer
}
