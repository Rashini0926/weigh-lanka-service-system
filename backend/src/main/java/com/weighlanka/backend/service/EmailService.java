package com.weighlanka.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("rashinichamodika552@gmail.com"); // your email
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    // Template for yearly reminders
    public void sendYearlyReminder(String to, String customerName, String machineId) {
        String subject = "Annual Service Reminder - Weigh Lanka";
        String body = "Dear " + customerName + ",\n\n"
                + "This is a kind reminder that your scale/machine (ID: " + machineId + ") "
                + "is due for annual calibration/service.\n"
                + "Please contact Weigh Lanka to schedule the service.\n\n"
                + "Thank you,\n"
                + "Weigh Lanka Service Team.";

        sendEmail(to, subject, body);
    }
}
