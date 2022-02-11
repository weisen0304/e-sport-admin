

<template>
  <div class="m-text">
    <div class="img-box">
      <img src="../../../../assets/images/img.png" alt="" @click="selectImg" />
      <input
        type="file"
        name=""
        id=""
        @change="change"
        ref="inputImage"
        style="display: none"
      />
    </div>
    <textarea placeholder="請輸入" v-model="text" @keyup="inputing"></textarea>
    <div class="btn-box">
      <div @click="sendClick">发送ctrl+enter</div>
    </div>
  </div>
</template>
<script>
import { sendMsg } from "@/api/game/chat_list";
import { upLoadImg } from "@/api/common/common";

export default {
  props: ["session"],
  data() {
    return {
      text: "",
    };
  },
  computed: {},
  methods: {
    textFormat(val) {
      // 格式化文字展示文本域格式文字
      if (val) {
        let newString = val.replace(/\n/g, "_@").replace(/\r/g, "_#");
        newString = newString.replace(/_#_@/g, "<br/>"); // IE7-8
        newString = newString.replace(/_@/g, "<br/>"); // IE9、FF、chrome
        newString = newString.replace(/\s/g, "&nbsp;"); // 空格处理
        return newString;
      }
    },
    inputing(e) {
      if (e.ctrlKey && e.keyCode === 13 && this.text.length) {
        let text = this.textFormat(this.text);
        let imgHtml = `<div class="text">${text}</div>`;

        this.send(text);
      }
    },
    sendClick() {
      let text = this.textFormat(this.text);

      let imgHtml = `<div class="text">${text}</div>`;
      this.send(text);
    },
    // 选择图片
    selectImg() {
      let inputDOM = this.$refs.inputImage;
      inputDOM.click();
    },
    change(e) {
      let inputDOM = this.$refs.inputImage;
      this.upLoadRequest(inputDOM.files[0]);
    },

    /**上传图片**/
    async upLoadRequest(file) {
      let url = await this.$putOssImg(file, 0);
      this.$refs.inputImage.value = null;
      this.send(`picture:${url}`);
    },
    async send(content) {
      await sendMsg({
        sysUserContent: content,
        sessionId: this.session.sessionId,
      });
      this.$emit("sendSuccess");
      this.text = "";
    },
  },
};
</script>

<style lang="scss">
.m-text {
  height: 200px;
  border-top: solid 1px #ddd;
  background: #f1f1f1;
  display: flex;
  flex-direction: column;
  padding: 0 20px;

  textarea {
    // height: 100%;
    width: 100%;
    border: none;
    outline: none;
    font-family: "Micrsofot Yahei";
    resize: none;
    background: #f1f1f1;
    flex: 1;
  }
  .btn-box {
    display: flex;
    justify-content: flex-end;
    font-size: 14px;
    color: #a0a0a0;
    div {
      background: #fff;
      padding: 5px 10px;
      margin-right: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
  }
  .img-box {
    padding: 10px 0px;
    img {
      width: 20px;
      height: auto;
    }
  }
}
</style>
