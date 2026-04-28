package com.hotel.service;

import com.hotel.common.BusinessException;
import com.hotel.mapper.HotelMapper;
import com.hotel.mapper.RoomTypeMapper;
import com.hotel.model.Hotel;
import com.hotel.model.RoomType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RoomTypeService {
  private final HotelMapper hotelMapper;
  private final RoomTypeMapper roomTypeMapper;

  public RoomTypeService(HotelMapper hotelMapper, RoomTypeMapper roomTypeMapper) {
    this.hotelMapper = hotelMapper;
    this.roomTypeMapper = roomTypeMapper;
  }

  public List<RoomType> listMerchantRoomTypes(long merchantId) {
    Hotel hotel = hotelMapper.findByMerchantId(merchantId);
    if (hotel == null) throw new BusinessException("酒店不存在");
    return roomTypeMapper.listByHotelId(hotel.getId());
  }

  public void createMerchantRoomType(
      long merchantId, String name, BigDecimal price, String facilitiesText, int stock) {
    Hotel hotel = hotelMapper.findByMerchantId(merchantId);
    if (hotel == null) throw new BusinessException("酒店不存在");
    RoomType rt = new RoomType();
    rt.setHotelId(hotel.getId());
    rt.setName(name);
    rt.setPrice(price);
    rt.setFacilitiesText(facilitiesText == null ? "" : facilitiesText);
    rt.setStock(stock);
    rt.setCreatedAt(LocalDateTime.now());
    roomTypeMapper.insert(rt);
  }

  public void updateMerchantRoomType(
      long merchantId, long roomTypeId, String name, BigDecimal price, String facilitiesText, int stock) {
    Hotel hotel = hotelMapper.findByMerchantId(merchantId);
    if (hotel == null) throw new BusinessException("酒店不存在");
    RoomType existing = roomTypeMapper.findById(roomTypeId);
    if (existing == null || !existing.getHotelId().equals(hotel.getId())) {
      throw new BusinessException("房型不存在");
    }
    existing.setName(name);
    existing.setPrice(price);
    existing.setFacilitiesText(facilitiesText == null ? "" : facilitiesText);
    existing.setStock(stock);
    roomTypeMapper.update(existing);
  }

  public void deleteMerchantRoomType(long merchantId, long roomTypeId) {
    Hotel hotel = hotelMapper.findByMerchantId(merchantId);
    if (hotel == null) throw new BusinessException("酒店不存在");
    RoomType existing = roomTypeMapper.findById(roomTypeId);
    if (existing == null || !existing.getHotelId().equals(hotel.getId())) {
      throw new BusinessException("房型不存在");
    }
    roomTypeMapper.deleteById(roomTypeId);
  }
}

