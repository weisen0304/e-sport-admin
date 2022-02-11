<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="聊天内容" prop="playerId">
        <el-input
          v-model="queryParams.playerId"
          placeholder="請輸入聊天内容"
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

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['opt:msg:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['opt:msg:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['opt:msg:remove']"
        >删除</el-button>
      </el-col> -->

    <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <el-table
      v-loading="loading"
      :data="msgList"
      @selection-change="handleSelectionChange"
    >
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!-- <el-table-column label="聊天房间ID" align="center" prop="chatroomMsgId" /> -->
      <el-table-column label="玩家ID" align="center" prop="playerId" />
      <el-table-column label="玩家頭像" align="center">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px; border-radius: 50%"
            :src="scope.row.avatar"
            fit="fill"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="玩家昵稱" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nickName || "無" }}</span>
        </template>
      </el-table-column>

      <el-table-column label="聊天内容" align="center" prop="msg" />
      <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['opt:msg:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:msg:remove']"
          >删除</el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <div style="height:90px"></div>
    <!-- 添加或修改聊天大廳消息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="發送時間" prop="form.createTime">
          <el-date-picker
            v-model="form.createTime"
            type="datetime"
            placeholder="選擇日期時間"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="聊天内容" prop="msg">
          <el-input
            v-model="form.msg"
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
  listMsg,
  getMsg,
  delMsg,
  addMsg,
  updateMsg,
  exportMsg,
} from "@/api/game/chartroom";

export default {
  name: "Msg",
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
      // 聊天大厅消息表格数据
      msgList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        playerId: null,
        msg: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        playerId: [
          { required: true, message: "發送時間不能为空", trigger: "blur" },
        ],
        msg: [{ required: true, message: "聊天內容不能為空", trigger: "blur" }],
        createTime: [
          { required: true, message: "發送時間不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询聊天大厅消息列表 */
    getList() {
      this.loading = true;
      listMsg(this.queryParams).then((response) => {
        response = response.data;
        this.msgList = response.rows;
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
        chatroomMsgId: null,
        playerId: null,
        msg: null,
        createTime: null,
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
      this.ids = selection.map((item) => item.chatroomMsgId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加聊天大廳消息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const chatroomMsgId = row.chatroomMsgId || this.ids;
      getMsg(chatroomMsgId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改聊天大廳消息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.chatroomMsgId != null) {
            updateMsg(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMsg(this.form).then((response) => {
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
      const chatroomMsgIds = row.chatroomMsgId || this.ids;
      this.$confirm(
        '是否確認删除聊天大廳消息編號為"' + chatroomMsgIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delMsg(chatroomMsgIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否確認匯出所有聊天大廳消息資料項目?", "警告", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportMsg(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
  },
};
</script>