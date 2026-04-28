package com.hotel.controller.admin;

import com.hotel.common.ApiResponse;
import com.hotel.common.PageResponse;
import com.hotel.model.Role;
import com.hotel.model.Hotel;
import com.hotel.model.HotelStatus;
import com.hotel.service.AuthService;
import com.hotel.service.HotelService;
import com.hotel.mapper.HotelMapper;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/hotels")
public class AdminHotelController {
  private final AuthService authService;
  private final HotelMapper hotelMapper;
  private final HotelService hotelService;

  public AdminHotelController(AuthService authService, HotelMapper hotelMapper, HotelService hotelService) {
    this.authService = authService;
    this.hotelMapper = hotelMapper;
    this.hotelService = hotelService;
  }

  @GetMapping
  public ApiResponse<PageResponse<Hotel>> list(
      @RequestParam(value = "status", defaultValue = "ALL") String status,
      @RequestParam(value = "page", defaultValue = "1") int page,
      @RequestParam(value = "pageSize", defaultValue = "50") int pageSize) {
    authService.requireRole(Role.ADMIN);
    List<Hotel> items = hotelMapper.listByStatus(status, pageSize, (page - 1) * pageSize);
    long total = hotelMapper.countByStatus(status);
    return ApiResponse.ok(PageResponse.of(items, page, pageSize, total));
  }

  @PostMapping("/{id}/offline")
  public ApiResponse<Void> offline(@PathVariable("id") long id) {
    authService.requireRole(Role.ADMIN);
    hotelService.forceOffline(id);
    return ApiResponse.ok();
  }

  @PostMapping("/{id}/enable")
  public ApiResponse<Void> enable(@PathVariable("id") long id) {
    authService.requireRole(Role.ADMIN);
    hotelMapper.updateStatus(id, HotelStatus.ONLINE);
    return ApiResponse.ok();
  }
}

