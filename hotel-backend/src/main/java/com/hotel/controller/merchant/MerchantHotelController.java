package com.hotel.controller.merchant;

import com.hotel.common.ApiResponse;
import com.hotel.dto.UpdateHotelRequest;
import com.hotel.model.Role;
import com.hotel.model.Hotel;
import com.hotel.service.AuthService;
import com.hotel.service.HotelService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/merchant/hotel")
public class MerchantHotelController {
  private final AuthService authService;
  private final HotelService hotelService;

  public MerchantHotelController(AuthService authService, HotelService hotelService) {
    this.authService = authService;
    this.hotelService = hotelService;
  }

  @GetMapping
  public ApiResponse<Hotel> me() {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    return ApiResponse.ok(hotelService.getOrCreateMerchantHotel(merchantId));
  }

  @PutMapping
  public ApiResponse<Hotel> update(@Valid @RequestBody UpdateHotelRequest req) {
    authService.requireRole(Role.MERCHANT);
    long merchantId = authService.requireLoginId();
    return ApiResponse.ok(
        hotelService.updateMerchantHotel(merchantId, req.getName(), req.getAddress(), req.getDescription()));
  }
}

