

document.addEventListener("DOMContentLoaded", () => {
  populateClasses();
  showStudentsList();
});


function showAddStudentForm() {
  document.getElementById('addStudentPopup').style.display = 'block';
}

function showAddClassForm() {
  document.getElementById('addClassPopup').style.display = 'block';
}

function closePopup() {
  const studentPopup = document.getElementById('addStudentPopup');
  const classPopup = document.getElementById('addClassPopup');
  if (studentPopup) studentPopup.style.display = 'none';
  if (classPopup) classPopup.style.display = 'none';
}


function addClass() {
  const newClassName = document.getElementById('newClassName').value.trim();
  if (!newClassName) {
    alert("Please provide a class name.");
    return;
  }

  const classSelector = document.getElementById('classSelector');
  const newOption = document.createElement('option');
  newOption.value = newClassName;
  newOption.text = newClassName;
  classSelector.add(newOption);

  saveClasses();
  closePopup();
}

function populateClasses() {
  try {
    const savedClasses = JSON.parse(localStorage.getItem('classes')) || [];
    const classSelector = document.getElementById('classSelector');
    savedClasses.forEach(className => {
      const option = document.createElement('option');
      option.value = className;
      option.text = className;
      classSelector.add(option);
    });
  } catch (e) {
    console.error('Error loading classes:', e);
  }
}

function saveClasses() {
  const classSelector = document.getElementById('classSelector');
  const classes = Array.from(classSelector.options).map(opt => opt.value);
  localStorage.setItem('classes', JSON.stringify(classes));
}


function addStudent() {
  const name = document.getElementById('newStudentName').value.trim();
  const roll = document.getElementById('newStudentRoll').value.trim();
  const classSelector = document.getElementById('classSelector');
  const selectedClass = classSelector.value;

  if (!name || !roll) {
    alert("Please provide both name and roll number.");
    return;
  }

  const studentsList = document.getElementById('studentsList');
  const listItem = document.createElement('li');
  listItem.setAttribute('data-roll-number', roll);
  listItem.innerHTML = `<strong>${name}</strong> (Roll No. ${roll})`;

  listItem.appendChild(createButton('A', 'absent', () => markAttendance('absent', listItem, selectedClass)));
  listItem.appendChild(createButton('P', 'present', () => markAttendance('present', listItem, selectedClass)));
  listItem.appendChild(createButton('L', 'leave', () => markAttendance('leave', listItem, selectedClass)));

  studentsList.appendChild(listItem);
  saveStudentsList(selectedClass);
  closePopup();
}

function saveStudentsList(selectedClass) {
  const studentsList = document.getElementById('studentsList');
  const savedStudents = JSON.parse(localStorage.getItem('students')) || {};
  const students = Array.from(studentsList.children).map(item => ({
    name: item.querySelector('strong').innerText,
    rollNumber: item.getAttribute('data-roll-number')
  }));

  savedStudents[selectedClass] = students;
  localStorage.setItem('students', JSON.stringify(savedStudents));
}

function showStudentsList() {
  const classSelector = document.getElementById('classSelector');
  const selectedClass = classSelector.value;
  const studentsList = document.getElementById('studentsList');
  studentsList.innerHTML = '';

  const savedStudents = JSON.parse(localStorage.getItem('students')) || {};
  const selectedClassStudents = savedStudents[selectedClass] || [];

  selectedClassStudents.forEach(student => {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-roll-number', student.rollNumber);
    listItem.innerHTML = `<strong>${student.name}</strong> (Roll No. ${student.rollNumber})`;

    const absentButton = createButton('A', 'absent', () => markAttendance('absent', listItem, selectedClass));
    const presentButton = createButton('P', 'present', () => markAttendance('present', listItem, selectedClass));
    const leaveButton = createButton('L', 'leave', () => markAttendance('leave', listItem, selectedClass));

    const savedColor = getSavedColor(selectedClass, student.rollNumber);
    if (savedColor) listItem.style.backgroundColor = savedColor;

    listItem.append(absentButton, presentButton, leaveButton);
    studentsList.appendChild(listItem);
  });

  showSummary(selectedClass);
}


function markAttendance(status, listItem, selectedClass) {
  const name = listItem.querySelector('strong').innerText;
  const rollNumber = listItem.getAttribute('data-roll-number');

  listItem.style.backgroundColor = getStatusColor(status);
  saveColor(selectedClass, rollNumber, getStatusColor(status));

  updateAttendanceRecord(name, selectedClass, status);
  showSummary(selectedClass);
}

function updateAttendanceRecord(name, selectedClass, status) {
  const savedData = JSON.parse(localStorage.getItem('attendanceData')) || [];
  const existingIndex = savedData.findIndex(r => r.name === name && r.class === selectedClass);

  if (existingIndex !== -1) {
    savedData[existingIndex].status = status;
    savedData[existingIndex].date = getCurrentDate();
  } else {
    savedData.push({ name, class: selectedClass, status, date: getCurrentDate() });
  }

  localStorage.setItem('attendanceData', JSON.stringify(savedData));
}

function showSummary(selectedClass) {
  const savedData = JSON.parse(localStorage.getItem('attendanceData')) || [];
  const classData = savedData.filter(r => r.class === selectedClass);

  const total = new Set(classData.map(r => r.name)).size;
  const present = classData.filter(r => r.status === 'present').length;
  const absent = classData.filter(r => r.status === 'absent').length;
  const leave = classData.filter(r => r.status === 'leave').length;

  document.getElementById('totalStudents').innerText = total;
  document.getElementById('totalPresent').innerText = present;
  document.getElementById('totalAbsent').innerText = absent;
  document.getElementById('totalLeave').innerText = leave;
}

function showAttendanceResult(selectedClass) {
  const resultSection = document.getElementById('resultSection');
  const savedData = JSON.parse(localStorage.getItem('attendanceData')) || [];
  const classData = savedData.filter(r => r.class === selectedClass);

  const total = new Set(classData.map(r => r.name)).size;
  const present = classData.filter(r => r.status === 'present').length;
  const absent = classData.filter(r => r.status === 'absent').length;
  const leave = classData.filter(r => r.status === 'leave').length;

  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  resultSection.innerHTML = `
    <p>Date: ${date} | Time: ${time}</p>
    <p>Class: ${selectedClass}</p>
    <p>Total Students: ${total}</p>
    <p>Present: ${present}</p>
    <p>Absent: ${absent}</p>
    <p>Leave: ${leave}</p>
  `;
  resultSection.style.display = 'block';
}

function getStatusColor(status) {
  switch (status) {
    case 'absent': return '#e74c3c';
    case 'present': return '#2ecc71';
    case 'leave': return '#f39c12';
    default: return '';
  }
}

function getCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function createButton(text, className, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.innerText = text;
  btn.className = className;
  btn.onclick = onClick;
  return btn;
}

function saveColor(selectedClass, rollNumber, color) {
  const colors = JSON.parse(localStorage.getItem('colors')) || {};
  if (!colors[selectedClass]) colors[selectedClass] = {};
  colors[selectedClass][rollNumber] = color;
  localStorage.setItem('colors', JSON.stringify(colors));
}

function getSavedColor(selectedClass, rollNumber) {
  const colors = JSON.parse(localStorage.getItem('colors')) || {};
  return colors[selectedClass]?.[rollNumber] || null;
}
function submitAttendance() {
  const classSelector = document.getElementById('classSelector');
  const selectedClass = classSelector.value;

  if (!selectedClass) {
    alert("Please select a class first.");
    return;
  }

  const studentsList = document.querySelectorAll('#studentsList li');
  if (studentsList.length === 0) {
    alert("No students found for this class.");
    return;
  }

  let totalPresent = 0, totalAbsent = 0, totalLeave = 0;

  studentsList.forEach(studentItem => {
    const name = studentItem.querySelector('strong').innerText;
    const rollNumber = studentItem.getAttribute('data-roll-number');

    const savedColors = JSON.parse(localStorage.getItem('colors')) || {};
    const classColors = savedColors[selectedClass] || {};
    const color = classColors[rollNumber];

    let status = '';
    if (color === '#2ecc71') status = 'present';
    else if (color === '#e74c3c') status = 'absent';
    else if (color === '#f39c12') status = 'leave';
    else status = 'absent'; 
    if (status === 'present') totalPresent++;
    if (status === 'absent') totalAbsent++;
    if (status === 'leave') totalLeave++;

    updateAttendanceRecord(name, selectedClass, status);
  });

  document.getElementById('totalStudents').innerText = studentsList.length;
  document.getElementById('totalPresent').innerText = totalPresent;
  document.getElementById('totalAbsent').innerText = totalAbsent;
  document.getElementById('totalLeave').innerText = totalLeave;

  showAttendanceResult(selectedClass);
  alert("✅ Attendance submitted successfully!");
}
