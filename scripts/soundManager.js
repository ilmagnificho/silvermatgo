// soundManager.js - 효과음 및 진동 관리
export class SoundManager {
    constructor() {
        // 설정에서 효과음, 진동 상태 로드
        this.soundEnabled = this.loadSoundSetting();
        this.vibrationEnabled = this.loadVibrationSetting();
        
        // 오디오 객체 준비
        this.sounds = {
            cardSelect: new Audio('sounds/card_select.mp3'),
            cardMatch: new Audio('sounds/card_match.mp3'),
            cardPlace: new Audio('sounds/card_place.mp3'),
            goStop: new Audio('sounds/go_stop.mp3'),
            win: new Audio('sounds/win.mp3'),
            lose: new Audio('sounds/lose.mp3'),
            special: new Audio('sounds/special.mp3')
        };
        
        // 오디오 객체 로드 오류 처리
        for (const sound of Object.values(this.sounds)) {
            sound.addEventListener('error', (e) => {
                console.warn('오디오 로드 오류:', e);
                // 오류 발생 시 소리 기능 비활성화
                this.soundEnabled = false;
            });
        }
    }
    
    // 설정에서 소리 설정 로드
    loadSoundSetting() {
        const settings = localStorage.getItem('gameSettings');
        
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                return parsedSettings.soundEffect === true;
            } catch (e) {
                console.error('설정 로드 오류:', e);
                return true; // 기본값: 활성화
            }
        }
        
        return true; // 기본값: 활성화
    }
    
    // 설정에서 진동 설정 로드
    loadVibrationSetting() {
        const settings = localStorage.getItem('gameSettings');
        
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                return parsedSettings.vibration === true;
            } catch (e) {
                console.error('설정 로드 오류:', e);
                return true; // 기본값: 활성화
            }
        }
        
        return true; // 기본값: 활성화
    }
    
    // 설정 변경 적용
    updateSettings(soundEnabled, vibrationEnabled) {
        this.soundEnabled = soundEnabled;
        this.vibrationEnabled = vibrationEnabled;
    }
    
    // 효과음 재생
    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            // 재생 중이면 처음으로 되돌리고 다시 재생
            sound.currentTime = 0;
            
            // 재생 시도 및 오류 처리
            sound.play().catch(e => {
                console.warn('효과음 재생 실패:', e);
            });
        }
    }
    
    // 진동 실행
    vibrate(pattern) {
        if (!this.vibrationEnabled) return;
        
        // 진동 API 지원 여부 확인
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                console.warn('진동 실행 실패:', e);
            }
        }
    }
    
    // 카드 선택 효과
    playCardSelect() {
        this.playSound('cardSelect');
        this.vibrate(50);
    }
    
    // 카드 매칭 효과
    playCardMatch() {
        this.playSound('cardMatch');
        this.vibrate(100);
    }
    
    // 카드 배치 효과
    playCardPlace() {
        this.playSound('cardPlace');
        this.vibrate(50);
    }
    
    // 고/스톱 효과
    playGoStop() {
        this.playSound('goStop');
        this.vibrate([100, 50, 100]);
    }
    
    // 특수 효과 (쪽, 따닥 등)
    playSpecial() {
        this.playSound('special');
        this.vibrate([50, 50, 100, 50, 100]);
    }
    
    // 승리 효과
    playWin() {
        this.playSound('win');
        this.vibrate([100, 100, 200, 100, 200, 100]);
    }
    
    // 패배 효과
    playLose() {
        this.playSound('lose');
        this.vibrate(300);
    }
}