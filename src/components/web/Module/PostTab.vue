<template>
  <div class="msf-session-post-tab">
    <el-col :span="12" class="left">
      <p>
        标题:&emsp;{{ kb_modules_info.title }}
      </p><hr>描述:&emsp;{{ kb_modules_info.intro ||'NULL' }}
      <el-form
        ref="form"
        :inline="true"
        label-position="left"
        :model="post"
        label-width="100px"
      >
        <el-form-item
          :required="post.required"
          :label="(post.required)? 'post:':'[post]:'"
        >
          <el-col :span="24">
            <!-- 联级选择器 -->
            <el-cascader
              ref="refCasCader"
              v-model="cascaderValue"
              :options="cascaderData"
              :props="cascaderProps"
              clearable
              :filterable="true"
              style="width: 40vw"
              @expand-change="handleCascaderExpandChange"
              @change="handleCascaderChange"
            />
          </el-col>
          <!-- 降噪 -->
          <div v-if="!post.required && !post.fullname" align="right">
            <el-divider />
            <el-button type="primary" icon="el-icon-arrow-left" @click="Back">上一步</el-button>
            <el-button type="primary" @click="Next">执行<i class="el-icon-arrow-right el-icon--right" /></el-button>
          </div>
        </el-form-item>
      </el-form>
      <el-divider />
      <ModuleOption
        v-if="loading"
        ref="RefModuleOption"
        page="post"
        class="infinite-list"
        :kb_modules_info="kb_modules_info"
        :sid="id"
        :show_exec="true"
        :fullname.sync="post.fullname"
        v-on="$listeners"
        @Next="Next"
        @Back="Back"
      />
    </el-col>
    <el-col class="infinite-list-right" :span="12">
      <MsfPostEvent />
    </el-col>
  </div>
</template>

<script>
import MsfPostEvent from '@/views/zPostEvent'
import ModuleOption from '@/components/web/Module/ModuleOption'
import { modules_ref_names } from '@/api/module'
import { call_post } from '@/api/module'
import { pathToTree } from '@/utils/util'
import { kb_modules_fetch } from '@/api/kb'

import {
  keyPostType,
  keyPostWeight,
  saveToLocalStorge,
  getFromLocalStorge
} from '@/utils/cache'
export default {
  components: {
    MsfPostEvent,
    ModuleOption
  },
  props: {
    id: {
      type: Number,
      default() { 0 }
    },
    platform: {
      type: String,
      default() { '' }
    }
  },
  data() {
    return {
      filter_options: { },
      post: {
        fullname: '',
        required: true,
        tags: []
      },
      loading: false,
      select_loading: false,
      post_options: {},
      cascaderData: [],
      kb_modules_info: {},
      posts_tree_all: [],
      posts_all: [],
      cascaderValue: [],
      cascaderProps: {
        value: 'title',
        label: 'title'
      }

    }
  },
  watch: {
    post() {

    }
  },
  created() {
    this.initdata()
  },
  methods: {
    clearData() {
      this.postDesc = ''
      this.postOptions = []
    },
    initdata() { // 读取localstorge中的模块标识和选项
      this.post.fullname = getFromLocalStorge(keyPostType, '')
      this.cascaderValue = this.post.fullname.split('/')
      if (this.post.fullname) {
        this.handleChangePostType(this.post.fullname)
      }
      this.filter_options = getFromLocalStorge(keyPostWeight, {})
      this.fetch_post_modules()
    },
    async handleChangePostType(postType) { // 选择模块变更时调用，保存一些数据到缓存
      if (!postType) {
        this.clearData()
        return
      }
      this.post.fullname = postType
      await kb_modules_fetch({ fullname: 'post/' + this.post.fullname }).then(response => {
        this.kb_modules_info = response.data
        if (response.data.results.length === 1) {
          this.kb_modules_info = response.data.results[0]
          this.loading = true
        }
      })
      saveToLocalStorge(keyPostType, postType)
    },
    getPostTypesTree(data) {
      const types = data.map((value) => {
        return value['ref_name']
      })
      const tree = pathToTree(types, this.filter_options)
      return tree
    },
    handleCascaderChange(value) { // 根据用户使用，添加权重
      this.handleChangePostType(this.cascaderValue.join('/'))
      value.forEach(element => {
        if (this.filter_options[element]) {
          this.filter_options[element]++
        } else {
          this.filter_options[element] = 1
        }
      })
      saveToLocalStorge(keyPostWeight, this.filter_options)
    },
    handleCascaderExpandChange(value) { // 计算权重,排序
      for (var i = 0; i < this.cascaderData.length; i++) {
        if (this.cascaderData[i].title === value[0]) {
          if (value.length === 1) {
            this.cascaderData[i]['children'] = this.cascaderData[i]['children'].sort(function(a, b) {
              return a.weight < b.weight ? 1 : -1
            })
          }
          const parent = this.cascaderData[i]['children']
          parent.forEach((child, index) => {
            if (child.title === value[1]) {
              if (value.length === 2) {
                parent[index]['children'] = parent[index]['children'].sort(function(a, b) {
                  return a.weight < b.weight ? 1 : -1
                })
                this.cascaderData[i]['children'] = parent
              }
            }
          })
        }
      }
    },
    Back() {

    },
    async execute_post() { // 执行post模块
      var post_id = this.posts_all.filter((post) => {
        return (post['ref_name'] === this.post.fullname)
      })
      if (post_id.length === 1) {
        await call_post(post_id[0].id, this.post_options).then(response => {
          var job = response.data
          if (job.job_id) {
            this.$notify({
              title: '执行模块成功，请等待返回结果',
              message: 'UUID:' + job.uuid,
              type: 'success',
              position: 'bottom-right'
            })
          } else {
            this.$notify({
              title: '执行模块失败',
              message: 'UUID:' + job.uuid,
              type: 'error',
              position: 'bottom-right'
            })
          }
          this.$emit('cancel')
        })
      }
    },
    Next(data) {
      this.post_options = data
      // 判断是否有session这个属性，如果有就是可以不提供post
      this.post.required = !Object.prototype.hasOwnProperty.call(data, 'SESSION')
      this.post_options = data
      this.execute_post()
    },
    async fetch_post_modules() { // 获取所有可用post模块
      const params = { type: 'post', platform: this.platform }
      await modules_ref_names(params).then(response => {
        // 筛选
        this.posts_all = response.data
        this.posts_tree_all = this.getPostTypesTree(response.data)
        this.cascaderData = this.posts_tree_all
        this.cascaderData = this.cascaderData.sort(function(a, b) {
          return a.weight < b.weight ? 1 : -1
        })
      })
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.msf-session-post-tab{
    height: calc((100vh - 84px) * 0.5 + 24px);
  overflow-y: auto;
 }
.infinite-list {
    height: calc((100vh - 84px) * 0.5  + 24px - 28px);
    padding: 0;
    margin: 0;
    list-style: none;
}
.infinite-list-right {
    height: calc((100vh - 84px) * 0.5  + 24px);
    padding: 0;
    margin: 0;
    list-style: none;
}
</style>
