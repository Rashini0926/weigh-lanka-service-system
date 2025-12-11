package com.weighlanka.backend.controller;

import com.weighlanka.backend.dto.AdminLoginRequest;
import com.weighlanka.backend.dto.ResetPasswordRequest;
import com.weighlanka.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        boolean ok = adminService.validateLogin(request.getUsername(), request.getPassword());

        if (!ok) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }

        // simple dummy token (no real security, internal app)
        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "token", "WEIGHLANKA_ADMIN_TOKEN"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        adminService.resetPassword(request.getPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
