
const getDefaultState = () => {
  return {
    console_events: 'empty'
  }
}

const state = getDefaultState()

// 修改state状态
const mutations = {
  SET_CONSOLE_EVENTS: (state, console_events) => {
    state.console_events = console_events
  }
}
// 提供方法给其他组件调度
const actions = {
  // set console_events
  change_events({ commit }, console_events) {
    commit('SET_CONSOLE_EVENTS', console_events)
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
