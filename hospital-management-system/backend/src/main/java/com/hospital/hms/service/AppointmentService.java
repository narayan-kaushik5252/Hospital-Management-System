package com.hospital.hms.service;

import com.hospital.hms.dto.AppointmentDto;
import com.hospital.hms.entity.Appointment;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.enums.AppointmentStatus;
import com.hospital.hms.exception.ConflictException;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.AppointmentRepository;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public List<AppointmentDto> getAll() {
        return appointmentRepository.findAll().stream().map(this::toDto).toList();
    }

    public AppointmentDto getById(Long id) {
        return toDto(findEntity(id));
    }

    public List<AppointmentDto> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream().map(this::toDto).toList();
    }

    public List<AppointmentDto> getByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream().map(this::toDto).toList();
    }

    public AppointmentDto create(AppointmentDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + dto.getDoctorId()));

        // Prevent double-booking the same doctor at the same timestamp.
        // This existsBy query hits idx_appt_doctor_date rather than scanning
        // the full appointments table.
        if (appointmentRepository.existsByDoctorIdAndAppointmentDate(doctor.getId(), dto.getAppointmentDate())) {
            throw new ConflictException("Doctor already has an appointment at that time");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(dto.getAppointmentDate())
                .reason(dto.getReason())
                .status(AppointmentStatus.SCHEDULED)
                .build();

        return toDto(appointmentRepository.save(appointment));
    }

    public AppointmentDto update(Long id, AppointmentDto dto) {
        Appointment appointment = findEntity(id);

        if (dto.getAppointmentDate() != null) {
            appointment.setAppointmentDate(dto.getAppointmentDate());
        }
        if (dto.getReason() != null) {
            appointment.setReason(dto.getReason());
        }
        if (dto.getStatus() != null) {
            appointment.setStatus(dto.getStatus());
        }
        if (dto.getNotes() != null) {
            appointment.setNotes(dto.getNotes());
        }

        return toDto(appointmentRepository.save(appointment));
    }

    public void delete(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    private Appointment findEntity(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private AppointmentDto toDto(Appointment a) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(a.getId());
        dto.setPatientId(a.getPatient().getId());
        dto.setDoctorId(a.getDoctor().getId());
        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setReason(a.getReason());
        dto.setStatus(a.getStatus());
        dto.setNotes(a.getNotes());
        dto.setPatientName(a.getPatient().getFirstName() + " " + a.getPatient().getLastName());
        dto.setDoctorName("Dr. " + a.getDoctor().getFirstName() + " " + a.getDoctor().getLastName());
        return dto;
    }
}
