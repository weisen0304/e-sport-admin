<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['opt:conf:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['opt:conf:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['opt:conf:remove']"
          >删除</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="confList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="編號"
        align="center"
        prop="collectCoinRobotConfId"
      />
      <el-table-column label="玩家ID" align="center" prop="playerId" />
      <el-table-column label="玩家昵稱" align="center" prop="nickName" />

      <el-table-column label="玩家頭像" align="center" prop="avatar">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px; border-radius: 50%"
            :src="scope.row.avatar"
            fit="fill"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="創建人" align="center" prop="createBy" />

      <el-table-column label="創建時間" align="center" prop="createTime" />

      <el-table-column label="狀態" align="center" prop="statusName" />
      <el-table-column label="收幣話術" align="center" prop="collectCoinMsg" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['opt:conf:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleStop(scope.row)"
            v-hasPermi="['opt:conf:edit']"
            >{{ scope.row.status == 0 ? "停用" : "啟用" }}</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:conf:remove']"
            >删除</el-button
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

    <!-- 添加或修改收幣機器人对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收幣玩家" prop="playerId">
          <el-select v-model="form.playerId" placeholder="請選擇玩家">
            <el-option
              v-for="dict in playerList"
              :key="dict.playerId"
              :label="dict.nickName"
              :value="dict.playerId"
              class="el-option"
            >
              <img
                :src="dict.avatar"
                alt=""
                style="width: 50px; height: 50px"
              />
              <span>{{ dict.nickName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收幣話術" prop="collectCoinMsg">
          <el-input
            v-model="form.collectCoinMsg"
            type="textarea"
            placeholder="請輸入内容"
          />
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
import {
  listConf,
  getConf,
  delConf,
  addConf,
  updateConf,
  exportConf,
} from "@/api/game/coin_robot";
import { listPlayer } from "@/api/game/player";

export default {
  name: "Conf",
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
      // 收幣機器人表格数据
      confList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        playerId: null,
        status: null,
        collectCoinMsg: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        playerId: [
          { required: true, message: "收幣話術不能為空", trigger: "blur" },
        ],
        createTime: [
          { required: true, message: "收幣話術不能為空", trigger: "blur" },
        ],
        createBy: [
          { required: true, message: "收幣話術不能為空", trigger: "blur" },
        ],
      },
      //   狀態
      statusOptions: [],
      playerList: null, //玩家列表
    };
  },
  created() {
    this.getStatus();
    this.getList();
  },
  methods: {
    /** 查询收幣機器人列表 */
    getList() {
      this.loading = true;
      listConf(this.queryParams).then((response) => {
        response = response.data;

        response.rows.forEach((item) => {
          let obj = this.statusOptions.find(
            (item2) => item2.dictValue == item.status
          );
          if (obj) {
            item.statusName = obj.dictLabel;
          }

          let d = new Date(item.createTime);
          const resDate =
            d.getFullYear() +
            "-" +
            this.p(d.getMonth() + 1) +
            "-" +
            this.p(d.getDate());
          const resTime =
            this.p(d.getHours()) +
            ":" +
            this.p(d.getMinutes()) +
            ":" +
            this.p(d.getSeconds());
          item.createTime = resDate + " " + resTime;
        });
        this.confList = response.rows;

        this.total = response.total;
        this.loading = false;
      });
    },
    p(s) {
      return s < 10 ? "0" + s : s;
    },
    getPlayerList() {
      listPlayer({
        pageNum: 1,
        pageSize: 100000,
      }).then((response) => {
        response = response.data;
        let playerList = response.rows;
        this.playerList = playerList;
      });
    },
    getStatus() {
      this.getDicts("coin_robot_status").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions = response.data;
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
        collectCoinRobotConfId: null,
        playerId: null,
        createTime: null,
        createBy: null,
        status: 0,
        collectCoinMsg: null,
      };
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
      this.ids = selection.map((item) => item.collectCoinRobotConfId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      if (!this.playerList) {
        this.getPlayerList();
      }
      this.reset();
      this.open = true;
      this.title = "添加收幣機器人";
    },
    // 停用
    handleStop(row) {
      let tipText;
      if (row.status == 0) {
        tipText = "停用";
      } else if (row.status == 1) {
        tipText = "啟用";
      }
      row = JSON.parse(JSON.stringify(row));
      row.status = row.status == 0 ? 1 : 0;
      const collectCoinRobotConfId = row.collectCoinRobotConfId;
      this.$confirm("是否確認" + tipText + "?", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        updateConf(row).then((response) => {
          this.$message({
            type: "success",
            message: "成功!",
          });

          this.getList();
        });
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      if (!this.playerList) {
        this.getPlayerList();
      }
      this.reset();
      const collectCoinRobotConfId = row.collectCoinRobotConfId || this.ids;
      this.getItem(collectCoinRobotConfId).then((response) => {
        this.form = response;
        this.open = true;
        this.title = "修改收幣機器人";
      });
    },
    getItem(id) {
      return new Promise((resolve, reject) => {
        const target = this.confList.find((item) => {
          if (item.collectCoinRobotConfId == id) {
            return true;
          }
        });
        if (target) {
          resolve(target);
        }
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.collectCoinRobotConfId != null) {
            updateConf(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addConf(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const collectCoinRobotConfIds = row.collectCoinRobotConfId || this.ids;
      this.$confirm(
        '是否確認删除收幣機器人編號为"' +
          collectCoinRobotConfIds +
          '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delConf(collectCoinRobotConfIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
  },
};
</script>
<style >
.el-option {
  height: 70px;
  display: flex;
  align-items: center;
}
.el-option img {
  border-radius: 50%;
  margin-right: 10px;
}
</style>
