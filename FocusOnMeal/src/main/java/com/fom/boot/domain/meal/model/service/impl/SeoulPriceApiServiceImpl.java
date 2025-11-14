package com.fom.boot.domain.meal.model.service.impl;

import com.fom.boot.domain.meal.model.service.SeoulPriceApiService;
import org.springframework.stereotype.Service;


@Service
public class SeoulPriceApiServiceImpl implements SeoulPriceApiService {
    @Override
    public Integer getAveragePrice(String ingredientName) {
        return 0;
    }

    @Override
    public String testConnection() {
        return "";
    }
}
