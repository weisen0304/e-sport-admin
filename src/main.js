import Vue from 'vue'

import Cookies from 'js-cookie'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css
import App from './App'
import store from './store'
import router from './router'
import permission from './directive/permission'

import './assets/icons' // icon
import './permission' // permission control
import { getDicts } from "@/api/system/dict/data";
import { getConfigKey } from "@/api/system/config";
import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, download, handleTree } from "@/utils/ruoyi";
import Pagination from "@/components/Pagination";
// 自定义表格工具扩展
import RightToolbar from "@/components/RightToolbar"
/**阿里云oss工具 */


// 图片预览插件
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
Vue.use(Viewer, {
    defaultOptions: {
        zIndex: 9999,
        inline: false,
        button: true,
        navbar: false,
        title: false,
        toolbar: true,
        tooltip: false,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: false,
        transition: false,
        fullscreen: false,
        keyboard: false
    }
})

import OSS from "ali-oss";
// 初始化 OSS
const ossClient = new OSS({
    accessKeyId: "LTAI4G8mRXCjyw14xkL41tV7", // 查看你自己的阿里云KEY
    accessKeySecret: "ok55oQJ5EBp0Hdo7Ek6jIeiYaTAC8B", // 查看自己的阿里云KEYSECRET
    bucket: "e-e-sports", // 你的 OSS bucket 名称
    region: "oss-cn-hongkong", // bucket 所在地址，我的是 华北2 北京
});
Vue.prototype.$ossClient = ossClient
Vue.prototype.$putOssImg = function (file, flag = 1) {
    // this.$message({ showClose: true, message: msg, type: "success" });
    return new Promise((reslove) => {
        let fileName = file.name.substr(0, file.name.lastIndexOf("."));
        let date = new Date().getTime();
        let fileNames = `${date}_${fileName}`; // 拼接文件名，保证唯一，这里使用时间戳+原文件名
        this.$ossClient.put("uploads/" + fileNames, file).then((res) => {
            if (res.res.statusCode === 200) {
                let url = res.res.requestUrls[0];
                reslove(url);
                if (flag == 0) return;
                this.$message({
                    message: "上传成功",
                    type: "success",
                });

            } else {
                this.$message("上传失败");
            }
        });
    })
}
// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree

Vue.prototype.msgSuccess = function (msg) {
    this.$message({ showClose: true, message: msg, type: "success" });
}

Vue.prototype.msgError = function (msg) {
    this.$message({ showClose: true, message: msg, type: "error" });
}
Vue.prototype.msgInfo = function (msg) {
    this.$message.info(msg);
}
// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.use(permission);
// 全局挂在上传图片url
Vue.prototype.$uploadImg = process.env.VUE_APP_BASE_API + '/common/uploadImg'
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
    size: Cookies.get('size') || 'medium' // set element-ui default size
})
Vue.config.productionTip = false

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})
