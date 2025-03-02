// settingsManager.js - 게임 설정 관리
export class SettingsManager {
    constructor() {
        // 기본 설정
        this.defaultSettings = {
            difficulty: 'normal',     // 난이도: easy, normal, hard
            textSize: 'normal',       // 글자 크기: normal, large, extra-large
            soundEffect: true,        // 효과음
            vibration: true,          // 진동
            highContrast: false,      // 고대비 모드
            tutorialShown: false      // 튜토리얼 표시 여부
        };
        
        // 현재 설정 로드
        this.settings = this.loadSettings();
        
        // UI에 설정 반영
        this.applySettingsToUI();
    }
    
    // 설정 로드
    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch (e) {
                console.error('설정 로드 오류:', e);
                return { ...this.defaultSettings };
            }
        }
        
        return { ...this.defaultSettings };
    }
    
    // 설정 저장
    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }
    
    // 설정 업데이트
    updateSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.saveSettings();
            
            // 특정 설정 변경에 따른 추가 작업
            this.handleSettingChange(key, value);
            
            return true;
        }
        
        return false;
    }
    
    // 설정 가져오기
    getSetting(key) {
        return this.settings[key];
    }
    
    // 모든 설정 가져오기
    getAllSettings() {
        return { ...this.settings };
    }
    
    // 설정 초기화
    resetSettings() {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applySettingsToUI();
    }
    
    // 모든 데이터 초기화
    clearAllData() {
        localStorage.clear();
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
    }
    
    // UI에 설정 반영
    applySettingsToUI() {
        // 난이도
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.value = this.settings.difficulty;
        }
        
        // 글자 크기
        const textSizeSelect = document.getElementById('text-size');
        if (textSizeSelect) {
            textSizeSelect.value = this.settings.textSize;
        }
        
        // 글자 크기 적용
        this.applyTextSize(this.settings.textSize);
        
        // 효과음
        const soundEffectToggle = document.getElementById('sound-effect');
        if (soundEffectToggle) {
            soundEffectToggle.checked = this.settings.soundEffect;
        }
        
        // 진동
        const vibrationToggle = document.getElementById('vibration');
        if (vibrationToggle) {
            vibrationToggle.checked = this.settings.vibration;
        }
        
        // 고대비 모드
        const highContrastToggle = document.getElementById('high-contrast');
        if (highContrastToggle) {
            highContrastToggle.checked = this.settings.highContrast;
        }
        
        // 고대비 모드 적용
        this.applyHighContrast(this.settings.highContrast);
    }
    
    // 설정 변경에 대한 추가 처리
    handleSettingChange(key, value) {
        switch (key) {
            case 'textSize':
                this.applyTextSize(value);
                break;
                
            case 'highContrast':
                this.applyHighContrast(value);
                break;
                
            case 'soundEffect':
                // 효과음 관련 처리
                break;
                
            case 'vibration':
                // 진동 관련 처리
                break;
        }
    }
    
    // 글자 크기 적용
    applyTextSize(size) {
        document.body.classList.remove('text-normal', 'text-large', 'text-extra-large');
        document.body.classList.add(`text-${size}`);
        
        // CSS 변수 설정
        const rootElement = document.documentElement;
        
        switch (size) {
            case 'large':
                rootElement.style.setProperty('--font-xs', '14px');
                rootElement.style.setProperty('--font-sm', '16px');
                rootElement.style.setProperty('--font-md', '18px');
                rootElement.style.setProperty('--font-lg', '22px');
                rootElement.style.setProperty('--font-xl', '28px');
                rootElement.style.setProperty('--font-xxl', '36px');
                break;
                
            case 'extra-large':
                rootElement.style.setProperty('--font-xs', '16px');
                rootElement.style.setProperty('--font-sm', '18px');
                rootElement.style.setProperty('--font-md', '22px');
                rootElement.style.setProperty('--font-lg', '26px');
                rootElement.style.setProperty('--font-xl', '32px');
                rootElement.style.setProperty('--font-xxl', '42px');
                break;
                
            default: // normal
                rootElement.style.setProperty('--font-xs', '12px');
                rootElement.style.setProperty('--font-sm', '14px');
                rootElement.style.setProperty('--font-md', '16px');
                rootElement.style.setProperty('--font-lg', '18px');
                rootElement.style.setProperty('--font-xl', '24px');
                rootElement.style.setProperty('--font-xxl', '32px');
                break;
        }
    }
    
    // 고대비 모드 적용
    applyHighContrast(enabled) {
        const rootElement = document.documentElement;
        
        if (enabled) {
            // 고대비 색상 적용
            rootElement.style.setProperty('--bg-primary', '#000000');
            rootElement.style.setProperty('--bg-secondary', '#111111');
            rootElement.style.setProperty('--bg-tertiary', '#222222');
            rootElement.style.setProperty('--text-primary', '#FFFFFF');
            rootElement.style.setProperty('--text-secondary', '#FFFF00');
            rootElement.style.setProperty('--accent-color', '#FFFF00');
            rootElement.style.setProperty('--card-bg', '#FFFFFF');
            rootElement.style.setProperty('--card-border', '#FFFF00');
            
            // 카드 색상 고대비 설정
            rootElement.style.setProperty('--card-1', '#FF0000');
            rootElement.style.setProperty('--card-2', '#FF0000');
            rootElement.style.setProperty('--card-3', '#FF00FF');
            rootElement.style.setProperty('--card-4', '#00FF00');
            rootElement.style.setProperty('--card-5', '#00FF00');
            rootElement.style.setProperty('--card-6', '#FF00FF');
            rootElement.style.setProperty('--card-7', '#0000FF');
            rootElement.style.setProperty('--card-8', '#0000FF');
            rootElement.style.setProperty('--card-9', '#FF8000');
            rootElement.style.setProperty('--card-10', '#FF8000');
            rootElement.style.setProperty('--card-11', '#FF8000');
            rootElement.style.setProperty('--card-12', '#FF00FF');
            
            document.body.classList.add('high-contrast');
        } else {
            // 기본 색상으로 복원
            rootElement.style.setProperty('--bg-primary', '#0A4428');
            rootElement.style.setProperty('--bg-secondary', '#0E5334');
            rootElement.style.setProperty('--bg-tertiary', '#074023');
            rootElement.style.setProperty('--text-primary', '#FFFFFF');
            rootElement.style.setProperty('--text-secondary', '#90EE90');
            rootElement.style.setProperty('--accent-color', '#FFD700');
            rootElement.style.setProperty('--card-bg', '#FFFFFF');
            rootElement.style.setProperty('--card-border', '#FFD700');
            
            // 카드 색상 기본 설정
            rootElement.style.setProperty('--card-1', '#D32F2F');
            rootElement.style.setProperty('--card-2', '#D32F2F');
            rootElement.style.setProperty('--card-3', '#9C27B0');
            rootElement.style.setProperty('--card-4', '#4CAF50');
            rootElement.style.setProperty('--card-5', '#4CAF50');
            rootElement.style.setProperty('--card-6', '#9C27B0');
            rootElement.style.setProperty('--card-7', '#2196F3');
            rootElement.style.setProperty('--card-8', '#2196F3');
            rootElement.style.setProperty('--card-9', '#FF9800');
            rootElement.style.setProperty('--card-10', '#FF9800');
            rootElement.style.setProperty('--card-11', '#FF9800');
            rootElement.style.setProperty('--card-12', '#9C27B0');
            
            document.body.classList.remove('high-contrast');
        }
    }
}