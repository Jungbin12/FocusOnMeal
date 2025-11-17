package com.fom.boot.app.member.dto;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetRequest {
    private String token;
    private String newPassword;
    private String confirmPassword;
}
