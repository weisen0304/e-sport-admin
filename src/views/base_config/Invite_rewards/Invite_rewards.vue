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
        prop="invitationRewardConfId"
      />
      <el-table-column
        label="邀請者獎勵門票數"
        align="center"
        prop="inviterReward"
      />
      <el-table-column
        label="被邀請者獎勵門票數"
        align="center"
        prop="inviteeReward"
      />
      <el-table-column label="創建人" align="center" prop="createBy" />

      <el-table-column label="創建時間" align="center" prop="createTime" />

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
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:conf:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改邀請獎勵配寘对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="邀請者獎勵門票數" prop="inviterReward">
          <el-input
            v-model="form.inviterReward"
            type="digit"
            @input="
              form.inviterReward = form.inviterReward.replace(/[^\d.]/g, '')
            "
            placeholder="請輸入邀请者奖励门票"
          />
        </el-form-item>
        <el-form-item label="被邀請者獎勵門票數" prop="inviteeReward">
          <el-input
            v-model="form.inviteeReward"
            @input="
              form.inviteeReward = form.inviteeReward.replace(/[^\d.]/g, '')
            "
            placeholder="請輸入被邀請者獎勵門票數"
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
} from "@/api/game/Invite_rewards";

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
      // 邀请奖励配置表格数据
      confList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        inviterReward: null,
        inviteeReward: null,
        status: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        createBy: [
          {
            required: true,
            message: "",
            trigger: "blur",
          },
        ],
        createTime: [
          {
            required: true,
            message: "",
            trigger: "blur",
          },
        ],
        status: [
          {
            required: true,
            message: "",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询邀请奖励配置列表 */
    getList() {
      this.loading = true;
      listConf(this.queryParams).then((response) => {
        response = response.data;
        response.rows.forEach((item) => {
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表單重置
    reset() {
      this.form = {
        invitationRewardConfId: null,
        inviterReward: null,
        inviteeReward: null,
        createBy: null,
        createTime: null,
        updateTime: null,
        updateBy: null,
        status: 0,
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
      this.ids = selection.map((item) => item.invitationRewardConfId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      if (this.confList.length == 0) {
        this.reset();
        this.open = true;
        this.title = "添加邀請獎勵配寘";
      } else {
        this.$message.error("只能配寘一項邀請獎勵");
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const invitationRewardConfId = row.invitationRewardConfId || this.ids;
      this.getItem(invitationRewardConfId).then((response) => {
        this.form = response;
        this.open = true;
        this.title = "修改邀請獎勵配寘";
      });
    },
    getItem(id) {
      return new Promise((resolve, reject) => {
        const target = this.confList.find((item) => {
          if (item.invitationRewardConfId == id) {
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
          if (this.form.invitationRewardConfId != null) {
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
      const invitationRewardConfIds = row.invitationRewardConfId || this.ids;
      this.$confirm(
        '是否確認删除邀請獎勵配寘編號為"' +
          invitationRewardConfIds +
          '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delConf(invitationRewardConfIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    }
  },
};
</script>
