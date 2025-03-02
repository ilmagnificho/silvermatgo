// tutorialManager.js - 튜토리얼 관리
export class TutorialManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.tutorialSeen = this.loadTutorialStatus();
        
        // DOM 요소
        this.tutorialSteps = document.querySelectorAll('.tutorial-step');
        this.prevButton = document.getElementById('prev-step');
        this.nextButton = document.getElementById('next-step');
        this.dots = document.querySelectorAll('.dot');
    }
    
    // 튜토리얼 보기 상태 로드
    loadTutorialStatus() {
        return localStorage.getItem('tutorialSeen') === 'true';
    }
    
    // 튜토리얼 보기 상태 저장
    saveTutorialStatus(seen) {
        localStorage.setItem('tutorialSeen', seen);
        this.tutorialSeen = seen;
    }
    
    // 튜토리얼 초기화
    resetTutorial() {
        this.saveTutorialStatus(false);
        this.goToStep(1);
    }
    
    // 튜토리얼 단계 변경
    goToStep(step) {
        if (step < 1 || step > this.totalSteps) return;
        
        // 현재 단계 저장
        this.currentStep = step;
        
        // 모든 단계 숨기기
        this.tutorialSteps.forEach(stepElement => {
            stepElement.classList.remove('active');
        });
        
        // 해당 단계만 표시
        const targetStep = document.querySelector(`.tutorial-step[data-step="${step}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // 도트 업데이트
        this.dots.forEach(dot => {
            dot.classList.remove('active');
            if (parseInt(dot.dataset.step) === step) {
                dot.classList.add('active');
            }
        });
        
        // 버튼 상태 업데이트
        this.updateButtonState();
    }
    
    // 이전 단계로
    prevStep() {
        this.goToStep(this.currentStep - 1);
    }
    
    // 다음 단계로
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.goToStep(this.currentStep + 1);
        } else {
            // 마지막 단계에서 튜토리얼 완료 처리
            this.completeTutorial();
        }
    }
    
    // 튜토리얼 완료
    completeTutorial() {
        this.saveTutorialStatus(true);
        
        // 시작 화면으로 복귀 (화면 전환은 UI 매니저가 담당)
        const tutorialScreen = document.getElementById('tutorial-screen');
        const startScreen = document.getElementById('start-screen');
        
        if (tutorialScreen && startScreen) {
            tutorialScreen.classList.remove('active');
            startScreen.classList.add('active');
        }
    }
    
    // 버튼 상태 업데이트
    updateButtonState() {
        // 첫 단계에서는 이전 버튼 비활성화
        if (this.currentStep === 1) {
            this.prevButton.disabled = true;
        } else {
            this.prevButton.disabled = false;
        }
        
        // 마지막 단계에서는 다음 버튼 텍스트 변경
        if (this.currentStep === this.totalSteps) {
            this.nextButton.textContent = '완료';
        } else {
            this.nextButton.textContent = '다음';
        }
    }
    
    // 상황에 맞는 도움말 표시
    showContextHelp(gameState) {
        let helpMessage = '';
        
        // 게임 상태에 따른 도움말 메시지
        switch (gameState.phase) {
            case 'playerTurn':
                helpMessage = '카드를 선택하고 바닥에서 같은 월의 카드를 가져오세요.';
                break;
                
            case 'aiTurn':
                helpMessage = 'AI가 카드를 선택하는 차례입니다. 잠시만 기다려 주세요.';
                break;
                
            case 'goStop':
                helpMessage = '계속 진행하시려면 "고", 현재 점수로 마치려면 "스톱"을 선택하세요.';
                break;
                
            default:
                helpMessage = '화투는 같은 월의 카드를 모아 점수를 얻는 게임입니다.';
                break;
        }
        
        // 기본적인 카드 타입 설명 추가
        const basicHelp = `
        - 광(⭐): 1월, 3월, 8월, 11월, 12월에 존재하며 3장 이상 모으면 점수
        - 띠(동물): 5장 이상 모으면 점수
        - 열끗(리본): 5장 이상 모으면 점수
        - 피: 10장 이상 모으면 점수
        `;
        
        // 도움말 표시 (간단한 알림으로 구현)
        alert(`${helpMessage}\n\n${basicHelp}`);
    }
}