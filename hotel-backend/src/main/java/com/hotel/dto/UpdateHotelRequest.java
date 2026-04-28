package com.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateHotelRequest {
  @NotBlank private String name;
  @NotBlank private String address;
  @NotBlank private String description;
}

