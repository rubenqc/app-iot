'use strict'

const test = require('ava')
const sinon = require('sinon')

const proxyquire = require('proxyquire')

const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () {}
}

let uuid = 'yyy-yyy-yyw'
let id = 2
let MetricStub = null
let AgentStub = null
let sandbox = null
let db = null
let type = 'temperatura'

let uuidArgs = null
let agentUuidArgs = null
let metricTest = {
  type: 'temperatura',
  value: 15.2
}

let metricTestCreate = {
  type: 'temperatura',
  value: 15.2,
  agentId: 1
}

let createArgs = {
  where: {
    uuid
  }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  MetricStub = {
    belongsTo: sandbox.spy()
  }
  AgentStub = {
    hasMany: sandbox.spy()
  }

  agentUuidArgs = {
    attributes: ['id', 'type', 'value', 'createdAt'],
    where: {
      type
    },
    limit: 20,
    order: [['createdAt', 'DESC']],
    include: [{
      attributes: [],
      model: AgentStub,
      where: {
        uuid
      }
    }],
    raw: true
  }
  uuidArgs = {
    attributes: ['type'],
    group: ['type'],
    include: [{
      attributes: [],
      model: AgentStub,
      where: {
        uuid
      }
    }],
    raw: true
  }

  // Metric findAll
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(uuidArgs).returns(Promise.resolve(metricFixtures.findByAgentId(id)))
  MetricStub.findAll.withArgs(agentUuidArgs).returns(Promise.resolve(metricFixtures.findByAgentType(type, id)))

  // Agent findOne
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(createArgs).returns(Promise.resolve(agentFixtures.single))

  // Metric create
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(metricTestCreate).returns(Promise.resolve({
    toJSON () {
      return metricFixtures.single
    }
  }))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.serial('Metric#findByAgentUuid', async t => {
  let metrics = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(uuidArgs), 'findAll should be called with uuid args')

  t.deepEqual(metrics, metricFixtures.findByAgentId(2), 'metrics should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metrics = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(agentUuidArgs), 'findAll should be called with type,uuid args')

  t.deepEqual(metrics, metricFixtures.findByAgentType(type, id), 'metrics should be the same')
})

test.serial('Metric#create - new', async t => {
  let metric = await db.Metric.create(uuid, metricTest)

  t.deepEqual(metric, metricFixtures.single, 'metrics should be the same')
})
