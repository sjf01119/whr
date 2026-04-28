package com.hotel.mapper;

import com.hotel.model.BookingGuest;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface BookingGuestMapper {
  @Insert(
      "insert into booking_guest(order_id,guest_name,id_card,phone) "
          + "values(#{orderId},#{guestName},#{idCard},#{phone})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(BookingGuest guest);

  @Select("select * from booking_guest where order_id = #{orderId}")
  List<BookingGuest> findByOrderId(@Param("orderId") long orderId);
}
