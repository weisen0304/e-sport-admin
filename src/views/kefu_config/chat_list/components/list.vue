

<template>
  <div class="m-list">
    <!-- hhhhhhhhhhhhhhhhhhh
    {{ userList }} -->
    <ul>
      <!--  :class="{ active: sessionIndex == index }" -->
      <li
        v-for="(item, index) in userList"
        :key="index"
        :class="{ active: item.isCurrentSeesion == 1 }"
        @click="select(item, index)"
      >
        <div class="avatar-box">
          <img
            class="avatar"
            style="width:40px;height:40rpx"
            :alt="item.name"
            :src="item.avatar"
          />
          <span v-if="item.status == 0"></span>
        </div>

        <div class="content-box">
          <p class="first-p">
            <span class="name">{{ item.nickName }}</span>
            <span class="time">{{ item.sessionCreateTime }}</span>
          </p>
          <p class="last-p" v-if="item.status == 2">正在发起会话</p>
          <p class="last-p" v-else>{{ item.lastMsg }}</p>
        </div>
      </li>

      <!-- <li v-for="(item, index) in 50" :key="index" style="color:#000;height:40px">哈哈哈哈哈哈哈哈哈哈</li> -->
    </ul>
  </div>
</template>
<script>
export default {
  props: ["userList", "sessionIndex", "session", "search"],
  methods: {
    select(value, index) {
      this.$emit("selectSession", { value, index });
    },
  },
  computed: {
    // 蒐索
    // searchList() {
    //   if (this.userList) {
    //     return this.userList.filter((item) => {
    //       if (item.nickName.indexOf(this.search) > -1) {
    //         return true;
    //       }
    //     });
    //   }
    // },
  },
};
</script>
<style lang='scss' scoped>
.m-list {
  height: 100%;
  // overflow: auto;
  // ul {
  //   height: calc(800px - 54px);
  //   overflow: auto;
  // }
  li {
    padding: 0px 5px;
    height: 62px;
    // line-height: 62px;
    // border-bottom: 1px solid #292c33;
    cursor: pointer;
    transition: background-color 0.1s;
    display: flex;
    align-items: center;
    &:hover {
      background-color: #dedbdb;
    }
    &.active {
      background-color: #c6c5c5;
    }
  }
  .avatar,
  .content-box {
    vertical-align: middle;
  }
  .avatar {
    border-radius: 2px;
    height: 40px;
  }
  .avatar-box {
    position: relative;
    span {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #ed4014;
      top: -4px;
      right: -4px;
      border-radius: 50%;
    }
  }
  .content-box {
    flex: 1;
    margin: 0 0 0 8px;
    font-size: 12px;
    overflow: hidden;
    p {
      margin: 0;
    }
    .first-p {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 3px;
      color: #333;
      .time {
        color: #999999;
        text-indent: 5px;
      }
      .name {
        max-width: 60%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .last-p {
      color: #888;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin-right: 50px;
    }
  }
}
</style>