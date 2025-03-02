// gameManager.js - 게임 로직 관리
import { CardDeck } from './cardDeck.js';
import { AIPlayer } from './aiPlayer.js';
import { SoundManager } from './soundManager.js';

export class GameManager {
    constructor() {
        this.deck = new CardDeck();
        this.ai = new AIPlayer();
        this.soundManager = new SoundManager();
        
        // 게임 상태
        this.state = {
            phase: 'idle', // idle, dealing, playerTurn, aiTurn, goStop, gameOver
            round: 0,
            playerCards: [],
            aiCards: [],
            boardCards: [],
            playerCollected: {
                kwang: [], // 광
                animal: [], // 띠
                ribbon: [], // 열끗
                junk: []    // 피
            },
            aiCollected: {
                kwang: [],
                animal: [],
                ribbon: [],
                junk: []
            },
            playerScore: 0,
            aiScore: 0,
            currentPoints: 0,
            goCount: 0,
            isPlayerTurn: true,
            selectedCard: null,
            matchingCards: [],
            lastAction: null,
            gameResult: {
                isWin: false,
                score: 0,
                coins: 0
            }
        };
        
        // 이벤트 콜백
        this.onGameStateChanged = null;
        this.onCardsDealt = null;
        this.onPlayerTurn = null;
        this.onAITurn = null;
        this.onCardPlayed = null;
        this.onCardCollected = null;
        this.onGoStopPrompt = null;
        this.onGameOver = null;
    }
    
    // 새 게임 시작
    startNewGame() {
        // 덱 초기화 및 섞기
        this.deck.initialize();
        this.deck.shuffle();
        
        // 게임 상태 초기화
        this.state = {
            phase: 'dealing',
            round: 1,
            playerCards: [],
            aiCards: [],
            boardCards: [],
            playerCollected: {
                kwang: [],
                animal: [],
                ribbon: [],
                junk: []
            },
            aiCollected: {
                kwang: [],
                animal: [],
                ribbon: [],
                junk: []
            },
            playerScore: 0,
            aiScore: 0,
            currentPoints: 0,
            goCount: 0,
            isPlayerTurn: Math.random() < 0.5, // 랜덤 선공
            selectedCard: null,
            matchingCards: [],
            lastAction: null,
            gameResult: {
                isWin: false,
                score: 0,
                coins: 0
            }
        };
        
        // 카드 분배
        this.dealInitialCards();
        
        // 상태 변경 알림
        if (this.onGameStateChanged) {
            this.onGameStateChanged(this.state);
        }
        
        // 첫 턴 시작
        setTimeout(() => {
            this.state.phase = this.state.isPlayerTurn ? 'playerTurn' : 'aiTurn';
            
            if (this.onGameStateChanged) {
                this.onGameStateChanged(this.state);
            }
            
            if (!this.state.isPlayerTurn) {
                this.startAITurn();
            }
        }, 1000);
    }
    
    // 초기 카드 분배
    dealInitialCards() {
        // 플레이어, AI에게 각각 7장씩 분배
        for (let i = 0; i < 7; i++) {
            this.state.playerCards.push(this.deck.drawCard());
            this.state.aiCards.push(this.deck.drawCard());
        }
        
        // 바닥에 8장 깔기
        for (let i = 0; i < 8; i++) {
            this.state.boardCards.push(this.deck.drawCard());
        }
        
        // 이벤트 발생
        if (this.onCardsDealt) {
            this.onCardsDealt(this.state);
        }
    }
    
    // 플레이어 카드 선택
    selectCard(cardIndex) {
        if (this.state.phase !== 'playerTurn') return false;
        
        const card = this.state.playerCards[cardIndex];
        this.state.selectedCard = card;
        
        // 매칭되는 바닥 카드 찾기
        this.state.matchingCards = this.findMatchingCards(card);
        
        return true;
    }
    
    // 바닥 카드 선택 (플레이어)
    selectBoardCard(cardIndex) {
        if (this.state.phase !== 'playerTurn' || !this.state.selectedCard) return false;
        
        const selectedCard = this.state.selectedCard;
        const boardCard = this.state.boardCards[cardIndex];
        
        // 선택한 바닥 카드가 매칭되는지 확인
        if (this.state.matchingCards.includes(boardCard)) {
            // 카드 플레이 처리
            this.playCard(selectedCard, boardCard);
            return true;
        }
        
        return false;
    }
    
    // 카드 플레이 처리
    playCard(playerCard, boardCard) {
        const player = this.state.isPlayerTurn ? 'player' : 'ai';
        const cards = player === 'player' ? this.state.playerCards : this.state.aiCards;
        const collected = player === 'player' ? this.state.playerCollected : this.state.aiCollected;
        
        // 플레이어 또는 AI의 손에서 카드 제거
        const cardIndex = cards.findIndex(c => c === playerCard);
        if (cardIndex !== -1) {
            cards.splice(cardIndex, 1);
        }
        
        // 바닥에서 매칭되는 카드 제거하고 수집
        if (boardCard) {
            const boardIndex = this.state.boardCards.findIndex(c => c === boardCard);
            if (boardIndex !== -1) {
                this.state.boardCards.splice(boardIndex, 1);
            }
            
            // 카드 타입에 따라 분류하여 수집
            this.collectCard(collected, boardCard);
            this.collectCard(collected, playerCard);
        } else {
            // 매칭되는 카드가 없으면 바닥에 놓기
            this.state.boardCards.push(playerCard);
        }
        
        // 특수 조합 체크 (쪽, 따닥, 폭탄 등)
        this.checkSpecialCombinations(player);
        
        // 점수 계산
        this.calculateScore();
        
        // 카드 플레이 이벤트 발생
        if (this.onCardPlayed) {
            this.onCardPlayed({
                player,
                playedCard: playerCard,
                collectedCard: boardCard,
                state: this.state
            });
        }
        
        // 덱에서 새 카드 뽑기
        if (this.deck.remainingCards() > 0) {
            const newCard = this.deck.drawCard();
            cards.push(newCard);
        }
        
        // 게임 종료 조건 체크
        if (this.checkGameOver()) {
            return;
        }
        
        // 고/스톱 조건 체크
        if (this.state.playerScore >= 7 || this.state.aiScore >= 7) {
            this.state.phase = 'goStop';
            
            if (this.onGoStopPrompt) {
                this.onGoStopPrompt({
                    player,
                    currentPoints: player === 'player' ? this.state.playerScore : this.state.aiScore,
                    state: this.state
                });
            }
            return;
        }
        
        // 턴 전환
        this.state.isPlayerTurn = !this.state.isPlayerTurn;
        this.state.phase = this.state.isPlayerTurn ? 'playerTurn' : 'aiTurn';
        this.state.selectedCard = null;
        this.state.matchingCards = [];
        
        // 상태 변경 알림
        if (this.onGameStateChanged) {
            this.onGameStateChanged(this.state);
        }
        
        // AI 턴인 경우 AI 플레이 시작
        if (!this.state.isPlayerTurn) {
            setTimeout(() => {
                this.startAITurn();
            }, 1000);
        }
    }
    
    // AI 턴 시작
    startAITurn() {
        if (this.state.phase !== 'aiTurn') return;
        
        // AI 결정 기반 카드 플레이
        const decision = this.ai.makeDecision(
            this.state.aiCards, 
            this.state.boardCards, 
            this.state.playerCollected,
            this.state.aiCollected
        );
        
        if (decision) {
            // 선택한 카드 및 매칭 카드 설정
            this.state.selectedCard = decision.card;
            
            if (this.onAITurn) {
                this.onAITurn({
                    card: decision.card,
                    matchingCard: decision.matchingCard,
                    state: this.state
                });
            }
            
            // 약간의 지연 후 카드 플레이
            setTimeout(() => {
                this.playCard(decision.card, decision.matchingCard);
            }, 1000);
        } else {
            // 에러 처리: AI가 결정을 내리지 못한 경우
            console.error('AI 결정 오류');
            
            // 랜덤 카드 선택
            const randomCardIndex = Math.floor(Math.random() * this.state.aiCards.length);
            const randomCard = this.state.aiCards[randomCardIndex];
            
            this.state.selectedCard = randomCard;
            const matchingCards = this.findMatchingCards(randomCard);
            
            let matchingCard = null;
            if (matchingCards.length > 0) {
                matchingCard = matchingCards[Math.floor(Math.random() * matchingCards.length)];
            }
            
            if (this.onAITurn) {
                this.onAITurn({
                    card: randomCard,
                    matchingCard: matchingCard,
                    state: this.state
                });
            }
            
            // 약간의 지연 후 카드 플레이
            setTimeout(() => {
                this.playCard(randomCard, matchingCard);
            }, 1000);
        }
    }
    
    // 고/스톱 선택
    selectGoStop(choice) {
        if (this.state.phase !== 'goStop') return;
        
        if (choice === 'go') {
            // '고' 선택 - 게임 계속
            this.state.goCount++;
            this.state.currentPoints = this.state.isPlayerTurn ? this.state.playerScore : this.state.aiScore;
            
            // 턴 전환
            this.state.isPlayerTurn = !this.state.isPlayerTurn;
            this.state.phase = this.state.isPlayerTurn ? 'playerTurn' : 'aiTurn';
            
            // 상태 변경 알림
            if (this.onGameStateChanged) {
                this.onGameStateChanged(this.state);
            }
            
            // AI 턴인 경우 AI 플레이 시작
            if (!this.state.isPlayerTurn) {
                setTimeout(() => {
                    this.startAITurn();
                }, 1000);
            }
        } else {
            // '스톱' 선택 - 게임 종료
            this.endGame();
        }
    }
    
    // 게임 종료 체크
    checkGameOver() {
        // 모든 카드를 다 썼거나, 플레이어/AI의 패가 없는 경우
        if (this.deck.remainingCards() === 0 && 
            (this.state.playerCards.length === 0 || this.state.aiCards.length === 0)) {
            this.endGame();
            return true;
        }
        
        // 점수가 일정 이상인 경우 (예: 고스톱 횟수 제한)
        if (this.state.goCount >= 3) {
            this.endGame();
            return true;
        }
        
        return false;
    }
    
    // 게임 종료 처리
    endGame() {
        // 최종 점수 계산
        this.calculateFinalScore();
        
        // 승패 결정
        const isPlayerWin = this.state.playerScore > this.state.aiScore;
        
        // 코인 계산
        let coins = isPlayerWin ? 100 + this.state.playerScore * 10 : 10;
        
        // 게임 결과 설정
        this.state.gameResult = {
            isWin: isPlayerWin,
            score: isPlayerWin ? this.state.playerScore : this.state.aiScore,
            coins: coins
        };
        
        // 상태 업데이트
        this.state.phase = 'gameOver';
        
        // 게임 오버 이벤트 발생
        if (this.onGameOver) {
            this.onGameOver(this.state.gameResult);
        }
        
        // 코인 저장
        this.updatePlayerCoins(coins);
    }
    
    // 매칭되는 카드 찾기
    findMatchingCards(card) {
        if (!card) return [];
        
        return this.state.boardCards.filter(boardCard => 
            boardCard.month === card.month
        );
    }
    
    // 카드 수집
    collectCard(collection, card) {
        if (!card) return;
        
        // 카드 타입에 따라 분류
        switch (card.type) {
            case 'kwang':
                collection.kwang.push(card);
                break;
            case 'animal':
                collection.animal.push(card);
                break;
            case 'ribbon':
                collection.ribbon.push(card);
                break;
            case 'junk':
                collection.junk.push(card);
                break;
        }
    }
    
    // 특수 조합 체크 (쪽, 따닥, 폭탄 등)
    checkSpecialCombinations(player) {
        // 여기서는 간단한 구현만 포함
        // 실제 구현에서는 더 복잡한 규칙 적용 필요
    }
    
    // 점수 계산
    calculateScore() {
        // 플레이어 점수 계산
        let playerScore = 0;
        
        // 광 점수
        const playerKwangCount = this.state.playerCollected.kwang.length;
        if (playerKwangCount >= 3) {
            playerScore += playerKwangCount;
        }
        
        // 띠 점수
        const playerAnimalCount = this.state.playerCollected.animal.length;
        if (playerAnimalCount >= 5) {
            playerScore += Math.floor(playerAnimalCount / 5);
        }
        
        // 열끗 점수
        const playerRibbonCount = this.state.playerCollected.ribbon.length;
        if (playerRibbonCount >= 5) {
            playerScore += Math.floor(playerRibbonCount / 5);
        }
        
        // 피 점수
        const playerJunkCount = this.state.playerCollected.junk.length;
        if (playerJunkCount >= 10) {
            playerScore += Math.floor(playerJunkCount / 10);
        }
        
        this.state.playerScore = playerScore;
        
        // AI 점수 계산 (플레이어와 동일한 로직)
        let aiScore = 0;
        
        const aiKwangCount = this.state.aiCollected.kwang.length;
        if (aiKwangCount >= 3) {
            aiScore += aiKwangCount;
        }
        
        const aiAnimalCount = this.state.aiCollected.animal.length;
        if (aiAnimalCount >= 5) {
            aiScore += Math.floor(aiAnimalCount / 5);
        }
        
        const aiRibbonCount = this.state.aiCollected.ribbon.length;
        if (aiRibbonCount >= 5) {
            aiScore += Math.floor(aiRibbonCount / 5);
        }
        
        const aiJunkCount = this.state.aiCollected.junk.length;
        if (aiJunkCount >= 10) {
            aiScore += Math.floor(aiJunkCount / 10);
        }
        
        this.state.aiScore = aiScore;
    }
    
    // 최종 점수 계산
    calculateFinalScore() {
        // 기본 점수 계산
        this.calculateScore();
        
        // 추가 점수 계산 (고 횟수에 따른 보너스 등)
        if (this.state.goCount > 0) {
            this.state.playerScore += this.state.goCount;
            this.state.aiScore += this.state.goCount;
        }
    }
    
    // 플레이어 코인 업데이트
    updatePlayerCoins(coins) {
        let currentCoins = localStorage.getItem('playerCoins');
        currentCoins = currentCoins ? parseInt(currentCoins) : 0;
        
        // 코인 추가
        currentCoins += coins;
        
        // 저장
        localStorage.setItem('playerCoins', currentCoins.toString());
    }
    
    // 현재 게임 상태 반환
    getCurrentState() {
        return { ...this.state };
    }
    
    // 게임 결과 반환
    getGameResult() {
        return { ...this.state.gameResult };
    }
}