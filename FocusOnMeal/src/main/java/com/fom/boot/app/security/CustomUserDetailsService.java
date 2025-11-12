package com.fom.boot.app.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.fom.boot.domain.member.model.mapper.MemberMapper;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberMapper memberMapper; // MyBatis Mapper 주입

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        // MemberMapper를 통해 DB에서 회원 정보 조회
        Member member = memberMapper.findByMemberId(username);
        
        if (member == null) {
            throw new UsernameNotFoundException("해당하는 회원을 찾을 수 없습니다: " + username);
        }

        // 조회된 Member 객체를 CustomUserDetails로 감싸서 반환
        return new CustomUserDetails(member);
    }
}