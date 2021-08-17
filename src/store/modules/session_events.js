
const getDefaultState = () => {
  return {
    session_events: 'empty'
  }
}

const state = getDefaultState()

// 修改state状态
const mutations = {
  SET_EVENTS: (state, session_events) => {
    state.session_events = session_events
  }
}
// 提供方法给其他组件调度
const actions = {
  // set session_events
  change_events({ commit }, session_events) {
    commit('SET_EVENTS', session_events)
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

