package com.fom.boot.domain.meal.model.service;

import java.util.List;

public interface GeminiApiService {
    String testConnection();

    String generateMealPlan(int height, int weight, int servingSize, List<String> allergies, String message, Integer previousPrice);
}
