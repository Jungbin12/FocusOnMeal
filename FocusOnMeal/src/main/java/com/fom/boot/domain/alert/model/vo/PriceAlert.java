package com.fom.boot.domain.alert.model.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PriceAlert {
    private int alertId;
    private String memberId;
    private int ingredientId;
    private BigDecimal thresholdPrice;
    private String notificationEnabled;
}
