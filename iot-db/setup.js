'use strict'

const debug = require('debug')('iot-node:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')

const prompt = inquirer.createPromptModule()
async function setup () {

  if(process.argv[2]!='-y' && process.argv[2]!='--yes'){
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ])
  
    if (!answer.setup) {
      return console.log('Nothing happened :D')
    }
  }

  const config = {
    database: process.env.DB_NAME || 'iotnode',
    username: process.env.DB_USER || 'ruben',
    password: process.env.DB_PASS || 'kof2002',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: s => debug(s),
    setup: true,
    operatorsAliases:false
  }

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
