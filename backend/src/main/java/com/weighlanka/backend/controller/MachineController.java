package com.weighlanka.backend.controller;

import com.weighlanka.backend.model.Machine;
import com.weighlanka.backend.service.MachineService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@CrossOrigin("*")
public class MachineController {

    private final MachineService machineService;

    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    @PostMapping
    public Machine createMachine(@RequestBody Machine machine) {
        return machineService.createMachine(machine);
    }

    @GetMapping
    public List<Machine> getAllMachines() {
        return machineService.getAllMachines();
    }

    @GetMapping("/{id}")
    public Machine getMachineById(@PathVariable String id) {
        return machineService.getMachineById(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<Machine> getMachinesByCustomer(@PathVariable String customerId) {
        return machineService.getMachinesByCustomer(customerId);
    }

    @PutMapping("/{id}")
    public Machine updateMachine(@PathVariable String id, @RequestBody Machine machine) {
        return machineService.updateMachine(id, machine);
    }

    @DeleteMapping("/{id}")
    public void deleteMachine(@PathVariable String id) {
        machineService.deleteMachine(id);
    }
}
