package com.fom.boot.app.member.dto;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetLinkRequest {
    private String memberId;
    private String email;
}
