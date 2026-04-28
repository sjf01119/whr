package com.hotel.controller.admin;

import com.hotel.common.ApiResponse;
import com.hotel.common.PageResponse;
import com.hotel.dto.OrderListItem;
import com.hotel.model.Role;
import com.hotel.service.AuthService;
import com.hotel.service.OrderService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
  private final AuthService authService;
  private final OrderService orderService;

  public AdminOrderController(AuthService authService, OrderService orderService) {
    this.authService = authService;
    this.orderService = orderService;
  }

  @GetMapping
  public ApiResponse<PageResponse<OrderListItem>> list(
      @RequestParam(value = "status", defaultValue = "ALL") String status,
      @RequestParam(value = "page", defaultValue = "1") int page,
      @RequestParam(value = "pageSize", defaultValue = "50") int pageSize) {
    authService.requireRole(Role.ADMIN);
    List<OrderListItem> items = orderService.listAllOrders(status, page, pageSize);
    long total = orderService.countAllOrders(status);
    return ApiResponse.ok(PageResponse.of(items, page, pageSize, total));
  }

  @PostMapping("/{id}/cancel")
  public ApiResponse<Void> cancelOrder(@PathVariable("id") long id) {
    authService.requireRole(Role.ADMIN);
    orderService.adminCancelOrder(id);
    return ApiResponse.ok();
  }
}

