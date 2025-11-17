package com.fom.boot.app.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class JoinRequest {
    @NotBlank
    private String memberId;
    @NotBlank
    private String memberPw;
    @NotBlank
    private String memberName;
    private String memberNickname;
    @Email
    private String email;
    private String phone;
    private String gender;
}
