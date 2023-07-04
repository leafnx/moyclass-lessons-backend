const getLessonsQuery = `
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

const createLessonsQuery = `
  WITH insert_l as (
    INSERT INTO lessons (date, title)
    SELECT
      gs::date as date,
      $2 as title
    FROM generate_series(
      $4::date, $6::date, '1 day'
    ) gs

    WHERE extract(dow from gs) = ANY($3::int[])

    ORDER BY date ASC
    LIMIT $5

    RETURNING id
  ),
  insert_lt as (
    INSERT INTO lesson_teachers (lesson_id, teacher_id)
    SELECT
      insert_l.id,
      t.id
    FROM insert_l

    JOIN teachers t
    ON t.id = ANY($1::int[])
  )

  SELECT * FROM insert_l
`

export { getLessonsQuery, createLessonsQuery }