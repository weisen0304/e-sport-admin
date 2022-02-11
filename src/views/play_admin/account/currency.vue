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

    <el-table
      v-loading="loading"
      :data="currencyList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="編號"
        align="center"
        prop="playerGameCurrencyId"
      />
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
      <el-table-column
        label="遊戲幣種"
        align="center"
        prop="gameCurrencyName"
      />

      <el-table-column label="遊戲幣餘額" align="center" prop="amount" />
      <el-table-column label="狀態" align="center" prop="statusName" />
      <el-table-column label="處理人" align="center" prop="updateBy">
        <template slot-scope="scope">
          <span>{{ scope.row.updateBy || "無" }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="處理時間"
        align="center"
        prop="updateTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime || "無" }}</span>
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
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleTiXian(scope.row)"
            v-hasPermi="['opt:ticket:remove']"
            >提現</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleCoin(scope.row)"
            >增加金幣</el-button
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

    <!-- 添加或修改玩家游戏币对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <div style="padding: 0px 0 20px">
          請確認好收幣機器人是否收到轉帳在錄入提款金額
        </div>
        <el-form-item label="提現金额" prop="withdrawAmount">
          <el-input
            v-model="form.withdrawAmount"
            placeholder="請輸入提現金额"
            @input="
              form.withdrawAmount = form.withdrawAmount.replace(/[^\d.]/g, '')
            "
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormTiXian">確 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改玩家游戏币对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open2"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form2" :rules="rules2" label-width="120px">
        <div style="padding: 0px 0 20px">金幣管理</div>
        <el-form-item label="增/減金幣個數" prop="withdrawAmount">
          <el-input-number
            class="custom-number"
            style="text-align: left"
            v-model="form2.currencyCount"
            controls-position="right"
            :precision="2"
            placeholder="請輸入金幣個數"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormCoin">確 定</el-button>
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
        <el-table-column
          label="遊戲幣種"
          align="center"
          prop="gameCurrencyName"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.gameCurrencyName || "無" }}</span>
          </template></el-table-column
        >
        <el-table-column
          label="收入遊戲幣來源"
          align="center"
          prop="incomeFrom"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.incomeFrom || "無" }}</span>
          </template></el-table-column
        >
        <el-table-column
          label="收入遊戲幣數量"
          align="center"
          prop="incomeAmount"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.incomeAmount || "無" }}</span>
          </template></el-table-column
        >
        <el-table-column label="支出遊戲幣種类" align="center" prop="payType">
          <template slot-scope="scope">
            <span>{{ scope.row.payType || "無" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支出遊戲幣數量" align="center" prop="payAmount">
          <template slot-scope="scope">
            <span>{{ scope.row.payAmount || "無" }}</span>
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
        <el-button type="primary" @click="submitFormDetail()">確 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCurrency,
  getCurrency,
  delCurrency,
  addCurrency,
  updateCurrency,
  inOrdeCurrency,
  exportCurrency,
  dongJieCurrency,
  jieDongCurrency,
  tiXianCurrency,
  listMingCurrency,
} from "@/api/game/currency_play";
import { listPlayer } from "@/api/game/player";
export default {
  name: "Currency",
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
      // 玩家游戏币表格数据
      currencyList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      open2: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        playerId: null,
        nickName: null,
        email: null,
        status: null,
      },
      // 表單参数
      form: {},
      form2: {
        currencyCount: 0
      },
      // 表單校验
      rules: {
        withdrawAmount: [
          { required: true, message: "請輸入提現金额", trigger: "blur" },
        ],
      },
      rules2: {
         currencyCount: [
          { required: true, message: "請輸入金幣", trigger: "blur" },
        ],
      },
      statusOptions: [],
      playerList: [],
      openTiXian: false,
      queryParamsDetail: {
        pageNum: 1,
        pageSize: 10,
      },
      openDetail: false,
      listMingXi: [],
      statusOptions_type: null,
      statusOptions_incomeFrom: null,
      statusOptions_payType: null,
      totalDetail: 0,
    };
  },
  created() {
    this.getStatus(() => {
      this.getList();
    });
    this.getPlayerList();
  },
  methods: {
    /** 查询玩家游戏币列表 */
    getList() {
      this.loading = true;
      listCurrency(this.queryParams).then((response) => {
        response = response.data;
        response.rows.forEach((item) => {
          if (item.updateTime) {
            let d = new Date(item.updateTime);
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
            item.updateTime = resDate + " " + resTime;
          }
          let obj = this.statusOptions.find((item2) => {
            if (item2.dictValue == item.status) {
              return true;
            }
          });
          if (obj) {
            item.statusName = obj.dictLabel;
          }
        });
        this.currencyList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    p(s) {
      return s < 10 ? "0" + s : s;
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
    getStatus(cb) {
      this.getDicts("playcurrency_status").then((response) => {
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
      this.getDicts("currency_status").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions_type = response.data;
        cb();
      });
    },
    // 收入遊戲幣來源
    getStatus2(cb) {
      if (this.statusOptions_incomeFrom) {
        cb();
        return;
      }
      this.getDicts("currency_incomefrom").then((response) => {
        const list = response.data;
        list.forEach((element) => {
          element.dictValue = parseInt(element.dictValue);
        });
        this.statusOptions_incomeFrom = response.data;
        cb();
      });
    },
    // 支出遊戲幣種类
    getStatus3(cb) {
      if (this.statusOptions_payType) {
        cb();
        return;
      }
      this.getDicts("currency_paytype").then((response) => {
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
            listMingCurrency(this.playerDetailId, this.queryParamsDetail).then(
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
    submitFormDetail(row) {
      this.openDetail = false;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.open2 = false;
      this.reset();
    },
    // 表單重置
    reset() {
      this.form = {
        playerGameCurrencyId: null,
        gameCurrencyId: null,
        playerId: null,
        amount: null,
        status: 0,
        updateBy: null,
        updateTime: null,
      };
      this.form2 = {
        currencyCount: 0
      };
      this.resetForm("form");
      this.resetForm("form2");
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
      this.ids = selection.map((item) => item.playerGameCurrencyId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加玩家遊戲幣";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const playerGameCurrencyId = row.playerGameCurrencyId || this.ids;
      getCurrency(playerGameCurrencyId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改玩家遊戲幣";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.playerGameCurrencyId != null) {
            updateCurrency(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCurrency(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    submitFormTiXian() {
      this.form.withdrawAmount = parseInt(this.form.withdrawAmount);
      this.$refs["form"].validate((valid) => {
        if (valid) {
          tiXianCurrency(this.form).then((response) => {
            this.msgSuccess("新增成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    submitFormCoin() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          inOrdeCurrency(this.form2).then((response) => {
            this.msgSuccess("操作成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    handleTiXian(row) {
      this.open = true;
      this.form.playerId = row.playerId;
      this.title = "提現";
    },
    handleCoin(row) {
      this.open2 = true;
      this.form2.playerId = row.playerId;
      this.title = "增加金幣";
    },
    handleDongJie(row) {
      const playerGameCurrencyId = row.playerGameCurrencyId;
      const status = row.status;
      if (status == 1) {
        this.jiedong(playerGameCurrencyId);
      } else {
        this.dongjie(playerGameCurrencyId);
      }
    },
    dongjie(playerGameCurrencyId) {
      this.$confirm(
        '是否確認凍結編號為"' + playerGameCurrencyId + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          // jieDongCurrency
          return dongJieCurrency(playerGameCurrencyId);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("凍結成功");
        });
    },
    jiedong(playerGameCurrencyId) {
      this.$confirm(
        '是否確認解凍編號為"' + playerGameCurrencyId + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return jieDongCurrency(playerGameCurrencyId);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("解凍成功");
        });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const playerGameCurrencyIds = row.playerGameCurrencyId || this.ids;
      this.$confirm(
        '是否確認删除玩家遊戲幣編號為"' +
          playerGameCurrencyIds +
          '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delCurrency(playerGameCurrencyIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
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
