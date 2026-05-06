package com.hotel.controller.admin;

import com.hotel.common.ApiResponse;
import com.hotel.dto.AvatarUploadResponse;
import com.hotel.dto.ChangePasswordRequest;
import com.hotel.dto.LoginRequest;
import com.hotel.dto.ProfileInfoResponse;
import com.hotel.model.Role;
import com.hotel.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;

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

  @GetMapping("/profile")
  public ApiResponse<ProfileInfoResponse> profile() {
    return ApiResponse.ok(authService.profile(Role.ADMIN));
  }

  @PostMapping("/profile/password")
  public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
    authService.changePassword(Role.ADMIN, req.getOldPassword(), req.getNewPassword(), req.getConfirmPassword());
    return ApiResponse.ok();
  }

  @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<AvatarUploadResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
    return ApiResponse.ok(authService.uploadAvatar(Role.ADMIN, file));
  }
}
