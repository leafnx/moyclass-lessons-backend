import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import lessonRouter from './routes/lesson.router.js'

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', lessonRouter)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})