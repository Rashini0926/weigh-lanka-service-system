package com.weighlanka.backend.service;

import com.weighlanka.backend.dto.ServiceTableRow;
import com.weighlanka.backend.model.Customer;
import com.weighlanka.backend.model.Machine;
import com.weighlanka.backend.model.ServiceRecord;
import com.weighlanka.backend.repository.CustomerRepository;
import com.weighlanka.backend.repository.MachineRepository;
import com.weighlanka.backend.repository.ServiceRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ServiceRecordServiceImpl implements ServiceRecordService {

    private final ServiceRecordRepository repository;
    private final CustomerRepository customerRepository;
    private final MachineRepository machineRepository;

    public ServiceRecordServiceImpl(ServiceRecordRepository repository,
                                    CustomerRepository customerRepository,
                                    MachineRepository machineRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.machineRepository = machineRepository;
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
        existing.setVisitNo(record.getVisitNo());
        existing.setInvoiceNo(record.getInvoiceNo());

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

    /**
     * Build rows for the daily report (Excel-style table).
     */
    @Override
    public List<ServiceTableRow> getDailyReport(LocalDate date) {
        List<ServiceRecord> records = repository.findByServiceDate(date);

        System.out.println("📅 Building daily report for date: " + date);
        System.out.println("📌 Service records found: " + records.size());

        return records.stream().map(record -> {

            // ----- Load Customer -----
            Customer customer = customerRepository
                    .findById(record.getCustomerId())
                    .orElse(null);

            if (customer == null) {
                System.out.println("❌ Customer not found for ID: " + record.getCustomerId());
            }

            // ----- Load Machine -----
            Machine machine = machineRepository
                    .findById(record.getMachineId())
                    .orElse(null);

            if (machine == null) {
                System.out.println("❌ Machine not found for ID: " + record.getMachineId());
            }

            // ----- Map Customer fields -----
            String nameAndAddress = "";
            String location = "";
            String tel = "";

            if (customer != null) {
                nameAndAddress = customer.getCustomerName() + ", " + customer.getAddress();
                location = customer.getLocation();
                tel = customer.getPhone();
            }

            // ----- Map Machine fields -----
            String model = "";
            String serialNo = "";
            String cap = "";
            String regNo = "";
            String idNo = "";

            if (machine != null) {
                model = machine.getModel();
                serialNo = machine.getSerialNumber();
                cap = machine.getCapacity();
                regNo = machine.getRegNo();
                idNo = machine.getIdNo();
            }

            // ----- Build DTO row -----
            return new ServiceTableRow(
                    record.getServiceDate(),        // DATE
                    record.getVisitNo(),            // NO
                    record.getInvoiceNo(),          // INV NO
                    nameAndAddress,                 // NAME & ADDRESS
                    location,                       // LOCATION
                    tel,                            // TEL
                    model,                          // MODEL
                    serialNo,                       // SERIAL NO
                    cap,                            // CAP
                    regNo,                          // REG NO
                    idNo,                           // ID NO
                    record.getTechnicianName()      // Serviced By
            );
        }).toList();
    }
}
