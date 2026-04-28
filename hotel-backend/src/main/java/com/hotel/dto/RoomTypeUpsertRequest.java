package com.hotel.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class RoomTypeUpsertRequest {
  @NotBlank private String name;
  @NotNull private BigDecimal price;
  private String facilitiesText;
  @Min(0) private int stock;
}

