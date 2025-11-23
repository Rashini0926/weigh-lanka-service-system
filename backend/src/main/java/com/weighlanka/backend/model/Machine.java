package com.weighlanka.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "machines")
public class Machine {

    @Id
    private String id;

    private String machineName;
    private String location;
    private String status;    // Active, Inactive, Under Maintenance
    private String type;      // Weighbridge, Scale, etc.
}
