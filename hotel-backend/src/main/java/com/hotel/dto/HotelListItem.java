package com.hotel.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class HotelListItem {
  private Long id;
  private String name;
  private String address;
  private String description;
  private BigDecimal minPrice;
}

