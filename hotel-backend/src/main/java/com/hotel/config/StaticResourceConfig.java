package com.hotel.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
  @Value("${app.upload.avatar-dir:uploads/avatar}")
  private String avatarDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    Path avatarPath = Paths.get(avatarDir).toAbsolutePath().normalize();
    registry
        .addResourceHandler("/uploads/avatar/**")
        .addResourceLocations("file:" + avatarPath.toString().replace("\\", "/") + "/");
  }
}
