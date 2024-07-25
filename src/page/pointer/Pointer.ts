interface EntityPointer {
    id?: number,                           // ID
    name: string,                          // *点图名
    note: string,                          // 简介
    uid?: number,                          // 创建人
    date_create?: string,                  // 创建时间
    date_modify?: string,                  // 编辑时间
    area: string,                          // *地域
    thumb_up: number,                      // *点赞数
    is_public: number,                     // *是否公开
    visit_count?: number,                  // 访问次数
    video_link: '',                        // 路径视频演示
    pointers: Array<EntityPointerPointer>, // *路径点

}

interface EntityPointerPointer{
    note: string,
    img: string,
    position: [number, number],
    type: string,
    name: string
}

export {
    type EntityPointer,
    type EntityPointerPointer
}
