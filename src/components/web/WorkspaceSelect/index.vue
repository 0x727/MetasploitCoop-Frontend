<template>
  <el-select
    v-model="workspace_name"
    filterable
    remote
    :placeholder="workspace"
    @focus="fetchWorkspaceList"
    @change="set_workspace"
  >
    <el-option
      v-for="item in options"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>
</template>

<script>
// import { workspaces_fetch } from '@/api/workspaces'
export default {
  name: 'WorkspaceSelect',
  data() {
    return {
      loading: false,
      options: [],
      workspace: localStorage.getItem('LSWorkspace'),
      workspace_name: ''
    }
  },
  created() {
    this.fetchWorkspaceList()
  },

  methods: {
    fetchWorkspaceList() {
      this.options = ['default']
      this.set_workspace(this.options[0])
    },
    set_workspace(value) {
      this.workspace_name = value
      localStorage.setItem('LSWorkspace', this.workspace_name)
      this.$notify({
        title: 'Success',
        message: 'Set workspace to ' + value,
        type: 'success',
        position: 'bottom-right'
      })
      this.$router.push(`${this.$route.path}?workspace=${value}`)
    }
  }
}
</script>
