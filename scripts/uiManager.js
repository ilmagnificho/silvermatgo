// uiManager.js - UI 관리 및 게임 상태 표시
import { CardDeck } from './cardDeck.js';

export class UIManager {
    constructor(gameManager, settingsManager) {
        this.gameManager = gameManager;
        this.settingsManager = settingsManager;
        
        // DOM 요소
        this.screenElements = {
            'start-screen': document.getElementById('start-screen'),
            'game-screen': document.getElementById('game-screen'),
            'result-screen': document.getElementById('result-screen'),
            'tutorial-screen': document.getElementById('tutorial-screen'),
            'settings-screen': document.getElementById('settings-screen')
        };
        
        this.boardCardsElement = document.getElementById('board-cards');
        this.playerCardsElement = document.getElementById('player-cards');
        this.opponentCardsElement = document.querySelector('.opponent-cards');
        this.gameStatusElement = document.getElementById('game-status');
        this.playerScoreElement = document.getElementById('player-score');
        this.aiScoreElement = document.getElementById('ai-score');
        this.goStopDialog = document.getElementById('go-stop-dialog');
        this.currentPointsElement = document.getElementById('current-points');
        this.countdownElement = document.getElementById('countdown-timer');
        
        // 게임 매니저 이벤트 연결
        this.initGameEvents();
        
        // 카드 이벤트 리스너
        this.selectedCardIndex = -1;
    }
    
    // 게임 결과 화면 표시
    showGameResult(result) {
        const resultTitle = document.getElementById('result-title');
        const resultIcon = document.getElementById('result-icon');
        const resultMessage = document.getElementById('result-message');
        const finalScore = document.getElementById('final-score');
        const earnedCoins = document.getElementById('earned-coins');
        
        if (result.isWin) {
            resultTitle.textContent = '승리!';
            resultIcon.textContent = '🎉';
            resultMessage.textContent = '축하합니다! 게임에서 이겼습니다.';
        } else {
            resultTitle.textContent = '패배';
            resultIcon.textContent = '😢';
            resultMessage.textContent = '아쉽게도 졌습니다. 다시 도전해보세요!';
        }
        
        finalScore.textContent = result.score;
        earnedCoins.textContent = result.coins;
        
        // 결과 화면 표시
        this.showScreen('result-screen');
    }
    
    // 특수 효과 표시 (쪽, 따닥 등)
    showSpecialEffect(action) {
        // 간단한 구현: 알림으로 표시
        if (action) {
            alert(action.message);
        }
    }
    
    // 화면 전환
    showScreen(screenId) {
        // 모든 화면 숨기기
        Object.values(this.screenElements).forEach(element => {
            if (element) {
                element.classList.remove('active');
            }
        });
        
        // 지정된 화면 표시
        if (this.screenElements[screenId]) {
            this.screenElements[screenId].classList.add('active');
        }
    }
    
    // 플레이어 카드 활성화/비활성화
    enablePlayerCards(enabled) {
        if (!this.playerCardsElement) return;
        
        const playerCards = this.playerCardsElement.querySelectorAll('.player-card');
        
        playerCards.forEach(card => {
            if (enabled) {
                card.classList.remove('disabled');
            } else {
                card.classList.add('disabled');
            }
        });
    }
    
    // 게임 매니저 이벤트 초기화
    initGameEvents() {
        if (this.gameManager) {
            this.gameManager.onGameStateChanged = (state) => {
                this.updateGameUI(state);
            };
            
            this.gameManager.onCardsDealt = (state) => {
                this.renderGameBoard(state);
            };
            
            this.gameManager.onPlayerTurn = () => {
                if (this.gameStatusElement) {
                    this.gameStatusElement.textContent = '당신의 차례';
                }
            };
            
            this.gameManager.onAITurn = (data) => {
                if (this.gameStatusElement) {
                    this.gameStatusElement.textContent = 'AI 차례';
                }
                this.highlightAICard(data.card);
            };
            
            this.gameManager.onCardPlayed = (data) => {
                this.renderGameBoard(data.state);
                
                // 특수 효과 (쪽, 따닥 등) 표시
                if (data.lastAction) {
                    this.showSpecialEffect(data.lastAction);
                }
            };
            
            this.gameManager.onGoStopPrompt = (data) => {
                this.showGoStopDialog(data.currentPoints);
            };
            
            this.gameManager.onGameOver = (result) => {
                this.showGameResult(result);
            };
        }
    }
    
    // 게임 UI 업데이트
    updateGameUI(state) {
        // 게임 상태에 따른 UI 업데이트
        if (!state) return;
        
        switch (state.phase) {
            case 'playerTurn':
                if (this.gameStatusElement) {
                    this.gameStatusElement.textContent = '당신의 차례';
                }
                this.enablePlayerCards(true);
                break;
                
            case 'aiTurn':
                if (this.gameStatusElement) {
                    this.gameStatusElement.textContent = 'AI 차례';
                }
                this.enablePlayerCards(false);
                break;
                
            case 'goStop':
                if (this.gameStatusElement) {
                    this.gameStatusElement.textContent = '고 / 스톱 선택';
                }
                this.enablePlayerCards(false);
                break;
                
            case 'gameOver':
                if (this.gameStatusElement) {
                    this.gameStatusElement.textContent = '게임 종료';
                }
                this.enablePlayerCards(false);
                break;
        }
        
        // 점수 업데이트
        if (this.playerScoreElement) {
            this.playerScoreElement.textContent = state.playerScore;
        }
        if (this.aiScoreElement) {
            this.aiScoreElement.textContent = state.aiScore;
        }
    }
    
    // 게임 보드 렌더링
    renderGameBoard(state) {
        if (!state) return;
        
        // 바닥 카드 렌더링
        this.renderBoardCards(state.boardCards);
        
        // 플레이어 카드 렌더링
        this.renderPlayerCards(state.playerCards);
        
        // AI 카드 렌더링 (뒷면만 표시)
        this.renderAICards(state.aiCards.length);
    }
    
    // 바닥 카드 렌더링
    renderBoardCards(boardCards) {
        if (!this.boardCardsElement || !boardCards) return;
        
        this.boardCardsElement.innerHTML = '';
        
        boardCards.forEach(card => {
            const cardElement = this.createCardElement(card, false);
            this.boardCardsElement.appendChild(cardElement);
        });
    }
    
    // 플레이어 카드 렌더링
    renderPlayerCards(playerCards) {
        if (!this.playerCardsElement || !playerCards) return;
        
        this.playerCardsElement.innerHTML = '';
        this.selectedCardIndex = -1;
        
        playerCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, true);
            
            // 카드 선택 이벤트 추가
            cardElement.addEventListener('click', () => {
                this.selectPlayerCard(index);
            });
            
            this.playerCardsElement.appendChild(cardElement);
        });
    }
    
    // AI 카드 렌더링 (뒷면)
    renderAICards(cardCount) {
        if (!this.opponentCardsElement) return;
        
        this.opponentCardsElement.innerHTML = '';
        
        for (let i = 0; i < cardCount; i++) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card card-back';
            this.opponentCardsElement.appendChild(cardElement);
        }
    }
    
    // 카드 요소 생성
    createCardElement(card, isPlayer) {
        if (!card) return document.createElement('div');
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        cardElement.dataset.month = card.month;
        cardElement.dataset.type = card.type;
        
        // 월 표시
        const monthElement = document.createElement('div');
        monthElement.className = 'card-month';
        monthElement.textContent = `${card.month}월`;
        cardElement.appendChild(monthElement);
        
        // 종류 표시
        const typeElement = document.createElement('div');
        typeElement.className = 'card-type';
        typeElement.textContent = CardDeck.getMonthName(card.month);
        cardElement.appendChild(typeElement);
        
        // 플레이어 카드인 경우 선택 가능하도록 설정
        if (isPlayer) {
            cardElement.classList.add('player-card');
        } else {
            // 바닥 카드인 경우 클릭 이벤트 추가
            cardElement.addEventListener('click', () => {
                if (this.selectedCardIndex !== -1) {
                    this.selectBoardCard(card);
                }
            });
        }
        
        return cardElement;
    }
    
    // 플레이어 카드 선택
    selectPlayerCard(index) {
        if (!this.playerCardsElement || !this.gameManager) return;
        
        // 게임 상태가 플레이어 턴이 아니면 무시
        if (this.gameManager.getCurrentState().phase !== 'playerTurn') {
            return;
        }
        
        // 이전 선택 해제
        const playerCards = this.playerCardsElement.querySelectorAll('.player-card');
        playerCards.forEach(card => card.classList.remove('selected'));
        
        // 새 카드 선택
        if (this.selectedCardIndex === index) {
            // 같은 카드 클릭 시 선택 해제
            this.selectedCardIndex = -1;
        } else {
            // 새 카드 선택
            if (playerCards[index]) {
                playerCards[index].classList.add('selected');
            }
            this.selectedCardIndex = index;
            
            // 게임 매니저에 선택 알림
            this.gameManager.selectCard(index);
            
            // 매칭되는 바닥 카드 하이라이트
            this.highlightMatchingCards();
        }
    }
    
    // 바닥 카드 선택
    selectBoardCard(card) {
        if (this.selectedCardIndex === -1 || !this.gameManager || !card) return;
        
        // 게임 매니저에게 카드 선택 전달
        const boardCards = this.gameManager.getCurrentState().boardCards;
        const index = boardCards.findIndex(c => c.id === card.id);
        
        if (index !== -1) {
            const success = this.gameManager.selectBoardCard(index);
            
            if (success) {
                // 선택 초기화
                this.selectedCardIndex = -1;
                
                // 하이라이트 제거
                if (this.boardCardsElement) {
                    const boardCardElements = this.boardCardsElement.querySelectorAll('.card');
                    boardCardElements.forEach(card => card.classList.remove('highlight'));
                }
            }
        }
    }
    
    // 매칭되는 바닥 카드 하이라이트
    highlightMatchingCards() {
        if (!this.boardCardsElement || !this.gameManager) return;
        
        // 모든 하이라이트 제거
        const boardCardElements = this.boardCardsElement.querySelectorAll('.card');
        boardCardElements.forEach(card => card.classList.remove('highlight'));
        
        // 현재 게임 상태 및 선택된 카드 가져오기
        const state = this.gameManager.getCurrentState();
        if (!state || !state.selectedCard) return;
        
        // 선택된 카드와 같은 월을 가진 바닥 카드 하이라이트
        boardCardElements.forEach(cardElement => {
            if (parseInt(cardElement.dataset.month) === state.selectedCard.month) {
                cardElement.classList.add('highlight');
            }
        });
    }
    
    // AI 카드 하이라이트 (AI 턴에 사용)
    highlightAICard(card) {
        if (!this.opponentCardsElement) return;
        
        // AI 카드는 뒷면으로만 표시되므로 실제로 하이라이트할 수 없음
        // 하지만 애니메이션 효과를 위해 임의의 카드를 하이라이트
        const aiCardElements = this.opponentCardsElement.querySelectorAll('.card');
        if (aiCardElements.length > 0) {
            const randomIndex = Math.floor(Math.random() * aiCardElements.length);
            
            // 하이라이트 효과
            aiCardElements[randomIndex].classList.add('highlight');
            
            // 잠시 후 하이라이트 제거
            setTimeout(() => {
                aiCardElements[randomIndex].classList.remove('highlight');
            }, 1000);
        }
    }
    
    // 고/스톱 다이얼로그 표시
    showGoStopDialog(currentPoints) {
        if (!this.goStopDialog || !this.currentPointsElement || 
            !this.countdownElement || !this.gameManager) return;
        
        this.currentPointsElement.textContent = currentPoints;
        this.goStopDialog.classList.remove('hidden');
        
        // 카운트다운 시작
        let countdown = 3;
        this.countdownElement.textContent = countdown;
        
        const timer = setInterval(() => {
            countdown--;
            this.countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                // 시간 초과 시 자동으로 '스톱' 선택
                this.gameManager.selectGoStop('stop');
                this.goStopDialog.classList.add('hidden');
            }
        }, 1000);
        
        // 버튼 클릭 시 타이머 정지
        const goBtn = document.getElementById('go-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (goBtn) {
            goBtn.onclick = () => {
                clearInterval(timer);
                this.goStopDialog.classList.add('hidden');
                this.gameManager.selectGoStop('go');
            };
        }
        
        if (stopBtn) {
            stopBtn.onclick = () => {
                clearInterval(timer);
                this.goStopDialog.classList.add('hidden');
                this.gameManager.selectGoStop('stop');
            };
        }
    }
}
