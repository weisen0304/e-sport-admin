<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="98px"
    >
      <el-form-item label="賽事種類名稱" prop="raceTypeName">
        <el-input
          v-model="queryParams.raceTypeName"
          placeholder="請輸入賽事種類名稱"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="賽事種類類型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="請選擇賽事種類類型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          ></el-option>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['opt:type:add']"
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
          v-hasPermi="['opt:type:edit']"
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
          v-hasPermi="['opt:type:remove']"
          >删除</el-button
        >
      </el-col>

      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <el-table
      v-loading="loading"
      :data="typeList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="賽事種類編號" align="center" prop="raceTypeId" />
      <el-table-column
        label="賽事種類名稱"
        align="center"
        prop="raceTypeName"
      />
      <el-table-column label="賽程資訊" align="center" prop="typeName">
        <template slot-scope="scope">
          <div @click="showSchedule(scope.row)" style="color: #409eff">
            {{ scope.row.raceScheduleName }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="賽事種類類型" align="center" prop="typeName" />
      <el-table-column label="對應遊戲" align="center" prop="typeName">
        <template slot-scope="scope">
          <div style="color: #409eff" @click="showGame(scope.row)">
            {{ scope.row.gameName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="賽事種類封面" align="center" prop="raceTypeCover">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px"
            :src="scope.row.raceTypeCover"
            fit="fill"
          ></el-image>
        </template>
      </el-table-column>
      <!-- <el-table-column label="結算規則" align="center" prop="typeName">
        <template slot-scope="scope">
          <div style="color: #409eff" @click="showRule(scope.row)">
            {{ scope.row.settlementRuleName }}
          </div>
        </template>
      </el-table-column> -->
      <el-table-column
        label="狀態"
        align="center"
        prop="statusName"
        width="180"
      />
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
            v-hasPermi="['opt:type:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:type:remove']"
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

    <!-- 添加或修改賽事種類对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="109px">
        <el-form-item label="賽事種類名稱" prop="raceTypeName">
          <el-input
            v-model="form.raceTypeName"
            placeholder="請輸入賽事種類名稱"
          />
        </el-form-item>

        <el-form-item label="賽程" prop="raceScheduleId">
          <el-select v-model="form.raceScheduleId" placeholder="請選擇賽程">
            <el-option
              v-for="item in scheduleList"
              :key="item.raceScheduleId"
              :label="item.raceScheduleName"
              :value="item.raceScheduleId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="對應遊戲" prop="supportGameId">
          <el-select v-model="form.supportGameId" placeholder="請選擇對應遊戲">
            <el-option
              v-for="dict in gameList"
              :key="dict.supportGameId"
              :label="dict.gameName"
              :value="dict.supportGameId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="結算規則" prop="settlementRuleId">
          <el-select v-model="form.settlementRuleId" placeholder="請選擇">
            <el-option
              v-for="dict in ruleList"
              :key="dict.settlementRuleId"
              :label="dict.settlementRuleName"
              :value="dict.settlementRuleId"
            >
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="賽事種類封面" prop="raceTypeCover">
          <!-- <el-input
            v-model="form.raceTypeCover"
            placeholder="請輸入賽事種類封面url"
          /> -->
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="upLoadRequest"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="form.raceTypeCover"
              :src="form.raceTypeCover"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="賽事種類類型" prop="type">
          <el-select v-model="form.type" placeholder="請選擇賽事種類類型">
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-select v-model="form.status" placeholder="請選擇狀態">
            <el-option
              v-for="dict in statusList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">確 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 显示賽程資訊 -->
    <el-dialog
      title="賽程資訊"
      :visible.sync="DialogVisibleSchedule"
      width="30%"
    >
      <el-form :model="scheduleListById" :rules="rules" label-width="110px">
        <el-form-item label="賽程名稱" prop="raceScheduleName">
          <el-input
            disabled
            v-model="scheduleListById.raceScheduleName"
            placeholder="請輸入賽程名稱"
          />
        </el-form-item>
        <el-form-item label="創建房間時間(單位/秒)" prop="createGameRoomTime">
          <el-input
            disabled
            v-model="scheduleListById.createGameRoomTime"
            placeholder="請輸入創建房間時間"
          />
          <!-- <span>(單位/秒)</span> -->
        </el-form-item>
        <el-form-item label="開始競賽時間(單位/秒)" prop="gameStartTime">
          <el-input
            disabled
            v-model="scheduleListById.gameStartTime"
            placeholder="請輸入開始競賽時間(單位/秒)"
          />
        </el-form-item>
        <el-form-item label="結束競賽時間(單位/秒)" prop="endGameTime">
          <el-input
            v-model="scheduleListById.endGameTime"
            disabled
            placeholder="請輸入結束競賽時間(單位/秒)"
          />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="DialogVisibleSchedule = false"
          >確 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 显示對應遊戲 -->
    <el-dialog title="對應遊戲" :visible.sync="DialogVisibleGame" width="30%">
      <el-form :model="gameListById" label-width="80px">
        <el-form-item label="遊戲名稱" prop="gameName">
          <el-input disabled v-model="gameListById.gameName" />
        </el-form-item>

        <el-form-item label="LOGO" prop="LOGO">
          <img
            v-if="gameListById.gameLogoUrl"
            :src="gameListById.gameLogoUrl"
            class="avatar"
          />
        </el-form-item>

        <el-form-item label="創建時間" prop="createTime">
          <el-input disabled v-model="gameListById.createTime" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="DialogVisibleGame = false"
          >確 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 显示规则 -->
    <!-- 添加或修改結算規則对话框 -->

    <el-dialog title="結算規則" :visible.sync="DialogVisibleRule" width="30%">
      <el-form :model="ruleListById" label-width="140px">
        <el-form-item label="結算規則名稱" prop="settlementRuleName">
          <el-input v-model="ruleListById.settlementRuleName" disabled />
        </el-form-item>
        <el-form-item label="結算規則類型" prop="bonusType">
          <el-input v-model="ruleListById.bonusTypeName" disabled />
        </el-form-item>
        <el-form-item label="擊殺一個人結算金額" prop="rewardAmountKillNum">
          <el-input v-model="ruleListById.rewardAmountKillNum" disabled />
        </el-form-item>
        <el-form-item label="勝利方結算金額" prop="rewardWinSide">
          <el-input v-model="ruleListById.rewardWinSide" disabled />
        </el-form-item>
        <!-- <el-form-item label="游戏币种" prop="raceScheduleId">
          <el-input v-model="ruleListById.gameCurrencyName" disabled />
        </el-form-item> -->
        <el-form-item label="需要花費遊戲幣" prop="cost">
          <el-input v-model="ruleListById.cost" disabled />
        </el-form-item>
        <el-form-item label="規則內容">
          <div v-html="ruleListById.ruleContent"></div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="DialogVisibleRule = false"
          >確 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listType,
  getType,
  delType,
  addType,
  updateType,
  exportType,
  querySchedule,
  queryGame,
  queryRule,
} from "@/api/game/race_type";
import { upLoadImg } from "@/api/common/common";
import { gamelist } from "@/api/game/game";
import { listSchedule } from "@/api/game/race_schedule";
import { listRule } from "@/api/game/settlement_rule";

export default {
  name: "Type",
  components: {},
  data() {
    return {
      // id相关数据
      DialogVisibleSchedule: false,
      scheduleListById: [],
      DialogVisibleGame: false,
      gameListById: [],
      DialogVisibleRule: false,
      ruleListById: [],
      // 狀態数据
      statusList: [],
      // 下拉数据
      scheduleList: null,
      ruleList: null,
      gameList: null,
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
      // 賽事種類表格数据
      typeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        raceTypeName: null,
        raceScheduleId: null,
        supportGameId: null,
        settlementRuleId: null,
        raceTypeCover: null,
        status: null,
        type: null,
      },
      // 表單参数
      form: {},
      statusOptions: [],

      // 表單校验
      rules: {
        raceTypeName: [
          {
            required: true,
            message: "賽事種類名稱不能為空",
            trigger: "blur",
          },
        ],
        raceScheduleId: [
          {
            required: true,
            message: "請選擇賽程",
            trigger: "blur",
          },
        ],
        supportGameId: [
          {
            required: true,
            message: "請選擇平臺遊戲",
            trigger: "blur",
          },
        ],
        settlementRuleId: [
          {
            required: true,
            message: "請選擇結算規則",
            trigger: "blur",
          },
        ],
        raceTypeCover: [
          {
            required: true,
            message: "賽事種類封面url不能為空",
            trigger: "blur",
          },
        ],
      },
      bonusTypeList: null,
    };
  },
  created() {
    this.getDicts("type").then((response) => {
      const list = response.data;
      list.forEach((element) => {
        element.dictValue = parseInt(element.dictValue);
      });
      this.statusOptions = response.data;
      this.getDicts("status").then((response) => {
        const statusList = response.data;
        statusList.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusList = statusList;
        this.getList();
      });
    });
    this.getBonusType();
  },
  methods: {
    /** 查询賽事種類列表 */
    getList() {
      this.loading = true;
      listType(this.queryParams).then((response) => {
        response = response.data;
        let rows = response.rows;
        rows.forEach((item) => {
          let obj1 = this.statusOptions.find(
            (item2) => item2.dictValue == item.type
          );
          item.typeName = obj1 ? obj1.dictLabel : "";

          let obj2 = this.statusList.find(
            (item2) => item2.dictValue == item.status
          );
          item.statusName = obj2 ? obj2.dictLabel : "";
        });
        this.typeList = rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getBonusType() {
      this.getDicts("bonus_type").then((response) => {
        const statusList = response.data;
        statusList.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.bonusTypeList = statusList;
      });
    },
    getRuleList() {
      listRule({
        pageNum: 1,
        pageSize: 1000,
      }).then((response) => {
        response = response.data;
        let rows = response.rows;
        rows.forEach((item) => {
          // if (item.bonusType == 0) {
          //   item.bonusTypeName = "按擊殺人數個數結算獎金";
          // } else if (item.bonusType == 1) {
          //   item.bonusTypeName = "按比賽場次勝利一方結算獎金";
          // } else if (item.bonusType == 2) {
          //   item.bonusTypeName = "自定義結算規則";
          // }
          let obj1 = this.bonusTypeList.find(
            (item2) => item2.dictValue == item.bonusType
          );
          item.bonusTypeName = obj1 ? obj1.dictLabel : "";
        });
        this.ruleList = rows;
      });
    },
    getGameList() {
      gamelist({
        pageNum: 1,
        pageSize: 1000,
      }).then((response) => {
        response = response.data;
        this.gameList = response.rows;
      });
    },
    getScheduleList() {
      listSchedule({
        pageNum: 1,
        pageSize: 1000,
      }).then((response) => {
        response = response.data;
        this.scheduleList = response.rows;
      });
    },
    // 根据id查询列表
    showSchedule(row) {
      const raceTypeId = row.raceScheduleId;
      querySchedule(raceTypeId).then((response) => {
        this.scheduleListById = response.data;
        this.DialogVisibleSchedule = true;
      });
    },
    showGame(row) {
      const raceTypeId = row.supportGameId;
      queryGame(raceTypeId).then((response) => {
        // gameListById
        this.gameListById = response.data;
        this.DialogVisibleGame = true;
      });
    },
    showRule(row) {
      const raceTypeId = row.settlementRuleId;
      queryRule(raceTypeId).then((response) => {
        const ruleListById = response.data;
        // if (ruleListById.bonusType == 0) {
        //   ruleListById.bonusTypeName = "按擊殺人數個數結算獎金";
        // } else if (ruleListById.bonusType == 1) {
        //   ruleListById.bonusTypeName = "按比賽場次勝利一方結算獎金";
        // } else if (ruleListById.bonusType == 2) {
        //   ruleListById.bonusTypeName = "自定義結算規則";
        // }
        let obj1 = this.bonusTypeList.find(
          (item2) => item2.dictValue == ruleListById.bonusType
        );
        ruleListById.bonusTypeName = obj1 ? obj1.dictLabel : "";

        this.ruleListById = response.data;

        this.DialogVisibleRule = true;
      });
    },

    /*选择logo*/
    handleAvatarSuccess(res, file) {
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    /**上传图片**/
    async upLoadRequest({ file }) {
      let url = await this.$putOssImg(file);
      this.form.raceTypeCover = url;
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表單重置
    reset() {
      this.form = {
        raceTypeId: null,
        raceTypeName: null,
        raceScheduleId: null,
        raceScheduleText: null,
        supportGameId: null,
        supportGameText: null,
        settlementRuleId: null,
        settlementRuleText: null,
        raceTypeCover: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        status: 0,
        type: null,
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
      this.ids = selection.map((item) => item.raceTypeId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      if (!this.scheduleList) {
        this.getRuleList();
        this.getGameList();
        this.getScheduleList();
      }

      this.reset();
      this.open = true;
      this.title = "添加賽事種類";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      if (!this.scheduleList) {
        this.getRuleList();
        this.getGameList();
        this.getScheduleList();
      }

      this.reset();
      const raceTypeId = row.raceTypeId || this.ids;
      getType(raceTypeId).then((response) => {
        this.form = response.data;

        this.open = true;
        this.title = "修改賽事種類";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.raceTypeId != null) {
            updateType(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addType(this.form).then((response) => {
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
      const raceTypeIds = row.raceTypeId || this.ids;
      this.$confirm(
        '是否確认删除賽事種類編號为"' + raceTypeIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delType(raceTypeIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否確认导出所有賽事種類数据项?", "警告", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportType(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
  },
};
</script>
<style >
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 160px;
  height: 160px;
  line-height: 160px;
  text-align: center;
}
.avatar {
  width: 160px;
  height: 160px;
  display: block;
}
p {
  margin: 0;
  padding: 0;
}
.el-input.is-disabled .el-input__inner {
  background: #fff;
  color: #606266;
}
</style>