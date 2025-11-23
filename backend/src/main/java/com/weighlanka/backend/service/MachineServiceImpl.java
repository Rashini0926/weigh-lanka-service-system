package com.weighlanka.backend.service;

import com.weighlanka.backend.model.Machine;
import com.weighlanka.backend.repository.MachineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MachineServiceImpl implements MachineService {

    private final MachineRepository machineRepository;

    public MachineServiceImpl(MachineRepository machineRepository) {
        this.machineRepository = machineRepository;
    }

    @Override
    public Machine createMachine(Machine machine) {
        return machineRepository.save(machine);
    }

    @Override
    public Machine updateMachine(String id, Machine machine) {
        Machine existing = machineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        existing.setMachineName(machine.getMachineName());
        existing.setLocation(machine.getLocation());
        existing.setStatus(machine.getStatus());
        existing.setType(machine.getType());

        return machineRepository.save(existing);
    }

    @Override
    public Machine getMachineById(String id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Machine not found"));
    }

    @Override
    public List<Machine> getAllMachines() {
        return machineRepository.findAll();
    }

    @Override
    public void deleteMachine(String id) {
        machineRepository.deleteById(id);
    }
}
