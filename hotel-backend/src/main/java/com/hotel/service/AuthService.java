package com.hotel.service;

import cn.dev33.satoken.stp.StpUtil;
import com.hotel.common.BusinessException;
import com.hotel.mapper.SysUserMapper;
import com.hotel.model.Role;
import com.hotel.model.SysUser;
import com.hotel.model.UserStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final SysUserMapper sysUserMapper;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public AuthService(SysUserMapper sysUserMapper) {
    this.sysUserMapper = sysUserMapper;
  }

  public void registerUser(String username, String password) {
    if (sysUserMapper.findByUsername(username) != null) {
      throw new BusinessException("用户名已存在");
    }
    SysUser user = new SysUser();
    user.setUsername(username);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setRole(Role.USER);
    user.setStatus(UserStatus.ENABLED);
    user.setCreatedAt(LocalDateTime.now());
    sysUserMapper.insert(user);
  }

  public LoginResult login(String username, String password, Role requiredRole) {
    SysUser user = sysUserMapper.findByUsername(username);
    if (user == null) {
      throw new BusinessException("账号或密码错误");
    }
    if (user.getRole() != requiredRole) {
      throw new BusinessException("角色不匹配");
    }
    if (user.getStatus() != UserStatus.ENABLED) {
      throw new BusinessException("账号不可用");
    }
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new BusinessException("账号或密码错误");
    }
    StpUtil.login(user.getId());
    StpUtil.getSession().set("role", user.getRole().name());
    StpUtil.getSession().set("username", user.getUsername());
    String token = StpUtil.getTokenValue();
    return new LoginResult(token, user.getUsername(), toRoleName(user.getRole()));
  }

  public void logout() {
    StpUtil.logout();
  }

  public long requireLoginId() {
    return Long.parseLong(String.valueOf(StpUtil.getLoginId()));
  }

  public void requireRole(Role role) {
    StpUtil.checkLogin();
    Object r = StpUtil.getSession().get("role");
    if (r == null || !role.name().equals(String.valueOf(r))) {
      throw new cn.dev33.satoken.exception.NotPermissionException(role.name());
    }
  }

  public LoginResult me(Role role) {
    requireRole(role);
    String token = StpUtil.getTokenValue();
    String username = String.valueOf(StpUtil.getSession().get("username"));
    return new LoginResult(token, username, toRoleName(role));
  }

  private String toRoleName(Role role) {
    return role == Role.ADMIN ? "admin" : role == Role.MERCHANT ? "merchant" : "user";
  }

  @Data
  @AllArgsConstructor
  public static class LoginResult {
    private String token;
    private String username;
    private String role;
  }
}
