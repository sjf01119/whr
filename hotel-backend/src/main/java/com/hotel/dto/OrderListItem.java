package com.hotel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class OrderListItem {
  private Long id;
  private String orderNo;
  private Long userId;
  private String username;
  private Long hotelId;
  private String hotelName;
  private Long roomTypeId;
  private String roomTypeName;
  private LocalDate checkinDate;
  private LocalDate checkoutDate;
  private Integer roomCount;
  private BigDecimal amount;
  private String status;
  private LocalDateTime createdAt;
}

