package com.weighlanka.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("customers")
public class Customer {

    @Id
    private String id;

    private String name;
    private String address;
    private String location;
    private String phone;
}
