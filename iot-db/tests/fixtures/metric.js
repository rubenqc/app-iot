'use strict'

let count = 20

const metric = {
  id: 1,
  uuid: 'xxx-xxx-xxx',
  username: 'ruben',
  createdAt: Date(),
  updatedAt: Date(),
  agentId: 1
}

const metrics = [
  metric,
  extend(metric, { id: 2, uuid: 'xxx-xxx-xxy', username: 'test', agentId: 2 }),
  extend(metric, { id: 3, uuid: 'xxx-xxx-xxz', agentId: 2 }),
  extend(metric, { id: 4, uuid: 'xxx-xxx-xxxw', agentId: 2 })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics,
  findByAgentUuid: id => metrics.filter(a => a.agentId === id),
  findByTypeAgentUuid: (type, id) => metrics.filter(a => a.agentId === id && a.type === type)
}
