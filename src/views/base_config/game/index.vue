<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      v-show="showSearch"
      :inline="true"
    >
      <el-form-item label="遊戲名稱" prop="gameName">
        <el-input
          v-model="queryParams.gameName"
          placeholder="請輸入遊戲名稱"
          clearable
          size="small"
          style="width: 240px"
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
          v-hasPermi="['system:role:add']"
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
          v-hasPermi="['system:role:edit']"
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
          v-hasPermi="['system:role:remove']"
          >删除</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roleList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="遊戲編號" prop="supportGameId" />
      <el-table-column
        label="遊戲名稱"
        prop="gameName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="遊戲LOGO" align="center">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px"
            :src="scope.row.gameLogoUrl"
            fit="scale-down"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="狀態" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
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
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:role:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:role:remove']"
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="遊戲名稱" prop="gameName">
          <el-input v-model="form.gameName" placeholder="請輸入遊戲名稱" />
        </el-form-item>

        <el-form-item label="LOGO" prop="LOGO">
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="upLoad"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="dialogImageUrl" :src="dialogImageUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="狀態">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
              >{{ dict.dictLabel }}</el-radio
            >
          </el-radio-group>
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
import userAvatar from "./userAvatar";
import {
  gamelist,
  addGame,
  updateGame,
  delGame,
  getCurrentById,
} from "@/api/game/game";
import { upLoadImg } from "@/api/common/common";
export default {
  name: "Role",
  components: { userAvatar },
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
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 狀態数据字典
      statusOptions: [],
      // 菜單列表
      menuOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        gameName: null,
        status: null,
      },
      // 弹窗的类型-add,edit
      dialogType: "add",
      //游戏logo Url
      dialogImageUrl: "",
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        roleName: [
          { required: true, message: "遊戲名稱不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("support_game_status").then((response) => {
      const list = response.data;
      list.forEach((element) => {
        element.dictValue = parseInt(element.dictValue);
      });
      this.statusOptions = response.data;
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询游戏列表 */
    getList() {
      this.loading = true;
      gamelist(this.queryParams).then((response) => {
        response = response.data;
        this.roleList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    // 狀態修改
    handleStatusChange(row) {
      // 先获取详情信息
      this.getDetailById(row.supportGameId);

      let supportGameId = row.supportGameId;
      let text = row.status == 1 ? "啟用" : "停用";
      this.$confirm(
        '確認要"' + text + '""' + row.gameName + '"這個遊戲嗎?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.updateCurrentGame(row.status, row);
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
    // 表單重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }

      this.form = {
        supportGameId: null,
        gameName: null,
        gameLogoUrl: null,
        createTime: null,
        createBy: null,
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.dialogType = "add";
      this.title = "添加遊戲";
      this.dialogImageUrl = "";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.title = "修改";
      this.dialogImageUrl = row.gameLogoUrl;
      this.dialogType = "edit";
      this.open = true;
      this.getDetailById(row.supportGameId);
      this.form.supportGameId = row.supportGameId;
    },
    /*获取对应游戏币的详情*/
    getDetailById(gameCurrencyId = "") {
      let params = { gameCurrencyId };
      params = JSON.stringify(params);

      getCurrentById(gameCurrencyId, params).then((res) => {
        this.form = res.data;
        this.form.remark = undefined;
        this.form.status = Number(res.data.status);
      });
    },
    /** 新增编辑提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (!this.form.gameName) {
            this.$message({
              message: "请填写遊戲名稱",
              type: "error",
            });
            return;
          }
          if (!this.dialogImageUrl) {
            this.$message({
              message: "請選擇遊戲LOGO",
              type: "error",
            });
            return;
          }
          this.form.gameLogoUrl = this.dialogImageUrl;
          let formData1 = {
            gameLogoUrl: this.form.gameLogoUrl,
            gameName: this.form.gameName,
            remark: this.form.remark || "",
            status: this.form.status,
          };
          // 请求接口，成功之后关闭弹窗
          if (this.dialogType == "edit") {
            formData1.supportGameId = this.form.supportGameId;
          }

          let $http = this.dialogType == "add" ? addGame : updateGame;
          console.log('formData1',formData1);
          $http(formData1)
            .then((res) => {
              this.$message({
                message: res.msg,
                type: "success",
              });
              this.open = false;
              this.getList();
            })
            .catch((err) => {});
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const supportGameId = row.supportGameId;
      let params = { supportGameIds: supportGameId };
      params = JSON.stringify(params);

      this.$confirm(
        '是否確認删除編號為"' + supportGameId + '"的遊戲?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delGame(supportGameId, params);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },

    /*选择logo*/
    handleAvatarSuccess(res, file) {
      // this.dialogImageUrl = URL.createObjectURL(file.raw);
      this.dialogImageUrl =  this.dialogImageUrl;
      console.log('dialogImageUrl')

    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上傳頭像圖片只能是JPG格式！");
      }
      if (!isLt2M) {
        this.$message.error("上傳頭像圖片大小不能超過2MB！");
      }
      return isJPG && isLt2M;
    },

    /**上传图片**/
    async upLoad({ file }) {
      let url = await this.$putOssImg(file);
      console.log('url',url);
      this.dialogImageUrl = url;
    },
    /**修改对应的游戏内容**/
    updateCurrentGame(status, row) {
      let formData1 = {
        gameLogoUrl: this.form.gameLogoUrl,
        gameName: this.form.gameName,
        status,
        supportGameId: this.form.supportGameId,
      };
      let index = this.roleList.findIndex((item) => {
        return item.supportGameId == row.supportGameId;
      });
      updateGame(formData1)
        .then((res) => {
          this.$message({
            message: res.msg,
            type: "success",
          });
          row.status = status;
          this.$set(this.roleList, index, row);
        })
        .catch((err) => {
          this.$message({
            message: "修改失敗",
            type: "error",
          });
        });
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