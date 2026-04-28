package com.hotel.model;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Hotel {
  private Long id;
  private Long merchantId;
  private String name;
  private String address;
  private String description;
  private HotelStatus status;
  private LocalDateTime createdAt;
}

