import 'dotenv/config'
import db from '../src/db.js'
import { getLessonsQuery, createLessonsQuery } from '../src/queries/lesson.queries.js'

describe('queries', () => {
  afterAll(async () => {
    await db.end()
  })

  describe('getLessons query', () => {
    const getLessonsParams = [
      // dateLow, dateHigh, status, teacherIdsArray, studentsCountLow, studentsCountHigh, offset, lessonsPerPage
      [null, null, null, null, null, null, null, null],
      ['2019-09-02', '2019-09-02', null, null, null, null, null, null],
      ['2019-09-02', '2020-09-02', null, null, null, null, null, null],
      [null, null, 1, null, null, null, null, null],
      [null, null, null, [1,2], null, null, null, null],
      [null, null, null, null, 1, 1, null, null],
      [null, null, null, null, 1, 2, null, null],
      [null, null, null, null, null, null, 3, 3],
      ['2019-09-02', '2019-09-02', 1, [1,2], 1, 2, 3, 3]
    ]
  
    test.each(getLessonsParams)('should work with different params', async (
      dateLow,
      dateHigh,
      status,
      teacherIdsArray,
      studentsCountLow,
      studentsCountHigh,
      offset,
      lessonsPerPage
    ) => {
      const client = await db.connect()
  
      try {
        await client.query('BEGIN')
  
        await client.query(getLessonsQuery, [
          dateLow,
          dateHigh,
          status,
          teacherIdsArray,
          studentsCountLow,
          studentsCountHigh,
          offset,
          lessonsPerPage
        ])
  
        await client.query('ROLLBACK')
      }
      catch (err) {
        throw err
      }
      finally {
        client.release()
      }
    })
  })

  describe('createLessons query', () => {
    const createLessonsParams = [
      // teacherIds, title, days, firstDate, lessonsCountFormatted, lastDateFormatted
      [[1,2], null, [0,1,3,6], "2023-06-01", 9, null],
      [[1,2], null, [0,1,3,6], "2023-06-01", null, "2025-06-01"],
      [null, null, [0,1,3,6], "2023-06-01", 9, null]
    ]

    test.each(createLessonsParams)('should work with different params', async (
      teacherIds,
      title = 'Blue Ocean',
      days,
      firstDate,
      lessonsCountFormatted,
      lastDateFormatted
    ) => {
      const client = await db.connect()
  
      try {
        await client.query('BEGIN')
  
        await client.query(createLessonsQuery, [
          teacherIds,
          title,
          days,
          firstDate,
          lessonsCountFormatted,
          lastDateFormatted
        ])
  
        await client.query('ROLLBACK')
      }
      catch (err) {
        throw err
      }
      finally {
        client.release()
      }
    })
  })
})