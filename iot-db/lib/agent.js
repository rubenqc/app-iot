'use strict'

module.exports = function setupAgent (AgentModel) {
  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }

    const existingAgent = await AgentModel.findOne(cond)

    if (existingAgent) {
      const updated = await AgentModel.update(agent, cond)
      return updated ? AgentModel.findOne(cond) : existingAgent
    }

    const result = await AgentModel.create(agent)
    return result.toJSON()
  }

  function findById (id) {
    return AgentModel.findById(id)
  }

  async function findByUuid (uuid) {
    const cond = {
      where: {
        uuid
      }
    }
    const existingAgent = await AgentModel.findOne(cond)

    return existingAgent
  }

  function findAll () {
    return AgentModel.findAll()
  }

  function findConnected () {
    return AgentModel.findAll({
      where: {
        connected: true
      }
    })
  }

  function findByUsername () {
    return AgentModel.findAll({
      where: {
        username: 'ruben',
        connected: true
      }
    })
  }

  return {
    findById,
    createOrUpdate,
    findByUuid,
    findAll,
    findConnected,
    findByUsername
  }
}
