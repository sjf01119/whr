package com.hotel.service;

import com.hotel.common.BusinessException;
import com.hotel.dto.OrderListItem;
import com.hotel.mapper.BookingOrderMapper;
import com.hotel.mapper.HotelMapper;
import com.hotel.mapper.RoomTypeMapper;
import com.hotel.model.BookingOrder;
import com.hotel.model.Hotel;
import com.hotel.model.HotelStatus;
import com.hotel.model.OrderStatus;
import com.hotel.model.RoomType;
import com.hotel.mapper.BookingGuestMapper;
import com.hotel.model.BookingGuest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
  private final HotelMapper hotelMapper;
  private final RoomTypeMapper roomTypeMapper;
  private final BookingOrderMapper bookingOrderMapper;
  private final BookingGuestMapper bookingGuestMapper;

  public OrderService(HotelMapper hotelMapper, RoomTypeMapper roomTypeMapper, BookingOrderMapper bookingOrderMapper, BookingGuestMapper bookingGuestMapper) {
    this.hotelMapper = hotelMapper;
    this.roomTypeMapper = roomTypeMapper;
    this.bookingOrderMapper = bookingOrderMapper;
    this.bookingGuestMapper = bookingGuestMapper;
  }

  @Transactional
  public long createOrder(
      long userId, long hotelId, long roomTypeId, LocalDate checkinDate, LocalDate checkoutDate, int roomCount,
      String guestName, String phone, String idCard) {
    if (roomCount <= 0) throw new BusinessException("房间数不合法");
    if (checkinDate == null || checkoutDate == null) throw new BusinessException("日期不合法");
    long nights = ChronoUnit.DAYS.between(checkinDate, checkoutDate);
    if (nights <= 0) throw new BusinessException("离店日期必须晚于入住日期");

    Hotel hotel = hotelMapper.findById(hotelId);
    if (hotel == null || hotel.getStatus() != HotelStatus.ONLINE) {
      throw new BusinessException("酒店不存在或已下架");
    }

    RoomType rt = roomTypeMapper.findById(roomTypeId);
    if (rt == null || !rt.getHotelId().equals(hotelId)) {
      throw new BusinessException("房型不存在");
    }
    if (rt.getStock() < roomCount) {
      throw new BusinessException("库存不足");
    }

    BigDecimal amount = rt.getPrice().multiply(BigDecimal.valueOf(roomCount)).multiply(BigDecimal.valueOf(nights));

    BookingOrder order = new BookingOrder();
    order.setOrderNo(genOrderNo());
    order.setUserId(userId);
    order.setHotelId(hotelId);
    order.setRoomTypeId(roomTypeId);
    order.setCheckinDate(checkinDate);
    order.setCheckoutDate(checkoutDate);
    order.setRoomCount(roomCount);
    order.setAmount(amount);
    order.setStatus(OrderStatus.CREATED);
    order.setCreatedAt(LocalDateTime.now());
    bookingOrderMapper.insert(order);

    BookingGuest guest = new BookingGuest();
    guest.setOrderId(order.getId());
    guest.setGuestName(guestName);
    guest.setPhone(phone);
    guest.setIdCard(idCard);
    bookingGuestMapper.insert(guest);

    return order.getId();
  }

  public List<OrderListItem> listUserOrders(long userId, int page, int pageSize) {
    return bookingOrderMapper.listByUserId(userId, pageSize, (page - 1) * pageSize);
  }

  public long countUserOrders(long userId) {
    return bookingOrderMapper.countByUserId(userId);
  }

  public List<OrderListItem> listHotelOrders(long hotelId, int page, int pageSize) {
    return bookingOrderMapper.listByHotelId(hotelId, pageSize, (page - 1) * pageSize);
  }

  public long countHotelOrders(long hotelId) {
    return bookingOrderMapper.countByHotelId(hotelId);
  }

  public List<OrderListItem> listAllOrders(String status, int page, int pageSize) {
    return bookingOrderMapper.listAll(status, pageSize, (page - 1) * pageSize);
  }

  public long countAllOrders(String status) {
    return bookingOrderMapper.countAllWithStatus(status);
  }

  @Transactional
  public void adminCancelOrder(long orderId) {
    BookingOrder order = bookingOrderMapper.findById(orderId);
    if (order == null) {
      throw new BusinessException("订单不存在");
    }
    int ok = bookingOrderMapper.updateStatus(orderId, order.getStatus(), OrderStatus.CANCELED);
    if (ok != 1) throw new BusinessException("订单状态更新失败");
  }

  @Transactional
  public void payOrder(long userId, long orderId) {
    BookingOrder order = bookingOrderMapper.findById(orderId);
    if (order == null || !order.getUserId().equals(userId)) {
      throw new BusinessException("订单不存在");
    }
    if (order.getStatus() != OrderStatus.CREATED) {
      throw new BusinessException("订单状态不允许支付");
    }
    int updated = roomTypeMapper.deductStock(order.getRoomTypeId(), order.getRoomCount());
    if (updated != 1) {
      throw new BusinessException("库存不足");
    }
    int ok = bookingOrderMapper.updateStatus(orderId, OrderStatus.CREATED, OrderStatus.PAID);
    if (ok != 1) throw new BusinessException("订单状态变更失败");
  }

  @Transactional
  public void payMerchantOrder(long hotelId, long orderId) {
    BookingOrder order = bookingOrderMapper.findById(orderId);
    if (order == null || !order.getHotelId().equals(hotelId)) {
      throw new BusinessException("订单不存在");
    }
    if (order.getStatus() != OrderStatus.CREATED) {
      throw new BusinessException("订单状态不允许确认接单");
    }
    int updated = roomTypeMapper.deductStock(order.getRoomTypeId(), order.getRoomCount());
    if (updated != 1) {
      throw new BusinessException("库存不足");
    }
    int ok = bookingOrderMapper.updateStatus(orderId, OrderStatus.CREATED, OrderStatus.PAID);
    if (ok != 1) throw new BusinessException("订单状态变更失败");
  }

  public void cancelUserOrder(long userId, long orderId) {
    BookingOrder order = bookingOrderMapper.findById(orderId);
    if (order == null || !order.getUserId().equals(userId)) {
      throw new BusinessException("订单不存在");
    }
    int ok = bookingOrderMapper.updateStatus(orderId, OrderStatus.CREATED, OrderStatus.CANCELED);
    if (ok != 1) throw new BusinessException("订单状态不允许取消");
  }

  public void cancelMerchantOrder(long hotelId, long orderId) {
    BookingOrder order = bookingOrderMapper.findById(orderId);
    if (order == null || !order.getHotelId().equals(hotelId)) {
      throw new BusinessException("订单不存在");
    }
    int ok = bookingOrderMapper.updateStatus(orderId, OrderStatus.CREATED, OrderStatus.CANCELED);
    if (ok != 1) throw new BusinessException("订单状态不允许取消");
  }

  public void checkin(long hotelId, long orderId) {
    BookingOrder order = bookingOrderMapper.findById(orderId);
    if (order == null || !order.getHotelId().equals(hotelId)) {
      throw new BusinessException("订单不存在");
    }
    int ok = bookingOrderMapper.updateStatus(orderId, OrderStatus.PAID, OrderStatus.CHECKED_IN);
    if (ok != 1) throw new BusinessException("订单状态不允许入住");
  }

  public void checkout(long hotelId, long orderId) {
    BookingOrder order = bookingOrderMapper.findById(orderId);
    if (order == null || !order.getHotelId().equals(hotelId)) {
      throw new BusinessException("订单不存在");
    }
    int ok = bookingOrderMapper.updateStatus(orderId, OrderStatus.CHECKED_IN, OrderStatus.COMPLETED);
    if (ok != 1) throw new BusinessException("订单状态不允许退房");
  }

  private String genOrderNo() {
    String raw = UUID.randomUUID().toString().replace("-", "");
    return raw.substring(0, 20);
  }
}
