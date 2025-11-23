package com.weighlanka.backend.service;

import com.weighlanka.backend.model.ServiceRecord;

import java.util.List;

public interface ServiceRecordService {

    ServiceRecord createRecord(ServiceRecord record);

    ServiceRecord updateRecord(String id, ServiceRecord record);

    ServiceRecord getRecordById(String id);

    List<ServiceRecord> getAllRecords();

    List<ServiceRecord> getRecordsByCustomer(String customerId);

    List<ServiceRecord> getRecordsByMachine(String machineId);

    void deleteRecord(String id);
}
