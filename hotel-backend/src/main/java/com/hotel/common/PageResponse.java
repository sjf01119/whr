package com.hotel.common;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PageResponse<T> {
  private List<T> items;
  private int page;
  private int pageSize;
  private long total;

  public static <T> PageResponse<T> of(List<T> items, int page, int pageSize, long total) {
    return new PageResponse<>(items, page, pageSize, total);
  }
}

