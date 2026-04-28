package com.hotel.controller.merchant;

import com.hotel.common.ApiResponse;
import com.hotel.common.PageResponse;
import com.hotel.dto.OrderListItem;
import com.hotel.model.Role;
import com.hotel.service.AuthService;
import com.hotel.service.HotelService;
import com.hotel.service.OrderService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/merchant/orders")
public class MerchantOrderController {
  private final AuthService authService;
  private final HotelService hotelService;
  private final OrderService orderService;

  public MerchantOrderController(AuthService authService, HotelService hotelService, OrderService orderService) {
    this.authService = authService;
    this.hotelService = hotelService;
    this.orderService = orderService;
  }

  @GetMapping
  public ApiResponse<PageResponse<OrderListItem>> list(
      @RequestParam(value = "page", defaultValue = "1") int page,
      @RequestParam(value = "pageSize", defaultValue = "50") int pageSize) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    long hotelId = hotelService.getOrCreateMerchantHotel(merchantId).getId();
    List<OrderListItem> items = orderService.listHotelOrders(hotelId, page, pageSize);
    long total = orderService.countHotelOrders(hotelId);
    return ApiResponse.ok(PageResponse.of(items, page, pageSize, total));
  }

  @PostMapping("/{id}/cancel")
  public ApiResponse<Void> cancel(@PathVariable("id") long id) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    long hotelId = hotelService.getOrCreateMerchantHotel(merchantId).getId();
    orderService.cancelMerchantOrder(hotelId, id);
    return ApiResponse.ok();
  }

  @PostMapping("/{id}/pay")
  public ApiResponse<Void> pay(@PathVariable("id") long id) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    long hotelId = hotelService.getOrCreateMerchantHotel(merchantId).getId();
    orderService.payMerchantOrder(hotelId, id);
    return ApiResponse.ok();
  }

  @PostMapping("/{id}/checkin")
  public ApiResponse<Void> checkin(@PathVariable("id") long id) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    long hotelId = hotelService.getOrCreateMerchantHotel(merchantId).getId();
    orderService.checkin(hotelId, id);
    return ApiResponse.ok();
  }

  @PostMapping("/{id}/checkout")
  public ApiResponse<Void> checkout(@PathVariable("id") long id) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    long hotelId = hotelService.getOrCreateMerchantHotel(merchantId).getId();
    orderService.checkout(hotelId, id);
    return ApiResponse.ok();
  }
}
