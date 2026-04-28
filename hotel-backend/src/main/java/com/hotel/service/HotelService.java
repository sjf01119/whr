package com.hotel.service;

import com.hotel.common.BusinessException;
import com.hotel.dto.HotelListItem;
import com.hotel.mapper.HotelMapper;
import com.hotel.mapper.RoomTypeMapper;
import com.hotel.model.Hotel;
import com.hotel.model.HotelStatus;
import com.hotel.model.RoomType;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class HotelService {
  private final HotelMapper hotelMapper;
  private final RoomTypeMapper roomTypeMapper;

  public HotelService(HotelMapper hotelMapper, RoomTypeMapper roomTypeMapper) {
    this.hotelMapper = hotelMapper;
    this.roomTypeMapper = roomTypeMapper;
  }

  public List<HotelListItem> listOnline() {
    return hotelMapper.listOnlineWithMinPrice();
  }

  public Hotel getHotel(long id) {
    Hotel hotel = hotelMapper.findById(id);
    if (hotel == null || hotel.getStatus() != HotelStatus.ONLINE) {
      throw new BusinessException("酒店不存在或已下架");
    }
    return hotel;
  }

  public List<RoomType> listRoomTypes(long hotelId) {
    return roomTypeMapper.listByHotelId(hotelId);
  }

  public Hotel getOrCreateMerchantHotel(long merchantId) {
    Hotel hotel = hotelMapper.findByMerchantId(merchantId);
    if (hotel != null) return hotel;
    Hotel created = new Hotel();
    created.setMerchantId(merchantId);
    created.setName("未命名酒店");
    created.setAddress("");
    created.setDescription("");
    created.setStatus(HotelStatus.OFFLINE);
    created.setCreatedAt(LocalDateTime.now());
    hotelMapper.insert(created);
    return created;
  }

  public Hotel updateMerchantHotel(long merchantId, String name, String address, String description) {
    Hotel hotel = getOrCreateMerchantHotel(merchantId);
    hotel.setName(name);
    hotel.setAddress(address);
    hotel.setDescription(description);
    hotelMapper.updateBase(hotel);
    return hotelMapper.findById(hotel.getId());
  }

  public void forceOffline(long hotelId) {
    hotelMapper.updateStatus(hotelId, HotelStatus.OFFLINE);
  }
}

