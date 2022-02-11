<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="98px"
    >
      <el-form-item label="結算規則名稱" prop="settlementRuleName">
        <el-input
          v-model="queryParams.settlementRuleName"
          placeholder="請輸入結算規則名稱"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="結算規則類型" prop="bonusType">
        <el-select
          v-model="queryParams.bonusType"
          placeholder="請選擇結算規則類型"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['opt:rule:add']"
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
          v-hasPermi="['opt:rule:edit']"
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
          v-hasPermi="['opt:rule:remove']"
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
      :data="ruleList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="規則編號"
        align="center"
        prop="settlementRuleId"
      />
      <el-table-column
        label="結算規則名稱"
        align="center"
        prop="settlementRuleName"
      />
      <el-table-column label="結算規則類型" align="center" prop="bonusTypeName">
        <template slot-scope="scope">
          <span>{{ scope.row.bonusTypeName || "無" }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="擊殺一個人結算遊戲幣"
        align="center"
        prop="rewardAmountKillNum"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.rewardAmountKillNum || "無" }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="勝利方結算遊戲幣"
        align="center"
        prop="rewardWinSide"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.rewardWinSide || "無" }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="游戏币种"
        align="center"
        prop="gameCurrencyName"
      /> -->
      <el-table-column label="需要花費門票" align="center" prop="cost" />
      <el-table-column label="規則內容" align="center" prop="ruleContent" />
      <!-- <el-table-column label="0正常 1删除" align="center" prop="status" /> -->
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
            v-hasPermi="['opt:rule:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:rule:remove']"
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

    <!-- 添加或修改結算規則对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="155px">
        <el-form-item label="結算規則名稱" prop="settlementRuleName">
          <el-input
            v-model="form.settlementRuleName"
            placeholder="請輸入結算規則名稱"
          />
        </el-form-item>
        <el-form-item label="結算規則類型" prop="bonusType">
          <el-select v-model="form.bonusType" placeholder="請選擇結算規則類型">
            <!-- <el-option label="請選擇字典生成" value="" /> -->
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="擊殺一個人結算遊戲幣" prop="rewardAmountKillNum" v-if='form.bonusType!=1'>
          <el-input
            v-model="form.rewardAmountKillNum"
            placeholder="請輸入擊殺一個人結算遊戲幣"
          />
        </el-form-item>
        <el-form-item label="勝利方結算遊戲幣" prop="rewardWinSide" v-if='form.bonusType!=0'>
          <el-input
            v-model="form.rewardWinSide"
            placeholder="請輸入勝利方結算遊戲幣"
          />
        </el-form-item>
        <!-- <el-form-item label="勝利方結算遊戲幣" prop="gameCurrencyId">
          <el-input
            v-model="form.gameCurrencyId"
            placeholder="請輸入勝利方結算遊戲幣"
          />
        </el-form-item> -->
        <el-form-item label="結算遊戲幣種" prop="raceScheduleId">
          <el-select
            v-model="form.gameCurrencyId"
            placeholder="請選擇結算遊戲幣種"
          >
            <el-option
              v-for="dict in currentList"
              :key="dict.gameCurrencyId"
              :label="dict.gameCurrencyName"
              :value="dict.gameCurrencyId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所需花費門票" prop="cost">
          <el-input v-model="form.cost" placeholder="請輸入所需花費門票" />
        </el-form-item>
        <el-form-item label="規則內容">
          <editor v-model="form.ruleContent" :min-height="192" />
        </el-form-item>
        <!-- <el-form-item label="0正常 1删除">
          <el-radio-group v-model="form.status">
            <el-radio label="1">請選擇字典生成</el-radio>
          </el-radio-group>
        </el-form-item> -->
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
  listRule,
  getRule,
  delRule,
  addRule,
  updateRule,
  exportRule,
} from "@/api/game/settlement_rule";
import { getCurrentList } from "@/api/game/currency";

import Editor from "@/components/Editor";

export default {
  name: "Rule",
  components: {
    Editor,
  },
  data() {
    return {
      currentList: null,
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
      // 結算規則表格数据
      ruleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        settlementRuleName: null,
        bonusType: null,
        rewardAmountKillNum: null,
        rewardWinSide: null,
        gameCurrencyId: null,
        cost: null,
        ruleContent: null,
        status: null,
      },
      // 表單参数
      form: {},

      rules: {
        settlementRuleName: [
          { required: true, message: "結算規則名稱不能為空", trigger: "blur" },
        ],
        bonusType: [
          {
            required: true,
            message: "結算規則類型",
            trigger: "change",
          },
        ],
        gameCurrencyId: [
          {
            required: true,
            message: "結算規則類型",
            trigger: "blur",
          },
        ],
        cost: [
          {
            required: true,
            message: "需要花費多少遊戲幣不能為空",
            trigger: "blur",
          },
        ],

        ruleContent: [
          { required: true, message: "規則內容不能為空", trigger: "blur" },
        ],
      },
      statusOptions: null,
    };
  },
  created() {
    this.getBonusType(() => {
      this.getList();
    });
  },
  // bonus_type
  methods: {
    /** 查询結算規則列表 */

    getList() {
      this.loading = true;
      listRule(this.queryParams).then((response) => {
        response = response.data;
        let rows = response.rows;
        rows.forEach((item) => {
          let obj1 = this.statusOptions.find(
            (item2) => item2.dictValue == item.bonusType
          );
          item.bonusTypeName = obj1 ? obj1.dictLabel : "";
        });
        this.ruleList = rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getBonusType(cb) {
      this.getDicts("bonus_type").then((response) => {
        const statusList = response.data;
        statusList.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions = statusList;
        if (cb) {
          cb();
        }
      });
    },
    /** 查询列表 */
    handelGetCurrentList() {
      getCurrentList({
        pageNum: 1,
        pageSize: 1000,
      }).then((response) => {
        response = response.data;
        this.currentList = response.rows;
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
        settlementRuleId: null,
        settlementRuleName: null,
        bonusType: null,
        rewardAmountKillNum: null,
        rewardWinSide: null,
        gameCurrencyId: null,
        cost: null,
        ruleContent: null,
        createTime: null,
        createBy: null,
        status: 0,
        updateBy: null,
        updateTime: null,
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
      this.ids = selection.map((item) => item.settlementRuleId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加結算規則";
      this.handelGetCurrentList();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const settlementRuleId = row.settlementRuleId || this.ids;
      getRule(settlementRuleId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改結算規則";
        if (!this.currentList) {
          this.handelGetCurrentList();
        }
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.settlementRuleId != null) {
            updateRule(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRule(this.form).then((response) => {
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
      const settlementRuleIds = row.settlementRuleId || this.ids;
      this.$confirm(
        '是否確認删除結算規則編號為"' + settlementRuleIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delRule(settlementRuleIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    }
  },
};
</script>
