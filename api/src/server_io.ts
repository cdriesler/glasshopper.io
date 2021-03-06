import express from 'express'
import { Server } from 'http'
import { serverConfig } from './store'
import * as db from './db'
import * as io from './io'

const PORT = process.env.PORT || 3100

const router = express().set('port', PORT)
const server = new Server(router)

db.initialize()
io.initialize(server)

server.listen(PORT)
