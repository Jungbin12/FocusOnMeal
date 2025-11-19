package com.fom.boot.domain.member.model.service.impl;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.common.util.NicknameUtils;
import com.fom.boot.domain.member.model.mapper.MemberMapper;
import com.fom.boot.domain.member.model.service.EmailService;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MemberServiceImpl implements MemberService {

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder bcrypt;

    // 이메일 인증 코드 저장소
    private final ConcurrentHashMap<String, VerificationData> verificationCodes = new ConcurrentHashMap<>();

    private record VerificationData(String code, long expiryTime, boolean verified) {}

    // 기본 기능
    @Override
    public Member selectOneByLogin(LoginRequest loginRequest) {
        return memberMapper.selectOneByLogin(loginRequest);
    }

    @Override
    public int insertMember(Member member) {
        return memberMapper.insertMember(member);
    }

    @Override
    public Member selectOneById(String memberId) {
        return memberMapper.selectOneById(memberId);
    }

    @Override
    public int updateMemberPassword(String memberId, String encodedPw) {
        return memberMapper.updateMemberPassword(memberId, encodedPw);
    }

    @Override
    public String searchMemberId(String memberName, String email) {
        return memberMapper.searchMemberId(memberName, email);
    }

    @Override
    public boolean checkMemberIdExists(String memberId) {
        return memberMapper.selectOneById(memberId) != null;
    }

    @Override
    public boolean checkEmailExists(String email) {
        return memberMapper.checkEmailExists(email) > 0;
    }

    // 이메일 인증 코드 저장
    @Override
    public void saveVerificationCode(String email, String code) {
        long expiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5);
        verificationCodes.put(email, new VerificationData(code, expiryTime, false));
        cleanupExpiredCodes();
    }

    // 인증 코드 확인
    @Override
    public boolean verifyEmailCode(String email, String code) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) return false;
        if (System.currentTimeMillis() > data.expiryTime()) {
            verificationCodes.remove(email);
            return false;
        }
        if (!data.code().equals(code)) return false;

        verificationCodes.put(email, new VerificationData(code, data.expiryTime(), true));
        return true;
    }

    @Override
    public boolean isEmailVerified(String email) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) return false;
        if (System.currentTimeMillis() > data.expiryTime()) {
            verificationCodes.remove(email);
            return false;
        }
        return data.verified();
    }

    @Override
    public void deleteVerificationCode(String email) {
        verificationCodes.remove(email);
    }

    private void cleanupExpiredCodes() {
        long now = System.currentTimeMillis();
        verificationCodes.entrySet().removeIf(e -> e.getValue().expiryTime() < now);
    }


    // 비밀번호 재설정 (실제 구현 X)
    @Override
    @Transactional
    public boolean sendPasswordResetLink(String memberId, String email, String ipAddress, String userAgent) {
        return true;
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        return false;
    }

    @Override
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        return true;
    }

    @Override
    public boolean sendMemberIdByEmail(String memberName, String email) throws Exception {
        String memberId = memberMapper.searchMemberId(memberName, email);
        if (memberId == null) {
            throw new Exception("일치하는 회원 정보가 없습니다.");
        }
        emailService.sendMemberIdEmail(email, memberName, memberId);
        return true;
    }

	@Override
	public boolean checkEmailExists(Object email) {
		// TODO Auto-generated method stub
		return false;
	}


	// 관리자 목록 조회용
	@Override
	public List<Member> selectAllMembers(PageInfo pageInfo, String type, String keyword, String sortColumn, String sortOrder) {
		return memberMapper.selectAllMembers(
	            pageInfo.getStartRow(),
	            pageInfo.getEndRow(),
	            type,
	            keyword,
	            sortColumn,
	            sortOrder
	    );
	}

	@Override
	public Member findByMemberId(String memberId) {
		return memberMapper.findByMemberId(memberId);
	}
	
	// 회원 등급 및 닉네임 변경
	@Override
	@Transactional
	public String updateAdminYn(String memberId, String adminYn) {
		
		// 등급에 따른 닉네임 변경
	    String newNickname;
	    if ("Y".equals(adminYn)) {
	        newNickname = NicknameUtils.generateAdminNickname(); 
	    } else {
	        newNickname = NicknameUtils.generateUserNickname();
	    }
	    
	    // 2. DB 업데이트를 위한 Member 객체 준비
        Member member = new Member();
        member.setMemberId(memberId);
        member.setAdminYn(adminYn);
        member.setMemberNickname(newNickname);

        // 3. DB에 등급과 닉네임 모두 반영
        int result = memberMapper.updateAdminNickname(member);

        if (result > 0) {
            // 4. 업데이트된 닉네임만 프론트엔드로 반환
            return newNickname;
        } else {
            // 업데이트 실패 시 예외 처리
            throw new RuntimeException("회원 등급 및 닉네임 업데이트에 실패했습니다.");
        }
    }
		
	// 회원 상태 변경
	@Override
	public int updateStatusYn(String memberId, String statusYn) {
		return memberMapper.updateStatusYn(memberId, statusYn);
	}

	// 총 회원수 + 검색
	@Override
	public int getTotalMembersBySearch(String type, String keyword) {
		return memberMapper.getTotalMembersBySearch(type, keyword);
	}
}
