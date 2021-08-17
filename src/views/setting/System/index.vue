<template>
  <el-tabs v-model="activeName" type="card">
    <el-tab-pane label="用户管理" name="first">
      <UsersList />
    </el-tab-pane>
    <el-tab-pane label="配置管理" name="second"><Config /></el-tab-pane>
    <!-- <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane> -->
    <!-- <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane> -->
  </el-tabs>
</template>
<script>
import UsersList from './Users/index'
import Config from './Config/index'
export default {
  components: {
    UsersList,
    Config
  },
  data() {
    return {
      activeName: 'first'
    }
  },
  created() {
  },
  methods: {

  }
}
</script>
