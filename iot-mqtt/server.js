'use strict'

const debug = require('debug')('iot-node:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const server = new mosca.Server(settings)

server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
})

server.on('clientDisconnected', client => {
  debug(`Client Disconnected: ${client.id}`)
})

server.on('published', (packet, client) => {
  debug(`Received: ${packet.topic}`)
  debug(`Paylaod: ${packet.payload}`)
})

server.on('ready', () => {
  console.log(`${chalk.green('[iot-mqtt]')} server is running`)
})

server.on('error', (err) => {
  debug('Redis connection error', err)
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.log(`${chalk.red('[fatal error]')} ${err.message}`)
  console.log(err.stack)
  process.exit(1)
}

process.on('uncaughException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
