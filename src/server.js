import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mediaRoutes from "./media/index.js"
import filesRoutes from "./files/index.js"
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js"

const server = express()

const port = process.env.PORT || 3001

const whitelist = [process.env.FRONTEND_DEV_URL, process.env.FRONTEND_CLOUD_URL]

const corsOptions = {
  origin: function (origin, next) {
    console.log(process.env.FRONTEND_DEV_URL)
    if (!origin || whitelist.includes(origin)) {
      next(null, true)
    } else {
      next(new Error("Origin is not supported!"))
    }
  },
}

// *********MIDDLEWARES*********
server.use(express.json())
server.use(cors(corsOptions))

// ********ROUTES*********
server.use("/media", mediaRoutes)
server.use("/files", filesRoutes)

// ********ERROR MIDDLEWARES**********
server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(forbiddenErrorHandler)
server.use(catchAllErrorHandler)

console.table(listEndpoints(server))

server.listen(port, () => {
  console.log("Server listening on port ", port)
})
