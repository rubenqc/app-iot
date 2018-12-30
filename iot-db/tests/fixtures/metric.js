'use strict'

// let count = 20

const metric = {
  id: 1,
  type: 'teperatura',
  value: '10.5',
  createdAt: Date(),
  updatedAt: Date(),
  agentId: 1
}

const metrics = [
  metric,
  extend(metric, { id: 2, type: 'energia', value: '11.2', agentId: 2 }),
  extend(metric, { id: 3, type: 'temperatura', agentId: 2 }),
  extend(metric, { id: 4, type: 'presion', agentId: 2 })

]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics,
  findByAgentId: id => metrics.filter(a => a.agentId === id),
  findByAgentType: (type, id) => metrics.filter(a => a.agentId === id && a.type === type)
}
