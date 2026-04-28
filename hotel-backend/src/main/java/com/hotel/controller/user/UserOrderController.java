package com.hotel.controller.user;

import com.hotel.common.ApiResponse;
import com.hotel.common.PageResponse;
import com.hotel.dto.CreateOrderRequest;
import com.hotel.dto.OrderListItem;
import com.hotel.model.Role;
import com.hotel.service.AuthService;
import com.hotel.service.OrderService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/orders")
public class UserOrderController {
  private final AuthService authService;
  private final OrderService orderService;

  public UserOrderController(AuthService authService, OrderService orderService) {
    this.authService = authService;
    this.orderService = orderService;
  }

  @PostMapping
  public ApiResponse<Map<String, Object>> create(@Valid @RequestBody CreateOrderRequest req) {
    authService.requireRole(Role.USER);
    long userId = authService.requireLoginId();
    long orderId =
        orderService.createOrder(
            userId,
            req.getHotelId(),
            req.getRoomTypeId(),
            req.getCheckinDate(),
            req.getCheckoutDate(),
            req.getRoomCount(),
            req.getGuestName(),
            req.getPhone(),
            req.getIdCard());
    Map<String, Object> data = new HashMap<>();
    data.put("orderId", orderId);
    return ApiResponse.ok(data);
  }

  @GetMapping
  public ApiResponse<PageResponse<OrderListItem>> mine(
      @RequestParam(value = "page", defaultValue = "1") int page,
      @RequestParam(value = "pageSize", defaultValue = "50") int pageSize) {
    authService.requireRole(Role.USER);
    long userId = authService.requireLoginId();
    List<OrderListItem> items = orderService.listUserOrders(userId, page, pageSize);
    long total = orderService.countUserOrders(userId);
    return ApiResponse.ok(PageResponse.of(items, page, pageSize, total));
  }

  @PostMapping("/{id}/pay")
  public ApiResponse<Void> pay(@PathVariable("id") long id) {
    authService.requireRole(Role.USER);
    long userId = authService.requireLoginId();
    orderService.payOrder(userId, id);
    return ApiResponse.ok();
  }

  @PostMapping("/{id}/cancel")
  public ApiResponse<Void> cancel(@PathVariable("id") long id) {
    authService.requireRole(Role.USER);
    long userId = authService.requireLoginId();
    orderService.cancelUserOrder(userId, id);
    return ApiResponse.ok();
  }
}

