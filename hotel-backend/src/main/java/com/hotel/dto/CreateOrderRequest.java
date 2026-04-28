package com.hotel.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CreateOrderRequest {
  @NotNull private Long hotelId;
  @NotNull private Long roomTypeId;
  @NotNull private LocalDate checkinDate;
  @NotNull private LocalDate checkoutDate;
  @Min(1) private int roomCount;

  @NotBlank(message = "入住人姓名不能为空")
  private String guestName;

  @NotBlank(message = "手机号不能为空")
  private String phone;

  @NotBlank(message = "身份证号不能为空")
  private String idCard;
}

