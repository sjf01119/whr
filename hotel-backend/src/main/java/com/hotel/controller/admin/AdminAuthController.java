package com.hotel.controller.admin;

import com.hotel.common.ApiResponse;
import com.hotel.dto.LoginRequest;
import com.hotel.model.Role;
import com.hotel.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {
  private final AuthService authService;

  public AdminAuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public ApiResponse<AuthService.LoginResult> login(@Valid @RequestBody LoginRequest req) {
    return ApiResponse.ok(authService.login(req.getUsername(), req.getPassword(), Role.ADMIN));
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout() {
    authService.requireRole(Role.ADMIN);
    authService.logout();
    return ApiResponse.ok();
  }

  @PostMapping("/me")
  public ApiResponse<AuthService.LoginResult> me() {
    return ApiResponse.ok(authService.me(Role.ADMIN));
  }
}

