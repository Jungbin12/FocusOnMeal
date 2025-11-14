package com.fom.boot.app.meal.controller;

import com.fom.boot.app.meal.dto.ChatRequest;
import com.fom.boot.domain.meal.model.service.GeminiApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 채팅 기반 식단 추천 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final GeminiApiService geminiApiService;

    /**
     * 채팅 메시지로 식단 추천 요청
     */
    @PostMapping("/meal-recommendation")
    public ResponseEntity<Map<String, Object>> getMealRecommendation(@RequestBody ChatRequest request) {
        log.info("식단 추천 요청 - 메시지: {}", request.getMessage());

        Map<String, Object> response = new HashMap<>();

        try {
            // Gemini API 호출 (가격 정보 없이)
            String mealPlan = geminiApiService.generateMealPlan(
                    request.getHeight(),
                    request.getWeight(),
                    request.getServingSize(),
                    request.getAllergies(),
                    request.getMessage()
            );

            response.put("status", "SUCCESS");
            response.put("mealPlan", mealPlan);

            log.info("식단 추천 성공");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("식단 추천 실패", e);
            response.put("status", "ERROR");
            response.put("message", "식단 추천 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 간단한 채팅 테스트 엔드포인트
     */
    @PostMapping("/simple")
    public ResponseEntity<Map<String, Object>> simpleChat(@RequestBody Map<String, String> request) {
        log.info("간단 채팅 요청 - 메시지: {}", request.get("message"));

        Map<String, Object> response = new HashMap<>();

        try {
            // 기본값으로 식단 추천
            String mealPlan = geminiApiService.generateMealPlan(
                    170,  // 기본 키
                    70,   // 기본 몸무게
                    1,    // 1인분
                    List.of(), // 알러지 없음
                    request.get("message")
            );

            response.put("status", "SUCCESS");
            response.put("reply", mealPlan);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("간단 채팅 실패", e);
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
