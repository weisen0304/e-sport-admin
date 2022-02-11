<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :span="3">
        <div class="grid-content bg-purple"></div>
      </el-col>
      <el-col :span="6"
        ><div class="grid-content bg-purple">
          <el-card class="box-card">
            <div slot="header" class="clearfix" style="text-align: center">
              <span>日匯總</span>
            </div>
            <div class="text item">
              當日收益：
              <span class="fw"> {{ info.dayOfRevenue }}</span>
            </div>
            <div class="text item">
              當日支出：
              <span class="fw"> {{ info.dayOfExpenditure }}</span>
            </div>
            <div class="text item">
              當日利潤：
              <span class="fw"> {{ info.dayOfProfits }}</span>
            </div>

            <div
              v-if="info.dayOfIncreaseOrDown == 0"
              class="flex_center row_text"
              style="color: #f31c24"
            >
              利潤較昨日增長:<img
                src="../assets/icons/top.png"
                alt=""
                style="transform: scale(0.38)"
              />
              {{ info.dayOfPercent }}%
            </div>
            <div
              v-if="info.dayOfIncreaseOrDown == 1"
              style="color: #22b14c"
              class="flex_center row_text"
            >
              利潤較昨日下降:
              <img
                src="../assets/icons/down.png"
                alt=""
                style="transform: rotate(180deg) scale(0.38)"
              />
              {{ info.dayOfPercent }}%
            </div>
            <div
              style="color: #f37c1c"
              v-if="info.dayOfIncreaseOrDown == 3"
              class="flex_center row_text"
            >
              利潤較昨日持平
            </div>
          </el-card>
        </div></el-col
      >
      <el-col :span="6"
        ><div class="grid-content bg-purple">
          <el-card class="box-card">
            <div slot="header" class="clearfix" style="text-align: center">
              <span>總匯總</span>
            </div>
            <div class="text item">
              總收益：
              <span class="fw"> {{ info.totalRevenue }}</span>
            </div>
            <div class="text item">
              總支出：
              <span class="fw"> {{ info.totalExpenditure }}</span>
            </div>
            <div class="text item">
              總利潤：
              <span class="fw"> {{ info.totalProfits }}</span>
            </div>

            <div
              class="flex_center row_text"
              v-if="
                info.monthOfIncreaseOrDown == 0 ||
                info.monthOfIncreaseOrDown == 1 ||
                info.monthOfIncreaseOrDown == 3
              "
            ></div>
          </el-card></div
      ></el-col>
      <el-col :span="6"
        ><div class="grid-content bg-purple">
          <el-card class="box-card">
            <div slot="header" class="clearfix" style="text-align: center">
              <span>月匯總</span>
            </div>
            <div class="text item">
              當月收益：
              <span class="fw"> {{ info.monthOfRevenue }}</span>
            </div>
            <div class="text item">
              當月支出：
              <span class="fw"> {{ info.monthOfExpenditure }}</span>
            </div>
            <div class="text item">
              當月利潤：
              <span class="fw"> {{ info.monthOfProfits }}</span>
            </div>
            <div
              v-if="info.monthOfIncreaseOrDown == 0"
              style="color: #f31c24"
              class="flex_center row_text"
            >
              利潤較上月增長:
              <img
                src="../assets/icons/top.png"
                alt=""
                style="transform: scale(0.38)"
              />
              {{ info.dayOfPercent }}%
            </div>
            <div
              v-if="info.monthOfIncreaseOrDown == 1"
              style="color: #22b14c"
              class="flex_center row_text"
            >
              利潤較上月下降:
              <img
                src="../assets/icons/down.png"
                alt=""
                style="transform: rotate(180deg) scale(0.38)"
              />
              {{ info.dayOfPercent }}%
            </div>
            <div
              v-if="info.monthOfIncreaseOrDown == 3"
              style="color: #f37c1c"
              class="flex_center row_text"
            >
              利潤較上月持平
            </div>
          </el-card>
        </div></el-col
      >
    </el-row>
    <div style="height: 30px"></div>
    <div class="main_box">
      <h5>指定週期報表</h5>
      <div class="picker_block">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="選擇日期">
            <el-date-picker
              v-model="daterange"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="開始日期"
              end-placeholder="結束日期"
              :picker-options="pickerOptions"
              value-format="yyyy/MM/dd"
              @change="pickerChange"
            >
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>
      <el-row :gutter="20">
        <el-col :span="3">
          <div class="grid-content bg-purple"></div>
        </el-col>
        <el-col :span="6"
          ><div class="grid-item">
            <el-card class="box-card">
              <div class="item f-20">收益</div>
              <div style="font-weight: 700" v-if="dataByDate">
                {{ dataByDate.revenue }}
              </div>
            </el-card>
            <!-- 收益 -->
          </div></el-col
        >
        <el-col :span="6"
          ><div class="grid-item">
            <el-card class="box-card">
              <div class="item f-20">支出</div>
              <div style="font-weight: 700" v-if="dataByDate">
                {{ dataByDate.expenditure }}
              </div>
            </el-card>
            <!-- 收益 -->
          </div></el-col
        >
        <el-col :span="6"
          ><div class="grid-item">
            <el-card class="box-card">
              <div class="item f-20">利潤</div>
              <div style="font-weight: 700" v-if="dataByDate">
                {{ dataByDate.profits }}
              </div>
            </el-card>
            <!-- 收益 -->
          </div></el-col
        >
      </el-row>
    </div>
    <!-- 
    <div class="table_content">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="index" align="center" label="">
        </el-table-column>
        <el-table-column prop="date" label="日期" align="center">
        </el-table-column>
        <el-table-column prop="name" label="收益" align="center">
        </el-table-column>
        <el-table-column prop="name" label="支出" align="center">
        </el-table-column>
        <el-table-column prop="address" label="利润" align="center">
        </el-table-column>
      </el-table>
    </div> -->
  </div>
</template>

<script>
import { indexAccount, indexAccountByDate } from "@/api/common/common";

export default {
  name: "index",
  data() {
    return {
      // 版本号
      info: {},
      tableData: [
        {
          date: "2016-05-02",
          name: "100",
          address: "100",
        },
        {
          date: "2016-05-04",
          name: "100",
          address: "100 ",
        },
        {
          date: "2016-05-01",
          name: "100",
          address: "100",
        },
        {
          date: "2016-05-03",
          name: "100",
          address: "100",
        },
      ],
      // 日期
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一個个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三個月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      value1: "2020",
      daterange: [],
      form: {},
      dataByDate: null,
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const res = await indexAccount();
      const { data } = res;
      this.info = data;
    },
    async pickerChange(e) {
      if (this.daterange) {
        const { data } = await indexAccountByDate({
          beginTime: this.daterange[0],
          endTime: this.daterange[1],
        });
        this.dataByDate = data;
      } else {
        this.dataByDate = null;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
.text {
  font-size: 20px;
  // text-align: center;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.box-card {
  // width: 480px;
  font-size: 20px;
}
.table_content {
  width: 85%;
  margin: auto;
}
.main_box {
  border-top: 1px solid #ccc;
  h5 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 10px;
  }
  .picker_block {
    display: flex;
    justify-content: flex-end;
    // width: 90%;
    margin-right: 70px;
    margin-bottom: 50px;
  }
}

.grid-item {
  text-align: center;
}
.f-20 {
  font-size: 20px;
}
.flex_center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  transform: scale(0.7);
}
.row_text {
  // margin: 10px;
  font-size: 18px;
  font-weight: 700;
  height: 60px;
  line-height: 60px;
  // margin-left: 10px;
}
.fw {
  font-weight: 700;
}
.main {
  // display: inline-block;
  margin: auto;
  width: 200px;
}
// .el-card__body{
//   display: flex;
//   justify-content: center;
// }
</style>

