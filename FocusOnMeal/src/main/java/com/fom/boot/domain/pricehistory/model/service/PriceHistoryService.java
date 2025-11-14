package com.fom.boot.domain.pricehistory.model.service;

import java.time.LocalDate;
import java.util.List;

import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;

public interface PriceHistoryService {

	PriceTrendResponse getPriceTrend(int ingredientId, String period, LocalDate startDate, LocalDate endDate, String priceType, String region);

	PriceTrendResponse getLatestPriceWithChanges(int ingredientId, String priceType, String region);

	List<PriceTrendResponse> getLatestPricesBatch(String ingredientIds, String priceType, String region);

}
