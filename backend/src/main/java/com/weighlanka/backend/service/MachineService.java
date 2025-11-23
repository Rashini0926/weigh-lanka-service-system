package com.weighlanka.backend.service;

import com.weighlanka.backend.model.Machine;

import java.util.List;

public interface MachineService {

    Machine createMachine(Machine machine);

    Machine updateMachine(String id, Machine machine);

    Machine getMachineById(String id);

    List<Machine> getAllMachines();

    void deleteMachine(String id);
}
