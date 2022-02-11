<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="玩家ID" prop="playerId" label-width="150">
        <el-input
          type="number"
          v-model="queryParams.playerId"
          controls-position="right"
          placeholder="請輸入玩家ID"
          size="small"
        />
      </el-form-item>
      <el-form-item label="昵稱" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="請輸入昵稱"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="email" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="請輸入email"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="狀態" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="請選擇"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >蒐索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>
    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="playerList"
      @selection-change="handleSelectionChange"
    >
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="玩家id" align="center" prop="playerId" />
      <el-table-column label="頭像" align="center" prop="avatar">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px; border-radius: 50%"
            :src="scope.row.avatar"
            fit="fill"
          ></el-image>
        </template>
      </el-table-column>

      <el-table-column label="昵稱" align="center" prop="nickName">
        <template slot-scope="scope">
          <div @click="handleUpdate2(scope.row)" class="link-type">
            <span>{{ scope.row.nickName }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="email" align="center" prop="email">
        <template slot-scope="scope">
          <span>{{ scope.row.email || "無" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="狀態" align="center" prop="statusVal" />

      <el-table-column label="登入來源" align="center" prop="loginFromText" />
      <el-table-column label="登入地點" align="center" prop="loginLocation" />
      <el-table-column label="註冊時間" align="center" prop="createTime" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.status == 2">
            <el-button size="mini" type="text" v-hasPermi="['opt:player:edit']"
              >禁賽中</el-button
            >
          </div>
          <div v-else>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['opt:player:edit']"
              >{{ scope.row.status == 0 ? "停用" : "啟用" }}</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['opt:player:remove']"
              >禁止參賽</el-button
            >
          </div>

          <el-button
            size="mini"
            type="text"
            v-hasPermi="['opt:player:edit']"
            @click="handleCompetitionHistory(scope.row)"
            >競賽歷史資訊</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 玩家详情 -->
    <el-dialog
      :title="title"
      :visible.sync="openDetail"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="玩家id">
          <el-input v-model="form.playerId" disabled></el-input>
        </el-form-item>
        <el-form-item label="玩家昵稱">
          <el-input v-model="form.nickName" disabled></el-input>
        </el-form-item>
        <el-form-item label="頭像" v-model="form.avatar">
          <el-image
            style="width: 100px; height: 100px; border-radius: 50%"
            :src="form.avatar"
            fit="fill"
          ></el-image>
        </el-form-item>
        <el-form-item label="email">
          <el-input v-model="form.email" disabled></el-input>
        </el-form-item>
        <el-form-item label="登入來源">
          <el-input v-model="form.loginFromText" disabled></el-input>
        </el-form-item>
        <el-form-item label="登入地點">
          <el-input v-model="form.loginLocation" disabled></el-input>
        </el-form-item>
        <el-form-item label="註冊時間">
          <el-input v-model="form.createTime" disabled></el-input>
        </el-form-item>

        <el-form-item label="推薦人">
          <!-- <el-input v-model="form.introducePlayerId" disabled></el-input> -->
          <div
            style="color: #337ab7; font-weight: 700"
            @click="handleUpdateIntroduceId(form.introducePlayerId)"
          >
            {{ form.introducePlayerId || "無" }}
          </div>
        </el-form-item>
        <!-- 狀態 -->
        <el-form-item label="狀態">
          <el-radio-group>
            <el-radio v-if="form.status == 0">正常</el-radio>
            <el-radio v-if="form.status == 1">停用</el-radio>
            <el-radio v-if="form.status == 2">禁賽中</el-radio>
          </el-radio-group>
        </el-form-item>

        <div v-if="form.status != 0">
          <el-form-item label="禁賽截止時間" v-if="form.suspendEndDate">
            <el-input v-model="form.suspendEndDate" disabled></el-input>
          </el-form-item>
          <el-form-item label="處理原因" v-if="form.handleReason">
            <el-input
              type="textarea"
              v-model="form.handleReason"
              disabled
            ></el-input>
          </el-form-item>
        </div>

        <el-form-item label="玩家遊戲名稱">
          <el-input v-model="gameUserName" disabled></el-input>
        </el-form-item>
        <el-form-item label="openID">
          <el-input v-model="openId" disabled></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormDetail">確 定</el-button>
      </div>
    </el-dialog>

    <!-- 停用与禁赛 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="125px">
        <el-form-item label="處理原因" prop="handleReason">
          <el-input
            type="textarea"
            v-model="form.handleReason"
            placeholder="請輸入處理原因"
          />
        </el-form-item>
        <el-form-item
          label="禁賽截止日期"
          prop="suspendEndDate"
          v-if="isSuspend"
        >
          <el-date-picker
            clearable
            size="small"
            v-model="form.suspendEndDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择禁賽截止日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">確 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPlayer, handlePlayer, getPlayer } from "@/api/game/player";

export default {
  name: "Player",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非單个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示蒐索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 玩家表格数据
      playerList: [],
      // 弹出层标题
      title: "",
      // 玩家狀態
      statusOptions: [],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        playerId: null,
        nickName: null,
        phone: null,
        email: null,
        avatar: null,
        sex: null,
        status: null,
        handleTime: null,
        handler: null,
        handleReason: null,
        introducePlayerId: null,
        suspendEndDate: null,
        loginFrom: null,
        thirdPartyPlatformUid: null,
        loginLocation: null,
        isInit: null,
      },
      // 是否禁赛,用于区分禁赛与停用
      isSuspend: false,
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        playerId: [
          {
            required: true,
            message: "平臺唯一玩家id不能為空",
            trigger: "blur",
          },
        ],
        status: [
          {
            required: true,
            message: "玩家狀態不能為空",
            trigger: "blur",
          },
        ],
        loginFrom: [
          {
            required: true,
            message: "登入來源不能為空",
            trigger: "blur",
          },
        ],
        thirdPartyPlatformUid: [
          {
            required: true,
            message: "協力廠商平臺uid不能為空",
            trigger: "blur",
          },
        ],
        isInit: [
          {
            required: true,
            message: "不能為空",
            trigger: "blur",
          },
        ],
        handleReason: [
          { required: true, message: "操作理由不能為空", trigger: "blur" },
        ],
        suspendEndDate: [
          { required: true, message: "禁賽截止日期", trigger: "blur" },
        ],
      },
      openDetail: false,
      openId: "",
      gameUserName: "",
    };
  },
  created() {
    this.getDicts("player_status").then((response) => {
      this.statusOptions = response.data;
      this.getList();
    });
  },
  methods: {
    /** 查询玩家列表 */
    getList() {
      this.loading = true;
      listPlayer(this.queryParams).then((response) => {
        let resultData = response.data,
          statusVal = "";
        let playerList = resultData.rows;

        playerList.forEach((element) => {
          let status = element.status;

          // 玩家狀態
          statusVal = this.statusOptions.filter((item) => {
            return status == parseInt(item.dictValue);
          });

          element.statusVal =
            statusVal.length == 0 ? "禁賽中" : statusVal[0].dictLabel;

          // 玩家登陆来源
          element.loginFromText = element.loginFrom == 0 ? "facebook" : "line";
        });

        this.playerList = playerList;
        this.total = resultData.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表單重置
    reset() {
      this.form = {
        id: null,
        playerId: null,
        nickName: null,
        phone: null,
        email: null,
        avatar: null,
        sex: null,
        status: 0,
        createTime: null,
        handleTime: null,
        handler: null,
        handleReason: null,
        updateBy: null,
        updateTime: null,
        introducePlayerId: null,
        suspendEndDate: null,
      };
      this.isSuspend = false;
      this.resetForm("form");
    },
    /** 蒐索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加玩家";
    },
    /** 按钮操作 ---啟用与停用*/
    handleUpdate(row) {
      this.reset();
      const playerId = row.playerId;
      const status = row.status;
      this.form.playerId = playerId;
      this.form.status = status;
      if (status == 0) {
        // 停用
        this.open = true;
        this.title = "停用";
      } else if (status == 1) {
        // 啟用
        this.handlePlayerAction(0);
      } else if (status == 2) {
        // 禁用
        this.$message({
          type: "error",
          message: "禁賽中",
        });
      }
    },
    handleUpdateIntroduceId(id) {
      if (!id) {
        return;
      }
      let row = {
        playerId: id,
      };
      this.handleUpdate2(row);
    },
    handleUpdate2(row) {
      this.reset();
      const playerId = row.playerId;
      getPlayer(playerId).then((res) => {
        let formData = res.data.playerBasicInfo;
        formData.loginFromText = formData.loginFrom == 0 ? "facebook" : "line";
        this.form = formData;
        let playerGameInfo = res.data.playerGameInfo;
        this.gameUserName = playerGameInfo ? playerGameInfo.gameUserName : "";
        this.openId = playerGameInfo ? playerGameInfo.openId : "";
        this.openDetail = true;
        this.title = "玩家詳情";
      });
    },
    getItem(id) {
      return new Promise((resolve, reject) => {
        const target = this.playerList.find((item) => {
          if (item.playerId == id) {
            return true;
          }
        });
        if (target) {
          resolve(target);
        }
      });
    },
    /** 操作玩家 */
    handlePlayerAction(playerStatus) {
      let formData = {
        handleReason: this.form.handleReason,
        playerId: this.form.playerId,
        status: playerStatus,
        suspendEndDate: this.form.suspendEndDate,
      };
      handlePlayer(formData).then((response) => {
        this.getList();
        this.open = false;
        this.msgSuccess("操作成功");
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          // 停用与禁赛
          let playerStatus = this.isSuspend ? null : 1;
          this.handlePlayerAction(playerStatus);
        }
      });
    },
    submitFormDetail() {
      this.openDetail = false;
    },
    /** 查看玩家競賽歷史資訊 */
    handleCompetitionHistory(row) {
      const playerId = row.playerId;
      this.$router.push({ path: "/game/player/history/" + playerId });
    },

    // 禁赛
    handleDelete(row) {
      this.reset();
      const playerId = row.playerId;
      this.open = true;
      this.title = "禁赛";
      this.isSuspend = true;
      this.form.playerId = playerId;
    },
  },
};
</script>
<style>
.el-input.is-disabled .el-input__inner {
  background: #fff;
  color: #606266;
}

.custom-number .el-input__inner {
  text-align: left;
}
</style>
