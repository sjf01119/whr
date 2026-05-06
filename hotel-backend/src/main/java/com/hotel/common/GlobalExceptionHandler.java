package com.hotel.common;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(BusinessException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ApiResponse<Void> handleBusiness(BusinessException e) {
    return ApiResponse.fail(e.getMessage());
  }

  @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class, ConstraintViolationException.class})
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ApiResponse<Void> handleValidation(Exception e) {
    if (e instanceof MethodArgumentNotValidException ex) {
      String msg =
          ex.getBindingResult().getFieldErrors().stream()
              .map(err -> err.getField() + ":" + err.getDefaultMessage())
              .collect(Collectors.joining("; "));
      return ApiResponse.fail(msg.isEmpty() ? "参数错误" : msg);
    }
    if (e instanceof BindException ex) {
      String msg =
          ex.getBindingResult().getFieldErrors().stream()
              .map(err -> err.getField() + ":" + err.getDefaultMessage())
              .collect(Collectors.joining("; "));
      return ApiResponse.fail(msg.isEmpty() ? "参数错误" : msg);
    }
    if (e instanceof ConstraintViolationException ex) {
      String msg =
          ex.getConstraintViolations().stream()
              .map(v -> v.getPropertyPath() + ":" + v.getMessage())
              .collect(Collectors.joining("; "));
      return ApiResponse.fail(msg.isEmpty() ? "参数错误" : msg);
    }
    return ApiResponse.fail("参数错误");
  }

  @ExceptionHandler(NotLoginException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  public ApiResponse<Void> handleNotLogin(NotLoginException e) {
    return ApiResponse.fail("未登录");
  }

  @ExceptionHandler(NotPermissionException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public ApiResponse<Void> handleNoPerm(NotPermissionException e) {
    return ApiResponse.fail("无权限");
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public ApiResponse<Void> handleOther(Exception e) {
    log.error("Unhandled exception", e);
    return ApiResponse.fail("服务异常");
  }
}
