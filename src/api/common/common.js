import request from '@/utils/request'

// 上传图片
export function upLoadImg(query) {
    return request({
        headers: {
            "Content-type": "multipart/form-data"
        },
        url: '/common/uploadImg',
        method: 'POST',
        data: query

    })
}
// 首页
export function indexAccount() {
    return request({
        url: '/statement/overview',
        method: 'GET',
    })
}
// /statement/filter
export function indexAccountByDate(query) {
    return request({
        url: '/statement/filter',
        method: 'GET',
        params: query
    })
}
