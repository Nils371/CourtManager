package com.courtmanager.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Async
    public void sendBookingConfirmation(String toEmail, String customerName, String courtName, LocalDateTime startTime, LocalDateTime endTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy 'um' HH:mm 'Uhr'");
        String formattedStartTime = startTime.format(formatter);
        String formattedEndTime = endTime.format(formatter);


        String emailText = """
                Lieber %s,
                
                vielen Dank für deine Buchung! Hier sind deine Details:
                
                Platz: %s
                Start: %s
                Ende: %s
                
                Wir wünschen dir viel Spaß beim Spielen!
                
                Viele Grüße
                """.formatted(customerName, courtName, formattedStartTime, formattedEndTime);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Bestätigung: " + courtName + " am " + formattedStartTime);
        message.setText(emailText);
        message.setFrom("noreply@courtmanager.com");

        mailSender.send(message);
    }
}
