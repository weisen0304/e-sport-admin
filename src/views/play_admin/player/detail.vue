<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="玩家id">
        <el-input v-model="form.playerId"></el-input>
      </el-form-item>
       <el-form-item label="玩家昵称">
        <el-input v-model="form.nickName"></el-input>
      </el-form-item>
      <el-form-item label="头像" v-model="form.avatar">
          <el-image
            style="width: 100px; height: 100px"
            :src="form.avatar"
            fit="fill"
          ></el-image>
      </el-form-item>
       <el-form-item label="email">
        <el-input v-model="form.email"></el-input>
      </el-form-item>
       <el-form-item label="登录来源">
        <el-input v-model="form.loginFromText"></el-input>
      </el-form-item>
        <el-form-item label="登录地点">
        <el-input v-model="form.loginLocation"></el-input>
      </el-form-item>
      <el-form-item label="注册时间">
        <el-input v-model="form.createTime"></el-input>
      </el-form-item>
     
      <el-form-item label="推荐人">
        <el-input v-model="form.createTime"></el-input>
      </el-form-item>
      <!-- 状态 -->
      <el-form-item label="状态">
         <el-radio-group>
          <el-radio v-if="form.status==0">正常</el-radio>
          <el-radio v-if="form.status==1">停用</el-radio>
          <el-radio v-if="form.status==2">禁赛中</el-radio>
        </el-radio-group>
      </el-form-item>

      <div v-if="form.status!=0">
        <el-form-item label="禁赛截止时间" v-if="form.suspendEndDate">
           <el-input  v-model="form.suspendEndDate"></el-input>
         </el-form-item>
         <el-form-item label="处理原因" v-if="form.handleReason">
           <el-input type="textarea" v-model="form.handleReason"></el-input>
         </el-form-item>
      </div>
      
     
        <el-form-item label="玩家游戏名称">
          <el-input v-model="gameUserName"></el-input>
        </el-form-item>
        <el-form-item label="openID">
            <el-input v-model="openId"></el-input>
        </el-form-item>
      
      
    </el-form>
   
  </div>
</template>

<script>
import { getPlayer } from "@/api/game/player";

export default {
  name: "Player",
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
       form: {},
        // 状态
        statusOptions:[],
        // 绑定的游戏信息
        gameUserName:'',
        openId:''
    };
  },
  created() {
    const playerId = this.$route.params.playerId;

     this.getDicts("player_status").then((response) => {
      this.statusOptions = response.data;
      this.getPlayerInfo(playerId)
    });

    
  },
  methods: {
   /** 获取玩家信息 */
    getPlayerInfo(playerId){
      getPlayer(playerId).then(res =>{
        
        let formData = res.data.playerBasicInfo
        formData.loginFromText = formData.loginFrom==0? 'facebook' : 'line';
        this.form = formData 
        let playerGameInfo = res.data.playerGameInfo
        this.gameUserName =playerGameInfo? playerGameInfo.gameUserName : '';
        this.openId =playerGameInfo? playerGameInfo.openId : '';
      })
    }
  }
};
</script>