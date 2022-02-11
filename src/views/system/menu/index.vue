<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="選單名稱" prop="menuName">
        <el-input
          v-model="queryParams.menuName"
          placeholder="請輸入選單名稱"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="狀態" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="選單狀態"
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
          @click="handleAdd"
          v-hasPermi="['system:menu:add']"
          >新增</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        prop="menuName"
        label="選單名稱"
        :show-overflow-tooltip="true"
        width="160"
      ></el-table-column>
      <el-table-column prop="icon" label="圖標" align="center" width="100">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column
        prop="orderNum"
        label="排序"
        width="60"
      ></el-table-column>
      <el-table-column
        prop="perms"
        label="權限標識"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        prop="component"
        label="組件路徑"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        prop="status"
        label="狀態"
        :formatter="statusFormat"
        width="80"
      ></el-table-column>
      <el-table-column label="創建時間" align="center" prop="createTime">
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
            v-hasPermi="['system:menu:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:menu:add']"
            >新增</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:menu:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改選單对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上級選單">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="選擇上級選單"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="選單類型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目錄</el-radio>
                <el-radio label="C">選單</el-radio>
                <el-radio label="F">按鈕</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.menuType != 'F'" label="選單圖標">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input
                  slot="reference"
                  v-model="form.icon"
                  placeholder="点击選擇圖標"
                  readonly
                >
                  <svg-icon
                    v-if="form.icon"
                    slot="prefix"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px; width: 16px"
                  />
                  <i
                    v-else
                    slot="prefix"
                    class="el-icon-search el-input__icon"
                  />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="選單名稱" prop="menuName">
              <el-input v-model="form.menuName" placeholder="請輸入選單名稱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="顯示排序" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" label="是否外鏈">
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.menuType != 'F'"
              label="路由地址"
              prop="path"
            >
              <el-input v-model="form.path" placeholder="請輸入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="組件路徑" prop="component">
              <el-input v-model="form.component" placeholder="請輸入組件路徑" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'M'" label="權限标识">
              <el-input
                v-model="form.perms"
                placeholder="请權限标识"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" label="显示狀態">
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in visibleOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                  >{{ dict.dictLabel }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" label="選單狀態">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                  >{{ dict.dictLabel }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType == 'C'" label="是否緩存">
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">緩存</el-radio>
                <el-radio label="1">不緩存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
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
  listMenu,
  getMenu,
  delMenu,
  addMenu,
  updateMenu,
} from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
  name: "Menu",
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示蒐索条件
      showSearch: true,
      // 選單表格树数据
      menuList: [],
      // 選單树选项
      menuOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示狀態数据字典
      visibleOptions: [],
      // 選單狀態数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        menuName: undefined,
        visible: undefined,
      },
      // 表單参数
      form: {},
      // 表單校验
      rules: {
        menuName: [
          { required: true, message: "選單名稱不能為空", trigger: "blur" },
        ],
        orderNum: [
          { required: true, message: "選單顺序不能為空", trigger: "blur" },
        ],
        path: [
          { required: true, message: "路由地址不能為空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_show_hide").then((response) => {
      this.visibleOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    // 選擇圖標
    selected(name) {
      this.form.icon = name;
    },
    /** 查询選單列表 */
    getList() {
      this.loading = true;
      listMenu(this.queryParams).then((response) => {
        this.menuList = this.handleTree(response.data, "menuId");
        this.loading = false;
      });
    },
    /** 转换選單数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children,
      };
    },
    /** 查询選單下拉树结构 */
    getTreeselect() {
      listMenu().then((response) => {
        this.menuOptions = [];
        const menu = { menuId: 0, menuName: "主類目", children: [] };
        menu.children = this.handleTree(response.data, "menuId");
        this.menuOptions.push(menu);
      });
    },
    // 显示狀態字典翻译
    visibleFormat(row, column) {
      if (row.menuType == "F") {
        return "";
      }
      return this.selectDictLabel(this.visibleOptions, row.visible);
    },
    // 選單狀態字典翻译
    statusFormat(row, column) {
      if (row.menuType == "F") {
        return "";
      }
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 取消按鈕
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表單重置
    reset() {
      this.form = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: "M",
        orderNum: undefined,
        isFrame: "1",
        isCache: "0",
        visible: "0",
        status: "0",
      };
      this.resetForm("form");
    },
    /** 蒐索按鈕操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按鈕操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按鈕操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.menuId) {
        this.form.parentId = row.menuId;
      } else {
        this.form.parentId = 0;
      }
      this.open = true;
      this.title = "添加選單";
    },
    /** 修改按鈕操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getMenu(row.menuId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改選單";
      });
    },
    /** 提交按鈕 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.menuId != undefined) {
            updateMenu(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMenu(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按鈕操作 */
    handleDelete(row) {
      this.$confirm(
        '是否確認删除名稱為"' + row.menuName + '"的數據項?',
        "警告",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delMenu(row.menuId);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
  },
};
</script>