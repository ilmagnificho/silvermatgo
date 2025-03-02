// uiManager.js - UI 관리 및 게임 상태 표시
import { CardDeck } from './cardDeck.js';

export class UIManager {
    constructor(gameManager, settingsManager) {
        // 기존 생성자 코드 유지
        
        // 점수 히스토리 추적을 위한 새로운 속성 추가
        this.scoreHistory = [];
        
        // 튜토리얼 및 팁 관련 속성 추가
        this.playCount = this.loadPlayCount();
        this.newFeatureThreshold = 5; // 5회 플레이 후 새로운 팁 노출
    }
    
    // 플레이 횟수 로드
    loadPlayCount() {
        return parseInt(localStorage.getItem('playCount') || '0');
    }
    
    // 플레이 횟수 저장
    savePlayCount() {
        localStorage.setItem('playCount', this.playCount.toString());
    }
    
    // 새로운 기능/팁 확인 및 노출
    checkAndShowNewFeatureTips() {
        this.playCount++;
        this.savePlayCount();
        
        if (this.playCount % this.newFeatureThreshold === 0) {
            this.showNewFeatureTip();
        }
    }
    
    // 새로운 기능/팁 표시
    showNewFeatureTip() {
        const tips = [
            '💡 고/스톱에서 더 많은 점수를 얻으려면 특수 조합에 주목하세요!',
            '🃏 광, 띠, 열끗, 피 카드를 전략적으로 모으면 더 높은 점수를 얻을 수 있습니다.',
            '🏆 점수는 카드 조합에 따라 달라집니다. 다양한 조합을 시도해보세요!'
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        // 팁 표시 (alert 대신 더 나은 UI 필요)
        const tipDialog = document.createElement('div');
        tipDialog.className = 'tip-dialog';
        tipDialog.innerHTML = `
            <div class="tip-content">
                <h3>게임 팁</h3>
                <p>${randomTip}</p>
                <button class="btn-primary">확인</button>
            </div>
        `;
        
        document.body.appendChild(tipDialog);
        
        tipDialog.querySelector('button').addEventListener('click', () => {
            document.body.removeChild(tipDialog);
        });
    }
    
    // 점수 히스토리 업데이트
    updateScoreHistory(playerScore, aiScore) {
        this.scoreHistory.push({
            playerScore,
            aiScore,
            timestamp: new Date()
        });
        
        // 최근 5개 게임까지만 저장
        if (this.scoreHistory.length > 5) {
            this.scoreHistory.shift();
        }
        
        // 점수 히스토리 시각화
        this.visualizeScoreHistory();
    }
    
    // 점수 히스토리 시각화
    visualizeScoreHistory() {
        const historyContainer = document.getElementById('score-history');
        if (!historyContainer) return;
        
        historyContainer.innerHTML = '';
        
        this.scoreHistory.forEach((game, index) => {
            const gameEntry = document.createElement('div');
            gameEntry.className = 'score-history-entry';
            gameEntry.innerHTML = `
                <span>게임 ${index + 1}</span>
                <span>나: ${game.playerScore}점</span>
                <span>AI: ${game.aiScore}점</span>
            `;
            historyContainer.appendChild(gameEntry);
        });
    }
    
    // 카드 배치 애니메이션 개선
    animateCardDealing(boardCards) {
        const boardCardsElement = document.getElementById('board-cards');
        boardCardsElement.innerHTML = '';
        
        boardCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, false);
            cardElement.style.opacity = '0';
            cardElement.style.transform = `translateY(${50 * (index + 1)}px)`;
            
            boardCardsElement.appendChild(cardElement);
            
            // 순차적으로 카드 표시
            setTimeout(() => {
                cardElement.style.opacity = '1';
                cardElement.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }
    
    // 점수 획득 애니메이션
    animateScoreGain(points) {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-gain-animation';
        scoreElement.textContent = `+${points}점`;
        scoreElement.style.position = 'fixed';
        scoreElement.style.top = '50%';
        scoreElement.style.left = '50%';
        scoreElement.style.transform = 'translate(-50%, -50%) scale(0)';
        scoreElement.style.color = 'var(--accent-color)';
        scoreElement.style.fontSize = '2rem';
        scoreElement.style.zIndex = '1000';
        
        document.body.appendChild(scoreElement);
        
        setTimeout(() => {
            scoreElement.style.transform = 'translate(-50%, -50%) scale(1)';
            scoreElement.style.transition = 'transform 0.3s ease-out';
        }, 10);
        
        setTimeout(() => {
            scoreElement.style.transform = 'translate(-50%, -50%) scale(1.5)';
            scoreElement.style.opacity = '0';
        }, 500);
        
        setTimeout(() => {
            document.body.removeChild(scoreElement);
        }, 800);
    }
    
    // 게임 종료 시 점수 히스토리 및 팁 처리
    showGameResult(result) {
        // 기존 게임 결과 표시 코드
        super.showGameResult(result);
        
        // 점수 히스토리 업데이트
        this.updateScoreHistory(result.score, 0);
        
        // 새로운 기능/팁 확인
        this.checkAndShowNewFeatureTips();
    }
    
    // 기존 메서드들... (이전 코드 유지)
}
