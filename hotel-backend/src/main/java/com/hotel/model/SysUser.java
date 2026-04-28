package com.hotel.model;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class SysUser {
  private Long id;
  private String username;
  private String passwordHash;
  private Role role;
  private UserStatus status;
  private LocalDateTime createdAt;
}

