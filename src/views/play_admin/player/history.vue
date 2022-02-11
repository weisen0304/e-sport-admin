<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="historyList">
      <el-table-column
        label="赛事房间id"
        width="100"
        align="center"
        prop="raceRoomId"
      >
        <template slot-scope="scope">
          <div style="color: #409eff">
            {{ scope.row.raceRoomId }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="对应结算规则"
        align="center"
        prop="settlementRuleName"
      >
        <template slot-scope="scope">
          <div style="color: #409eff">
            {{ scope.row.settlementRuleName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="竞赛时间" align="center" prop="createTime" />
      <el-table-column
        label="赛事房间状态"
        align="center"
        prop="raceRoomStatusName"
      />
      <el-table-column label="玩家竞赛明细" align="center">
        <template slot-scope="scope">
          <div
            style="color: #409eff"
            @click="getDetail(scope.row)"
            v-if="scope.row.raceRoomStatus == 4"
          >
            查看
          </div>
          <div
            style="color: #409eff"
            @click="handelResult(scope.row)"
            v-if="scope.row.raceRoomStatus == 3"
          >
            處理
          </div>
          <div
            style="color: #409eff"
            @click="getCancelDetail(scope.row)"
            v-if="scope.row.raceRoomStatus == 5"
          >
            查看
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="totalNum > 0"
      :total="totalNum"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 查看详情 -->
    <el-dialog
      title="查看"
      :visible.sync="openDetail"
      width="500px"
      append-to-body
    >
      <el-form ref="detail" :model="detail" label-width="120px">
        <el-form-item label="比賽結果">
          <el-input v-model="detail.gameResultName" disabled></el-input>
        </el-form-item>
        <el-form-item label=" 競賽開始時間">
          <el-input v-model="detail.gameStartTime" disabled></el-input>
        </el-form-item>
        <el-form-item label=" 競賽結束時間">
          <el-input v-model="detail.gameEndTime" disabled></el-input>
        </el-form-item>
        <el-form-item label="錄入人">
          <el-input v-model="detail.createBy" disabled></el-input>
        </el-form-item>
        <el-form-item label=" 記錄時間">
          <el-input v-model="detail.createTime" disabled></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeDetail">確 定</el-button>
      </div>
    </el-dialog>
    <!-- 處理 -->
    <el-dialog
      title="處理"
      :visible.sync="handelResiltDialog"
      width="500px"
      append-to-body
    >
      <el-form ref="resultForm" :model="resultObj" label-width="120px">
        <el-form-item label="比賽結果">
          <el-select
            v-model="resultObj.gameResult"
            placeholder="請選擇比賽結果"
          >
            <el-option
              v-for="dict in resultList"
              :key="dict.name"
              :label="dict.name"
              :value="dict.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handelResultHttp">確 定</el-button>
      </div>
    </el-dialog>
    <!-- 作废详情 -->
    <el-dialog
      :title="title"
      :visible.sync="openCancelDetail"
      width="500px"
      append-to-body
    >
      <el-form ref="detail" :model="cancellationReason" label-width="120px">
        <!-- <el-form-item label="競賽開始時間">
          <el-input
            v-model="cancellationReason.gameStartTime"
            disabled
          ></el-input>
        </el-form-item> -->
        <el-form-item label="作廢原因">
          <el-input
            v-model="cancellationReason.reason"
            disabled
            type="textarea"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeCancelDetail">確 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCompetitionHistory,
  reqDetail,
  reqHandleResult,
  reqCancellationReason,
} from "@/api/game/player";
export default {
  name: "Goods",
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
      totalNum: 10,
      // 商品表格数据
      historyList: [],
      // 弹出层标题
      title: "",
      //是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        playerId: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        goodsName: [
          { required: true, message: "商品名称不能为空", trigger: "blur" },
        ],
        goodsStock: [
          { required: true, message: "库存数量不能为空", trigger: "blur" },
        ],
        goodsAmount: [
          { required: true, message: "商品费用 (币)不能为空", trigger: "blur" },
        ],
        createTime: [
          { required: true, message: "上架时间不能为空", trigger: "blur" },
        ],
        gameCurrencyId: [
          { required: true, message: "請選擇游戏币", trigger: "change" },
        ],
        status: [
          { required: true, message: "請選擇商品状态", trigger: "change" },
        ],
        createBy: [
          { required: true, message: "添加商品人员不能为空", trigger: "blur" },
        ],
      },
      statusOptions: [],
      openDetail: false,
      detail: {
        gameResult: "",
        gameStartTime: "",
        gameEndTime: "",
        createBy: "",
        createTime: "",
      },
      handelResiltDialog: false,
      resultObj: {
        gameResult: "",
      },
      resultList: [
        { name: "勝利", value: 1 },
        { name: "失敗", value: 0 },
      ],
      openCancelDetail: false,
      cancellationReason: {
        reason: "",
      },
    };
  },
  async created() {
    const playerId = this.$route.params.playerId;
    this.queryParams.playerId = playerId;
    await this.getStatus();
    this.getList();
  },
  methods: {
    // detail
    async getDetail(row) {
      console.log("row", row);
      const { data } = await reqDetail({
        playerId: this.queryParams.playerId,
        raceRoomId: row.raceRoomId,
      });
      data.gameStartTime = this.handelTime(data.gameStartTime);
      data.gameEndTime = this.handelTime(data.gameEndTime);
      data.createTime = this.handelTime(data.createTime);
      if (data.gameResult == 0) {
        data.gameResultName = "失敗";
      } else {
        data.gameResultName = "勝利";
      }
      this.detail = data;
      this.openDetail = true;
    },
    closeDetail() {
      this.openDetail = false;
    },
    // 處理
    handelResult(row) {
      this.resultObj.raceRoomId = row.raceRoomId;
      this.handelResiltDialog = true;
    },
    async handelResultHttp() {
      console.log(this.resultObj.gameResult);
      if (this.resultObj.gameResult === "") {
        return this.msgError("請選擇比賽結果");
      } else {
        await reqHandleResult({
          ...this.resultObj,
          playerId: this.queryParams.playerId,
        });
        this.msgSuccess("處理成功");

        this.handelResiltDialog = false;
        this.resultObj = {
          gameResult: "",
        };
      }
    },
    getCancelDetail(row) {
      this.openCancelDetail = true;
      this.getCancellationReason(row.raceRoomId);
    },
    async getCancellationReason(raceRoomId) {
      let { data } = await reqCancellationReason({
        raceRoomId,
      });
      console.log("data", data);
      if ((data = 1)) {
        // Alfred:
        // 1: 赛事内有玩家未綁定Open ID導致賽事作廢！
        // 2: 传说对决中未满员导致作废!
        // 3: 传说对决中的队伍阵营与E-Sports中的队伍阵营不一致/存在外部选手导致作废!
        data = "赛事内有玩家未綁定Open ID導致賽事作廢！";
      } else if (data == 2) {
        data = "传说对决中未满员导致作废!";
      } else if (data == 3) {
        data =
          "传说对决中的队伍阵营与E-Sports中的队伍阵营不一致/存在外部选手导致作废!";
      }
      console.log("data", data);

      this.cancellationReason.reason = data;
    },
    closeCancelDetail() {
      this.openCancelDetail = false;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      getCompetitionHistory(this.queryParams).then((response) => {
        this.loading = false;
        response = response.data;
        response.rows.forEach((item) => {
          if (item.createTime) {
            item.createTime = this.handelTime(item.createTime);
          }
          let obj = this.statusOptions.find((item2) => {
            if (item2.dictValue == item.raceRoomStatus) {
              return true;
            }
          });
          if (obj) {
            item.raceRoomStatusName = obj.dictLabel;
          }
        });
        this.historyList = response.rows;

        this.totalNum = response.total;
      });
    },

    getStatus(cb) {
      return new Promise((resolve, reject) => {
        this.getDicts("match-room-status").then((response) => {
          const list = response.data;
          list.forEach((element) => {
            element.dictValue = parseInt(element.dictValue);
          });
          this.statusOptions = response.data;
          resolve();
        });
      });
    },

    handelTime(time) {
      let d = new Date(time);
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
      time = resDate + " " + resTime;
      return time;
    },
    p(s) {
      return s < 10 ? "0" + s : s;
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