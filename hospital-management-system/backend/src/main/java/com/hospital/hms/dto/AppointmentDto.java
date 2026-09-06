package com.hospital.hms.dto;

import com.hospital.hms.enums.AppointmentStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentDto {
    private Long id;

    @NotNull
    private Long patientId;

    @NotNull
    private Long doctorId;

    @NotNull
    @Future(message = "Appointment date must be in the future")
    private LocalDateTime appointmentDate;

    private String reason;
    private AppointmentStatus status;
    private String notes;

    // Denormalized display fields, populated on read for convenience
    private String patientName;
    private String doctorName;
}
