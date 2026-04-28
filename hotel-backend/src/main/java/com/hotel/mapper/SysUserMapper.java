package com.hotel.mapper;

import com.hotel.model.Role;
import com.hotel.model.SysUser;
import com.hotel.model.UserStatus;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface SysUserMapper {
  @Select("select * from sys_user where id = #{id}")
  SysUser findById(@Param("id") long id);

  @Select("select * from sys_user where username = #{username}")
  SysUser findByUsername(@Param("username") String username);

  @Select("select count(1) from sys_user")
  long countAll();

  @Select("select count(1) from sys_user where role = #{role}")
  long countByRole(@Param("role") Role role);

  @Select("select count(1) from sys_user where role = #{role} and date(created_at) = curdate()")
  long countTodayByRole(@Param("role") Role role);

  @Select("<script>"
      + "select * from sys_user where role = #{role} "
      + "<if test='status != null and status != \"ALL\"'> and status = #{status} </if>"
      + "order by id desc limit #{limit} offset #{offset}"
      + "</script>")
  List<SysUser> listByRoleAndStatus(@Param("role") Role role, @Param("status") String status, @Param("limit") int limit, @Param("offset") int offset);

  @Select("<script>"
      + "select count(1) from sys_user where role = #{role} "
      + "<if test='status != null and status != \"ALL\"'> and status = #{status} </if>"
      + "</script>")
  long countByRoleAndStatus(@Param("role") Role role, @Param("status") String status);

  @Select("select * from sys_user order by id desc limit #{limit} offset #{offset}")
  List<SysUser> listAll(@Param("limit") int limit, @Param("offset") int offset);

  @Insert(
      "insert into sys_user(username,password_hash,role,status,created_at) values(#{username},#{passwordHash},#{role},#{status},#{createdAt})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(SysUser user);

  @Update("update sys_user set username = #{username}, password_hash = #{passwordHash} where id = #{id}")
  int update(SysUser user);

  @Update("update sys_user set status = #{status} where id = #{id}")
  int updateStatus(@Param("id") long id, @Param("status") UserStatus status);
}

