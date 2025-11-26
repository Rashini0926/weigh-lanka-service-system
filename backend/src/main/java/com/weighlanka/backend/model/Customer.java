package com.weighlanka.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "customers")
public class Customer {

    @Id
    private String id;

    private String customerName;
    private String address;
    private String phone;
    private String email;

    // NEW FIELD – for Excel LOCATION column
    private String location;   // e.g. "Embilipitiya"
}
