package com.weighlanka.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ServiceTableRow {

    private LocalDate date;          // DATE
    private Integer no;              // NO
    private String invoiceNo;        // INV NO
    private String nameAndAddress;   // NAME & ADDRESS
    private String location;         // LOCATION
    private String tel;              // TEL
    private String model;            // MODEL
    private String serialNo;         // SERIAL NO
    private String cap;              // CAP
    private String regNo;            // REG NO
    private String idNo;             // ID NO
    private String servicedBy;       // Serviced By
}
