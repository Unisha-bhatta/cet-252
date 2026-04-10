const db = require('../db');

/**
 * @api {get} /api/students Get all students
 * @apiName GetStudents
 * @apiGroup Students
 * @apiVersion 1.0.0
 *
 * @apiQuery {String} [course] Filter by course name
 * @apiQuery {Number} [minGrade] Filter by minimum grade
 *
 * @apiSuccess {Object[]} students List of students
 * @apiSuccess {Number} students.id Unique ID
 * @apiSuccess {String} students.name Full name
 * @apiSuccess {Number} students.age Age
 * @apiSuccess {String} students.course Course name
 * @apiSuccess {Number} students.grade Grade percentage
 * @apiSuccess {String} students.email Email address
 * @apiSuccess {Number} students.enrolled_year Year of enrolment
 */
exports.getAllStudents = (req, res) => {
    let query = "SELECT * FROM students";
    const params = [];
    const conditions = [];

    if (req.query.course) {
        conditions.push("course = ?");
        params.push(req.query.course);
    }
    if (req.query.minGrade) {
        const g = parseFloat(req.query.minGrade);
        if (!isNaN(g)) { conditions.push("grade >= ?"); params.push(g); }
    }
    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });
        res.json(rows);
    });
};

/**
 * @api {get} /api/students/:id Get student by ID
 * @apiName GetStudent
 * @apiGroup Students
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} id Student unique ID
 *
 * @apiSuccess {Number} id Unique ID
 * @apiSuccess {String} name Full name
 * @apiSuccess {String} course Course name
 * @apiSuccess {Number} grade Grade percentage
 *
 * @apiError StudentNotFound The student does not exist.
 * @apiErrorExample {json} 404:
 *   { "error": "Student not found" }
 */
exports.getStudentById = (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });
        if (!row) return res.status(404).json({ error: "Student not found" });
        res.json(row);
    });
};

/**
 * @api {post} /api/students Create a new student
 * @apiName CreateStudent
 * @apiGroup Students
 * @apiVersion 1.0.0
 *
 * @apiBody {String} name Full name (min 2 characters)
 * @apiBody {Number} age Age (16-99)
 * @apiBody {String} course Course name
 * @apiBody {Number} [grade] Grade percentage (0-100)
 * @apiBody {String} email Valid email address
 * @apiBody {Number} [enrolled_year] Year of enrolment
 *
 * @apiSuccess {Number} id Newly created student ID
 * @apiSuccess {String} message Success message
 *
 * @apiError ValidationError One or more fields failed validation.
 * @apiErrorExample {json} 400:
 *   { "error": "Name must be at least 2 characters" }
 */
exports.createStudent = (req, res) => {
    const { name, age, course, grade, email, enrolled_year } = req.body;

    if (!name || name.trim().length < 2)
        return res.status(400).json({ error: "Name must be at least 2 characters" });
    if (!age || isNaN(age) || age < 16 || age > 99)
        return res.status(400).json({ error: "Age must be between 16 and 99" });
    if (!course || course.trim().length < 2)
        return res.status(400).json({ error: "Course is required" });
    if (!email || !email.includes('@'))
        return res.status(400).json({ error: "A valid email is required" });
    if (grade !== undefined && (isNaN(grade) || grade < 0 || grade > 100))
        return res.status(400).json({ error: "Grade must be between 0 and 100" });

    db.run(
        "INSERT INTO students (name, age, course, grade, email, enrolled_year) VALUES (?,?,?,?,?,?)",
        [name.trim(), age, course.trim(), grade || null, email.trim(), enrolled_year || new Date().getFullYear()],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE'))
                    return res.status(409).json({ error: "A student with this email already exists" });
                return res.status(500).json({ error: "Database error", details: err.message });
            }
            res.status(201).json({ id: this.lastID, name: name.trim(), message: "Student created successfully" });
        }
    );
};

/**
 * @api {put} /api/students/:id Update a student
 * @apiName UpdateStudent
 * @apiGroup Students
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} id Student unique ID
 *
 * @apiBody {String} [name] Full name
 * @apiBody {Number} [age] Age (16-99)
 * @apiBody {String} [course] Course name
 * @apiBody {Number} [grade] Grade percentage (0-100)
 * @apiBody {String} [email] Email address
 *
 * @apiSuccess {String} message Success message
 *
 * @apiError StudentNotFound Student does not exist.
 * @apiErrorExample {json} 404:
 *   { "error": "Student not found" }
 */
exports.updateStudent = (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const { name, age, course, grade, email, enrolled_year } = req.body;

    if (age !== undefined && (isNaN(age) || age < 16 || age > 99))
        return res.status(400).json({ error: "Age must be between 16 and 99" });
    if (grade !== undefined && (isNaN(grade) || grade < 0 || grade > 100))
        return res.status(400).json({ error: "Grade must be between 0 and 100" });

    db.run(
        `UPDATE students SET
            name = COALESCE(?, name),
            age = COALESCE(?, age),
            course = COALESCE(?, course),
            grade = COALESCE(?, grade),
            email = COALESCE(?, email),
            enrolled_year = COALESCE(?, enrolled_year)
         WHERE id = ?`,
        [name || null, age || null, course || null, grade || null, email || null, enrolled_year || null, id],
        function (err) {
            if (err) return res.status(500).json({ error: "Database error", details: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "Student not found" });
            res.json({ message: "Student updated successfully" });
        }
    );
};

/**
 * @api {delete} /api/students/:id Delete a student
 * @apiName DeleteStudent
 * @apiGroup Students
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} id Student unique ID
 *
 * @apiSuccess {String} message Confirmation message
 *
 * @apiError StudentNotFound Student does not exist.
 * @apiErrorExample {json} 404:
 *   { "error": "Student not found" }
 */
exports.deleteStudent = (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    db.run("DELETE FROM students WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Student not found" });
        res.json({ message: "Student deleted successfully" });
    });
};