<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="問題" prop="problem">
        <el-input
          v-model="queryParams.problem"
          placeholder="請輸入問題"
          clearable
          size="small"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['opt:problem:add']"
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
          v-hasPermi="['opt:problem:edit']"
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
          v-hasPermi="['opt:problem:remove']"
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
      :data="problemList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="問題編號" align="center" prop="hotProblemId" />
      <el-table-column label="問題" align="center" prop="problem" />
      <el-table-column label="回答内容" align="center" prop="answer" />
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
            v-hasPermi="['opt:problem:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:problem:remove']"
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

    <!-- 添加或修改热门問題对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="問題" prop="problem">
          <el-input v-model="form.problem" placeholder="請輸入問題" />
        </el-form-item>
        <el-form-item label="回答内容" prop="answer">
          <el-input
            v-model="form.answer"
            type="textarea"
            placeholder="請輸入内容"
          />
        </el-form-item>
        <!-- <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
              :value="dict.dictValue"
            >
              {{ dict.dictLabel }}
            </el-radio>
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
  listProblem,
  getProblem,
  delProblem,
  addProblem,
  updateProblem,
  exportProblem,
} from "@/api/game/hot_problem";

export default {
  name: "Problem",
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
      // 状态数据字典
      statusOptions: [],
      // 热门問題表格数据
      problemList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        problem: null,
        answer: null,
        status: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        problem: [{ required: true, message: "問題不能為空", trigger: "blur" }],
        answer: [{ required: true, message: "問題不能為空", trigger: "blur" }],
        
      },
    };
  },
  created() {
    this.getDicts("game_problem_status").then((response) => {
      const list = response.data;
      list.forEach((element) => {
        element.dictValue = parseInt(element.dictValue);
      });
      this.statusOptions = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询热门問題列表 */
    getList() {
      this.loading = true;
      listProblem(this.queryParams).then((response) => {
        response = response.data;

        this.problemList = response.rows;
        this.total = response.total;
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
        hotProblemId: null,
        problem: null,
        answer: null,
        createBy: null,
        createTime: null,
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
      this.ids = selection.map((item) => item.hotProblemId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加熱門問題";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const hotProblemId = row.hotProblemId || this.ids;
      getProblem(hotProblemId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改熱門問題";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.hotProblemId != null) {
            updateProblem(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProblem(this.form).then((response) => {
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
      const hotProblemIds = row.hotProblemId || this.ids;
      this.$confirm(
        '是否確認删除熱門問題編號為"' + hotProblemIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delProblem(hotProblemIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    
  },
};
</script>
