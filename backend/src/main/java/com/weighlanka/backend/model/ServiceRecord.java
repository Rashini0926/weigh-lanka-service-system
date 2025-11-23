package com.weighlanka.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "service_records")
public class ServiceRecord {

    @Id
    private String id;

    private String customerId;     // Reference to Customer
    private String machineId;      // Reference to Machine

    private LocalDate serviceDate;
    private LocalDate nextServiceDate;

    private String technicianName;
    private String remarks;
    private double serviceCost;
}
