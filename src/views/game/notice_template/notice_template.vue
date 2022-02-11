<template>
  <div class="app-container">
    <!-- 查询 -->
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="範本標題" prop="templateTitle">
        <el-input
          v-model="queryParams.templateTitle"
          placeholder="請輸入範本標題"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="範本類型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="請選擇範本類型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
            class="el-option"
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
    <!-- 操作 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['opt:template:add']"
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
          v-hasPermi="['opt:template:edit']"
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
          v-hasPermi="['opt:template:remove']"
          >删除</el-button
        >
      </el-col>

      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="templateList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="編號" align="center" prop="noticeTemplateId" />
      <el-table-column label="範本標題" align="center" prop="templateTitle" />
      <el-table-column label="範本內容" align="center" prop="templateContent" />
      <el-table-column label="範本類型" align="center" prop="typeName" />
      <el-table-column label="創建人" align="center" prop="createBy" />

      <el-table-column label="創建時間" align="center" prop="createTime" />
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
            v-hasPermi="['opt:template:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:template:remove']"
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

    <!-- 添加或修改通知模板对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="範本標題" prop="templateTitle">
          <el-input v-model="form.templateTitle" placeholder="請輸入範本標題" />
        </el-form-item>
        <el-form-item label="範本內容">
          <editor v-model="form.templateContent" :min-height="192" />
        </el-form-item>

        <el-form-item label="範本類型" prop="type">
          <el-select v-model="form.type" placeholder="請選擇範本類型">
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
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
  listTemplate,
  getTemplate,
  delTemplate,
  addTemplate,
  updateTemplate,
  exportTemplate,
} from "@/api/game/notice_template";
import Editor from "@/components/Editor";

export default {
  name: "Template",
  components: {
    Editor,
  },
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
      // 通知模板表格数据
      templateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        templateTitle: null,
        templateContent: null,
        status: null,
        type: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        templateTitle: [
          { required: true, message: "範本標題不能為空", trigger: "blur" },
        ],
        templateContent: [
          { required: true, message: "範本內容不能為空", trigger: "blur" },
        ],
        type: [
          {
            required: true,
            message: "請選擇範本類型",
            trigger: "change",
          },
        ],
      },
      statusOptions: [],
    };
  },
  created() {
    this.getStatus(() => {
      this.getList();
    });
  },
  methods: {
    /** 查询通知模板列表 */
    getList() {
      this.loading = true;
      listTemplate(this.queryParams).then((response) => {
        response = response.data;
        let statusOptions = this.statusOptions;
        response.rows.forEach((item) => {
          let obj = statusOptions.find((item2) => item2.dictValue == item.type);
          item.typeName = obj.dictLabel;
        });
        this.templateList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getStatus(cb) {
      this.getDicts("notice_template_status").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions = response.data;
        cb();
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
        noticeTemplateId: null,
        templateTitle: null,
        templateContent: null,
        createTime: null,
        createBy: null,
        status: 0,
        updateBy: null,
        updateTime: null,
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
      this.ids = selection.map((item) => item.noticeTemplateId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加通知範本";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const noticeTemplateId = row.noticeTemplateId || this.ids;
      getTemplate(noticeTemplateId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改通知範本";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.noticeTemplateId != null) {
            updateTemplate(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTemplate(this.form).then((response) => {
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
      const noticeTemplateIds = row.noticeTemplateId || this.ids;
      this.$confirm(
        '是否確認删除通知範本編號為"' + noticeTemplateIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delTemplate(noticeTemplateIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    }
  },
};
</script>