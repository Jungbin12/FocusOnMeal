package com.fom.boot.app.member.dto;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EmailCodeVerificationRequest {
    private String email;
    private String code;
}
