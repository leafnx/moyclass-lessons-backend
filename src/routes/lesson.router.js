import Router from 'express'
import lessonController from '../controllers/lesson.controller.js'

const lessonRouter = new Router()

lessonRouter.get('/', lessonController.getLessons)
lessonRouter.post('/lessons', lessonController.createLessons)

export default lessonRouter