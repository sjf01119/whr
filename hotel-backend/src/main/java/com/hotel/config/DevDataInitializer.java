package com.hotel.config;

import com.hotel.mapper.BookingOrderMapper;
import com.hotel.mapper.HotelMapper;
import com.hotel.mapper.RoomTypeMapper;
import com.hotel.mapper.SysUserMapper;
import com.hotel.model.BookingOrder;
import com.hotel.model.Hotel;
import com.hotel.model.HotelStatus;
import com.hotel.model.OrderStatus;
import com.hotel.model.Role;
import com.hotel.model.RoomType;
import com.hotel.model.SysUser;
import com.hotel.model.UserStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

@Component
public class DevDataInitializer implements ApplicationRunner {
  private final SysUserMapper sysUserMapper;
  private final HotelMapper hotelMapper;
  private final RoomTypeMapper roomTypeMapper;
  private final BookingOrderMapper bookingOrderMapper;
  private final JdbcTemplate jdbcTemplate;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public DevDataInitializer(
      SysUserMapper sysUserMapper,
      HotelMapper hotelMapper,
      RoomTypeMapper roomTypeMapper,
      BookingOrderMapper bookingOrderMapper,
      JdbcTemplate jdbcTemplate) {
    this.sysUserMapper = sysUserMapper;
    this.hotelMapper = hotelMapper;
    this.roomTypeMapper = roomTypeMapper;
    this.bookingOrderMapper = bookingOrderMapper;
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public void run(ApplicationArguments args) {
    ensureBookingGuestPhoneColumn();
    if (sysUserMapper.countAll() > 0) return;

    SysUser admin = new SysUser();
    admin.setUsername("admin");
    admin.setPasswordHash(encoder.encode("admin123"));
    admin.setRole(Role.ADMIN);
    admin.setStatus(UserStatus.ENABLED);
    admin.setCreatedAt(LocalDateTime.now());
    sysUserMapper.insert(admin);

    SysUser merchant = new SysUser();
    merchant.setUsername("merchant1");
    merchant.setPasswordHash(encoder.encode("merchant123"));
    merchant.setRole(Role.MERCHANT);
    merchant.setStatus(UserStatus.ENABLED);
    merchant.setCreatedAt(LocalDateTime.now());
    sysUserMapper.insert(merchant);

    SysUser user1 = new SysUser();
    user1.setUsername("user1");
    user1.setPasswordHash(encoder.encode("user123"));
    user1.setRole(Role.USER);
    user1.setStatus(UserStatus.ENABLED);
    user1.setCreatedAt(LocalDateTime.now());
    sysUserMapper.insert(user1);

    SysUser user2 = new SysUser();
    user2.setUsername("user2");
    user2.setPasswordHash(encoder.encode("user123"));
    user2.setRole(Role.USER);
    user2.setStatus(UserStatus.ENABLED);
    user2.setCreatedAt(LocalDateTime.now());
    sysUserMapper.insert(user2);

    Hotel hotel = new Hotel();
    hotel.setMerchantId(merchant.getId());
    hotel.setName("Hotle酒店");
    hotel.setAddress("示例地址");
    hotel.setDescription("经济/经典房型齐全，配套完善");
    hotel.setStatus(HotelStatus.ONLINE);
    hotel.setCreatedAt(LocalDateTime.now());
    hotelMapper.insert(hotel);

    RoomType rt1 =
        insertRoomType(
            hotel.getId(),
            "经济单人床房",
            new BigDecimal("100.00"),
            "洗浴间、24小时热水、电视、标准书桌、免费WiFi",
            20);
    RoomType rt2 =
        insertRoomType(
            hotel.getId(),
            "经济双人床房",
            new BigDecimal("120.00"),
            "洗浴间、24小时热水、电视、标准书桌、免费WiFi",
            20);
    RoomType rt3 =
        insertRoomType(
            hotel.getId(),
            "经济大床房",
            new BigDecimal("140.00"),
            "洗浴间、24小时热水、电视、标准书桌、免费WiFi",
            20);
    RoomType rt4 =
        insertRoomType(
            hotel.getId(),
            "经典单人床房",
            new BigDecimal("120.00"),
            "洗浴间、24小时热水、4k电视、配备电脑、免费独立WiFi",
            20);
    RoomType rt5 =
        insertRoomType(
            hotel.getId(),
            "经典双人床房",
            new BigDecimal("160.00"),
            "洗浴间、24小时热水、4k电视、配备电脑、免费独立WiFi",
            20);
    RoomType rt6 =
        insertRoomType(
            hotel.getId(),
            "经典大床房",
            new BigDecimal("180.00"),
            "洗浴间、24小时热水、4k电视、配备电脑、免费独立WiFi",
            20);

    LocalDate today = LocalDate.now();

    BookingOrder orderA = new BookingOrder();
    orderA.setOrderNo("A" + System.currentTimeMillis());
    orderA.setUserId(user1.getId());
    orderA.setHotelId(hotel.getId());
    orderA.setRoomTypeId(rt1.getId());
    orderA.setCheckinDate(today.plusDays(1));
    orderA.setCheckoutDate(today.plusDays(3));
    orderA.setRoomCount(1);
    orderA.setAmount(new BigDecimal("200.00"));
    orderA.setStatus(OrderStatus.CREATED);
    orderA.setCreatedAt(LocalDateTime.now());
    bookingOrderMapper.insert(orderA);

    BookingOrder orderB = new BookingOrder();
    orderB.setOrderNo("B" + System.currentTimeMillis());
    orderB.setUserId(user1.getId());
    orderB.setHotelId(hotel.getId());
    orderB.setRoomTypeId(rt6.getId());
    orderB.setCheckinDate(today.plusDays(2));
    orderB.setCheckoutDate(today.plusDays(3));
    orderB.setRoomCount(1);
    orderB.setAmount(new BigDecimal("180.00"));
    orderB.setStatus(OrderStatus.PAID);
    orderB.setCreatedAt(LocalDateTime.now());
    bookingOrderMapper.insert(orderB);

    BookingOrder orderC = new BookingOrder();
    orderC.setOrderNo("C" + System.currentTimeMillis());
    orderC.setUserId(user2.getId());
    orderC.setHotelId(hotel.getId());
    orderC.setRoomTypeId(rt2.getId());
    orderC.setCheckinDate(today.plusDays(1));
    orderC.setCheckoutDate(today.plusDays(2));
    orderC.setRoomCount(2);
    orderC.setAmount(new BigDecimal("240.00"));
    orderC.setStatus(OrderStatus.COMPLETED);
    orderC.setCreatedAt(LocalDateTime.now());
    bookingOrderMapper.insert(orderC);
  }

  private RoomType insertRoomType(
      long hotelId, String name, BigDecimal price, String facilitiesText, int stock) {
    RoomType rt = new RoomType();
    rt.setHotelId(hotelId);
    rt.setName(name);
    rt.setPrice(price);
    rt.setFacilitiesText(facilitiesText);
    rt.setStock(stock);
    rt.setCreatedAt(LocalDateTime.now());
    roomTypeMapper.insert(rt);
    return rt;
  }

  private void ensureBookingGuestPhoneColumn() {
    Integer count =
        jdbcTemplate.queryForObject(
            "select count(1) from information_schema.columns where table_schema = database() and table_name = 'booking_guest' and column_name = 'phone'",
            Integer.class);
    if (count != null && count == 0) {
      jdbcTemplate.execute("alter table booking_guest add column phone varchar(32) not null default ''");
    }
  }
}
