package com.hospital.hms.service;

import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public List<DoctorDto> getAll() {
        return doctorRepository.findAll().stream().map(this::toDto).toList();
    }

    public DoctorDto getById(Long id) {
        return toDto(findEntity(id));
    }

    public List<DoctorDto> getBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationIgnoreCase(specialization)
                .stream().map(this::toDto).toList();
    }

    public DoctorDto create(DoctorDto dto) {
        Doctor doctor = Doctor.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .specialization(dto.getSpecialization())
                .phone(dto.getPhone())
                .yearsExperience(dto.getYearsExperience())
                .available(true)
                .build();
        return toDto(doctorRepository.save(doctor));
    }

    public DoctorDto update(Long id, DoctorDto dto) {
        Doctor doctor = findEntity(id);
        doctor.setFirstName(dto.getFirstName());
        doctor.setLastName(dto.getLastName());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setPhone(dto.getPhone());
        doctor.setYearsExperience(dto.getYearsExperience());
        doctor.setAvailable(dto.isAvailable());
        return toDto(doctorRepository.save(doctor));
    }

    public void delete(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor not found: " + id);
        }
        doctorRepository.deleteById(id);
    }

    private Doctor findEntity(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
    }

    private DoctorDto toDto(Doctor d) {
        DoctorDto dto = new DoctorDto();
        dto.setId(d.getId());
        dto.setFirstName(d.getFirstName());
        dto.setLastName(d.getLastName());
        dto.setSpecialization(d.getSpecialization());
        dto.setPhone(d.getPhone());
        dto.setYearsExperience(d.getYearsExperience());
        dto.setAvailable(d.isAvailable());
        return dto;
    }
}
