package com.weighlanka.backend.repository;

import com.weighlanka.backend.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {

    // Spring Data automatically implements this method
    Admin findByUsername(String username);
}
