<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="98px"
    >
      <el-form-item label="商品名稱" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="請輸入商品名稱"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="庫存數量" prop="goodsStock">
        <el-input
          v-model="queryParams.goodsStock"
          placeholder="請輸入庫存數量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品狀態" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="請選擇"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
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
          v-hasPermi="['opt:goods:add']"
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
          v-hasPermi="['opt:goods:edit']"
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
          v-hasPermi="['opt:goods:remove']"
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
      :data="goodsList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="商品Id"
        width="100"
        align="center"
        prop="goodsId"
      />
      <el-table-column label="商品名稱" align="center" prop="goodsName" />
      <el-table-column label="庫存數量" align="center" prop="goodsStock" />
      <el-table-column label="商品logo" align="center">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px"
            :src="scope.row.goodsLogo"
            fit="fill"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="商品描述" align="center" prop="goodsDesc">
        <template slot-scope="scope">
          <span>{{scope.row.goodsDesc||'无'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="商品費用 (幣)"
        align="center"
        prop="goodsAmount"
      />
      <el-table-column label="狀態" align="center" prop="statusVal" />
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
            v-hasPermi="['opt:goods:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['opt:goods:remove']"
            >删除</el-button
          >
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

    <!-- 添加或修改商品对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="商品名稱" prop="goodsName">
          <el-input v-model="form.goodsName" placeholder="請輸入商品名稱" />
        </el-form-item>
        <el-form-item label="庫存數量" prop="goodsStock">
          <el-input v-model="form.goodsStock" placeholder="請輸入庫存數量" />
        </el-form-item>
        <el-form-item label="商品logo" prop="goodsLogo">
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="upLoadRequest"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.goodsLogo" :src="form.goodsLogo" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品描述" prop="goodsDesc">
          <el-input
            v-model="form.goodsDesc"
            type="textarea"
            placeholder="請輸入内容"
          />
        </el-form-item>

        <el-form-item label="遊戲幣種" prop="gameCurrencyId">
          <el-select
            v-model="form.gameCurrencyId"
            placeholder="請選擇"
            clearable
            size="small"
            @change="chooseCurrency"
          >
            <el-option
              v-for="dict in currentList"
              :key="dict.gameCurrencyId"
              :label="dict.gameCurrencyName"
              :value="dict.gameCurrencyId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品費用 (幣)" prop="goodsAmount">
          <el-input
            v-model="form.goodsAmount"
            type="number"
            placeholder="請輸入商品費用 (幣)"
          />
        </el-form-item>

        <el-form-item label="商品狀態" prop="status">
          <el-select
            v-model="form.statusVal"
            placeholder="請選擇"
            clearable
            size="small"
            @change="chooseGoodsStatus"
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否為門票" prop="isTicket">
          <el-select
            v-model="form.isTicket"
            placeholder="請選擇是否為門票"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in isTicketArr"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="門票數量"
          prop="ticketCount"
          v-if="form.isTicket == 1"
        >
          <el-input
            v-model="form.ticketCount"
            placeholder="請輸入門票數量"
            @input="form.ticketCount = form.ticketCount.replace(/[^\d.]/g, '')"
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
  listGoods,
  getGoods,
  delGoods,
  addGoods,
  updateGoods,
} from "@/api/game/goods";
import { upLoadImg } from "@/api/common/common";
import { getCurrencyOptions } from "@/api/game/currency";
export default {
  name: "Goods",
  components: {},
  data() {
    return {
      isTicketArr: [
        { dictLabel: "是", dictValue: 1 },
        { dictLabel: "否", dictValue: 0 },
      ],
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
      goodsList: [],
      // 弹出层标题
      title: "",
      // 狀態数据字典
      statusOptions: [],
      // 所需要遊戲幣種
      currentList: [],
      //是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsName: null,
        goodsStock: null,
        goodsLogo: null,
        goodsDesc: null,
        goodsAmount: null,
        gameCurrencyId: null,
        status: null,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        goodsName: [
          { required: true, message: "商品名稱不能为空", trigger: "blur" },
        ],
        goodsStock: [
          { required: true, message: "庫存數量不能为空", trigger: "blur" },
        ],
        goodsAmount: [
          { required: true, message: "商品費用 (幣)不能为空", trigger: "blur" },
        ],
        createTime: [
          { required: true, message: "上架時間不能為空", trigger: "blur" },
        ],
        gameCurrencyId: [
          { required: true, message: "請選擇游戏幣", trigger: "change" },
        ],
        status: [
          { required: true, message: "請選擇商品狀態", trigger: "change" },
        ],
        createBy: [
          { required: true, message: "添加商品人員不能為空", trigger: "blur" },
        ],
        isTicket: [
          { required: true, message: "請選擇是否為門票", trigger: "blur" },
        ],
        ticketCount: [
          { required: true, message: "請輸入門票數量", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getDicts("game_goods_status").then((response) => {
      this.statusOptions = response.data;
      this.getList();
    });

    this.getCurrency();
  },
  methods: {
    /** 查询商品列表 */
    getList() {
      this.loading = true;
      listGoods(this.queryParams).then((response) => {
        let resultData = response.data,
          statusVal = "";
        let goodsList = resultData.rows;

        goodsList.forEach((element) => {
          let status = element.status;

          statusVal = this.statusOptions.filter((item) => {
            return status == parseInt(item.dictValue);
          });

          element.statusVal = statusVal[0].dictLabel;
        });

        this.goodsList = goodsList;
        this.totalNum = resultData.total ? resultData.total : 0;
        this.loading = false;
      });
    },
    /** 所需遊戲幣種**/
    getCurrency() {
      getCurrencyOptions({ status: 0 }).then((res) => {
        this.currentList = res.data;
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
        goodsId: null,
        goodsName: null,
        goodsStock: null,
        goodsLogo: null,
        goodsDesc: null,
        goodsAmount: null,
        gameCurrencyId: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        status: null,
        statusVal: null,
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
      this.ids = selection.map((item) => item.goodsId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /*选择所需游戏幣*/
    chooseCurrency(e) {
      this.form.gameCurrencyId = Number(e);
    },
    /*选择商品狀態*/
    chooseGoodsStatus(e) {
      this.form.status = Number(e);
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加商品";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const goodsId = row.goodsId || this.ids;
      getGoods(goodsId).then((response) => {
        let resultData = response.data,
          statusVal = "";

        statusVal = this.statusOptions.filter((item) => {
          return resultData.status == parseInt(item.dictValue);
        });
        resultData.statusVal = statusVal[0].dictLabel;

        this.form = resultData;
        this.open = true;
        this.title = "修改商品";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          // 校验商品圖片
          if (!this.form.goodsLogo) {
            this.$message("請選擇商品圖片");
            return;
          }

          // 先对goodsAmount，goodsStock变成数字类型
          this.form.goodsAmount = Number(this.form.goodsAmount);
          this.form.goodsStock = Number(this.form.goodsStock);

          if (this.form.goodsId != null) {
            this.form.goodsId = Number(this.form.goodsId);
            updateGoods(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addGoods(this.form).then((response) => {
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
      const goodsIds = row.goodsId || this.ids;
      this.$confirm(
        '是否確認删除商品編號為"' + goodsIds + '"的資料項目?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delGoods(goodsIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否確認匯出所有商品資料項目?", "警告", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportGoods(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    /*选择logo*/
    handleAvatarSuccess(res, file) {
      // this.form.goodsLogo = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      // const isJPG = file.type === "image/jpeg";
      // const isLt2M = file.size / 1024 / 1024 < 2;
      // if (!isJPG) {
      //   this.$message.error("上傳圖片只能是JPG格式！");
      // }
      // if (!isLt2M) {
      //   this.$message.error("上傳圖片大小不能超過2MB！");
      // }
      // return isJPG && isLt2M;
    },

    /**上传图片**/
    async upLoadRequest({ file }) {
      let url = await this.$putOssImg(file);
      this.form.goodsLogo = url;
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