// cardDeck.js - 화투 카드 덱 관리
export class CardDeck {
    constructor() {
        this.cards = [];
        this.initialize();
    }
    
    // 덱 초기화
    initialize() {
        this.cards = [];
        
        // 화투 48장 생성 (1월 ~ 12월, 각 4장씩)
        for (let month = 1; month <= 12; month++) {
            // 각 월별로 4장의 카드 생성 (광, 띠/열끗, 피)
            this.createMonthCards(month);
        }
    }
    
    // 월별 카드 생성
    createMonthCards(month) {
        // 각 월의 카드 이름과 타입 정의
        const cardTypes = this.getCardTypes(month);
        
        // 각 타입별 카드 생성
        for (let i = 0; i < cardTypes.length; i++) {
            this.cards.push({
                id: `${month}-${i+1}`,
                month: month,
                type: cardTypes[i].type,
                name: cardTypes[i].name,
                points: cardTypes[i].points
            });
        }
    }
    
    // 월별 카드 타입 정의
    getCardTypes(month) {
        // 각 월의 카드 타입 및 이름 정의
        // 타입: kwang(광), animal(띠), ribbon(열끗), junk(피)
        switch (month) {
            case 1: // 1월 - 소나무
                return [
                    { type: 'kwang', name: '송광', points: 5 },
                    { type: 'ribbon', name: '홍단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 2: // 2월 - 매화
                return [
                    { type: 'animal', name: '매', points: 1 },
                    { type: 'ribbon', name: '홍단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 3: // 3월 - 벚꽃
                return [
                    { type: 'kwang', name: '벚광', points: 5 },
                    { type: 'ribbon', name: '홍단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 4: // 4월 - 등나무
                return [
                    { type: 'animal', name: '비', points: 1 },
                    { type: 'ribbon', name: '초단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 5: // 5월 - 난초
                return [
                    { type: 'animal', name: '난', points: 1 },
                    { type: 'ribbon', name: '초단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 6: // 6월 - 모란
                return [
                    { type: 'animal', name: '나비', points: 1 },
                    { type: 'ribbon', name: '청단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 7: // 7월 - 싸리
                return [
                    { type: 'animal', name: '멧돼지', points: 1 },
                    { type: 'ribbon', name: '초단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 8: // 8월 - 공산
                return [
                    { type: 'kwang', name: '공산광', points: 5 },
                    { type: 'animal', name: '기러기', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 9: // 9월 - 국화
                return [
                    { type: 'animal', name: '술', points: 1 },
                    { type: 'ribbon', name: '청단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 10: // 10월 - 단풍
                return [
                    { type: 'animal', name: '사슴', points: 1 },
                    { type: 'ribbon', name: '청단', points: 1 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 11: // 11월 - 오동
                return [
                    { type: 'kwang', name: '비광', points: 5 },
                    { type: 'junk', name: '쌍피', points: 2 },
                    { type: 'junk', name: '피', points: 1 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            case 12: // 12월 - 소나무와 새
                return [
                    { type: 'kwang', name: '황광', points: 5 },
                    { type: 'animal', name: '까치', points: 1 },
                    { type: 'junk', name: '쌍피', points: 2 },
                    { type: 'junk', name: '피', points: 1 }
                ];
            default:
                return [];
        }
    }
    
    // 카드 섞기
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    // 카드 한 장 뽑기
    drawCard() {
        if (this.cards.length === 0) {
            return null;
        }
        return this.cards.pop();
    }
    
    // 남은 카드 수
    remainingCards() {
        return this.cards.length;
    }
    
    // 월별 카드 이름 가져오기 (UI 표시용)
    static getMonthName(month) {
        const monthNames = [
            '소나무', '매화', '벚꽃', '등나무', '난초', '모란',
            '싸리', '공산', '국화', '단풍', '오동', '소나무와 새'
        ];
        
        return monthNames[month - 1] || `${month}월`;
    }
}