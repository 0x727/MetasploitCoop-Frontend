<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="4" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('auxiliary')">
        <div class="card-panel-icon-wrapper icon-autoprefixer">
          <svg-icon icon-class="autoprefixer" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Auxiliary
          </div>
          <count-to :start-val="0" :end-val="module_stats_data.auxiliary" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="4" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('encoders')">
        <div class="card-panel-icon-wrapper icon-code">
          <svg-icon icon-class="code" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Encoders
          </div>
          <count-to :start-val="0" :end-val="module_stats_data.encoders" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="4" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('exploits')">
        <div class="card-panel-icon-wrapper icon-bug">
          <svg-icon icon-class="bug" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Exploits
          </div>
          <count-to :start-val="0" :end-val="module_stats_data.exploits" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="4" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('nops')">
        <div class="card-panel-icon-wrapper icon-thermometer-empty">
          <svg-icon icon-class="thermometer-empty" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Nops
          </div>
          <count-to :start-val="0" :end-val="module_stats_data.nops" :duration="3000" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="4" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('payloads')">
        <div class="card-panel-icon-wrapper icon-biohazard">
          <svg-icon icon-class="biohazard" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Payloads
          </div>
          <count-to :start-val="0" :end-val="module_stats_data.payloads" :duration="3200" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="4" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('post')">
        <div class="card-panel-icon-wrapper icon-cubes">
          <svg-icon icon-class="cubes" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            Post
          </div>
          <count-to :start-val="0" :end-val="module_stats_data.post" :duration="3600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { core_module_stats } from '@/api/rpc/core'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      module_stats_data: { }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      core_module_stats().then(response => {
        this.module_stats_data = response.result
      })
    },
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-autoprefixer {
        background: #40c9c6;
      }

      .icon-code {
        background: #36a3f7;
      }

      .icon-bug {
        background: #f4516c;
      }

      .icon-thermometer-empty {
        background: #34bfa3
      }

      .icon-biohazard {
        background: #14b2e2
      }

      .icon-cubes {
        background: #0a7de7
      }
    }

    .icon-autoprefixer {
      color: #40c9c6;
    }

    .icon-code {
      color: #36a3f7;
    }

    .icon-bug {
      color: #f4516c;
    }

    .icon-thermometer-empty {
      color: #34bfa3
    }

    .icon-biohazard {
      color: #14b2e2
    }

    .icon-cubes {
      color: #0a7de7
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
