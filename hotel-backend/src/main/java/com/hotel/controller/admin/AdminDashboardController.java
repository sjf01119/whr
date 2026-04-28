package com.hotel.controller.admin;

import com.hotel.common.ApiResponse;
import com.hotel.mapper.BookingOrderMapper;
import com.hotel.mapper.HotelMapper;
import com.hotel.mapper.SysUserMapper;
import com.hotel.model.Role;
import com.hotel.service.AuthService;
import java.util.HashMap;
import java.util.Map;
import java.math.BigDecimal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
  private final AuthService authService;
  private final SysUserMapper sysUserMapper;
  private final HotelMapper hotelMapper;
  private final BookingOrderMapper bookingOrderMapper;

  public AdminDashboardController(
      AuthService authService, SysUserMapper sysUserMapper, HotelMapper hotelMapper, BookingOrderMapper bookingOrderMapper) {
    this.authService = authService;
    this.sysUserMapper = sysUserMapper;
    this.hotelMapper = hotelMapper;
    this.bookingOrderMapper = bookingOrderMapper;
  }

  @GetMapping
  public ApiResponse<Map<String, Object>> dashboard() {
    authService.requireRole(Role.ADMIN);
    Map<String, Object> data = new HashMap<>();
    data.put("merchants", sysUserMapper.countByRole(Role.MERCHANT));
    data.put("hotels", hotelMapper.countAll());
    data.put("users", sysUserMapper.countByRole(Role.USER));
    data.put("orders", bookingOrderMapper.countAll());
    
    data.put("todayMerchants", sysUserMapper.countTodayByRole(Role.MERCHANT));
    data.put("todayHotels", hotelMapper.countToday());
    data.put("todayUsers", sysUserMapper.countTodayByRole(Role.USER));
    data.put("todayOrders", bookingOrderMapper.countTodayAll());
    
    BigDecimal totalRevenue = bookingOrderMapper.sumTotalRevenue();
    data.put("totalRevenue", totalRevenue == null ? "0.00" : totalRevenue.toPlainString());
    
    return ApiResponse.ok(data);
  }
}

