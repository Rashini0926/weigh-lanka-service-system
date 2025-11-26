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

    private String customerId;
    private String machineId;

    private LocalDate serviceDate;
    private LocalDate nextServiceDate;

    private String technicianName;
    private String remarks;
    private double serviceCost;

    // NEW FIELDS – for Excel table
    private Integer visitNo;   // NO column
    private String invoiceNo;  // INV NO column
}
