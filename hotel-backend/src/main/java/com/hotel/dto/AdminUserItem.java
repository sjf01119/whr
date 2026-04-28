package com.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminUserItem {
  private Long id;
  private String username;
  private String role;
  private String status;
}

