package com.hotel.service;

import cn.dev33.satoken.stp.StpUtil;
import com.hotel.common.BusinessException;
import com.hotel.dto.AvatarUploadResponse;
import com.hotel.dto.ProfileInfoResponse;
import com.hotel.mapper.SysUserMapper;
import com.hotel.model.Role;
import com.hotel.model.SysUser;
import com.hotel.model.UserStatus;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AuthService {
  private final SysUserMapper sysUserMapper;
  private final String avatarRootDir;
  private final String avatarPublicPrefix;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private static final long AVATAR_MAX_SIZE = 5L * 1024L * 1024L;
  private static final Set<String> ALLOWED_EXT = Set.of("jpg", "jpeg", "png", "webp");
  private static final Set<String> ALLOWED_CONTENT_TYPE = Set.of("image/jpeg", "image/png", "image/webp");

  public AuthService(
      SysUserMapper sysUserMapper,
      @Value("${app.upload.avatar-dir:uploads/avatar}") String avatarRootDir,
      @Value("${app.upload.avatar-prefix:/uploads/avatar/}") String avatarPublicPrefix) {
    this.sysUserMapper = sysUserMapper;
    this.avatarRootDir = avatarRootDir;
    this.avatarPublicPrefix = avatarPublicPrefix.endsWith("/") ? avatarPublicPrefix : avatarPublicPrefix + "/";
  }

  public void registerUser(String username, String password) {
    if (sysUserMapper.findByUsername(username) != null) {
      throw new BusinessException("用户名已存在");
    }
    SysUser user = new SysUser();
    user.setUsername(username);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setPhone("");
    user.setAvatar("");
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
    return new LoginResult(token, user.getUsername(), toRoleName(user.getRole()), user.getAvatar());
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
    long userId = requireLoginId();
    SysUser user = sysUserMapper.findById(userId);
    if (user == null) {
      throw new BusinessException("账号不存在");
    }
    String token = StpUtil.getTokenValue();
    return new LoginResult(token, user.getUsername(), toRoleName(role), user.getAvatar());
  }

  public ProfileInfoResponse profile(Role role) {
    requireRole(role);
    long userId = requireLoginId();
    SysUser user = sysUserMapper.findById(userId);
    if (user == null) {
      throw new BusinessException("账号不存在");
    }
    return new ProfileInfoResponse(
        user.getId(),
        user.getUsername(),
        toRoleName(user.getRole()),
        user.getPhone(),
        user.getAvatar(),
        user.getCreatedAt());
  }

  public void changePassword(Role role, String oldPassword, String newPassword, String confirmPassword) {
    requireRole(role);
    if (!newPassword.equals(confirmPassword)) {
      throw new BusinessException("两次输入的新密码不一致");
    }
    long userId = requireLoginId();
    SysUser user = sysUserMapper.findById(userId);
    if (user == null) {
      throw new BusinessException("账号不存在");
    }
    if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
      throw new BusinessException("原密码不正确");
    }
    if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
      throw new BusinessException("新密码不能与原密码相同");
    }
    sysUserMapper.updatePasswordHash(userId, passwordEncoder.encode(newPassword));
  }

  public AvatarUploadResponse uploadAvatar(Role role, MultipartFile file) {
    requireRole(role);
    if (file == null || file.isEmpty()) {
      throw new BusinessException("请选择头像图片");
    }
    if (file.getSize() > AVATAR_MAX_SIZE) {
      throw new BusinessException("图片大小不能超过5MB");
    }
    String contentType = file.getContentType();
    if (contentType != null && !contentType.isBlank() && !ALLOWED_CONTENT_TYPE.contains(contentType.toLowerCase())) {
      throw new BusinessException("仅支持 jpg/png/webp 格式");
    }
    String ext = getFileExtension(file);
    if (!ALLOWED_EXT.contains(ext)) {
      throw new BusinessException("仅支持 jpg/png/webp 格式");
    }
    String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
    Path dir = Paths.get(avatarRootDir).toAbsolutePath().normalize();
    Path target = dir.resolve(filename).normalize();
    if (!target.startsWith(dir)) {
      throw new BusinessException("非法文件路径");
    }
    try {
      Files.createDirectories(dir);
      try (InputStream in = file.getInputStream()) {
        Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (IOException e) {
      throw new BusinessException("头像上传失败");
    }
    String avatarPath = avatarPublicPrefix + filename;
    long userId = requireLoginId();
    int ok = sysUserMapper.updateAvatar(userId, avatarPath);
    if (ok != 1) {
      throw new BusinessException("更新头像失败");
    }
    return new AvatarUploadResponse(avatarPath);
  }

  private String getFileExtension(MultipartFile file) {
    String originalName = file.getOriginalFilename();
    if (originalName == null || !originalName.contains(".")) {
      throw new BusinessException("文件格式不合法");
    }
    String ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
    if (ext.equals("jpeg")) {
      return "jpg";
    }
    return ext;
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
    private String avatar;
  }
}
