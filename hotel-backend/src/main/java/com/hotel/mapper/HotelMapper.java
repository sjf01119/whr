package com.hotel.mapper;

import com.hotel.dto.HotelListItem;
import com.hotel.model.Hotel;
import com.hotel.model.HotelStatus;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface HotelMapper {
  @Select("select * from hotel where id = #{id}")
  Hotel findById(@Param("id") long id);

  @Select("select * from hotel where merchant_id = #{merchantId} limit 1")
  Hotel findByMerchantId(@Param("merchantId") long merchantId);

  @Select(
      "select h.id,h.name,h.address,h.description, coalesce(min(rt.price), 0) as min_price "
          + "from hotel h left join room_type rt on rt.hotel_id = h.id "
          + "where h.status = 'ONLINE' "
          + "group by h.id,h.name,h.address,h.description "
          + "order by h.id desc")
  List<HotelListItem> listOnlineWithMinPrice();

  @Select("select count(1) from hotel")
  long countAll();

  @Select("select count(1) from hotel where date(created_at) = curdate()")
  long countToday();

  @Select("select * from hotel order by id desc limit #{limit} offset #{offset}")
  List<Hotel> listAll(@Param("limit") int limit, @Param("offset") int offset);

  @Select("<script>"
      + "select * from hotel "
      + "<where>"
      + "  <if test='status != null and status != \"ALL\"'> and status = #{status} </if>"
      + "</where>"
      + "order by id desc limit #{limit} offset #{offset}"
      + "</script>")
  List<Hotel> listByStatus(@Param("status") String status, @Param("limit") int limit, @Param("offset") int offset);

  @Select("<script>"
      + "select count(1) from hotel "
      + "<where>"
      + "  <if test='status != null and status != \"ALL\"'> and status = #{status} </if>"
      + "</where>"
      + "</script>")
  long countByStatus(@Param("status") String status);

  @Insert(
      "insert into hotel(merchant_id,name,address,description,status,created_at) values(#{merchantId},#{name},#{address},#{description},#{status},#{createdAt})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(Hotel hotel);

  @Update("update hotel set name=#{name},address=#{address},description=#{description} where id=#{id}")
  int updateBase(Hotel hotel);

  @Update("update hotel set status=#{status} where id=#{id}")
  int updateStatus(@Param("id") long id, @Param("status") HotelStatus status);
}

