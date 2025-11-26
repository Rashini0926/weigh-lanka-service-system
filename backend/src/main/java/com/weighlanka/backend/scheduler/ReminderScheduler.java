package com.weighlanka.backend.scheduler;

import com.weighlanka.backend.model.Customer;
import com.weighlanka.backend.model.Machine;
import com.weighlanka.backend.model.ServiceRecord;
import com.weighlanka.backend.repository.ServiceRecordRepository;
import com.weighlanka.backend.service.CustomerService;
import com.weighlanka.backend.service.EmailService;
import com.weighlanka.backend.service.MachineService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReminderScheduler {

    private final ServiceRecordRepository serviceRecordRepository;
    private final CustomerService customerService;
    private final MachineService machineService;
    private final EmailService emailService;

    public ReminderScheduler(ServiceRecordRepository serviceRecordRepository,
                             CustomerService customerService,
                             MachineService machineService,
                             EmailService emailService) {
        this.serviceRecordRepository = serviceRecordRepository;
        this.customerService = customerService;
        this.machineService = machineService;
        this.emailService = emailService;
    }

    // Runs EVERY DAY at 8:00 AM (production mode)
    @Scheduled(cron = "0 0 8 * * *")
    public void sendYearlyServiceReminders() {

        LocalDate today = LocalDate.now();

        // Find records where nextServiceDate = TODAY
        List<ServiceRecord> dueRecords = serviceRecordRepository.findByNextServiceDate(today);

        System.out.println("🔍 Checking yearly reminders for: " + today);
        System.out.println("📌 Records found: " + dueRecords.size());

        for (ServiceRecord record : dueRecords) {

            Customer customer = customerService.getCustomer(record.getCustomerId());
            Machine machine = machineService.getMachineById(record.getMachineId());

            if (customer == null) {
                System.out.println("❌ Customer not found for ID: " + record.getCustomerId());
                continue;
            }

            if (machine == null) {
                System.out.println("❌ Machine not found for ID: " + record.getMachineId());
                continue;
            }

            // Send email
            emailService.sendYearlyReminder(
                    customer.getEmail(),
                    customer.getCustomerName(),
                    machine.getId()
            );

            System.out.println(
                    "✔ Email sent to " + customer.getEmail() +
                            " for machine model " + machine.getModel()
            );
        }
    }
}
