package com.hotel.controller.admin;

import com.hotel.common.ApiResponse;
import com.hotel.common.BusinessException;
import com.hotel.common.PageResponse;
import com.hotel.dto.AdminUserItem;
import com.hotel.dto.AdminMerchantUpsertRequest;
import com.hotel.mapper.SysUserMapper;
import com.hotel.model.Role;
import com.hotel.model.SysUser;
import com.hotel.model.UserStatus;
import com.hotel.service.AuthService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/merchants")
public class AdminMerchantController {
  private final AuthService authService;
  private final SysUserMapper sysUserMapper;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public AdminMerchantController(AuthService authService, SysUserMapper sysUserMapper) {
    this.authService = authService;
    this.sysUserMapper = sysUserMapper;
  }

  @GetMapping
  public ApiResponse<PageResponse<AdminUserItem>> list(
      @RequestParam(value = "page", defaultValue = "1") int page,
      @RequestParam(value = "pageSize", defaultValue = "50") int pageSize) {
    authService.requireRole(Role.ADMIN);
    List<SysUser> users = sysUserMapper.listByRoleAndStatus(Role.MERCHANT, "ALL", pageSize, (page - 1) * pageSize);
    long total = sysUserMapper.countByRoleAndStatus(Role.MERCHANT, "ALL");
    List<AdminUserItem> items =
        users.stream()
            .map(u -> new AdminUserItem(u.getId(), u.getUsername(), "MERCHANT", u.getStatus().name()))
            .collect(Collectors.toList());
    return ApiResponse.ok(PageResponse.of(items, page, pageSize, total));
  }

  @PostMapping
  public ApiResponse<Void> create(@Valid @RequestBody AdminMerchantUpsertRequest req) {
    authService.requireRole(Role.ADMIN);
    if (sysUserMapper.findByUsername(req.getUsername()) != null) {
      throw new BusinessException("账号已存在");
    }
    if (req.getPassword() == null || req.getPassword().length() < 6) {
      throw new BusinessException("密码至少为6位");
    }
    SysUser user = new SysUser();
    user.setUsername(req.getUsername());
    user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
    user.setRole(Role.MERCHANT);
    user.setStatus(UserStatus.ENABLED);
    user.setCreatedAt(LocalDateTime.now());
    sysUserMapper.insert(user);
    return ApiResponse.ok();
  }

  @PutMapping("/{id}")
  public ApiResponse<Void> update(@PathVariable("id") long id, @Valid @RequestBody AdminMerchantUpsertRequest req) {
    authService.requireRole(Role.ADMIN);
    SysUser user = sysUserMapper.findById(id);
    if (user == null || user.getRole() != Role.MERCHANT) {
      throw new BusinessException("商家不存在");
    }
    SysUser existing = sysUserMapper.findByUsername(req.getUsername());
    if (existing != null && !existing.getId().equals(id)) {
      throw new BusinessException("账号已存在");
    }
    user.setUsername(req.getUsername());
    if (req.getPassword() != null && req.getPassword().length() >= 6) {
      user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
    }
    sysUserMapper.update(user);
    return ApiResponse.ok();
  }

  @PostMapping("/{id}/approve")
  public ApiResponse<Void> approve(@PathVariable("id") long id) {
    authService.requireRole(Role.ADMIN);
    sysUserMapper.updateStatus(id, UserStatus.ENABLED);
    return ApiResponse.ok();
  }

  @PostMapping("/{id}/enable")
  public ApiResponse<Void> enable(@PathVariable("id") long id) {
    authService.requireRole(Role.ADMIN);
    sysUserMapper.updateStatus(id, UserStatus.ENABLED);
    return ApiResponse.ok();
  }

  @PostMapping("/{id}/disable")
  public ApiResponse<Void> disable(@PathVariable("id") long id) {
    authService.requireRole(Role.ADMIN);
    sysUserMapper.updateStatus(id, UserStatus.DISABLED);
    return ApiResponse.ok();
  }
}

