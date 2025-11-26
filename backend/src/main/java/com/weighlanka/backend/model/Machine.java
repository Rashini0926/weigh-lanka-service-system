package com.weighlanka.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "machines")
public class Machine {

    @Id
    private String id;

    private String customerId;      // FK → Customer

    private String model;
    private String serialNumber;
    private LocalDate installedDate;
    private String warranty;

    private LocalDate lastServiceDate;
    private LocalDate nextServiceDate;

    // NEW FIELDS – for Excel table
    private String capacity;   // CAP column (e.g. "15kg")
    private String regNo;      // REG NO column
    private String idNo;       // ID NO column
}
