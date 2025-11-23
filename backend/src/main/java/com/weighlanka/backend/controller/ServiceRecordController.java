package com.weighlanka.backend.controller;

import com.weighlanka.backend.model.ServiceRecord;
import com.weighlanka.backend.service.ServiceRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@CrossOrigin
public class ServiceRecordController {

    @Autowired
    private ServiceRecordService serviceRecordService;

    @PostMapping
    public ServiceRecord createRecord(@RequestBody ServiceRecord record) {
        return serviceRecordService.createRecord(record);
    }

    @GetMapping
    public List<ServiceRecord> getAllRecords() {
        return serviceRecordService.getAllRecords();
    }

    @GetMapping("/{id}")
    public ServiceRecord getRecordById(@PathVariable String id) {
        return serviceRecordService.getRecordById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteRecord(@PathVariable String id) {
        serviceRecordService.deleteRecord(id);
    }
}
