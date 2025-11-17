package com.fom.boot.app.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenValidationResponse {
    private boolean valid;
}
