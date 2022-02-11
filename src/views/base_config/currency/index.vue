<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      v-show="showSearch"
      :inline="true"
    >
      <el-form-item label="遊戲幣名稱" prop="gameCurrencyName">
        <el-input
          v-model="queryParams.gameCurrencyName"
          placeholder="請輸入遊戲幣名稱"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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

    <el-row :gutter="10" class="mb8" v-if="dataList.length == 0">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:role:add']"
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
          v-hasPermi="['system:role:edit']"
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
          v-hasPermi="['system:role:remove']"
          >删除</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="編號" prop="gameCurrencyId" align="center" />
      <el-table-column
        label="遊戲幣名稱"
        prop="gameCurrencyName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="比率(1 : 5)" prop="ratio" />
      <!-- <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column> -->
      <el-table-column label="創建時間" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
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
            v-hasPermi="['system:role:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:role:remove']"
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="遊戲幣" prop="gameCurrencyName">
              <el-input
                v-model="form.gameCurrencyName"
                placeholder="請輸入遊戲幣名稱"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="比例" prop="ratio">
              <el-input
                v-model="form.ratio"
                type="number"
                placeholder="請輸入比例(1:1)"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- <el-row>
          <el-col :span="12">
             <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{dict.dictLabel}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm('form')">確 定</el-button>

        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCurrentList,
  addCurrent,
  deleteCurrent,
  getCurrentById,
  updateCurrent,
} from "@/api/game/currency";
import { getSelectGame } from "@/api/game/game";
import { upLoadImg } from "@/api/common/common";
export default {
  name: "Role",
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
      //数据列表
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 弹窗的类型-add,edit
      dialogType: "add",
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        gameCurrencyName: null,
        ratio: null,
        status: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        gameCurrencyName: [
          { required: true, message: "遊戲幣名稱不能為空", trigger: "blur" },
        ],
        ratio: [
          { required: true, message: "比率(1 : 5)不能为空", trigger: "blur" },
        ],
        status: [
          { required: true, message: "0正常 1删除不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      getCurrentList(this.queryParams).then((response) => {
        response = response.data;
        this.dataList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    // 状态修改
    handleStatusChange(row) {
      this.getDetailById(row.gameCurrencyId);
      this.form.gameCurrencyId = row.gameCurrencyId;
      let text = row.status === "0" ? "啟用" : "停用";
      this.$confirm(
        '確認要"' + text + '""' + row.gameCurrencyName + '"狀態嗎?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.updateCurrentGame(row.status, row);
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
    // 表單重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }

      this.form = {
        gameCurrencyId: undefined,
        status: "0",
        gameCurrencyName: undefined,
        ratio: undefined,
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加遊戲幣";
      this.dialogType = "add";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.title = "修改遊戲幣";
      this.open = true;
      this.isUpdate = true;
      this.getDetailById(row.gameCurrencyId);
      this.form.gameCurrencyId = row.gameCurrencyId;
      this.dialogType = "edit";
    },
    // 获取对应遊戲幣的详情
    getDetailById(gameCurrencyId = "") {
      let params = { gameCurrencyId };
      params = JSON.stringify(params);

      getCurrentById(gameCurrencyId, params).then((res) => {
        this.form = res.data;
        this.form.remark = undefined;
        this.form.status = String(res.data.status);
      });
    },

    /** 提交按钮  添加*/
    submitForm: function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let $http = this.dialogType == "add" ? addCurrent : updateCurrent;

          this.form.status = Number(this.form.status);
          $http(this.form).then((res) => {
            this.$message({
              message: res.msg,
              type: "success",
            });
            this.open = false;
            this.getList();
          });
        } else {
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.gameCurrencyId;
      let params = { gameCurrencyIds: id };
      params = JSON.stringify(params);

      this.$confirm('是否確認删除編號為"' + id + '"的遊戲幣?', "警告", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return deleteCurrent(id, params);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },

    /**修改对应的游戏内容**/
    updateCurrentGame(status, row) {
      this.form.status = Number(status);
      updateCurrent(this.form)
        .then((res) => {
          this.$message({
            message: res.msg,
            type: "success",
          });
          this.getList();
        })
        .catch((err) => {
          this.$message({
            message: "修改失敗",
            type: "error",
          });
        });
    },
  },
};
</script>

<style>
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
</style>