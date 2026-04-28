package com.hotel.controller.merchant;

import com.hotel.common.ApiResponse;
import com.hotel.mapper.BookingOrderMapper;
import com.hotel.model.Role;
import com.hotel.service.AuthService;
import com.hotel.service.HotelService;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/merchant/dashboard")
public class MerchantDashboardController {
  private final AuthService authService;
  private final HotelService hotelService;
  private final BookingOrderMapper bookingOrderMapper;

  public MerchantDashboardController(
      AuthService authService, HotelService hotelService, BookingOrderMapper bookingOrderMapper) {
    this.authService = authService;
    this.hotelService = hotelService;
    this.bookingOrderMapper = bookingOrderMapper;
  }

  @GetMapping
  public ApiResponse<Map<String, Object>> dashboard() {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    long hotelId = hotelService.getOrCreateMerchantHotel(merchantId).getId();
    long todayOrders = bookingOrderMapper.countTodayByHotelId(hotelId);
    BigDecimal todayRevenue = bookingOrderMapper.sumTodayRevenueByHotelId(hotelId);
    long pendingOrders = bookingOrderMapper.countPendingByHotelId(hotelId);
    
    // Fill recent 7 days
    List<com.hotel.dto.RevenueStat> recentList = bookingOrderMapper.getRecent7DaysRevenue(hotelId);
    Map<String, BigDecimal> recentMap = new HashMap<>();
    for (com.hotel.dto.RevenueStat stat : recentList) {
      recentMap.put(stat.getDate(), stat.getRevenue());
    }
    
    List<Map<String, Object>> recentRevenue = new java.util.ArrayList<>();
    java.time.LocalDate today = java.time.LocalDate.now();
    for (int i = 6; i >= 0; i--) {
      String dateStr = today.minusDays(i).toString();
      BigDecimal rev = recentMap.getOrDefault(dateStr, BigDecimal.ZERO);
      Map<String, Object> point = new HashMap<>();
      point.put("date", dateStr);
      point.put("revenue", rev.toPlainString());
      recentRevenue.add(point);
    }

    Map<String, Object> data = new HashMap<>();
    data.put("todayOrders", todayOrders);
    data.put("todayRevenue", todayRevenue == null ? "0.00" : todayRevenue.toPlainString());
    data.put("pendingOrders", pendingOrders);
    data.put("recentRevenue", recentRevenue);
    return ApiResponse.ok(data);
  }
}

