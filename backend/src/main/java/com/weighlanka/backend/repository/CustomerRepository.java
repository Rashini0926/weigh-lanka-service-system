package com.weighlanka.backend.repository;

import com.weighlanka.backend.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CustomerRepository extends MongoRepository<Customer, String> {
}
