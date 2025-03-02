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
        this.helpMessageElement = document.getElementById('help-message');
        this.specialEffectElement = document.getElementById('special-effect');
        this.playerCollectedArea = document.getElementById('player-collected-area');
        this.aiCollectedArea = document.getElementById('ai-collected-area');
        
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
        if (!action || !this.specialEffectElement) return;
        
        // 특수 효과 메시지 설정
        const specialMessage = document.getElementById('special-message');
        if (specialMessage) {
            specialMessage.textContent = action.message;
        }
        
        // 특수 효과 화면 표시
        this.specialEffectElement.classList.remove('hidden');
        
        // 잠시 후 숨기기
        setTimeout(() => {
            this.specialEffectElement.classList.add('hidden');
        }, 2000);
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
                if (data.collectionInfo && data.collectionInfo.specialAction) {
                    this.showSpecialEffect(data.collectionInfo.specialAction);
                }
                
                // 카드 수집 애니메이션
                if (data.collectionInfo && data.collectionInfo.cardsCollected && data.collectionInfo.cardsCollected.length > 0) {
                    const targetArea = data.player === 'player' ? this.playerCollectedArea : this.aiCollectedArea;
                    const cardType = data.collectionInfo.cardsCollected[0].type;
                    
                    // 수집 영역 내의 특정 타입 컨테이너 찾기
                    const typeContainer = targetArea ? targetArea.querySelector(`.${cardType}-container`) : null;
                    
                    if (targetArea && typeContainer) {
                        this.animateCardCollection(data.playedCard, typeContainer, cardType);
                    }
                }
            };
            
            this.gameManager.onNoMatchingCards = (data) => {
                this.enableCardDiscard();
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
                
                // 턴 표시기 활성화
                const turnIndicator = document.getElementById('turn-indicator');
                if (turnIndicator) {
                    turnIndicator.classList.remove('hidden');
                }
                break;
                
            case 'aiTurn':
                if (this.gameStatusElement) {
                    this.gameStatusElement.textContent = 'AI 차례';
                }
                this.enablePlayerCards(false);
                
                // 턴 표시기 비활성화
                const aiTurnIndicator = document.getElementById('turn-indicator');
                if (aiTurnIndicator) {
                    aiTurnIndicator.classList.add('hidden');
                }
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
        
        // 수집 카드 렌더링 (추가)
        this.renderCollectedCards(state.playerCollected, state.aiCollected);
        
        // 매칭 카드가 없으면 카드 버리기 모드 활성화 (추가)
        if (state.phase === 'playerTurn' && state.selectedCard && 
            (!state.matchingCards || state.matchingCards.length === 0)) {
            this.enableCardDiscard();
        }
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
        
        // 매칭되는 카드가 없을 경우
        if (state.matchingCards.length === 0) {
            // 바닥에 버릴 수 있음을 표시
            this.boardCardsElement.classList.add('discard-highlight');
            
            // 도움말 메시지 표시
            if (this.helpMessageElement) {
                this.helpMessageElement.textContent = '매칭되는 카드가 없습니다. 카드를 바닥에 버려주세요.';
                this.helpMessageElement.classList.remove('hidden');
                
                // 잠시 후 메시지 숨기기
                setTimeout(() => {
                    this.helpMessageElement.classList.add('hidden');
                }, 3000);
            }
        }
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
    
    // 카드 수집 영역 렌더링
    renderCollectedCards(playerCollected, aiCollected) {
        // 플레이어 수집 카드 영역 DOM 요소
        const playerCollectedArea = document.getElementById('player-collected-area');
        const aiCollectedArea = document.getElementById('ai-collected-area');
        
        if (!playerCollectedArea || !aiCollectedArea) return;
        
        // 플레이어 수집 카드 영역 초기화 및 렌더링
        playerCollectedArea.innerHTML = '';
        
        // 수집 카드 타입별로 컨테이너 생성
        const playerCollectionTypes = {
            'kwang': document.createElement('div'),
            'animal': document.createElement('div'),
            'ribbon': document.createElement('div'),
            'junk': document.createElement('div')
        };
        
        // 타입별 컨테이너 설정
        Object.keys(playerCollectionTypes).forEach(type => {
            const container = playerCollectionTypes[type];
            container.className = `collection-container ${type}-container`;
            
            // 타입 레이블 추가
            const label = document.createElement('div');
            label.className = 'collection-label';
            label.textContent = this.getCollectionTypeName(type);
            container.appendChild(label);
            
            // 카드 컨테이너 추가
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'collection-cards';
            
            // 수집된 카드 추가
            playerCollected[type].forEach(card => {
                const cardElement = this.createMiniCardElement(card);
                cardsContainer.appendChild(cardElement);
            });
            
            container.appendChild(cardsContainer);
            playerCollectedArea.appendChild(container);
        });
        
        // AI 수집 카드 영역 초기화 및 렌더링 (유사한 로직)
        aiCollectedArea.innerHTML = '';
        
        const aiCollectionTypes = {
            'kwang': document.createElement('div'),
            'animal': document.createElement('div'),
            'ribbon': document.createElement('div'),
            'junk': document.createElement('div')
        };
        
        Object.keys(aiCollectionTypes).forEach(type => {
            const container = aiCollectionTypes[type];
            container.className = `collection-container ${type}-container`;
            
            const label = document.createElement('div');
            label.className = 'collection-label';
            label.textContent = this.getCollectionTypeName(type);
            container.appendChild(label);
            
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'collection-cards';
            
            aiCollected[type].forEach(card => {
                const cardElement = this.createMiniCardElement(card);
                cardsContainer.appendChild(cardElement);
            });
            
            container.appendChild(cardsContainer);
            aiCollectedArea.appendChild(container);
        });
    }
    
    // 수집 카드 미니 카드 요소 생성
    createMiniCardElement(card) {
        if (!card) return document.createElement('div');
        
        const cardElement = document.createElement('div');
        cardElement.className = 'mini-card';
        cardElement.dataset.id = card.id;
        cardElement.dataset.month = card.month;
        cardElement.dataset.type = card.type;
        
        // 월 표시 (간소화된 형태)
        const monthElement = document.createElement('div');
        monthElement.className = 'mini-card-month';
        monthElement.textContent = `${card.month}`;
        cardElement.appendChild(monthElement);
        
        return cardElement;
    }
    
    // 수집 타입 이름 가져오기
    getCollectionTypeName(type) {
        switch(type) {
            case 'kwang': return '광';
            case 'animal': return '띠';
            case 'ribbon': return '열끗';
            case 'junk': return '피';
            default: return type;
        }
    }
    
    // 카드 수집 애니메이션 효과
    animateCardCollection(sourceCard, targetArea, cardType) {
        // 카드 요소 찾기
        const cardElements = document.querySelectorAll('.card');
        let sourceCardElement = null;
        
        for (const element of cardElements) {
            if (element.dataset.id === sourceCard.id) {
                sourceCardElement = element;
                break;
            }
        }
        
        if (!sourceCardElement || !targetArea) return;
        
        // 원본 카드의 위치 정보
        const sourceRect = sourceCardElement.getBoundingClientRect();
        
        // 대상 영역의 위치 정보
        const targetRect = targetArea.getBoundingClientRect();
        
        // 임시 카드 요소 생성 (애니메이션용)
        const tempCard = sourceCardElement.cloneNode(true);
        tempCard.style.position = 'fixed';
        tempCard.style.left = `${sourceRect.left}px`;
        tempCard.style.top = `${sourceRect.top}px`;
        tempCard.style.width = `${sourceRect.width}px`;
        tempCard.style.height = `${sourceRect.height}px`;
        tempCard.style.zIndex = '1000';
        tempCard.style.transition = 'all 0.5s ease-out';
        
        // body에 임시 카드 추가
        document.body.appendChild(tempCard);
        
        // 애니메이션을 위한 지연
        setTimeout(() => {
            // 대상 위치로 이동 및 크기 조절
            tempCard.style.left = `${targetRect.left + 10}px`;
            tempCard.style.top = `${targetRect.top + 10}px`;
            tempCard.style.width = '30px';  // 미니 카드 크기로 축소
            tempCard.style.height = '45px';
            tempCard.style.opacity = '0.8';
            
            // 애니메이션 완료 후 임시 카드 제거
            setTimeout(() => {
                document.body.removeChild(tempCard);
                
                // 수집 영역 업데이트
                const state = this.gameManager.getCurrentState();
                this.renderCollectedCards(state.playerCollected, state.aiCollected);
                
                // 효과 표시
                const collectionEffect = document.getElementById('collection-effect');
                if (collectionEffect) {
                    collectionEffect.classList.remove('hidden');
                    setTimeout(() => {
                        collectionEffect.classList.add('hidden');
                    }, 1000);
                }
            }, 500);
        }, 10);
    }
    
    // 패 버리기 기능 구현을 위한 메서드
    enableCardDiscard() {
        if (!this.playerCardsElement) return;
        
        const state = this.gameManager.getCurrentState();
        
        // 플레이어 턴이 아니거나 매칭 카드가 있으면 무시
        if (state.phase !== 'playerTurn' || (state.matchingCards && state.matchingCards.length > 0)) return;
        
        // 선택된 카드가 있다면 버리기 모드 활성화
        if (this.selectedCardIndex !== -1) {
            // 바닥 영역 하이라이트 (카드를 버릴 수 있는 영역)
            if (this.boardCardsElement) {
                this.boardCardsElement.classList.add('discard-highlight');
            }
            
            // 상태 표시 업데이트
            if (this.gameStatusElement) {
                this.gameStatusElement.textContent = '카드를 버려주세요';
            }
            
            // 도움말 메시지 표시
            if (this.helpMessageElement) {
                this.helpMessageElement.textContent = '매칭되는 카드가 없습니다. 카드를 바닥에 버려주세요.';
                this.helpMessageElement.classList.remove('hidden');
                
                // 잠시 후 메시지 숨기기
                setTimeout(() => {
                    this.helpMessageElement.classList.add('hidden');
                }, 3000);
            }
            
            // 바닥 영역 클릭 이벤트 추가
            if (this.boardCardsElement) {
                this.boardCardsElement.onclick = () => {
                    this.discardSelectedCard();
                };
            }
        }
    }
    
    // 카드 버리기 실행
    discardSelectedCard() {
        if (this.selectedCardIndex === -1 || !this.gameManager) return;
        
        const state = this.gameManager.getCurrentState();
        
        // 플레이어 턴이 아니면 무시
        if (state.phase !== 'playerTurn') return;
        
        // 게임 매니저에게 카드 버리기 전달
        this.gameManager.discardCard(this.selectedCardIndex);
        
        // 바닥 영역 하이라이트 제거
        if (this.boardCardsElement) {
            this.boardCardsElement.classList.remove('discard-highlight');
            // 클릭 이벤트 제거
            this.boardCardsElement.onclick = null;
        }
        
        // 선택 초기화
        this.selectedCardIndex = -1;
    }
}
