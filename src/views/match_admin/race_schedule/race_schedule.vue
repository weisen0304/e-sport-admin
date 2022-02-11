<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="賽程名稱" prop="raceScheduleName">
        <el-input
          v-model="queryParams.raceScheduleName"
          placeholder="請輸入賽程名稱"
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
          v-hasPermi="['opt:schedule:add']"
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
          v-hasPermi="['opt:schedule:edit']"
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
          v-hasPermi="['opt:schedule:remove']"
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
      :data="scheduleList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="賽程編號" align="center" prop="raceScheduleId" />
      <el-table-column
        label="賽程名稱"
        align="center"
        prop="raceScheduleName"
      />
      <el-table-column
        label="創建房間時間(單位/秒)"
        align="center"
        prop="createGameRoomTime"
      />
      <el-table-column
        label="開始競賽時間(單位/秒)"
        align="center"
        prop="gameStartTime"
      />
      <el-table-column
        label="結束競賽時間(單位/秒)"
        align="center"
        prop="endGameTime"
      />

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
            v-hasPermi="['opt:schedule:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:schedule:remove']"
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

    <!-- 添加或修改賽程对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="賽程名稱" prop="raceScheduleName">
          <el-input
            v-model="form.raceScheduleName"
            placeholder="請輸入賽程名稱"
          />
        </el-form-item>
        <el-form-item label="創建房間時間(單位/秒)" prop="createGameRoomTime">
          <el-input
            v-model="form.createGameRoomTime"
            placeholder="請輸入創建房間時間"
          />
          <!-- <span>(單位/秒)</span> -->
        </el-form-item>
        <el-form-item label="開始競賽時間(單位/秒)" prop="gameStartTime">
          <el-input
            v-model="form.gameStartTime"
            placeholder="請輸入开始競賽時間(單位/秒)"
          />
        </el-form-item>
        <el-form-item label="結束競賽時間(單位/秒)" prop="endGameTime">
          <el-input
            v-model="form.endGameTime"
            placeholder="請輸入結束競賽時間(單位/秒)"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listSchedule,
  getSchedule,
  delSchedule,
  addSchedule,
  updateSchedule,
  exportSchedule,
} from "@/api/game/race_schedule";

export default {
  name: "Schedule",
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
      // 賽程表格数据
      scheduleList: [],
      statusOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        raceScheduleName: null,
        createGameRoomTime: null,
        gameStartTime: null,
        status: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        raceScheduleName: [
          { required: true, message: "請輸入賽程名稱", trigger: "blur" },
        ],
        createGameRoomTime: [
          {
            required: true,
            message: "創建房間時間不能為空",
            trigger: "blur",
          },
        ],
        gameStartTime: [
          {
            required: true,
            message: "開始競賽時間不能為空",
            trigger: "blur",
          },
        ],
        endGameTime: [
          {
            required: true,
            message: "結束競賽時間(單位/秒)不能為空",
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
    this.getList();
  },
  methods: {
    /** 查询賽程列表 */
    getList() {
      this.loading = true;
      listSchedule(this.queryParams).then((response) => {
        response = response.data;
        this.scheduleList = response.rows;
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
        raceScheduleId: null,
        raceScheduleName: null,
        createGameRoomTime: null,
        gameStartTime: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
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
      this.ids = selection.map((item) => item.raceScheduleId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加賽程";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const raceScheduleId = row.raceScheduleId || this.ids;
      getSchedule(raceScheduleId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改賽程";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.raceScheduleId != null) {
            updateSchedule(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSchedule(this.form).then((response) => {
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
      const raceScheduleIds = row.raceScheduleId || this.ids;
      this.$confirm(
        '是否確認删除賽程編號為"' + raceScheduleIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delSchedule(raceScheduleIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
  },
};
</script>
