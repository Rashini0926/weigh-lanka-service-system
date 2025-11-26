package com.weighlanka.backend.repository;

import com.weighlanka.backend.model.Machine;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MachineRepository extends MongoRepository<Machine, String> {

    List<Machine> findByCustomerId(String customerId);  // REQUIRED for Option 1
}
