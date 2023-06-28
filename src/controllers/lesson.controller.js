import db from "../db.js"

class LessonController {
  async getLessons(req, res, next) {
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

      const query = `
        SELECT
          l.*,
          ls.visit_count as visit_count,
          ls.students as students,
          lt.teachers as teachers
        FROM lessons l
        
        LEFT JOIN (
          SELECT
            ls.lesson_id,
            count(*) filter (where visit) as visit_count,
            jsonb_agg(
              jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'visit', ls.visit
              )
            ) AS students
        
          FROM lesson_students ls
        
          LEFT JOIN students s
          ON ls.student_id = s.id
        
          GROUP BY ls.lesson_id
        ) ls
        ON l.id = ls.lesson_id
        
        LEFT JOIN (
          SELECT
            lt.lesson_id,
            jsonb_agg(t) AS teachers
        
          FROM lesson_teachers lt
        
          LEFT JOIN teachers t
          ON lt.teacher_id = t.id
        
          GROUP BY lt.lesson_id
        ) lt
        ON l.id = lt.lesson_id
        
        WHERE 1 = 1
          AND ($1::date is null or l.date between $1 and $2)
          AND ($3::int is null or $3 = l.status)
          AND ($4::text[] is null or to_json(array(select jsonb_array_elements(teachers) ->> 'id'))::jsonb ?| $4)
          AND ($5::int is null or jsonb_array_length(ls.students) between $5 and $6)
        
        ORDER BY l.date ASC

        OFFSET $7 LIMIT $8
      `
  
      const lessons = await db.query(query, [
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
  
      res.status(200).json({ msg: 'it works' })
    }
    catch {
      console.error(err)
      res.status(400).json({ error: err.message }).end()
    }
  }
}

const lessonController = new LessonController
export default lessonController