

<template>
  <div class="m-message">
    <div style="padding-bottom: 5px; padding-top: 9px">
      <span v-if="session">
        {{ session.nickName || "" }}
      </span>
    </div>
    <ul
      v-if="
        session && session.currentSessionMsg && session.currentSessionMsg.length
      "
      :data-need="needScrollBottom"
      v-scroll-bottom="session.currentSessionMsg"
    >
      <viewer>
        <li v-for="(item, index) in session.currentSessionMsg" :key="index">
          <p class="time">
            <span>{{ item.msgCreateTime }}</span>
          </p>
          <div class="main" :class="{ self: item.sysUserContent }">
            <div
              class="avatar"
              v-if="item.sysUserAvatar"
              :style="{
                background: `url(${item.sysUserAvatar}) no-repeat center center`,
              }"
            ></div>
            <div
              class="avatar"
              v-if="item.playerAvatar"
              :style="{
                background: `url(${item.playerAvatar}) no-repeat center center`,
              }"
            ></div>
            <div
              class="text"
              v-html="
                getHandleContent(item.playerContent || item.sysUserContent)
              "
            ></div>
          </div>
        </li>
      </viewer>
    </ul>
  </div>
</template>
<script>
import Vue from "vue";
export default {
  props: ["session", "user", "userList", "sessionList", "needScrollBottom"],
  directives: {
    // 发送消息后滚动到底部
    "scroll-bottom"(el) {
      if (el.dataset.need == 1) {
        Vue.nextTick(() => {
          el.scrollTop = el.scrollHeight - el.clientHeight;
        });
      }
    },
  },
  methods: {
    getHandleContent(content) {
      let html = content;
      if (content.substr(0, 8) === "picture:") {
        const url = content.substr(8);
        html = `<img src="${url}" class="el-image__inner el-image__preview">`;
      }
      return html;
    },
  },
};
</script>
<style lang="scss" >
.m-message {
  padding: 10px 0 10px 15px;
  display: flex;
  flex-direction: column;
  ul {
    overflow-y: scroll;
    flex: 1;
    padding-right: 15px;
  }
  li {
    margin-bottom: 15px;
  }
  .time {
    margin: 18px 0;
    text-align: center;

    > span {
      display: inline-block;
      padding: 0 8px;
      font-size: 12px;
      color: #fff;
      border-radius: 2px;
      //   background-color: #dcdcdc;
      color: #a1a1a1;
    }
  }
  .avatar {
    float: left;
    margin: 0 10px 0 0;
    border-radius: 3px;
    width: 40px;
    height: 40px;
    background-size: cover !important;
  }
  .text-content {
    // display: inline-block;
    // position: relative;
    // // padding: 0 10px;
    // max-width: calc(60%);
    // // min-height: 30px;
    // // line-height: 2.5;
    // // text-align: left;
    // word-break: break-all;
    // background-color: #fafafa;
    // border-radius: 4px;
    img {
      max-width: 150px;
    }
  }
  .text {
    display: inline-block;
    position: relative;
    padding: 0 10px;
    max-width: calc(60%);
    min-height: 30px;
    line-height: 2.5;
    text-align: left;
    word-break: break-all;
    background-color: #fafafa;
    border-radius: 4px;
    font-size: 12px;
    &:before {
      content: " ";
      position: absolute;
      top: 9px;
      right: 100%;
      border: 6px solid transparent;
      border-right-color: #fafafa;
    }
    img {
      max-width: 150px;
      margin-bottom: 10px;
      margin-top: 10px;

      display: block;
    }
    .text {
      max-width: 100%;
      padding: 0;
      font-size: 12px;
    }
  }

  .self {
    text-align: right;
    .avatar {
      float: right;
      margin: 0 0 0 10px;
      width: 40px;
      height: 40px;
      background-size: cover !important;
    }
    .text {
      background-color: #b2e281;

      &:before {
        right: inherit;
        left: 100%;
        border-right-color: transparent;
        border-left-color: #b2e281;
      }
      .text {
        max-width: 100%;
      }
    }
  }
}
</style>
