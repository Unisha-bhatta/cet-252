const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            course TEXT NOT NULL,
            grade REAL,
            email TEXT UNIQUE,
            enrolled_year INTEGER
        )
    `);

    db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
        if (err || row.count > 0) return;

        const students = [
            ["John Smith",      20, "Computing",   72.5, "j.smith@uni.ac.uk",      2023],
            ["Alice Brown",     19, "Engineering",  65.0, "a.brown@uni.ac.uk",      2024],
            ["David Lee",       21, "Business",     80.0, "d.lee@uni.ac.uk",        2022],
            ["Sarah Khan",      22, "IT",            58.5, "s.khan@uni.ac.uk",       2022],
            ["Michael Roy",     20, "Computing",    91.0, "m.roy@uni.ac.uk",        2023],
            ["Emma Wilson",     18, "Design",       74.0, "e.wilson@uni.ac.uk",     2024],
            ["Daniel Kim",      23, "Engineering",  68.0, "d.kim@uni.ac.uk",        2021],
            ["Sophia Patel",    21, "IT",            83.5, "s.patel@uni.ac.uk",      2022],
            ["Chris Evans",     22, "Business",     55.0, "c.evans@uni.ac.uk",      2022],
            ["Olivia White",    19, "Computing",    77.0, "o.white@uni.ac.uk",      2024],
            ["James Carter",    20, "IT",            62.0, "j.carter@uni.ac.uk",     2023],
            ["Liam Scott",      21, "Engineering",  88.5, "l.scott@uni.ac.uk",      2022],
            ["Noah Adams",      22, "Business",     71.0, "n.adams@uni.ac.uk",      2022],
            ["Mia Clark",       20, "Design",       69.0, "m.clark@uni.ac.uk",      2023],
            ["Ethan Walker",    23, "Computing",    95.0, "e.walker@uni.ac.uk",     2021],
            ["Ava Hall",        19, "IT",            60.5, "a.hall@uni.ac.uk",       2024],
            ["Lucas Young",     21, "Engineering",  75.0, "l.young@uni.ac.uk",      2022],
            ["Isabella King",   22, "Business",     82.0, "i.king@uni.ac.uk",       2022],
            ["Mason Wright",    20, "Computing",    67.0, "m.wright@uni.ac.uk",     2023],
            ["Charlotte Green", 18, "Design",       90.0, "c.green@uni.ac.uk",      2024],
            ["Ryan Murphy",     21, "Computing",    78.5, "r.murphy@uni.ac.uk",     2022],
            ["Zoe Turner",      20, "IT",            85.0, "z.turner@uni.ac.uk",     2023],
            ["Harry Baker",     22, "Engineering",  63.0, "h.baker@uni.ac.uk",      2022],
            ["Lily Morgan",     19, "Business",     76.5, "l.morgan@uni.ac.uk",     2024],
            ["Jack Harris",     23, "Computing",    89.0, "j.harris@uni.ac.uk",     2021]
        ];

        const stmt = db.prepare(
            "INSERT OR IGNORE INTO students (name, age, course, grade, email, enrolled_year) VALUES (?,?,?,?,?,?)"
        );
        students.forEach(s => stmt.run(s));
        stmt.finalize();
    });
});

module.exports = db;