<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="域名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入域名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="域名状态" prop="isDisabled">
        <el-select v-model="queryParams.isDisabled" placeholder="请选择域名状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建人" prop="createById" v-if="$auth.hasPermi('system:domainddns:edit')">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入创建人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="域名类型" prop="domainType" v-if="$auth.hasPermi('system:domainddns:edit')">
        <el-select v-model="queryParams.domainType" placeholder="请选择域名类型" clearable>
          <el-option
            v-for="dict in dict.type.sys_domain_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="daterangeCreateTime"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
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
          v-hasPermi="['system:domaincloudflare:add']"
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
          v-hasPermi="['system:domaincloudflare:edit']"
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
          v-hasPermi="['system:domaincloudflare:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:domaincloudflare:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="domaincloudflareList" @selection-change="handleSelectionChange" stripe>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55" align="center" prop="id" />
      <el-table-column label="域名" align="center" prop="name" />
      <el-table-column label="地址" align="center" prop="content" />
      <el-table-column label="验证码" align="center" prop="sn" />
      <el-table-column label="域名状态" align="center" prop="isDisabled">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.isDisabled"/>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" v-if="$auth.hasPermi('system:domainddns:edit')"/>
      <el-table-column label="域名类型" align="center" prop="domainType" v-if="$auth.hasPermi('system:domainddns:edit')">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_domain_type" :value="scope.row.domainType"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:domaincloudflare:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:domaincloudflare:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 添加或修改动态域名对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="域名" prop="ddnsId">
          <el-select v-model="form.ddnsId" placeholder="请选择域名">
            <el-option v-for="item in ddnsList" :key="item.id" :label="item.ddnsDomian" :value="item.id">{{item.ddnsDomian}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="content">
          <el-input v-model="form.content" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="序列号" prop="sn" v-if="showSn">
          <el-input v-model="form.sn" disabled="true"/>
          <el-button @click="handleResetSn">重置序列号</el-button>
        </el-form-item>
        <el-form-item label="域名状态" prop="isDisabled">
          <el-radio-group v-model="form.isDisabled">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
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
import { listDomaincloudflare, getDomaincloudflare, delDomaincloudflare, addDomaincloudflare, updateDomaincloudflare } from "@/api/system/domaincloudflare";
import { listDomainddns } from "@/api/system/domainddns";
export default {
  name: "Domaincloudflare",
  dicts: ['sys_domain_type', 'sys_normal_disable'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 动态域名表格数据
      domaincloudflareList: [],
      // 动态域名提供表
      ddnsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示序列号
      showSn: false,
      // 域名状态时间范围
      daterangeCreateTime: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        isDisabled: null,
        createById: null,
        domainType: null,
        createTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        ddnsId: [
          { required: true, message: "ddns表id不能为空", trigger: "change" }
        ],
        name: [
          { required: true, message: "域名不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "地址不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList(),
    this.getDdnsList();
  },
  methods: {
    /** 查询动态域名列表 */
    getList() {
      this.loading = true;
      this.queryParams.params = {};
      if (null != this.daterangeCreateTime && '' != this.daterangeCreateTime) {
        this.queryParams.params["beginCreateTime"] = this.daterangeCreateTime[0];
        this.queryParams.params["endCreateTime"] = this.daterangeCreateTime[1];
      }
      listDomaincloudflare(this.queryParams).then(response => {
        this.domaincloudflareList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /**获取ddns域名列表 */
    getDdnsList() {
      listDomainddns().then(response => {
        this.ddnsList = response.rows;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        ddnsId: null,
        deptId: null,
        userId: null,
        name: null,
        content: null,
        sn: null,
        isDisabled: null,
        createById: null,
        domainType: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.daterangeCreateTime = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.showSn = false;
      this.title = "添加动态域名";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDomaincloudflare(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.showSn = true;
        this.title = "修改动态域名";
      });
    },
    /** 修改重置序列号 */
    handleResetSn() {
      this.form.sn = "******"
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDomaincloudflare(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDomaincloudflare(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除数据？').then(function() {
        return delDomaincloudflare(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/domaincloudflare/export', {
        ...this.queryParams
      }, `domaincloudflare_${new Date().getTime()}.xlsx`)
    },
  }
}
</script>
