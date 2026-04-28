package com.hotel.controller.user;

import com.hotel.common.ApiResponse;
import com.hotel.dto.HotelListItem;
import com.hotel.model.Role;
import com.hotel.model.Hotel;
import com.hotel.model.RoomType;
import com.hotel.service.AuthService;
import com.hotel.service.HotelService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/hotels")
public class UserHotelController {
  private final AuthService authService;
  private final HotelService hotelService;

  public UserHotelController(AuthService authService, HotelService hotelService) {
    this.authService = authService;
    this.hotelService = hotelService;
  }

  @GetMapping
  public ApiResponse<List<HotelListItem>> list() {
    authService.requireRole(Role.USER);
    return ApiResponse.ok(hotelService.listOnline());
  }

  @GetMapping("/{id}")
  public ApiResponse<Hotel> detail(@PathVariable("id") long id) {
    authService.requireRole(Role.USER);
    return ApiResponse.ok(hotelService.getHotel(id));
  }

  @GetMapping("/{id}/room-types")
  public ApiResponse<List<RoomType>> roomTypes(@PathVariable("id") long id) {
    authService.requireRole(Role.USER);
    hotelService.getHotel(id);
    return ApiResponse.ok(hotelService.listRoomTypes(id));
  }
}

