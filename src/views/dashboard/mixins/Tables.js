export default {
  data() {
    return {
      defaultColumn: [
        { label: 'id', width: 65, name: 'ID' },
        { label: 'platform', width: 50, name: '' },
        { label: 'session_host', width: 120, name: '主机IP' },
        { label: 'info', width: 120, name: '主机用户' },
        { label: 'tunnel_peer', width: 150, name: '出口IP' },
        { label: 'location', width: 0, name: '位置' },
        { label: 'desc', width: 0, name: '主机描述' }
      ],
      expand_table_columns: [
        { label: 'id', width: 65, name: 'ID' },
        { label: 'arch', width: 120, name: '架构' },
        { label: 'type', width: 220, name: '会话类型' },
        { label: 'desc', width: 80, name: '会话描述' },
        { label: 'exploit_uuid', width: 120, name: 'exploit_uuid' },
        { label: 'platform', width: 120, name: '主机平台' },
        { label: 'routes', width: 120, name: 'routes' },
        { label: 'target_host', width: 120, name: 'target_host' },
        { label: 'tunnel_local', width: 0, name: '回连监听地址' },
        { label: 'via_exploit', width: 0, name: 'exploit' },
        { label: 'via_payload', width: 0, name: 'payload' }
      ]
    }
  },
  methods: {

  }
}
