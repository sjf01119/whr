package com.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateAvatarRequest {
  @NotBlank(message = "头像地址不能为空")
  @Size(max = 255, message = "头像地址长度不能超过255")
  private String avatar;
}
