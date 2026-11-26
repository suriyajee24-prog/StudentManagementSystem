package com.student.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.student.model.Student;
import com.student.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    public List<Student> getAllStudents() {
        return repo.findAll();
    }

    public Student addStudent(Student student) {
        return repo.save(student);
    }

    // Idhu than unakku missing
    public List<Student> addAllStudents(List<Student> students) {
        return repo.saveAll(students);
    }

    public Student updateStudent(Long id, Student newData) {
        Student s = repo.findById(id).orElseThrow();
        s.setName(newData.getName());
        s.setEmail(newData.getEmail());
        s.setDepartment(newData.getDepartment());
        s.setYear(newData.getYear());
        return repo.save(s);
    }

    public void deleteStudent(Long id) {
        repo.deleteById(id);
    }
}
