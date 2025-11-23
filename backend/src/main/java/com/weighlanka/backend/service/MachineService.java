package com.weighlanka.backend.service;

import com.weighlanka.backend.model.Machine;
import com.weighlanka.backend.repository.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MachineService {

    @Autowired
    private MachineRepository machineRepository;

    public Machine createMachine(Machine machine) {
        return machineRepository.save(machine);
    }

    public List<Machine> getAllMachines() {
        return machineRepository.findAll();
    }

    public Machine getMachineById(String id) {
        return machineRepository.findById(id).orElse(null);
    }

    public void deleteMachine(String id) {
        machineRepository.deleteById(id);
    }
}
