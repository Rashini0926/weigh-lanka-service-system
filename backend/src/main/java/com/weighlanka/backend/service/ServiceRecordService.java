package com.weighlanka.backend.service;

import com.weighlanka.backend.model.ServiceRecord;
import com.weighlanka.backend.repository.ServiceRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceRecordService {

    @Autowired
    private ServiceRecordRepository serviceRecordRepository;

    public ServiceRecord createRecord(ServiceRecord record) {
        return serviceRecordRepository.save(record);
    }

    public List<ServiceRecord> getAllRecords() {
        return serviceRecordRepository.findAll();
    }

    public ServiceRecord getRecordById(String id) {
        return serviceRecordRepository.findById(id).orElse(null);
    }

    public void deleteRecord(String id) {
        serviceRecordRepository.deleteById(id);
    }
}
