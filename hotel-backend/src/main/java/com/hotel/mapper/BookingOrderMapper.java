package com.hotel.mapper;

import com.hotel.dto.OrderListItem;
import com.hotel.model.BookingOrder;
import com.hotel.model.OrderStatus;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BookingOrderMapper {
  @Select("select * from booking_order where id = #{id}")
  BookingOrder findById(@Param("id") long id);

  @Select("select count(1) from booking_order where user_id = #{userId}")
  long countByUserId(@Param("userId") long userId);

  @Select(
      "select o.id,o.order_no,o.user_id,u.username,h.id as hotel_id,h.name as hotel_name,rt.id as room_type_id,rt.name as room_type_name,"
          + "o.checkin_date,o.checkout_date,o.room_count,o.amount,o.status,o.created_at "
          + "from booking_order o "
          + "join sys_user u on u.id = o.user_id "
          + "join hotel h on h.id = o.hotel_id "
          + "join room_type rt on rt.id = o.room_type_id "
          + "where o.user_id = #{userId} "
          + "order by o.id desc limit #{limit} offset #{offset}")
  List<OrderListItem> listByUserId(
      @Param("userId") long userId, @Param("limit") int limit, @Param("offset") int offset);

  @Select("select count(1) from booking_order where hotel_id = #{hotelId}")
  long countByHotelId(@Param("hotelId") long hotelId);

  @Select(
      "select o.id,o.order_no,o.user_id,u.username,h.id as hotel_id,h.name as hotel_name,rt.id as room_type_id,rt.name as room_type_name,"
          + "o.checkin_date,o.checkout_date,o.room_count,o.amount,o.status,o.created_at "
          + "from booking_order o "
          + "join sys_user u on u.id = o.user_id "
          + "join hotel h on h.id = o.hotel_id "
          + "join room_type rt on rt.id = o.room_type_id "
          + "where o.hotel_id = #{hotelId} "
          + "order by o.id desc limit #{limit} offset #{offset}")
  List<OrderListItem> listByHotelId(
      @Param("hotelId") long hotelId, @Param("limit") int limit, @Param("offset") int offset);

  @Select("select count(1) from booking_order")
  long countAll();

  @Select("select count(1) from booking_order where date(created_at) = curdate()")
  long countTodayAll();

  @Select("select coalesce(sum(amount), 0) from booking_order where status = 'COMPLETED'")
  java.math.BigDecimal sumTotalRevenue();

  @Select("<script>"
      + "select o.id,o.order_no,o.user_id,u.username,h.id as hotel_id,h.name as hotel_name,rt.id as room_type_id,rt.name as room_type_name,"
      + "o.checkin_date,o.checkout_date,o.room_count,o.amount,o.status,o.created_at "
      + "from booking_order o "
      + "join sys_user u on u.id = o.user_id "
      + "join hotel h on h.id = o.hotel_id "
      + "join room_type rt on rt.id = o.room_type_id "
      + "<where>"
      + "  <if test='status != null and status != \"ALL\"'> and o.status = #{status} </if>"
      + "</where>"
      + "order by o.id desc limit #{limit} offset #{offset}"
      + "</script>")
  List<OrderListItem> listAll(@Param("status") String status, @Param("limit") int limit, @Param("offset") int offset);

  @Select("<script>"
      + "select count(1) from booking_order o "
      + "<where>"
      + "  <if test='status != null and status != \"ALL\"'> and o.status = #{status} </if>"
      + "</where>"
      + "</script>")
  long countAllWithStatus(@Param("status") String status);

  @Insert(
      "insert into booking_order(order_no,user_id,hotel_id,room_type_id,checkin_date,checkout_date,room_count,amount,status,created_at) "
          + "values(#{orderNo},#{userId},#{hotelId},#{roomTypeId},#{checkinDate},#{checkoutDate},#{roomCount},#{amount},#{status},#{createdAt})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(BookingOrder order);

  @Update("update booking_order set status = #{toStatus} where id = #{id} and status = #{fromStatus}")
  int updateStatus(
      @Param("id") long id,
      @Param("fromStatus") OrderStatus fromStatus,
      @Param("toStatus") OrderStatus toStatus);

  @Select("select count(1) from booking_order where hotel_id = #{hotelId} and date(created_at) = curdate()")
  long countTodayByHotelId(@Param("hotelId") long hotelId);

  @Select(
      "select coalesce(sum(amount), 0) from booking_order where hotel_id = #{hotelId} and date(created_at) = curdate() and status = 'COMPLETED'")
  java.math.BigDecimal sumTodayRevenueByHotelId(@Param("hotelId") long hotelId);

  @Select("select count(1) from booking_order where hotel_id = #{hotelId} and status = 'CREATED'")
  long countPendingByHotelId(@Param("hotelId") long hotelId);

  @Select(
      "select date(created_at) as date, coalesce(sum(amount), 0) as revenue "
          + "from booking_order "
          + "where hotel_id = #{hotelId} and status = 'COMPLETED' and created_at >= date_sub(curdate(), interval 6 day) "
          + "group by date(created_at) "
          + "order by date")
  List<com.hotel.dto.RevenueStat> getRecent7DaysRevenue(@Param("hotelId") long hotelId);
}
