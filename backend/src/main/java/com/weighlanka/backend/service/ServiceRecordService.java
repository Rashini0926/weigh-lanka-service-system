package com.weighlanka.backend.service;

import com.weighlanka.backend.dto.ServiceTableRow;
import com.weighlanka.backend.model.ServiceRecord;

import java.time.LocalDate;
import java.util.List;

public interface ServiceRecordService {

    ServiceRecord createRecord(ServiceRecord record);

    ServiceRecord updateRecord(String id, ServiceRecord record);

    ServiceRecord getRecordById(String id);

    List<ServiceRecord> getAllRecords();

    List<ServiceRecord> getRecordsByCustomer(String customerId);

    List<ServiceRecord> getRecordsByMachine(String machineId);

    void deleteRecord(String id);

    // NEW – for Excel-style table
    List<ServiceTableRow> getDailyReport(LocalDate date);
}
