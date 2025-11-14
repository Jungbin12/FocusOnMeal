package com.fom.boot.domain.meal.model.service;

public interface SeoulPriceApiService {
    Integer getAveragePrice(String ingredientName);

    String testConnection();
}
