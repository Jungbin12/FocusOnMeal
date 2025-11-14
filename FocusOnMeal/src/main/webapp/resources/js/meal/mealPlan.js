// API 기본 URL (실제 서버 주소로 변경 필요)
const API_BASE_URL = 'http://localhost:8080/api';

// DOM 요소
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const generateBtn = document.getElementById('generateBtn');
const chatMessages = document.getElementById('chatMessages');
const chatPlaceholder = document.getElementById('chatPlaceholder');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const loadingArea = document.getElementById('loadingArea');
const mealPlanArea = document.getElementById('mealPlanArea');
const emptyState = document.getElementById('emptyState');
const errorMessage = document.getElementById('errorMessage');

// 모달 요소
const saveModal = document.getElementById('saveModal');
const modalClose = document.querySelector('.modal-close');
const servingSizeInput = document.getElementById('servingSize');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const cancelSaveBtn = document.getElementById('cancelSaveBtn');
const confirmSaveBtn = document.getElementById('confirmSaveBtn');

// 알러지 정보 수집
function getAllergies() {
    const allergies = [];
    document.querySelectorAll('.checkbox-item input:checked').forEach(checkbox => {
        allergies.push(checkbox.value);
    });
    return allergies;
}

// 메시지 추가
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 식단 그룹 추가
function addMealPlanGroup(title, meals) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'meal-plan-group';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'meal-plan-header';
    headerDiv.textContent = title;
    groupDiv.appendChild(headerDiv);

    meals.forEach(meal => {
        const mealItemDiv = document.createElement('div');
        mealItemDiv.className = 'meal-item';

        mealItemDiv.innerHTML = `
            <div class="meal-header">
                <span class="meal-name">${meal.name}</span>
                <div class="meal-buttons">
                    <button class="meal-btn">레시피</button>
                    <button class="meal-btn">대체식단</button>
                </div>
            </div>
            <div class="meal-info">
                <div><strong>탄수화물:</strong> <span>${meal.carbs || '0g'}</span></div>
                <div><strong>지방:</strong> <span>${meal.fat || '0g'}</span></div>
                <div><strong>칼로리:</strong> <span>${meal.calories || '0kcal'}</span></div>
                <div><strong>가격:</strong> <span>${meal.price || '0원'}</span></div>
            </div>
        `;

        groupDiv.appendChild(mealItemDiv);
    });

    // 저장 버튼 추가
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.innerHTML = '<span>❤</span><span>저장하기</span>';
    saveBtn.addEventListener('click', () => {
        openSaveModal();
    });
    groupDiv.appendChild(saveBtn);

    mealPlanArea.appendChild(groupDiv);

    // 버튼 이벤트 다시 바인딩
    bindMealButtonEvents();
}

// 모달 열기
function openSaveModal() {
    servingSizeInput.value = 1;
    saveModal.classList.add('active');
}

// 모달 닫기
function closeSaveModal() {
    saveModal.classList.remove('active');
}

// 인분수 증가
function increaseServing() {
    const currentValue = parseInt(servingSizeInput.value);
    if (currentValue < 10) {
        servingSizeInput.value = currentValue + 1;
    }
}

// 인분수 감소
function decreaseServing() {
    const currentValue = parseInt(servingSizeInput.value);
    if (currentValue > 1) {
        servingSizeInput.value = currentValue - 1;
    }
}

// 저장 확인
function confirmSave() {
    const servingSize = servingSizeInput.value;
    alert(`${servingSize}인분 기준으로 식단이 저장되었습니다!`);
    // 실제로는 서버에 저장 API 호출
    closeSaveModal();
}

// 에러 표시
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
    setTimeout(() => {
        errorMessage.classList.remove('active');
    }, 5000);
}

// 식단 생성 버튼 클릭
generateBtn.addEventListener('click', async () => {
    const height = heightInput.value;
    const weight = weightInput.value;
    const allergies = getAllergies();

    // 유효성 검사
    if (!height || !weight) {
        showError('키와 몸무게를 입력해주세요.');
        return;
    }

    if (height < 100 || height > 250) {
        showError('키는 100cm ~ 250cm 사이로 입력해주세요.');
        return;
    }

    if (weight < 30 || weight > 200) {
        showError('몸무게는 30kg ~ 200kg 사이로 입력해주세요.');
        return;
    }

    // UI 초기화
    chatPlaceholder.style.display = 'none';
    chatMessages.classList.add('active');
    loadingArea.classList.add('active');
    emptyState.style.display = 'none';
    generateBtn.disabled = true;

    // 사용자 메시지 추가
    addMessage('건강한 식단을 추천해주세요!', 'user');

    try {
        // 실제 API 호출 (가격 정보 포함)
        const response = await fetch(`${API_BASE_URL}/chat/meal-recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                height: parseInt(height),
                weight: parseInt(weight),
                servingSize: 1,
                allergies: allergies,
                message: '건강한 식단을 추천해주세요'
            })
        });

        if (!response.ok) {
            throw new Error('API 호출 실패');
        }

        const data = await response.json();

        // 로딩 종료
        loadingArea.classList.remove('active');

        if (data.status === 'SUCCESS') {
            // AI 응답 메시지 추가
            addMessage('당신의 체형에 맞는 건강한 식단을 추천해드렸습니다!', 'ai');

            // 식단 결과 표시
            mealPlanArea.classList.add('active');
            emptyState.style.display = 'none';

            // AI 응답을 식단 카드로 표시
            const currentTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

            // AI 응답을 그대로 표시 (파싱은 나중에 개선 가능)
            const mealPlanDiv = document.createElement('div');
            mealPlanDiv.className = 'meal-plan-group';
            mealPlanDiv.innerHTML = `
                <div class="meal-plan-header">추천 식단 - ${currentTime}</div>
                <div class="meal-plan-content" style="white-space: pre-wrap; padding: 20px; background: white; border-radius: 8px;">
                    ${data.mealPlan}
                </div>
            `;
            mealPlanArea.appendChild(mealPlanDiv);
        } else {
            throw new Error(data.message || 'AI 응답 오류');
        }

    } catch (error) {
        console.error('Error:', error);
        loadingArea.classList.remove('active');
        emptyState.style.display = 'block';
        addMessage('죄송합니다. 식단 생성 중 오류가 발생했습니다.', 'ai');
        showError('식단 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
        generateBtn.disabled = false;
    }
});

// 버튼 이벤트 바인딩
function bindMealButtonEvents() {
    document.querySelectorAll('.meal-btn').forEach(btn => {
        btn.removeEventListener('click', handleMealButtonClick);
        btn.addEventListener('click', handleMealButtonClick);
    });
}

function handleMealButtonClick(e) {
    const btnText = e.target.textContent;
    const mealName = e.target.closest('.meal-item').querySelector('.meal-name').textContent;

    if (btnText === '레시피') {
        alert(`${mealName}의 레시피 페이지로 이동합니다.`);
        // 실제로는 레시피 페이지로 이동
        // window.location.href = '/recipe?meal=' + mealName;
    } else if (btnText === '대체식단') {
        alert(`${mealName}의 대체 식단을 찾고 있습니다.`);
        // 실제로는 대체 식단 API 호출
    }
}

// 채팅 전송 함수
function sendChatMessage() {
    const message = chatInput.value.trim();

    if (!message) {
        return;
    }

    // 채팅창 활성화
    chatPlaceholder.style.display = 'none';
    chatMessages.classList.add('active');

    // 사용자 메시지 추가
    addMessage(message, 'user');

    // 입력창 초기화
    chatInput.value = '';

    // AI 응답 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
        addMessage('죄송합니다. 채팅 기능은 아직 개발 중입니다. "식단 정보 보기" 버튼을 눌러주세요!', 'ai');
    }, 500);
}

// 채팅 전송 버튼 클릭
chatSendBtn.addEventListener('click', sendChatMessage);

// Enter 키로 전송
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

// 모달 이벤트 리스너
modalClose.addEventListener('click', closeSaveModal);
cancelSaveBtn.addEventListener('click', closeSaveModal);
confirmSaveBtn.addEventListener('click', confirmSave);
decreaseBtn.addEventListener('click', decreaseServing);
increaseBtn.addEventListener('click', increaseServing);

// 모달 바깥 클릭 시 닫기
saveModal.addEventListener('click', (e) => {
    if (e.target === saveModal) {
        closeSaveModal();
    }
});