package com.hotel.controller.merchant;

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
@RequestMapping("/api/merchant/auth")
public class MerchantAuthController {
  private final AuthService authService;

  public MerchantAuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public ApiResponse<AuthService.LoginResult> login(@Valid @RequestBody LoginRequest req) {
    return ApiResponse.ok(authService.login(req.getUsername(), req.getPassword(), Role.MERCHANT));
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout() {
    authService.requireRole(Role.MERCHANT);
    authService.logout();
    return ApiResponse.ok();
  }

  @PostMapping("/me")
  public ApiResponse<AuthService.LoginResult> me() {
    return ApiResponse.ok(authService.me(Role.MERCHANT));
  }
}

