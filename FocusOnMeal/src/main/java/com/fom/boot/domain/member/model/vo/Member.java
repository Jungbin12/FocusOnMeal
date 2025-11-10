package com.fom.boot.domain.member.model.vo;

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
public class Member {
    private String memberId;
    private String memberPw;
    private String memberName;
    private String memberNickname;
    private String email;
    private String phone;
    private String gender;
    private Timestamp enrollDate;
    private String statusYn;
    private String adminYn;
}
