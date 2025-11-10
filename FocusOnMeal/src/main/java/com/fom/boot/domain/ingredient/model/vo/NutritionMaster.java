package com.fom.boot.domain.ingredient.model.vo;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class NutritionMaster {
    private int nutritionId;
    private int ingredientId;
    private String measureUnit;
    private BigDecimal calories;
    private BigDecimal carbsG;
    private BigDecimal proteinG;
    private BigDecimal fatG;
    private BigDecimal sugarG;
}