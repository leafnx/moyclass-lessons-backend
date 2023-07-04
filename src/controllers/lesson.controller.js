import moment from "moment/moment.js"
import db from "../db.js"
import { getLessonsQuery, createLessonsQuery } from "../queries/lesson.queries.js"

class LessonController {
  async getLessons(req, res) {
    try {
      const {
        date,
        status,
        teacherIds,
        studentsCount,
        page = '1',
        lessonsPerPage = '5'
      } = req.query

      // get low and high values from string
      const getLowAndHighValues = (values) => {
        if (!values) return []
  
        const valuesArray = values.replace(/\s/g, '').split(',')

        return valuesArray.length === 1 ? [values, values] : valuesArray
      }

      // convert date to low and high values for use with 'between' operator
      const [dateLow, dateHigh] = getLowAndHighValues(date)

      // get array of teacher ids from string
      const teacherIdsArray = teacherIds
        ? teacherIds.replace(/\s/g, '').split(',')
        : null

      // convert studentsCount to low and high values for use with 'between' operator
      const [studentsCountLow, studentsCountHigh] = getLowAndHighValues(studentsCount)
      
      // get offset for pagination
      const offset = (page - 1) * lessonsPerPage
  
      const lessons = await db.query(getLessonsQuery, [
        dateLow,
        dateHigh,
        status,
        teacherIdsArray,
        studentsCountLow,
        studentsCountHigh,
        offset,
        lessonsPerPage
      ])
      res.status(200).json(lessons.rows)
    }
    catch (err) {
      console.error(err)
      res.status(400).json({ error: err.message }).end()
    }
  }

  async createLessons(req, res) {
    try {
      const {
        teacherIds,
        title = 'Blue Ocean',
        days,
        firstDate,
        lessonsCount,
        lastDate
      } = req.body

      if (lessonsCount && lastDate) {
        throw { message: `You must provide only one of: (lessonsCount, lastDate)` }
      }

      const lessonsCountFormatted = lessonsCount || 300
      const lastDateFormatted = lastDate || moment(firstDate).add(1, 'year').format('YYYY-MM-DD')

      const addedIds = await db.query(createLessonsQuery, [
        teacherIds,
        title,
        days,
        firstDate,
        lessonsCountFormatted,
        lastDateFormatted
      ])
      const addedIdsFormatted = addedIds.rows.map(row => row.id)

      res.status(200).json({ addedIds: addedIdsFormatted })
    }
    catch (err) {
      console.error(err)
      res.status(400).json({ error: err.message }).end()
    }
  }

  async clear(req, res) {
    try {
      const query = `
        WITH delete_l as (
          DELETE FROM lessons
          WHERE title = 'Blue Ocean'
          RETURNING id
        ),
        delete_lt as (
          DELETE FROM lesson_teachers
          USING delete_l
          WHERE lesson_id = delete_l.id
        )
        
        SELECT * FROM delete_l
      `

      const deletedIds = await db.query(query)
      const deletedIdsFormatted = deletedIds.rows.map(row => row.id)
  
      res.status(200).json({ deletedIds: deletedIdsFormatted })
    }
    catch (err) {
      console.error(err)
      res.status(400).json({ error: err.message }).end()
    }
  }
}

const lessonController = new LessonController
export default lessonController