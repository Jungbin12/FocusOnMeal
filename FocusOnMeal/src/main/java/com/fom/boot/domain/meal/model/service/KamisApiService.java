package com.fom.boot.domain.meal.model.service;

public interface KamisApiService {
    String testConnection();

    Integer getRetailPrice(String item);

    String getRawResponse(String date, String categoryCode);
}
