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
          v-hasPermi="['opt:config:add']"
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
          v-hasPermi="['opt:config:edit']"
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
          v-hasPermi="['opt:config:remove']"
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
      :data="configList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="客服配寘編號"
        align="center"
        prop="customerServiceConfigId"
      />
      <el-table-column label="客服對應角色" align="center" prop="statusVal" />
      <!-- <el-table-column label="0正常 1删除" align="center" prop="status" /> -->
      <el-table-column
        label="會話過期時間 (單位/分鐘)"
        align="center"
        prop="sessionExpires"
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
            v-hasPermi="['opt:config:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:config:remove']"
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

    <!-- 添加或修改客服配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="125px">
        <el-form-item label="指定客服角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="請選擇客服角色">
            <el-option
              v-for="dict in rolesLists"
              :key="dict.roleId"
              :label="dict.roleName"
              :value="dict.roleId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="會話過期時間 (單位/分鐘)" prop="sessionExpires">
          <el-input
            v-model="form.sessionExpires"
            placeholder="請輸入會話過期時間 (單位/分鐘)"
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
  listConfig,
  getConfig,
  delConfig,
  addConfig,
  updateConfig,
  exportConfig,
} from "@/api/game/kefu";
import { getRoleOptions } from "@/api/system/role";
export default {
  name: "Config",
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
      // 客服配置表格数据
      configList: [],
      // 状态数据字典
      statusOptions: [],
      // 角色字典列表
      rolesLists: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: null,
        status: null,
        sessionExpires: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        roleId: [
          { required: true, message: "指定客服角色不能為空", trigger: "blur" },
        ],
  
        sessionExpires: [
          {
            required: true,
            message: "會話過期時間 (單位/分鐘)不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getDicts("list_status").then((response) => {
      const list = response.data;
      list.forEach((element) => {
        element.dictValue = parseInt(element.dictValue);
      });
      this.statusOptions = response.data;
    });

    this.getRolesList(() => {
      this.getList();
    });
  },
  methods: {
    /** 查询客服配置列表 */
    getList() {
      this.loading = true;
      listConfig(this.queryParams).then((response) => {
        let resultData = response.data,
          statusVal = "";
        let configList = resultData.rows;

        configList.forEach((element) => {
          let status = element.roleId;

          statusVal = this.rolesLists.filter((item) => {
            return status == parseInt(item.roleId);
          });

          element.statusVal = statusVal[0].roleName;
        });

        this.configList = configList;
        this.total = resultData.total;
        this.loading = false;
      });
    },
    /**获取角色下拉列表**/
    getRolesList(callback) {
      getRoleOptions().then((response) => {
        this.rolesLists = response.data;
        callback();
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
        customerServiceConfigId: null,
        roleId: null,
        createTime: null,
        createBy: null,
        status: 0,
        updateBy: null,
        updateTime: null,
        sessionExpires: null,
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
      this.ids = selection.map((item) => item.customerServiceConfigId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加客服配寘";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const customerServiceConfigId = row.customerServiceConfigId || this.ids;
      getConfig(customerServiceConfigId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改客服配寘";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.customerServiceConfigId != null) {
            updateConfig(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addConfig(this.form).then((response) => {
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
      const customerServiceConfigIds = row.customerServiceConfigId || this.ids;
      this.$confirm(
        '是否確認删除客服配寘編號為"' + customerServiceConfigIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delConfig(customerServiceConfigIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
  
  },
};
</script>
