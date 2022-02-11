<template>
  <div id="chat">
    <div class="sidebar">
      <div class="m-card">
        <footer>
          <input
            class="search"
            type="text"
            placeholder="蒐索"
            v-model="search"
          />
        </footer>
      </div>
      <div style="flex: 1" class="userList">
        <list
          :userList="userList"
          :session="session"
          :session-index.sync="sessionIndex"
          @selectSession="selectSession"
        ></list>
      </div>
    </div>
    <div class="main">
      <message
        :session="session"
        :user-list="userList"
        :needScrollBottom="needScrollBottom"
      ></message>
      <sendText :session="session" @sendSuccess="sendSuccess"></sendText>
    </div>
  </div>
</template>
<script>
import card from "./components/card";
import list from "./components/list";
import sendText from "./components/text";
import message from "./components/message";
// import store from "@/store/store";
import { listMsg, searchList, sendMsg, changeMsg } from "@/api/game/chat_list";
export default {
  data() {
    // let serverData = store.fetch();
    return {
      // 登录用户
      // user: serverData.user,
      // 用户列表
      // userList: serverData.userList,
      userList: [],
      // 会话列表
      sessionList: [],
      // 蒐索key
      search: "",
      // 选中的会话Index
      sessionIndex: 0,
      session: null, //当前会话对象{包含会话列表}
      currentSessionId: "",
      queryObj: {
        pageNum: 1,
        pageSize: 10,
      },
      sessionId: 0,
      timerId: null,
      nomore: false,
      flag: false,
      isSearch: false,
      needScrollBottom: false,
    };
  },
  created() {
    this.$nextTick(() => {
      const el = document.querySelector(".userList");
      const offsetHeight = el.offsetHeight;
      el.onscroll = () => {
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        if (offsetHeight + scrollTop - scrollHeight >= -1) {
          // 需要执行的代码
          // if (!this.nomore && !this.flag) {
          // this.queryObj.pageNum = this.queryObj.pageNum + 1;
          // this.getNextPageData();
          // }
        }
      };
    });
  },
  destroyed() {
    clearTimeout(this.timerId);
  },
  watch: {
    // 每当sessionList改变时，保存到localStorage中
    async search(newVal) {
      if (newVal) {
        this.isSearch = true;
      } else {
        this.isSearch = false;
        this.getLeftList(this.queryObj);
        return;
      }
      // 初始化
      // this.initPage();
      clearTimeout(this.timerId);
      const res = await searchList({
        nickName: newVal,
      });
      this.userList = res.data;
    },
    // 监听数据，做去重处理
    userList(newVal) {
      this.quChong(newVal);
    },
  },
  mounted() {
    this.lunXun(0);
  },
  methods: {
    initPage() {
      this.queryObj = {
        pageNum: 1,
        pageSize: 10,
      };
      this.nomore = false;
      this.userList = [];
    },

    // 轮询
    async lunXun(flag) {
      // if (flag == 0) {
      this.getLeftList();
      // } else {
      //   this.timerId = setTimeout(() => {
      //     // 初始化
      //    clearTimeout(this.timerId);
      //     this.getLeftList({ pageNum: 1, pageSize: 20 });
      //   }, 1000);
      // }
    },
    // 去重处理函数
    quChong(arr) {
      //遍历数组中所有的元素
      for (var i = 0, len = arr.length; i < len; i++) {
        for (var v = i + 1; v < len; v++) {
          //检查是否有重复的元素
          if (arr[i].sessionId === arr[v].sessionId) {
            //有，就从数组中去除
            arr.splice(v, 1);
            // splice方法会改变数组长度，所以要将数组长度 len 和下标 v 减一
            len--;
            v--;
          }
        }
      }
    },
    // pageNum pageSize
    async getLeftList() {
      this.flag = true; //开启请求
      var that = this;
      const { data } = await listMsg({ pageNum: 1, pageSize: 20 });
      this.flag = false; //请求结束
      const list = data.rows; //数据
      // 当前页面为1 不用清空列表，直接覆盖值
      // if (this.queryObj.pageNum == 1) {
      //   this.userList = list;
      // } else {
      // 否则拼接值
      // this.userList = [...this.userList, ...list];
      // }
      let userList = [...list, ...this.userList];
      this.userList = userList;
      // 如果请求到的数据为空，则标志为没有更多
      // if (list.length == 0) {
      //   this.nomore = true;
      // }
      this.findCurrentSession();

      this.timerId = setTimeout(() => {
        // 清空定时器
        clearTimeout(this.timerId);
        this.getLeftList({ pageNum: 1, pageSize: 20 });
      }, 1000);

      // 赋值正在会话对象
      // 轮询;
      //   获取当前会话列表;
      // this.getChangeMsgList(currentSessionId);
    },
    // 下拉加载
    async getNextPageData() {
      // 清空定时器
      clearTimeout(this.timerId);
      this.flag = true;
      const { data } = await listMsg(this.queryObj);
      this.flag = false; //请求结束
      const list = data.rows; //数据
      // 当前页面为1 不用清空列表，直接覆盖值
      // if (this.queryObj.pageNum == 1) {
      //   this.userList = list;
      // } else {
      // 否则拼接值
      // this.userList = [...this.userList, ...list];
      // }
      let userList = [...list];
      this.userList = userList;
      // 如果请求到的数据为空，则标志为没有更多
      if (list.length == 0) {
        this.nomore = true;
      }
      this.findCurrentSession();
      this.timerId = setTimeout(() => {
        // 清空定时器
        clearTimeout(this.timerId);
        this.getLeftList({ pageNum: 1, pageSize: 20 });
      }, 2000);
    },
    test() {
      //寻找 正在会话index；
      let index = userList.findIndex((item) => item.isCurrentSeesion == 1);
      if (index == -1) {
        index = 0;
      }
      // 正在会话index；
      this.sessionIndex = index;
      // 正在会话id
      let currentSessionId = list[index].sessionId;
      let dataList = list[index].currentSessionMsg;
      if (currentSessionId == this.currentSessionId) {
        if (
          this.session.currentSessionMsg &&
          this.session.currentSessionMsg.length == dataList.length
        ) {
          this.needScrollBottom = 0;
        } else {
          this.needScrollBottom = 1;
          dataList.forEach((item) => {
            // if (item.playerAvatar) {
            //   item.playerAvatar =
            //     item.playerAvatar;
            // }
            if (item.sysUserAvatar) {
              item.sysUserAvatar =
                item.sysUserAvatar;
            }
          });
          this.session = list[index];
        }
      } else {
        this.currentSessionId = currentSessionId;
        this.needScrollBottom = 1;
        dataList.forEach((item) => {
          // if (item.playerAvatar) {
          //   item.playerAvatar =
          //     item.playerAvatar;
          // }
          if (item.sysUserAvatar) {
            item.sysUserAvatar =
              item.sysUserAvatar;
          }
        });
        this.session = list[index];
      }
    },
    // 查找正在会话对象
    findCurrentSession() {
      let index = this.userList.findIndex((item) => item.isCurrentSeesion == 1);
      if (index == -1) {
        index = 0;
      }
      // 正在会话index；
      this.sessionIndex = index;
      // 正在会话id
      let currentSessionId = this.userList[index].sessionId;
      let dataList = this.userList[index].currentSessionMsg;

      if (currentSessionId == this.currentSessionId) {
        if (
          this.session.currentSessionMsg &&
          this.session.currentSessionMsg.length == dataList.length
        ) {
          this.needScrollBottom = 0;
        } else {
          this.needScrollBottom = 1;
          dataList.forEach((item) => {
            if (item.sysUserAvatar) {
              item.sysUserAvatar =
                item.sysUserAvatar;
            }
          });
          this.session = this.userList[index];
        }
      } else {
        this.currentSessionId = currentSessionId;
        this.needScrollBottom = 1;
        dataList.forEach((item) => {
          if (item.sysUserAvatar) {
            item.sysUserAvatar =
              item.sysUserAvatar;
          }
        });
        this.session = this.userList[index];
      }
    },
    // 点击切换会话
    selectSession(obj) {
      // 清空定时器
      clearTimeout(this.timerId);

      this.sessionIndex = obj.index;
      // 更改isCurrentSeesion 清空选中样式
      this.userList.forEach((item) => (item.isCurrentSeesion = 0));
      this.userList[obj.index].isCurrentSeesion = 1;

      //主要是取客户昵称
      this.session = obj.value;

      let sessionId = obj.value.sessionId;
      this.sessionId = sessionId;

      //请求接口 获取数据
      this.getChangeMsgList(sessionId);
    },
    // 获取会话列表
    async getChangeMsgList(sessionId, cb) {
      const { data } = await changeMsg(sessionId);
      data.forEach((item) => {
        if (item.sysUserAvatar) {
          item.sysUserAvatar =
            item.sysUserAvatar;
        }
      });
      this.session.currentSessionMsg = data;
      this.needScrollBottom = 1;
      // 一秒后 请求列表
      setTimeout(() => {
        this.getLeftList(this.queryObj);
      }, 1000);
      return data;
      this.sessionList = data; //当前会话的聊天数据

      if (this.isSearch) {
        this.getLeftList();
        this.search = "";
        this.isSearch = false;
      }
    },
    sendSuccess() {
      this.getLeftList(this.queryObj);
      //   this.getChangeMsgList(this.sessionId);
    },
  },

  components: {
    card,
    list,
    sendText,
    message,
  },
};
</script>

<style lang='scss'>
#chat {
  margin: 20px auto;
  width: 1000px;
  height: 800px;
}
#chat {
  overflow: hidden;
  border-radius: 3px;

  .sidebar,
  .main {
    height: 100%;
  }
  .sidebar {
    float: left;
    width: 200px;
    color: #f4f4f4;
    // background-color: #2e3238;
    background: #e6e5e5;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .userList {
      flex: 1;
      overflow-x: hidden;
      overflow-y: auto;
    }
    .userList::-webkit-scrollbar {
      display: none;
    }
  }
  .main {
    position: relative;
    overflow: hidden;
    background-color: #eee;
  }
  .m-text {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
  }
  .m-message {
    height: calc(100% - 200px);
  }
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.m-card {
  padding: 12px;
  /* border-bottom: solid 1px #24272c; */

  .avatar,
  .name {
    vertical-align: middle;
  }
  .avatar {
    border-radius: 2px;
  }
  .name {
    display: inline-block;
    margin: 0 0 0 15px;
    font-size: 16px;
  }
  .search {
    padding: 0 10px;
    width: 100%;
    font-size: 12px;
    /* color: #fff; */
    height: 30px;
    line-height: 30px;
    border: solid 1px #fff;
    border-radius: 4px;
    outline: none;
    /* background-color: #26292e; */
    background-color: #fff;
  }
}
</style>
