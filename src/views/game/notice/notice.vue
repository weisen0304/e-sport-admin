<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="98px"
    >
      <el-form-item label="通知種類" prop="noticeType">
        <el-select
          v-model="queryParams.noticeType"
          placeholder="請選擇消息種類"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in TypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="通知標題" prop="noticeTitle">
        <el-input
          v-model="queryParams.noticeTitle"
          placeholder="請輸入通知標題"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="關聯消息範本" prop="noticeTemplateId">
        <el-select
          v-model="queryParams.noticeTemplateId"
          filterable
          placeholder="請選擇關聯消息範本"
        >
          <el-option
            v-for="dict in templateList"
            :key="dict.noticeTemplateId"
            :label="dict.templateTitle"
            :value="dict.noticeTemplateId"
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
          v-hasPermi="['opt:notice:add']"
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
          v-hasPermi="['opt:notice:edit']"
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
          v-hasPermi="['opt:notice:remove']"
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
      :data="noticeList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="編號" align="center" prop="noticeId" />
      <!-- 消息种类(0: 通知, 1: 个人通知, 2: 活动弹框) -->
      <el-table-column label="通知種類" align="center" prop="typeName" />
     
      <el-table-column label="通知標題" align="center" prop="noticeTitle">
        <template slot-scope="scope">
          <span>{{ scope.row.noticeTitle || "無" }}</span>
        </template>
      </el-table-column>
     
      <el-table-column
        label="推送時間"
        align="center"
        prop="pushTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.pushTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
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
            v-hasPermi="['opt:notice:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-info"
            @click="handleDetail(scope.row)"
            v-hasPermi="['opt:notice:edit']"
            >詳情</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:notice:remove']"
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

    <!-- 添加或修改平台消息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="通知種類" prop="noticeType" :key="1">
          <el-select v-model="form.noticeType" placeholder="請選擇通知種類">
            <el-option
              v-for="dict in TypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="通知標題"
          prop="noticeTitle"
          :key="2"
          v-if="form.noticeType == 2"
        >
          <el-input v-model="form.noticeTitle" placeholder="請輸入通知標題" />
        </el-form-item>
        <el-form-item label="通知内容" v-if="form.noticeType == 2">
          <editor
            v-model="form.noticeContent"
            :min-height="192"
            v-if="form.noticeType == 2"
          />
        </el-form-item>
        <el-form-item
          label="關聯消息範本"
          prop="noticeTemplateId"
          v-if="form.noticeType == 1"
          :key="3"
        >
          <el-select
            v-model="form.noticeTemplateId"
            placeholder="請選擇關聯消息範本"
            filterable
          >
            <el-option
              v-for="dict in templateList"
              :key="dict.noticeTemplateId"
              :label="dict.templateTitle"
              :value="dict.noticeTemplateId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="推送玩家"
          prop="playerId"
          v-if="form.noticeType == 1"
          :key="4"
        >
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
        <el-form-item
          label="推送時間"
          prop="pushTime"
          :key="5"
          v-if="form.noticeType == 2"
        >
          <el-date-picker
            clearable
            size="small"
            v-model="form.pushTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="請選擇推送時間"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">確 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 詳情 -->
    <el-dialog
      title="詳情"
      :visible.sync="openDetail"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="通知種類" prop="noticeType" :key="1">
          <el-select
            v-model="form.noticeType"
            placeholder="請選擇消息種類"
            disabled
          >
            <el-option
              v-for="dict in TypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="通知標題"
          prop="noticeTitle"
          :key="2"
          v-if="form.noticeType == 2"
        >
          <el-input
            v-model="form.noticeTitle"
            placeholder="請輸入通知標題"
            disabled
          />
        </el-form-item>
        <el-form-item label="通知内容" v-if="form.noticeType == 2">
          <div v-html="form.noticeContent"></div>
        </el-form-item>
        <el-form-item
          label="關聯消息範本"
          prop="noticeTemplateId"
          v-if="form.noticeType == 1"
          :key="3"
        >
          <el-select
            v-model="form.noticeTemplateId"
            placeholder="請選擇關聯消息範本"
            filterable
            disabled
          >
            <el-option
              v-for="dict in templateList"
              :key="dict.noticeTemplateId"
              :label="dict.templateTitle"
              :value="dict.noticeTemplateId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="推送玩家"
          prop="playerId"
          v-if="form.noticeType == 1"
          :key="4"
        >
          <el-select v-model="form.playerId" placeholder="請選擇玩家" disabled>
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
        <el-form-item
          label="推送時間"
          prop="pushTime"
          :key="5"
          v-if="form.noticeType == 2"
        >
          <el-date-picker
            clearable
            size="small"
            v-model="form.pushTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="請選擇推送時間"
            disabled
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormDetail">確 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listNotice,
  getNotice,
  delNotice,
  addNotice,
  updateNotice,
  exportNotice,
} from "@/api/game/notice";
import Editor from "@/components/Editor";
import { listTemplate } from "@/api/game/notice_template";
import { listPlayer, handlePlayer } from "@/api/game/player";

export default {
  name: "Notice",
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
      // 平台消息表格数据
      noticeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeType: null,
        noticeContent: null,
        noticeTitle: null,
        noticeTemplateId: null,
        status: null,
        pushTime: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        noticeType: [
          {
            required: true,
            message: "請輸入通知種類",
            trigger: "change",
          },
        ],
       
        pushTime: [
          { required: true, message: "推送時間不能为空", trigger: "blur" },
        ],
      },
      TypeOptions: [],
      templateList: [], //消息模板
      playerList: [], //玩家列表
      openDetail: false,
    };
  },
  created() {
    this.getType(() => {
      this.getList();
    });
    // this.getNoticeTemplateStatus(() => {
    this.getNoticeTemplateList();
    this.getPlayerList();
    // });
  },
  watch: {
    noticeList(newval) {
    },
  },
  methods: {
    /** 查询平台消息列表 */
    getList() {
      this.loading = true;
      listNotice(this.queryParams).then((response) => {
        response = response.data;
        response.rows.forEach((item) => {
          let obj = this.TypeOptions.find(
            (item2) => item2.dictValue == item.noticeType
          );
          if (obj) {
            item.typeName = obj.dictLabel;
          }

          let obj2 = this.templateList.find(
            (item2) => item2.dictValue == item.noticeType
          );
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
        this.noticeList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    p(s) {
      return s < 10 ? "0" + s : s;
    },
    getNoticeTemplateStatus(cb) {
      this.getDicts("notice_template_status").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions = response.data;
        cb();
      });
    },
    // 待修改queryParams
    getNoticeTemplateList() {
      listTemplate({
        pageNum: 1,
        pageSize: 1000,
      }).then((response) => {
        response = response.data;
        this.templateList = response.rows;
      });
    },
    // 待修改queryParams
    getPlayerList() {
      listPlayer({
        pageNum: 1,
        pageSize: 1000,
      }).then((response) => {
        let resultData = response.data;
        let playerList = resultData.rows;
        this.playerList = playerList;
      });
    },
    getType(cb) {
      this.getDicts("notice_type").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.TypeOptions = response.data;
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
        noticeId: null,
        noticeType: null,
        noticeContent: null,
        noticeTitle: null,
        noticeTemplateId: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        status: 0,
        pushTime: null,
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
      this.ids = selection.map((item) => item.noticeId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加平臺消息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const noticeId = row.noticeId;
      this.getItem(noticeId).then((response) => {
        this.form = response;

        this.open = true;
        this.title = "修改平臺消息";
      });
    },
    handleDetail(row) {
      this.reset();
      const noticeId = row.noticeId;
      this.getItem(noticeId).then((response) => {
        this.form = response;
        this.openDetail = true;
      });
    },
    getItem(id) {
      return new Promise((resolve, reject) => {
        let target;
        this.noticeList.forEach((item) => {
          if (item.noticeId == id) {
            target = JSON.parse(JSON.stringify(item));
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
          if (this.form.noticeId != null) {
            updateNotice(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addNotice(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    submitFormDetail() {
      this.openDetail = false;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const noticeIds = row.noticeId || this.ids;
      this.$confirm(
        '是否確認删除平臺消息編號為"' + noticeIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delNotice(noticeIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否確認匯出所有平臺消息資料項目?", "警告", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportNotice(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
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
.el-input.is-disabled .el-input__inner {
  background: #fff;
  color: #606266;
}
p {
  margin: 0;
  padding: 0;
}
</style>
