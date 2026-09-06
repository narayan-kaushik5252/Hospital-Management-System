package com.hospital.hms.repository;

import com.hospital.hms.entity.Appointment;
import com.hospital.hms.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Backed by idx_appt_patient_id
    List<Appointment> findByPatientId(Long patientId);

    // Backed by idx_appt_doctor_id
    List<Appointment> findByDoctorId(Long doctorId);

    // Backed by the composite idx_appt_doctor_date index - avoids a table scan
    // when checking a doctor's schedule for conflicts
    List<Appointment> findByDoctorIdAndAppointmentDateBetween(
            Long doctorId, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByStatus(AppointmentStatus status);

    boolean existsByDoctorIdAndAppointmentDate(Long doctorId, LocalDateTime appointmentDate);
}
