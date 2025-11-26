package com.weighlanka.backend.service;

import com.weighlanka.backend.model.Machine;
import com.weighlanka.backend.repository.MachineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MachineServiceImpl implements MachineService {

    private final MachineRepository repo;

    public MachineServiceImpl(MachineRepository repo) {
        this.repo = repo;
    }

    @Override
    public Machine createMachine(Machine machine) {
        return repo.save(machine);
    }

    @Override
    public Machine updateMachine(String id, Machine machine) {
        Machine existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        existing.setCustomerId(machine.getCustomerId());
        existing.setModel(machine.getModel());
        existing.setSerialNumber(machine.getSerialNumber());
        existing.setInstalledDate(machine.getInstalledDate());
        existing.setWarranty(machine.getWarranty());
        existing.setLastServiceDate(machine.getLastServiceDate());
        existing.setNextServiceDate(machine.getNextServiceDate());
        existing.setCapacity(machine.getCapacity()); // NEW
        existing.setRegNo(machine.getRegNo());       // NEW
        existing.setIdNo(machine.getIdNo());         // NEW

        return repo.save(existing);
    }

    @Override
    public Machine getMachineById(String id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Machine> getAllMachines() {
        return repo.findAll();
    }

    @Override
    public List<Machine> getMachinesByCustomer(String customerId) {
        return repo.findByCustomerId(customerId);
    }

    @Override
    public void deleteMachine(String id) {
        repo.deleteById(id);
    }
}
