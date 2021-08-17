import { kb_modules_fetch } from '@/api/kb'
import { modules_ref_names } from '@/api/module'
import { pathToTree } from '@/utils/util'

export default {
  data() {
    return {
      kb_modules_info: {},
      post_options: {},
      loading: false
    }
  },
  methods: {
    getPostTypesTree(data) {
      const types = data.map((value) => {
        return value['ref_name']
      })
      const tree = pathToTree(types, this.filter_options)
      return tree
    },
    async handleCascaderChange(value) { // 根据用户使用，添加权重
      this.post.fullname = this.moduleName.join('/')
      await kb_modules_fetch({ fullname: 'post/' + this.post.fullname }).then(response => {
        this.kb_modules_info = response.data
        if (response.data.results.length === 1) {
          this.kb_modules_info = response.data.results[0]
          this.loading = true
        }
      })
      this.loading = true
    },
    async fetch_post_modules() { // 获取所有可用post模块
      const params = { type: 'post', platform: 'windows' }
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
    Next(data) {
      this.post_options = data
      // 判断是否有session这个属性，如果有就是可以不提供post
      if (Object.prototype.hasOwnProperty.call(data, 'SESSION')) { delete data['SESSION'] }
      if (Object.prototype.hasOwnProperty.call(data, 'PROXIES')) { delete data['PROXIES'] }
      this.post_options = data
    }
  }
}
