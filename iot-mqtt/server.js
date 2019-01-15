'use strict'

const debug = require('debug')('iot-node:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('iot-db')

const { parsePayload } = require('./utils')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const config = {
  database: process.env.DB_NAME || 'iotnode',
  username: process.env.DB_USER || 'ruben',
  password: process.env.DB_PASS || 'kof2002',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: s => debug(s),
  operatorsAliases: false
}

let Agent, Metric

/** Mosca */
const server = new mosca.Server(settings)
const clients = new Map()

server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

server.on('clientDisconnected', async client => {
  debug(`Client Disconnected: ${client.id}`)
  const agent = clients.get(client.id)

  if (agent) {
    // Marcar agente como desconectado
    agent.connected = false

    try {
      await Agent.createOrUpdate(Agent)
    } catch (e) {
      return handleError(e)
    }

    // Borrar el agente de la lista de clientes
    clients.delete(client.id)

    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    debug(`Cliente (${client.id}) asociado al Agente (${agent.uuid}) fue marcado como desconectado`)
  }
})

server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case ' agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
      debug(`Payload: ${packet.payload}`)

      const payload = parsePayload(packet.payload)

      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }

        debug(`Agent ${agent.uuid} saved`)

        // Notificar que el agent fue conectado
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        // Almacenar las metricas   - RETO: Guardar las metricas de manera paralela y no en serie
        for (let metric of payload.metrics) {
          let m

          try {
            m = await Metric.create(agent.uuid, metric)
          } catch (e) {
            return handleError(e)
          }

          debug(`Metric ${m.id} saved on agent  ${agent.uuid}`)
        }
      }
      break
  }

  debug(`Paylaod: ${packet.payload}`)
})

/** Iniciar mqtt */
server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[iot-mqtt]')} server is running`)
})

/** Gestion de error */

server.on('error', (err) => {
  debug('Redis connection error', err)
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.log(`${chalk.red('[fatal error]')} ${err.message}`)
  console.log(err.stack)
  process.exit(1)
}

function handleError (err) {
  console.log(`${chalk.red('[fatal error]')} ${err.message}`)
  console.log(err.stack)
}

process.on('uncaughException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
