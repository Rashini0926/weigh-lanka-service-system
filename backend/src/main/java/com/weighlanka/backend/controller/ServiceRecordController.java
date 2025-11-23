package com.weighlanka.backend.controller;

import com.weighlanka.backend.model.ServiceRecord;
import com.weighlanka.backend.service.ServiceRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-records")
@CrossOrigin("*")
public class ServiceRecordController {

    private final ServiceRecordService service;

    public ServiceRecordController(ServiceRecordService service) {
        this.service = service;
    }

    @PostMapping
    public ServiceRecord createRecord(@RequestBody ServiceRecord record) {
        return service.createRecord(record);
    }

    @GetMapping
    public List<ServiceRecord> getAllRecords() {
        return service.getAllRecords();
    }

    @GetMapping("/{id}")
    public ServiceRecord getRecordById(@PathVariable String id) {
        return service.getRecordById(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<ServiceRecord> getByCustomer(@PathVariable String customerId) {
        return service.getRecordsByCustomer(customerId);
    }

    @GetMapping("/machine/{machineId}")
    public List<ServiceRecord> getByMachine(@PathVariable String machineId) {
        return service.getRecordsByMachine(machineId);
    }

    @PutMapping("/{id}")
    public ServiceRecord updateRecord(
            @PathVariable String id,
            @RequestBody ServiceRecord record
    ) {
        return service.updateRecord(id, record);
    }

    @DeleteMapping("/{id}")
    public void deleteRecord(@PathVariable String id) {
        service.deleteRecord(id);
    }
}
