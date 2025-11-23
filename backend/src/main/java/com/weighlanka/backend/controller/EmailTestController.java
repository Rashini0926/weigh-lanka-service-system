package com.weighlanka.backend.controller;

import com.weighlanka.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailTestController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/test")
    public String sendTest() {
        emailService.sendEmail(
                "wijesingherashini526@gmail.com",
                "Test Email from Weigh Lanka System",
                "Email sending is working!"
        );

        return "Email sent successfully!";
    }
}
