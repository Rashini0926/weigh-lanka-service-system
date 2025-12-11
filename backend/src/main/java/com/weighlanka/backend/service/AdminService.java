package com.weighlanka.backend.service;

import com.weighlanka.backend.model.Admin;
import com.weighlanka.backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ✅ Validate login
    public boolean validateLogin(String username, String password) {
        Admin admin = adminRepository.findByUsername(username);

        if (admin == null) {
            return false;
        }

        // compare raw password with hashed password in DB
        return encoder.matches(password, admin.getPasswordHash());
    }

    // ✅ Reset password (for "admin" user)
    public void resetPassword(String newPassword) {
        Admin admin = adminRepository.findByUsername("admin");

        if (admin == null) {
            // first-time setup
            admin = new Admin();
            admin.setUsername("admin");
        }

        admin.setPasswordHash(encoder.encode(newPassword));
        adminRepository.save(admin);
    }

    // ✅ Initialize default admin if not exists
    public void initAdmin() {
        Admin existing = adminRepository.findByUsername("admin");
        if (existing == null) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPasswordHash(encoder.encode("1234")); // default password
            adminRepository.save(admin);
        }
    }
}
