package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Async
    public void sendCheckoutSummary(String toEmail, String customerName, List<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) return;

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        StringBuilder slotList = new StringBuilder();
        for (Booking booking : bookings) {
            slotList.append("- ")
                    .append(booking.getCourt().getName())
                    .append(" am ")
                    .append(booking.getStartTime().format(dateFormatter))
                    .append(" von ")
                    .append(booking.getStartTime().format(timeFormatter))
                    .append(" bis ")
                    .append(booking.getEndTime().format(timeFormatter))
                    .append(" Uhr\n");
        }

        BigDecimal grandTotal = bookings.stream()
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        String emailText = """
            Lieber %s,
            
            vielen Dank für deine Buchung! Hier ist die Übersicht deiner reservierten Zeiten:
            
            %s
            Gesamtsumme: %s €
            
            Wir wünschen dir viel Spaß beim Spielen!
            
            Viele Grüße
            """.formatted(customerName, slotList.toString(), grandTotal);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Deine Buchungsbestätigung - CourtManager");
        message.setText(emailText);
        message.setFrom("noreply@courtmanager.com");

        mailSender.send(message);
    }

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
        message.setSubject("Deine Buchungsbestätigung - CourtManager");
        message.setText(emailText);
        message.setFrom("noreply@courtmanager.com");

        mailSender.send(message);
    }
}
