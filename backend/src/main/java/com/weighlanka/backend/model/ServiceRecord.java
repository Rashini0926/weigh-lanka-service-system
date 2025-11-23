package com.weighlanka.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document("service_records")
public class ServiceRecord {

    @Id
    private String id;

    private String machineId;

    private LocalDate serviceDate;
    private LocalDate nextServiceDate;

    private String invoiceNo;
    private String servicedBy;
}
