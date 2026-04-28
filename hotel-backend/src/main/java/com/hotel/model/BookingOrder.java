package com.hotel.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class BookingOrder {
  private Long id;
  private String orderNo;
  private Long userId;
  private Long hotelId;
  private Long roomTypeId;
  private LocalDate checkinDate;
  private LocalDate checkoutDate;
  private Integer roomCount;
  private BigDecimal amount;
  private OrderStatus status;
  private LocalDateTime createdAt;
}

