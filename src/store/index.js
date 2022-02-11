import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import settings from './modules/settings'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    tagsView,
    permission,
    settings
  },
  getters
})

export default store
// export default 导出 Vuex.Store({}),接收一个配置对象；配置对象的选项有5个==》state,getter,mutation,actions,moudles