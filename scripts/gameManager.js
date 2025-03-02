// gameManager.js - 게임 로직 관리
import { CardDeck } from './cardDeck.js';
import { AIPlayer } from './aiPlayer.js';
import { SoundManager } from './soundManager.js';

export class GameManager {
    constructor() {
        // 기존 생성자 코드 유지
        
        // 튜토리얼 상태 추적
        this.tutorialStatus = this.loadTutorialStatus();
    }
    
    // 튜토리얼 상태 로드
    loadTutorialStatus() {
        const status = localStorage.getItem('tutorialStatus');
        return status ? JSON.parse(status) : {
            initialTutorialCompleted: false,
            newPlayerGuideShown: false
        };
    }
    
    // 튜토리얼 상태 저장
    saveTutorialStatus() {
        localStorage.setItem('tutorialStatus', JSON.stringify(this.tutorialStatus));
    }
    
    // 초기 튜토리얼 체크
    checkInitialTutorial() {
        if (!this.tutorialStatus.initialTutorialCompleted) {
            // 첫 게임 시 튜토리얼 강제 표시
            this.showInitialTutorial();
        }
    }
    
    // 초기 튜토리얼 표시
    showInitialTutorial() {
        const tutorialOverlay = document.createElement('div');
        tutorialOverlay.className = 'initial-tutorial-overlay';
        tutorialOverlay.innerHTML = `
            <div class="tutorial-content">
                <h2>처음 오신 분들을 위한 가이드</h2>
                <p>👋 어서오세요! 화투 맞고 게임에 온 것을 환영합니다.</p>
                <ul>
                    <li>🃏 같은 월의 카드를 모아 점수를 얻으세요</li>
                    <li>🏆 광, 띠, 열끗, 피로 점수를 계산합니다</li>
                    <li>🤔 고/스톱을 선택하여 더 많은 점수를 노릴 수 있어요</li>
                </ul>
                <button class="btn-primary start-game">게임 시작하기</button>
            </div>
        `;
        
        document.body.appendChild(tutorialOverlay);
        
        tutorialOverlay.querySelector('.start-game').addEventListener('click', () => {
            document.body.removeChild(tutorialOverlay);
            this.tutorialStatus.initialTutorialCompleted = true;
            this.saveTutorialStatus();
        });
    }
    
    // 게임 시작 시 튜토리얼 체크
    startNewGame() {
        // 초기 튜토리얼 체크
        this.checkInitialTutorial();
        
        // 기존 startNewGame 로직
        super.startNewGame();
    }
    
    // 판 깔리는 과정 시각화
    dealInitialCards() {
        // 기존 dealInitialCards 로직
        super.dealInitialCards();
        
        // 판 깔리는 애니메이션 호출 (UI 매니저의 메서드)
        if (this.onCardsDealt) {
            this.onCardsDealt(this.state);
        }
    }
    
    // 점수 획득 시 특수 효과 추가
    calculateScore() {
        const previousPlayerScore = this.state.playerScore;
        const previousAIScore = this.state.aiScore;
        
        // 기존 점수 계산 로직
        super.calculateScore();
        
        // 점수 변화 확인 및 UI 업데이트
        const playerScoreDiff = this.state.playerScore - previousPlayerScore;
        const aiScoreDiff = this.state.aiScore - previousAIScore;
        
        if (playerScoreDiff > 0) {
            // 점수 획득 애니메이션 호출
            if (this.onScoreGain) {
                this.onScoreGain({
                    player: 'player',
                    points: playerScoreDiff
                });
            }
        }
        
        if (aiScoreDiff > 0) {
            // AI 점수 획득 애니메이션 호출
            if (this.onScoreGain) {
                this.onScoreGain({
                    player: 'ai',
                    points: aiScoreDiff
                });
            }
        }
    }
    
    // 기존 메서드들... (이전 코드 유지)
}
