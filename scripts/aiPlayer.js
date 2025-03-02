// aiPlayer.js - AI 플레이어 로직
export class AIPlayer {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty; // easy, normal, hard
    }
    
    // 난이도 설정
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    
    // AI의 의사 결정
    makeDecision(aiCards, boardCards, playerCollected, aiCollected) {
        // 난이도에 따른 전략 선택
        switch (this.difficulty) {
            case 'easy':
                return this.makeEasyDecision(aiCards, boardCards);
            case 'normal':
                return this.makeNormalDecision(aiCards, boardCards, playerCollected, aiCollected);
            case 'hard':
                return this.makeHardDecision(aiCards, boardCards, playerCollected, aiCollected);
            default:
                return this.makeNormalDecision(aiCards, boardCards, playerCollected, aiCollected);
        }
    }
    
    // 초보자 난이도 의사 결정
    makeEasyDecision(aiCards, boardCards) {
        // 단순 매칭 전략: 가장 첫 번째로 매칭되는 카드 선택
        for (const card of aiCards) {
            const matchingCards = this.findMatchingCards(card, boardCards);
            
            if (matchingCards.length > 0) {
                return {
                    card: card,
                    matchingCard: matchingCards[0]
                };
            }
        }
        
        // 매칭되는 카드가 없으면 첫 번째 카드 선택
        return {
            card: aiCards[0],
            matchingCard: null
        };
    }
    
    // 보통 난이도 의사 결정
    makeNormalDecision(aiCards, boardCards, playerCollected, aiCollected) {
        // 카드 타입 우선순위: 광 > 동물 > 열끗 > 피
        const cardValues = {
            'kwang': 4,
            'animal': 3,
            'ribbon': 2,
            'junk': 1
        };
        
        // 매칭 가능한 카드들 중에서 가장 가치가 높은 카드 선택
        let bestChoice = null;
        let bestValue = -1;
        
        for (const card of aiCards) {
            const matchingCards = this.findMatchingCards(card, boardCards);
            
            if (matchingCards.length > 0) {
                // 매칭되는 카드 중 가장 가치 있는 카드 찾기
                for (const matchingCard of matchingCards) {
                    const cardValue = cardValues[matchingCard.type] || 0;
                    
                    if (cardValue > bestValue) {
                        bestValue = cardValue;
                        bestChoice = {
                            card: card,
                            matchingCard: matchingCard
                        };
                    }
                }
            }
        }
        
        // 매칭되는 카드가 있으면 선택
        if (bestChoice) {
            return bestChoice;
        }
        
        // 매칭되는 카드가 없으면 가장 가치가 낮은 카드 버리기
        let lowestValueCard = aiCards[0];
        let lowestValue = cardValues[aiCards[0].type] || 0;
        
        for (const card of aiCards) {
            const cardValue = cardValues[card.type] || 0;
            
            if (cardValue < lowestValue) {
                lowestValue = cardValue;
                lowestValueCard = card;
            }
        }
        
        return {
            card: lowestValueCard,
            matchingCard: null
        };
    }
    
    // 고급 난이도 의사 결정
    makeHardDecision(aiCards, boardCards, playerCollected, aiCollected) {
        // 현재 게임 상황 분석
        const aiCardCount = this.countCardTypes(aiCollected);
        const playerCardCount = this.countCardTypes(playerCollected);
        
        // 광 우선 전략
        if (aiCardCount.kwang >= 2) {
            // 광 3개를 모으기 위한 전략
            const kwangChoice = this.prioritizeCardType(aiCards, boardCards, 'kwang');
            if (kwangChoice) return kwangChoice;
        }
        
        // 플레이어 방해 전략
        if (playerCardCount.kwang >= 2) {
            // 플레이어의 광 조합 방해
            const blockChoice = this.blockPlayerStrategy(aiCards, boardCards, playerCollected);
            if (blockChoice) return blockChoice;
        }
        
        // 기본 전략: 가장 가치 있는 카드 선택
        const valueBasedChoice = this.valueBasedStrategy(aiCards, boardCards, aiCollected);
        if (valueBasedChoice) return valueBasedChoice;
        
        // 최후의 수단: 보통 난이도 결정 사용
        return this.makeNormalDecision(aiCards, boardCards, playerCollected, aiCollected);
    }
    
    // 매칭되는 카드 찾기
    findMatchingCards(card, boardCards) {
        if (!card) return [];
        
        return boardCards.filter(boardCard => 
            boardCard.month === card.month
        );
    }
    
    // 카드 타입 수 계산
    countCardTypes(collected) {
        return {
            kwang: collected.kwang.length,
            animal: collected.animal.length,
            ribbon: collected.ribbon.length,
            junk: collected.junk.length
        };
    }
    
    // 특정 타입의 카드 우선 선택
    prioritizeCardType(aiCards, boardCards, targetType) {
        for (const card of aiCards) {
            const matchingCards = this.findMatchingCards(card, boardCards);
            
            for (const matchingCard of matchingCards) {
                if (matchingCard.type === targetType) {
                    return {
                        card: card,
                        matchingCard: matchingCard
                    };
                }
            }
        }
        
        return null;
    }
    
    // 플레이어 방해 전략
    blockPlayerStrategy(aiCards, boardCards, playerCollected) {
        // 플레이어가 모으고 있는 카드 타입 파악
        const targetMonths = [];
        
        // 플레이어가 광 2개를 모았다면, 남은 광 카드의 월 파악
        if (playerCollected.kwang.length >= 2) {
            const kwangMonths = [1, 3, 8, 11, 12]; // 광이 있는 월
            const collectedKwangMonths = playerCollected.kwang.map(card => card.month);
            
            // 아직 수집하지 않은 광 월
            for (const month of kwangMonths) {
                if (!collectedKwangMonths.includes(month)) {
                    targetMonths.push(month);
                }
            }
        }
        
        // 타겟 월의 카드를 바닥에서 가져올 수 있으면 선택
        for (const month of targetMonths) {
            for (const card of aiCards) {
                if (card.month === month) {
                    const matchingCards = this.findMatchingCards(card, boardCards);
                    
                    if (matchingCards.length > 0) {
                        return {
                            card: card,
                            matchingCard: matchingCards[0]
                        };
                    }
                }
            }
        }
        
        return null;
    }
    
    // 가치 기반 전략
    valueBasedStrategy(aiCards, boardCards, aiCollected) {
        // 카드 타입별 점수 계산을 위한 가중치
        const typeWeights = {
            'kwang': 10,
            'animal': 5,
            'ribbon': 3,
            'junk': 1
        };
        
        // 현재 수집 상황에 따른 조정
        const collectionCounts = this.countCardTypes(aiCollected);
        
        // 조합 달성에 가까울수록 가중치 증가
        if (collectionCounts.kwang === 2) typeWeights.kwang = 20;
        if (collectionCounts.animal >= 4) typeWeights.animal = 8;
        if (collectionCounts.ribbon >= 4) typeWeights.ribbon = 6;
        if (collectionCounts.junk >= 9) typeWeights.junk = 3;
        
        // 카드 가치 계산 및 최적 선택
        let bestChoice = null;
        let bestScore = -1;
        
        for (const card of aiCards) {
            const matchingCards = this.findMatchingCards(card, boardCards);
            
            if (matchingCards.length > 0) {
                for (const matchingCard of matchingCards) {
                    // 카드 타입에 따른 점수 계산
                    const score = typeWeights[matchingCard.type] || 0;
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestChoice = {
                            card: card,
                            matchingCard: matchingCard
                        };
                    }
                }
            }
        }
        
        return bestChoice;
    }
}