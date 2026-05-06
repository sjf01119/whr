package com.hotel.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileInfoResponse {
  private Long id;
  private String username;
  private String role;
  private String phone;
  private String avatar;
  private LocalDateTime createdAt;
}
