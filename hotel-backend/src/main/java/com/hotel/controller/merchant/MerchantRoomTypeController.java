package com.hotel.controller.merchant;

import com.hotel.common.ApiResponse;
import com.hotel.dto.RoomTypeUpsertRequest;
import com.hotel.model.Role;
import com.hotel.model.RoomType;
import com.hotel.service.AuthService;
import com.hotel.service.RoomTypeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/merchant/room-types")
public class MerchantRoomTypeController {
  private final AuthService authService;
  private final RoomTypeService roomTypeService;

  public MerchantRoomTypeController(AuthService authService, RoomTypeService roomTypeService) {
    this.authService = authService;
    this.roomTypeService = roomTypeService;
  }

  @GetMapping
  public ApiResponse<List<RoomType>> list() {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    return ApiResponse.ok(roomTypeService.listMerchantRoomTypes(merchantId));
  }

  @PostMapping
  public ApiResponse<Void> create(@Valid @RequestBody RoomTypeUpsertRequest req) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    roomTypeService.createMerchantRoomType(
        merchantId, req.getName(), req.getPrice(), req.getFacilitiesText(), req.getStock());
    return ApiResponse.ok();
  }

  @PutMapping("/{id}")
  public ApiResponse<Void> update(@PathVariable("id") long id, @Valid @RequestBody RoomTypeUpsertRequest req) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    roomTypeService.updateMerchantRoomType(
        merchantId, id, req.getName(), req.getPrice(), req.getFacilitiesText(), req.getStock());
    return ApiResponse.ok();
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable("id") long id) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    roomTypeService.deleteMerchantRoomType(merchantId, id);
    return ApiResponse.ok();
  }
}

