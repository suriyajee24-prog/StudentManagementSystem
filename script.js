
const API_URL = "xxx";

const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const yearInput = document.getElementById("year");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

let editingId = null;

// Send HTTP requests to the Spring Boot backend
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            errorText || `Request failed: ${response.status}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Display a message on the page
function showMessage(text) {
    message.textContent = text;
}

// Load students from the database
async function loadStudents(keyword = "") {
    studentTable.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");
    loadingCell.colSpan = 6;
    loadingCell.textContent = "Loading students...";
    loadingRow.appendChild(loadingCell);
    studentTable.appendChild(loadingRow);

    try {
        let url = API_URL;

        if (keyword.trim() !== "") {
            url += "?keyword=" + encodeURIComponent(keyword.trim());
        }

        const students = await apiRequest(url);
        studentTable.replaceChildren();

        if (students.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 6;
            cell.textContent = "No students found.";
            row.appendChild(cell);
            studentTable.appendChild(row);
            return;
        }

        students.forEach(student => {
            const row = document.createElement("tr");

            addCell(row, student.id);
            addCell(row, student.name);
            addCell(row, student.email);
            addCell(row, student.department);
            addCell(row, student.year);

            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-button";
            editButton.addEventListener("click", () => {
                editStudent(student);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-button";
            deleteButton.addEventListener("click", () => {
                deleteStudent(student.id);
            });

            actionCell.append(editButton, deleteButton);
            row.appendChild(actionCell);
            studentTable.appendChild(row);
        });
    } catch (error) {
        studentTable.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "Unable to load students. Check the backend.";
        row.appendChild(cell);
        studentTable.appendChild(row);

        showMessage("Error: " + error.message);
    }
}

// Create one table cell
function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "";
    row.appendChild(cell);
}

// Add or update a student
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const student = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        department: departmentInput.value,
        year: Number(yearInput.value)
    };

    if (
        !student.name ||
        !student.email ||
        !student.department ||
        !student.year
    ) {
        showMessage("Please fill in all fields.");
        return;
    }

    try {
        if (editingId === null) {
            await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify(student)
            });

            showMessage("Student added successfully!");
        } else {
            await apiRequest(`${API_URL}/${editingId}`, {
                method: "PUT",
                body: JSON.stringify(student)
            });

            showMessage("Student updated successfully!");
        }

        resetForm();
        await loadStudents(searchInput.value);
    } catch (error) {
        showMessage("Error: " + error.message);
    }
});

// Fill the form for editing
function editStudent(student) {
    editingId = student.id;

    nameInput.value = student.name;
    emailInput.value = student.email;
    departmentInput.value = student.department;
    yearInput.value = String(student.year);

    formTitle.textContent = "Edit Student";
    saveButton.textContent = "Update Student";
    cancelButton.hidden = false;

    form.scrollIntoView({ behavior: "smooth" });
}

// Delete a student
async function deleteStudent(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        showMessage("Student deleted successfully!");
        await loadStudents(searchInput.value);

        if (editingId === id) {
            resetForm();
        }
    } catch (error) {
        showMessage("Error: " + error.message);
    }
}

// Reset the form
function resetForm() {
    form.reset();
    editingId = null;

    formTitle.textContent = "Add Student";
    saveButton.textContent = "Add Student";
    cancelButton.hidden = true;
}

// Cancel editing
cancelButton.addEventListener("click", resetForm);

// Search by student name or email
searchInput.addEventListener("input", function() {
    loadStudents(searchInput.value);
});

// Load the initial student list
loadStudents();
