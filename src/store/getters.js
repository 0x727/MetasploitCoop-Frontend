const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  language: state => state.app.language,
  size: state => state.app.size,
  token: state => state.user.token,
  roles: state => state.user.roles,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  session_events: state => state.session_events.session_events,
  toolbar_events: state => state.toolbar_events.toolbar_events,
  console_events: state => state.console_events.console_events
}
export default getters
