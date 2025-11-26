package com.weighlanka.backend.repository;

import com.weighlanka.backend.model.ServiceRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface ServiceRecordRepository extends MongoRepository<ServiceRecord, String> {

    List<ServiceRecord> findByCustomerId(String customerId);

    List<ServiceRecord> findByMachineId(String machineId);

    List<ServiceRecord> findByNextServiceDate(LocalDate nextServiceDate);

    // NEW – used for daily report (Excel-style table)
    List<ServiceRecord> findByServiceDate(LocalDate serviceDate);
}
