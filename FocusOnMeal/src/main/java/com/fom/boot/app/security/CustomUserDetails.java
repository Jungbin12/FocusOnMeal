package com.fom.boot.app.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fom.boot.domain.member.model.vo.Member;

// Member 객체를 Spring Security가 사용하는 UserDetails로 감싸는 클래스
public class CustomUserDetails implements UserDetails {

    private final Member member;

    public CustomUserDetails(Member member) {
        this.member = member;
    }

    public Member getMember() {
        return member;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // adminYn이 "Y"이면 ROLE_ADMIN, 아니면 ROLE_USER 권한 부여
        if ("Y".equals(member.getAdminYn())) {
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return member.getMemberPw(); // DB에서 조회한 암호화된 비밀번호
    }

    @Override
    public String getUsername() {
        return member.getMemberId(); // Spring Security의 'username'으로 'memberId' 사용
    }

    // --- 계정 상태 관련 ---

    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부 (항상 true로 설정)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠금 여부 (항상 true로 설정)
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 비밀번호 만료 여부 (항상 true로 설정)
    }

    @Override
    public boolean isEnabled() {
        // statusYn이 "Y"일 때만 계정 활성화
        return "Y".equals(member.getStatusYn());
    }
}