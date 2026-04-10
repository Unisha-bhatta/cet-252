const API_BASE = 'http://localhost:3000/api/students';

let allStudents = [];
let pendingDeleteId = null;

// ─── NAVIGATION ────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`view-${view}`).classList.add('active');
    if (view === 'students') loadStudents();
    if (view === 'dashboard') loadDashboard();
  });
});

// ─── API STATUS ────────────────────────────────────────
async function checkApiStatus() {
  const el = document.getElementById('apiStatus');
  const txt = document.getElementById('statusText');
  try {
    const res = await fetch('http://localhost:3000/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      el.className = 'api-status online';
      txt.textContent = 'API Online';
    } else {
      throw new Error();
    }
  } catch {
    el.className = 'api-status offline';
    txt.textContent = 'API Offline';
  }
}

// ─── GRADE HELPERS ─────────────────────────────────────
function gradeClass(g) {
  if (g === null || g === undefined) return '';
  if (g >= 70) return 'grade-a';
  if (g >= 60) return 'grade-b';
  if (g >= 50) return 'grade-c';
  return 'grade-d';
}

function formatGrade(g) {
  if (g === null || g === undefined) return '<span style="color:var(--text-muted)">N/A</span>';
  return `<span class="grade-badge ${gradeClass(g)}">${g}%</span>`;
}

// ─── DASHBOARD ─────────────────────────────────────────
async function loadDashboard() {
  try {
    const res = await fetch(API_BASE);
    const students = await res.json();
    allStudents = students;

    document.getElementById('statTotal').textContent = students.length;

    const grades = students.map(s => s.grade).filter(g => g != null);
    const avg = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : '—';
    const top = grades.length ? Math.max(...grades) : '—';

    document.getElementById('statAvg').textContent = avg !== '—' ? avg + '%' : '—';
    document.getElementById('statTop').textContent = top !== '—' ? top + '%' : '—';

    const courses = new Set(students.map(s => s.course));
    document.getElementById('statCourses').textContent = courses.size;

    // Top 5 performers
    const top5 = [...students].filter(s => s.grade != null).sort((a, b) => b.grade - a.grade).slice(0, 5);
    const tbody = document.getElementById('topTableBody');
    tbody.innerHTML = top5.map((s, i) => `
      <tr>
        <td><strong>${i + 1}</strong></td>
        <td>${s.name}</td>
        <td>${s.course}</td>
        <td>${formatGrade(s.grade)}</td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

// ─── LOAD ALL STUDENTS ─────────────────────────────────
async function loadStudents() {
  const loadMsg = document.getElementById('loadingMsg');
  const emptyMsg = document.getElementById('emptyMsg');
  const tbody = document.getElementById('studentTableBody');

  loadMsg.style.display = 'block';
  emptyMsg.style.display = 'none';
  tbody.innerHTML = '';

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    allStudents = data;
    loadMsg.style.display = 'none';
    renderTable(data);
  } catch (err) {
    loadMsg.textContent = '⚠ Could not load students. Is the API running?';
  }
}

function renderTable(students) {
  const tbody = document.getElementById('studentTableBody');
  const emptyMsg = document.getElementById('emptyMsg');

  if (!students.length) {
    emptyMsg.style.display = 'block';
    tbody.innerHTML = '';
    return;
  }

  emptyMsg.style.display = 'none';
  tbody.innerHTML = students.map(s => `
    <tr data-id="${s.id}">
      <td><code style="color:var(--text-muted);font-size:12px">#${s.id}</code></td>
      <td><strong>${s.name}</strong></td>
      <td>${s.age}</td>
      <td>${s.course}</td>
      <td>${formatGrade(s.grade)}</td>
      <td style="font-size:12px;color:var(--text-muted)">${s.email}</td>
      <td>${s.enrolled_year || '—'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="openEditModal(${s.id})">Edit</button>
          <button class="btn-delete" onclick="openDeleteModal(${s.id}, '${s.name.replace(/'/g, "\\'")}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ─── SEARCH & FILTER ───────────────────────────────────
document.getElementById('searchInput').addEventListener('input', applyFilter);
document.getElementById('courseFilter').addEventListener('change', applyFilter);

function applyFilter() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const course = document.getElementById('courseFilter').value;
  const filtered = allStudents.filter(s => {
    const matchName = s.name.toLowerCase().includes(q);
    const matchCourse = !course || s.course === course;
    return matchName && matchCourse;
  });
  renderTable(filtered);
}

// ─── CREATE ────────────────────────────────────────────
async function submitCreate() {
  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');

  const body = {
    name:          document.getElementById('f-name').value.trim(),
    age:           parseInt(document.getElementById('f-age').value),
    course:        document.getElementById('f-course').value,
    grade:         parseFloat(document.getElementById('f-grade').value) || undefined,
    email:         document.getElementById('f-email').value.trim(),
    enrolled_year: parseInt(document.getElementById('f-year').value) || undefined
  };

  msg.className = 'form-msg';
  msg.textContent = '';

  if (!body.name || !body.age || !body.course || !body.email) {
    msg.className = 'form-msg error';
    msg.textContent = 'Please fill in all required fields.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Adding…';

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create student');

    msg.className = 'form-msg success';
    msg.textContent = `✓ Student "${body.name}" added with ID #${data.id}`;
    ['f-name','f-age','f-course','f-grade','f-email','f-year'].forEach(id => {
      document.getElementById(id).value = '';
    });
  } catch (err) {
    msg.className = 'form-msg error';
    msg.textContent = '✗ ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Student';
  }
}

// ─── EDIT MODAL ────────────────────────────────────────
function openEditModal(id) {
  const student = allStudents.find(s => s.id === id);
  if (!student) return;

  document.getElementById('edit-id').value    = student.id;
  document.getElementById('edit-name').value  = student.name;
  document.getElementById('edit-age').value   = student.age;
  document.getElementById('edit-course').value = student.course;
  document.getElementById('edit-grade').value = student.grade || '';
  document.getElementById('edit-email').value = student.email;
  document.getElementById('editMsg').textContent = '';
  document.getElementById('editMsg').className = 'form-msg';

  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
}

async function submitUpdate() {
  const id  = document.getElementById('edit-id').value;
  const msg = document.getElementById('editMsg');

  const body = {
    name:   document.getElementById('edit-name').value.trim() || undefined,
    age:    parseInt(document.getElementById('edit-age').value) || undefined,
    course: document.getElementById('edit-course').value || undefined,
    grade:  parseFloat(document.getElementById('edit-grade').value) || undefined,
    email:  document.getElementById('edit-email').value.trim() || undefined
  };

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');

    msg.className = 'form-msg success';
    msg.textContent = '✓ Updated successfully';
    setTimeout(() => {
      closeModal();
      loadStudents();
    }, 800);
  } catch (err) {
    msg.className = 'form-msg error';
    msg.textContent = '✗ ' + err.message;
  }
}

// ─── DELETE MODAL ──────────────────────────────────────
function openDeleteModal(id, name) {
  pendingDeleteId = id;
  document.getElementById('deleteStudentName').textContent = name;
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('deleteModal').classList.remove('open');
}

async function confirmDelete() {
  if (!pendingDeleteId) return;

  try {
    const res = await fetch(`${API_BASE}/${pendingDeleteId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    closeDeleteModal();
    loadStudents();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Close modals on overlay click
document.getElementById('editModal').addEventListener('click', e => {
  if (e.target === document.getElementById('editModal')) closeModal();
});
document.getElementById('deleteModal').addEventListener('click', e => {
  if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
});

// ─── INIT ──────────────────────────────────────────────
checkApiStatus();
loadDashboard();