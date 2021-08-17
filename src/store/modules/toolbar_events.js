
const getDefaultState = () => {
  return {
    toolbar_events: 'empty'
  }
}

const state = getDefaultState()

// 修改state状态
const mutations = {
  SET_TOOLBAR_EVENTS: (state, toolbar_events) => {
    state.toolbar_events = toolbar_events
  }
}
// 提供方法给其他组件调度
const actions = {
  // set toolbar_events
  change_events({ commit }, toolbar_events) {
    commit('SET_TOOLBAR_EVENTS', toolbar_events)
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

