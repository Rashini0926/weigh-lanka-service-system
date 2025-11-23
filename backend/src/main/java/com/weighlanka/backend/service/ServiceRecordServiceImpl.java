package com.weighlanka.backend.service;

import com.weighlanka.backend.model.ServiceRecord;
import com.weighlanka.backend.repository.ServiceRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceRecordServiceImpl implements ServiceRecordService {

    private final ServiceRecordRepository repository;

    public ServiceRecordServiceImpl(ServiceRecordRepository repository) {
        this.repository = repository;
    }

    @Override
    public ServiceRecord createRecord(ServiceRecord record) {
        return repository.save(record);
    }

    @Override
    public ServiceRecord updateRecord(String id, ServiceRecord record) {
        ServiceRecord existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Record not found"));

        existing.setCustomerId(record.getCustomerId());
        existing.setMachineId(record.getMachineId());
        existing.setServiceDate(record.getServiceDate());
        existing.setNextServiceDate(record.getNextServiceDate());
        existing.setTechnicianName(record.getTechnicianName());
        existing.setRemarks(record.getRemarks());
        existing.setServiceCost(record.getServiceCost());

        return repository.save(existing);
    }

    @Override
    public ServiceRecord getRecordById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Record not found"));
    }

    @Override
    public List<ServiceRecord> getAllRecords() {
        return repository.findAll();
    }

    @Override
    public List<ServiceRecord> getRecordsByCustomer(String customerId) {
        return repository.findByCustomerId(customerId);
    }

    @Override
    public List<ServiceRecord> getRecordsByMachine(String machineId) {
        return repository.findByMachineId(machineId);
    }

    @Override
    public void deleteRecord(String id) {
        repository.deleteById(id);
    }
}
