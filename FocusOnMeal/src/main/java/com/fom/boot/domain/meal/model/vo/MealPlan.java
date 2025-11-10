package com.fom.boot.domain.meal.model.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.sql.Timestamp;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MealPlan {
    private int planId;
    private String memberId;
    private String planName;
    private int servingSize;
    private int totalCost;
    private Timestamp createdAt;
    private String isDelete;
    private Timestamp deleteAt;
}
