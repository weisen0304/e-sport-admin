<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="玩家ID" prop="playerId">
        <!-- <el-select v-model="queryParams.playerId" placeholder="請選擇玩家">
          <el-option
            v-for="dict in playerList"
            :key="dict.playerId"
            :label="dict.nickName"
            :value="dict.playerId"
            class="el-option"
          >
            <img :src="dict.avatar" alt="" style="width: 50px; height: 50px" />
            <span>{{ dict.nickName }}</span>
          </el-option>
        </el-select> -->
        <el-input
          type="number"
          v-model="queryParams.playerId"
          controls-position="right"
          placeholder="請輸入玩家ID"
          size="small"
        />
      </el-form-item>
      <el-form-item label="玩家昵稱" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="請輸入玩家昵稱"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="email" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="請輸入玩家email"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="狀態" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="請選擇消息種類"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
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
          @click="handleAdd()"
          v-hasPermi="['opt:ticket:add']"
          >充值門票</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['opt:ticket:edit']"
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
          v-hasPermi="['opt:ticket:remove']"
          >删除</el-button
        >
      </el-col> -->
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="ticketList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="編號" align="center" prop="playerTicketId" />
      <el-table-column label="玩家ID" align="center" prop="playerId" />
      <el-table-column label="玩家頭像" align="center" prop="avatar">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px; border-radius: 50%"
            :src="scope.row.avatar"
            fit="fill"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="玩家昵稱" align="center" prop="nickName" />

      <el-table-column label="門票餘額" align="center" prop="ticketCount" />
      <el-table-column label="狀態" align="center" prop="statusName" />
      <el-table-column label="處理人" align="center" prop="handler" />

      <el-table-column
        label="處理時間"
        align="center"
        prop="handleTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.handleTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <!-- <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['opt:ticket:add']"
            >充值門票</el-button
          > -->
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['opt:ticket:edit']"
            >充值門票</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-info"
            @click="getMingXi(scope.row)"
            v-hasPermi="['opt:ticket:edit']"
            >查看明細</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleDongJie(scope.row)"
            v-hasPermi="['opt:ticket:remove']"
            >{{ scope.row.status == 0 ? "凍結" : "解凍" }}</el-button
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
    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="充值玩家" prop="playerId">
          <el-select
            v-model="form.playerId"
            placeholder="請選擇玩家"
            :disabled="form.hasPlayer"
          >
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
        <el-form-item label="充值金額" prop="ticketCount">
          <el-input-number
            class="custom-number"
            style="text-align: left"
            v-model="form.ticketCount"
            controls-position="right"
            placeholder="請輸入充值金額"
            :precision="2"
          />
        </el-form-item>
        <el-form-item label="門票個數" prop="topUpAmount">
          <el-input-number
            class="custom-number"
            style="text-align: left"
            v-model="form.topUpAmount"
            controls-position="right"
            placeholder="請輸入門票個數"
            :precision="0"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">確 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 明細 -->
    <el-dialog
      :title="title"
      :visible.sync="openDetail"
      width="1200px"
      append-to-body
    >
      <el-table v-loading="loading" :data="listMingXi">
        <!-- <el-table-column label="編號" align="center" prop="playerTicketId" /> -->
        <el-table-column label="類型" align="center" prop="status">
          <template slot-scope="scope">
            <span>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收入門票來源" align="center" prop="incomeFrom">
          <template slot-scope="scope">
            <span>{{ scope.row.incomeFrom || "無" }}</span>
          </template></el-table-column
        >
        <el-table-column label="收入門票張數" align="center" prop="incomeCount">
          <template slot-scope="scope">
            <span>{{ scope.row.incomeCount || "無" }}</span>
          </template></el-table-column
        >
        <el-table-column label="支出門票種類" align="center" prop="payType">
          <template slot-scope="scope">
            <span>{{ scope.row.payType || "無" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支出門票張數" align="center" prop="payCount">
          <template slot-scope="scope">
            <span>{{ scope.row.payCount || "無" }}</span>
          </template></el-table-column
        >
        <el-table-column label="創建時間" align="center" prop="createTime">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime || "無" }}</span>
          </template></el-table-column
        >
      </el-table>
      <pagination
        v-show="totalDetail > 0"
        :total="totalDetail"
        :page.sync="queryParamsDetail.pageNum"
        :limit.sync="queryParamsDetail.pageSize"
        @pagination="getMingXi"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormDetail">確 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listTicket,
  getTicket,
  delTicket,
  addRecharge,
  exportTicket,
  dongJieTicket,
  jieDongTicket,
  listMingXiTicket,
} from "@/api/game/ticket";
import { listPlayer } from "@/api/game/player";
export default {
  name: "Ticket",
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
      // 【请填写功能名称】表格数据
      ticketList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        playerId: null,
        nickName: null,
        email: null,
        status: null,
      },
      queryParamsDetail: {
        pageNum: 1,
        pageSize: 10,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        playerId: [
          { required: true, message: "請選擇充值玩家", trigger: "change" },
        ],
        ticketCount: [
          { required: true, message: "請輸入充值金額", trigger: "blur" },
        ],
        topUpAmount: [
          { required: true, message: "請輸入門票個數", trigger: "blur" },
        ],
      },
      statusOptions: [],
      playerList: null,
      openDetail: false,
      listMingXi: [], //明細列表
      totalDetail: 0,
      statusOptions_type: null,
      statusOptions_incomeFrom: null,
      statusOptions_payType: null,
      playerDetailId: 0,
    };
  },
  created() {
    this.getStatus(() => {
      this.getList();
    });

    this.getPlayerList();
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      listTicket(this.queryParams).then((response) => {
        response = response.data;
        response.rows.forEach((item) => {
          let d = new Date(item.handleTime);
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
          item.handleTime = resDate + " " + resTime;

          let obj = this.statusOptions.find((item2) => {
            if (item2.dictValue == item.status) {
              return true;
            }
          });
          if (obj) {
            item.statusName = obj.dictLabel;
          }
        });
        this.ticketList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    p(s) {
      return s < 10 ? "0" + s : s;
    },
    getStatus(cb) {
      this.getDicts("ticket_status").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions = response.data;
        cb();
      });
    },
    // 获取玩家列表
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
    // 明細類型
    getStatus1(cb) {
      if (this.statusOptions_type) {
        cb();
        return;
      }
      this.getDicts("playticket_status").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions_type = response.data;
        cb();
      });
    },
    // 收入門票來源
    getStatus2(cb) {
      if (this.statusOptions_incomeFrom) {
        cb();
        return;
      }
      this.getDicts("ticket_incomefrom").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions_incomeFrom = response.data;
        cb();
      });
    },
    // 支出門票種類
    getStatus3(cb) {
      if (this.statusOptions_payType) {
        cb();
        return;
      }
      this.getDicts("ticket_paytype").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions_payType = response.data;
        cb();
      });
    },
    // 明細
    getMingXi(row) {
      if (row.playerId) {
        this.playerDetailId = row.playerId;
      }
      this.getStatus1(() => {
        this.getStatus2(() => {
          this.getStatus3(() => {
            listMingXiTicket(this.playerDetailId, this.queryParamsDetail).then(
              (res) => {
                let list = res.data.rows;
                list.forEach((item) => {
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
                  let obj1 = this.statusOptions_type.find(
                    (item2) => item2.dictValue == item.type
                  );
                  item.type = obj1 ? obj1.dictLabel : "";
                  if (item.incomeFrom) {
                    let obj2 = this.statusOptions_incomeFrom.find(
                      (item2) => item2.dictValue == item.incomeFrom
                    );
                    item.incomeFrom = obj2 ? obj2.dictLabel : "";
                  }
                  if (item.payType) {
                    let obj3 = this.statusOptions_payType.find(
                      (item2) => item2.dictValue == item.payType
                    );

                    item.payType = obj3 ? obj3.dictLabel : "";
                  }
                });
                this.listMingXi = list;
                this.openDetail = true;
                this.title = "明細";

                this.totalDetail = res.data.total;
                this.loading = false;
              }
            );
          });
        });
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
        playerTicketId: null,
        playerId: null,
        ticketCount: null,
        handleTime: null,
        handler: null,
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
      this.ids = selection.map((item) => item.playerTicketId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd(item) {
      this.reset();

      if (item) {
        console.log("item", item);
        let playerId = item.playerId;
        this.form.playerId = playerId;
        this.form.hasPlayer = true;
      } else {
        this.form.hasPlayer = false;
      }
      this.open = true;
      this.title = "充值門票";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const playerTicketId = row.playerTicketId || this.ids;
      getTicket(playerTicketId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          addRecharge(this.form).then((response) => {
            this.msgSuccess("充值成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    submitFormDetail() {
      this.openDetail = false;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const playerTicketIds = row.playerTicketId || this.ids;
      this.$confirm(
        '是否確認删除編號為"' + playerTicketIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delTicket(playerTicketIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    handleDongJie(row) {
      const playerTicketIds = row.playerTicketId;
      const status = row.status;
      if (status == 1) {
        this.jiedong(playerTicketIds);
      } else {
        this.dongjie(playerTicketIds);
      }
    },
    dongjie(playerTicketIds) {
      this.$confirm(
        '是否確認凍結編號為"' + playerTicketIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return dongJieTicket(playerTicketIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("凍結成功");
        });
    },
    jiedong(playerTicketIds) {
      this.$confirm(
        '是否確認解凍編號為"' + playerTicketIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return jieDongTicket(playerTicketIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("解凍成功");
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

.custom-number .el-input__inner {
  text-align: left;
}
</style>
