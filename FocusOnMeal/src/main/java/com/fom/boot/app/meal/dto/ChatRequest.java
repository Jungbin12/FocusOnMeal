package com.fom.boot.app.meal.dto;

import lombok.Data;

import java.util.List;

/**
 * 채팅 기반 식단 추천 요청 DTO
 */
@Data
public class ChatRequest {
    private String message;
    private int height = 170;        // 기본값
    private int weight = 70;         // 기본값
    private int servingSize = 1;     // 기본값
    private List<String> allergies = List.of(); // 기본값
    private Integer previousPrice;   // 이전 추천 식단 가격 (더 저렴한 식단 요청 시 사용)
}