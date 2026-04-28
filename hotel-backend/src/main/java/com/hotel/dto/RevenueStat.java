package com.hotel.dto;

import java.math.BigDecimal;

public class RevenueStat {
  private String date;
  private BigDecimal revenue;

  public String getDate() {
    return date;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public BigDecimal getRevenue() {
    return revenue;
  }

  public void setRevenue(BigDecimal revenue) {
    this.revenue = revenue;
  }
}
