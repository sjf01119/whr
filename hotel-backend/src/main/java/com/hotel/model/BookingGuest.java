package com.hotel.model;

import lombok.Data;

@Data
public class BookingGuest {
  private Long id;
  private Long orderId;
  private String guestName;
  private String idCard;
  private String phone;
}
