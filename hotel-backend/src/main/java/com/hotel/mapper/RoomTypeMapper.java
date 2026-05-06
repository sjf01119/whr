package com.hotel.mapper;

import com.hotel.model.RoomType;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface RoomTypeMapper {
  @Select("select * from room_type where id = #{id}")
  RoomType findById(@Param("id") long id);

  @Select("select * from room_type where hotel_id = #{hotelId} order by id desc")
  List<RoomType> listByHotelId(@Param("hotelId") long hotelId);

  @Insert(
      "insert into room_type(hotel_id,name,price,facilities_text,stock,created_at) values(#{hotelId},#{name},#{price},#{facilitiesText},#{stock},#{createdAt})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(RoomType roomType);

  @Update(
      "update room_type set name=#{name},price=#{price},facilities_text=#{facilitiesText},stock=#{stock} where id=#{id}")
  int update(RoomType roomType);

  @Delete("delete from room_type where id = #{id}")
  int deleteById(@Param("id") long id);

  @Update("update room_type set stock = stock - #{delta} where id = #{id} and stock >= #{delta}")
  int deductStock(@Param("id") long id, @Param("delta") int delta);

  @Update("update room_type set stock = stock + #{delta} where id = #{id}")
  int addStock(@Param("id") long id, @Param("delta") int delta);
}
