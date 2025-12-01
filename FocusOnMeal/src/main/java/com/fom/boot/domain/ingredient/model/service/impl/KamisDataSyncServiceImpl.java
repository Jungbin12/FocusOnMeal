package com.fom.boot.domain.ingredient.model.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fom.boot.domain.ingredient.model.mapper.IngredientMapper;
import com.fom.boot.domain.ingredient.model.mapper.IngredientPriceHistoryMapper;
import com.fom.boot.domain.ingredient.model.service.KamisDataSyncService;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;
import com.fom.boot.domain.meal.model.service.KamisApiService;
import com.fom.boot.domain.alert.model.service.PriceAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * KAMIS API 데이터 동기화 서비스 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KamisDataSyncServiceImpl implements KamisDataSyncService {

    private final KamisApiService kamisApiService;
    private final IngredientMapper ingredientMapper;
    private final IngredientPriceHistoryMapper priceHistoryMapper;
    private final ObjectMapper objectMapper;
    private final PriceAlertService priceAlertService;

    @Override
    @Transactional
    public boolean syncTodayPrice(String itemCategoryCode, String itemCode, String kindCode) {
        log.info("Today price sync started - category: {}, item: {}, kind: {}", itemCategoryCode, itemCode, kindCode);

        try {
            // 오늘 날짜로 API 호출
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String response = kamisApiService.getPeriodProductList(today, today, itemCategoryCode, itemCode, kindCode);

            if (response == null) {
                log.error("KAMIS API response is null");
                return false;
            }

            // 응답 파싱 및 저장
            return parseAndSaveData(response, itemCategoryCode, itemCode, kindCode);

        } catch (Exception e) {
            log.error("Price sync failed", e);
            return false;
        }
    }

    @Override
    @Transactional
    public int syncCategoryPrices(String itemCategoryCode) {
        log.info("Category sync started - category: {}", itemCategoryCode);

        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            log.info("Calling KAMIS API for category: {}, date: {}", itemCategoryCode, today);
            String response = kamisApiService.getDailyPriceByCategoryList(itemCategoryCode, today);

            if (response == null) {
                log.error("KAMIS API response is null for category: {}", itemCategoryCode);
                return 0;
            }

            log.debug("KAMIS API response for category {}: {}", itemCategoryCode, response.substring(0, Math.min(500, response.length())));
            return parseAndSaveAllItems(response, itemCategoryCode);

        } catch (Exception e) {
            log.error("Category sync failed for category: {}", itemCategoryCode, e);
            return 0;
        }
    }

    @Override
    @Transactional
    public String syncAndGetResult(String itemCategoryCode, String itemCode, String kindCode) {
        log.info("Test sync started - category: {}, item: {}, kind: {}", itemCategoryCode, itemCode, kindCode);

        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String response = kamisApiService.getPeriodProductList(today, today, itemCategoryCode, itemCode, kindCode);

            if (response == null) {
                return "KAMIS API response is null";
            }

            // JSON 파싱
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.path("data");

            // 에러 체크
            if (data.isArray() && data.size() > 0 && !data.get(0).isObject()) {
                String errorCode = data.get(0).asText();
                return "KAMIS API error code: " + errorCode;
            }

            JsonNode items = data.path("item");
            if (!items.isArray() || items.size() == 0) {
                return "No data";
            }

            // 품목 정보 추출 (첫 번째 아이템에서)
            String itemName = extractItemName(items);
            if (itemName == null) {
                return "Item name not found";
            }

            // Ingredient 저장 또는 조회
            Ingredient ingredient = getOrCreateIngredient(itemName, itemCategoryCode, itemCode, kindCode);
            if (ingredient == null) {
                return "Ingredient save failed";
            }

            // 오늘 날짜의 평균 가격 추출
            Integer avgPrice = extractTodayAveragePrice(items, today);
            if (avgPrice == null) {
                return "Today's average price not found";
            }

            // PriceHistory 저장
            PriceHistory priceHistory = new PriceHistory();
            priceHistory.setIngredientId(ingredient.getIngredientId());
            priceHistory.setPriceValue(avgPrice);
            priceHistory.setPriceType("소매");
            priceHistory.setRegion("서울");
            priceHistory.setCollectedDate(LocalDateTime.now());

            int saved = priceHistoryMapper.insertPrice(priceHistory);

            if (saved > 0) {
                return String.format("Sync success - item: %s, price: %d KRW, ingredientId: %d",
                        itemName, avgPrice, ingredient.getIngredientId());
            } else {
                return "Price history save failed";
            }

        } catch (Exception e) {
            log.error("Test sync failed", e);
            return "Error: " + e.getMessage();
        }
    }

    /**
     * JSON 응답 파싱 및 데이터 저장
     */
    private boolean parseAndSaveData(String response, String itemCategoryCode, String itemCode, String kindCode) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.path("data");

            // 에러 체크
            if (data.isArray() && data.size() > 0 && !data.get(0).isObject()) {
                String errorCode = data.get(0).asText();
                log.error("KAMIS API error code: {}", errorCode);
                return false;
            }

            JsonNode items = data.path("item");
            if (!items.isArray() || items.size() == 0) {
                log.warn("No response data");
                return false;
            }

            // 품목 정보 추출
            String itemName = extractItemName(items);
            if (itemName == null) {
                log.error("Item name not found");
                return false;
            }

            // Ingredient 저장 또는 조회
            Ingredient ingredient = getOrCreateIngredient(itemName, itemCategoryCode, itemCode, kindCode);
            if (ingredient == null) {
                return false;
            }

            // 오늘 날짜의 평균 가격 추출
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            Integer avgPrice = extractTodayAveragePrice(items, today);
            if (avgPrice == null) {
                log.warn("Today's average price not found");
                return false;
            }

            // PriceHistory 저장
            PriceHistory priceHistory = new PriceHistory();
            priceHistory.setIngredientId(ingredient.getIngredientId());
            priceHistory.setPriceValue(avgPrice);
            priceHistory.setPriceType("소매");
            priceHistory.setRegion("서울");
            priceHistory.setCollectedDate(LocalDateTime.now());

            int saved = priceHistoryMapper.insertPrice(priceHistory);
            log.info("Price history saved - item: {}, price: {} KRW", itemName, avgPrice);

            return saved > 0;

        } catch (Exception e) {
            log.error("Data parsing and save failed", e);
            return false;
        }
    }

    /**
     * 품목명 추출 (첫 번째 아이템에서 kindname 사용)
     */
    private String extractItemName(JsonNode items) {
        for (JsonNode item : items) {
            JsonNode kindNameNode = item.path("kindname");
            if (kindNameNode.isArray() && kindNameNode.size() > 0) {
                // "시금치(1kg)" 형태에서 품목명만 추출
                String fullName = kindNameNode.get(0).asText();
                if (fullName.contains("(")) {
                    return fullName.substring(0, fullName.indexOf("(")).trim();
                }
                return fullName;
            }
        }
        return null;
    }

    /**
     * 오늘 날짜의 평균 가격 추출
     */
    private Integer extractTodayAveragePrice(JsonNode items, String today) {
        // today: "2025-11-17" -> "11/17"
        String monthDay = today.substring(5).replace("-", "/");

        for (JsonNode item : items) {
            String countyName = item.path("countyname").asText();
            String regday = item.path("regday").asText();

            // "평균" 데이터이고, 날짜가 오늘인 경우
            if ("평균".equals(countyName) && regday.equals(monthDay)) {
                String priceStr = item.path("price").asText();
                if (priceStr != null && !priceStr.isEmpty() && !"-".equals(priceStr)) {
                    return Integer.parseInt(priceStr.replace(",", ""));
                }
            }
        }

        return null;
    }

    /**
     * Ingredient 조회 또는 생성
     */
    private Ingredient getOrCreateIngredient(String itemName, String itemCategoryCode, String itemCode, String kindCode) {
        // 기존 데이터 확인
        Ingredient existing = ingredientMapper.selectByKamisCode(itemCode, kindCode);
        if (existing != null) {
            log.debug("Using existing ingredient - id: {}, name: {}", existing.getIngredientId(), existing.getName());
            return existing;
        }

        // 새로 등록
        Ingredient newIngredient = new Ingredient();
        newIngredient.setName(itemName);
        newIngredient.setCategory(getCategoryName(itemCategoryCode));
        newIngredient.setStandardUnit("kg");
        newIngredient.setKamisItemCode(itemCode);
        newIngredient.setKamisKindCode(kindCode);
        newIngredient.setKamisItemCategoryCode(itemCategoryCode);

        int inserted = ingredientMapper.insertIngredient(newIngredient);
        if (inserted > 0) {
            log.info("New ingredient registered - id: {}, name: {}", newIngredient.getIngredientId(), itemName);
            return newIngredient;
        }

        log.error("Ingredient registration failed - name: {}", itemName);
        return null;
    }

    /**
     * 부류 코드를 한글명으로 변환
     */
    private String getCategoryName(String code) {
        return switch (code) {
            case "100" -> "Grains";
            case "200" -> "Vegetables";
            case "300" -> "SpecialCrops";
            case "400" -> "Fruits";
            case "500" -> "Livestock";
            case "600" -> "Seafood";
            default -> "Others";
        };
    }

    @Override
    @Transactional
    public int syncAllCategories() {
        log.info("All categories sync started");

        String[] categories = {"100", "200", "300", "400", "500", "600"};
        int totalSynced = 0;

        for (String category : categories) {
            try {
                int synced = syncCategoryPrices(category);
                totalSynced += synced;
                log.info("Category {} sync completed - {} items", getCategoryName(category), synced);
            } catch (Exception e) {
                log.error("Category {} sync failed", category, e);
            }
        }

        log.info("All categories sync completed - total {} items", totalSynced);
        return totalSynced;
    }

    @Override
    @Transactional
    public String syncAllCategoriesAndGetResult() {
        log.info("All categories sync started (with result)");

        StringBuilder result = new StringBuilder();
        String[] categories = {"100", "200", "300", "400", "500", "600"};
        int totalSynced = 0;

        for (String category : categories) {
            try {
                int synced = syncCategoryPrices(category);
                totalSynced += synced;
                result.append(String.format("%s: %d, ", getCategoryName(category), synced));
            } catch (Exception e) {
                log.error("Category {} sync failed", category, e);
                result.append(String.format("%s: failed, ", getCategoryName(category)));
            }
        }

        String finalResult = String.format("Sync completed - total %d items [%s]", totalSynced, result.toString());
        log.info(finalResult);
        return finalResult;
    }

    /**
     * dailyPriceByCategoryList 응답에서 모든 품목 파싱 및 저장
     */
    private int parseAndSaveAllItems(String response, String categoryCode) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode data = root.path("data");

            // 에러 체크
            if (data.isArray() && data.size() > 0 && !data.get(0).isObject()) {
                String errorCode = data.get(0).asText();
                log.error("KAMIS API error code: {} for category: {}", errorCode, categoryCode);
                return 0;
            }

            JsonNode items = data.path("item");
            if (!items.isArray() || items.size() == 0) {
                log.warn("No response data - category: {}, data structure: {}", categoryCode, data.toString().substring(0, Math.min(200, data.toString().length())));
                return 0;
            }

            log.info("Parsing {} items for category: {}", items.size(), categoryCode);
            int savedCount = 0;
            int skippedCount = 0;

            for (JsonNode item : items) {
                try {
                    // 품목 정보 추출
                    String itemName = item.path("item_name").asText();
                    String itemCode = item.path("item_code").asText();
                    String kindCode = item.path("kind_code").asText();
                    String rank = item.path("rank").asText();

                    // 상품 등급만 처리
                    if (!"상품".equals(rank)) {
                        continue;
                    }

                    // 가격 추출 (dpr1: 당일)
                    String priceStr = item.path("dpr1").asText();
                    if (priceStr == null || priceStr.isEmpty() || "-".equals(priceStr)) {
                        log.debug("No price - item: {}", itemName);
                        continue;
                    }

                    Integer price = Integer.parseInt(priceStr.replace(",", ""));

                    // Ingredient 저장 또는 조회
                    Ingredient ingredient = getOrCreateIngredient(itemName, categoryCode, itemCode, kindCode);
                    if (ingredient == null) {
                        continue;
                    }

                    // 오늘 이미 저장된 가격이 있는지 확인
                    int exists = priceHistoryMapper.checkTodayPriceExists(ingredient.getIngredientId());
                    if (exists > 0) {
                        skippedCount++;
                        log.debug("Today's price already exists - item: {}, skipped", itemName);
                        continue;
                    }

                    // PriceHistory 저장
                    PriceHistory priceHistory = new PriceHistory();
                    priceHistory.setIngredientId(ingredient.getIngredientId());
                    priceHistory.setPriceValue(price);
                    priceHistory.setPriceType("소매");
                    priceHistory.setRegion("서울");
                    priceHistory.setCollectedDate(LocalDateTime.now());

                    int saved = priceHistoryMapper.insertPrice(priceHistory);
                    if (saved > 0) {
                        savedCount++;
                        log.debug("Price saved - item: {}, price: {} KRW", itemName, price);

                        // 지정가 알림 체크 및 발송
                        try {
                            priceAlertService.checkAndNotifyPrice(
                                ingredient.getIngredientId(),
                                itemName,
                                BigDecimal.valueOf(price)
                            );
                        } catch (Exception alertEx) {
                            log.warn("Price alert check failed for item: {}", itemName, alertEx);
                        }
                    }

                } catch (Exception e) {
                    log.warn("Item save failed", e);
                }
            }

            log.info("Category {} save completed - saved: {}, skipped: {}, total in API: {}",
                    getCategoryName(categoryCode), savedCount, skippedCount, items.size());
            return savedCount;

        } catch (Exception e) {
            log.error("All items parsing and save failed", e);
            return 0;
        }
    }
}