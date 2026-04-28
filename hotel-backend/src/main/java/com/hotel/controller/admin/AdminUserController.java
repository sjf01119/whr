package com.hotel.controller.admin;

import com.hotel.common.ApiResponse;
import com.hotel.common.PageResponse;
import com.hotel.dto.AdminUserItem;
import com.hotel.mapper.SysUserMapper;
import com.hotel.model.Role;
import com.hotel.model.SysUser;
import com.hotel.model.UserStatus;
import com.hotel.service.AuthService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
  private final AuthService authService;
  private final SysUserMapper sysUserMapper;

  public AdminUserController(AuthService authService, SysUserMapper sysUserMapper) {
    this.authService = authService;
    this.sysUserMapper = sysUserMapper;
  }

  @GetMapping
  public ApiResponse<PageResponse<AdminUserItem>> list(
      @RequestParam(value = "status", defaultValue = "ALL") String status,
      @RequestParam(value = "page", defaultValue = "1") int page,
      @RequestParam(value = "pageSize", defaultValue = "50") int pageSize) {
    authService.requireRole(Role.ADMIN);
    List<SysUser> users = sysUserMapper.listByRoleAndStatus(Role.USER, status, pageSize, (page - 1) * pageSize);
    long total = sysUserMapper.countByRoleAndStatus(Role.USER, status);
    List<AdminUserItem> items =
        users.stream()
            .map(u -> new AdminUserItem(u.getId(), u.getUsername(), u.getRole().name(), u.getStatus().name()))
            .collect(Collectors.toList());
    return ApiResponse.ok(PageResponse.of(items, page, pageSize, total));
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

