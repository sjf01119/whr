package com.hotel.controller.user;

import com.hotel.common.ApiResponse;
import com.hotel.dto.AvatarUploadResponse;
import com.hotel.dto.ChangePasswordRequest;
import com.hotel.dto.LoginRequest;
import com.hotel.dto.ProfileInfoResponse;
import com.hotel.dto.RegisterRequest;
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
@RequestMapping("/api/user/auth")
public class UserAuthController {
  private final AuthService authService;

  public UserAuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest req) {
    authService.registerUser(req.getUsername(), req.getPassword());
    return ApiResponse.ok();
  }

  @PostMapping("/login")
  public ApiResponse<AuthService.LoginResult> login(@Valid @RequestBody LoginRequest req) {
    return ApiResponse.ok(authService.login(req.getUsername(), req.getPassword(), Role.USER));
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout() {
    authService.requireRole(Role.USER);
    authService.logout();
    return ApiResponse.ok();
  }

  @PostMapping("/me")
  public ApiResponse<AuthService.LoginResult> me() {
    return ApiResponse.ok(authService.me(Role.USER));
  }

  @GetMapping("/profile")
  public ApiResponse<ProfileInfoResponse> profile() {
    return ApiResponse.ok(authService.profile(Role.USER));
  }

  @PostMapping("/profile/password")
  public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
    authService.changePassword(Role.USER, req.getOldPassword(), req.getNewPassword(), req.getConfirmPassword());
    return ApiResponse.ok();
  }

  @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<AvatarUploadResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
    return ApiResponse.ok(authService.uploadAvatar(Role.USER, file));
  }
}
