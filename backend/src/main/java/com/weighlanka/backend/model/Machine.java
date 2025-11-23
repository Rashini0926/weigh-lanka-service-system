package com.weighlanka.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("machines")
public class Machine {

    @Id
    private String id;

    private String customerId;   // link customer → machine

    private String model;
    private String serialNo;
    private String capacity;
    private String regNo;
    private String internalIdNo;
}
