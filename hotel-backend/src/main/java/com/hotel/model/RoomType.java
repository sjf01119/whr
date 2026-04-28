package com.hotel.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class RoomType {
  private Long id;
  private Long hotelId;
  private String name;
  private BigDecimal price;
  private String facilitiesText;
  private Integer stock;
  private LocalDateTime createdAt;
}

