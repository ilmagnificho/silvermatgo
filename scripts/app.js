// app.js - 실버 맞고 웹앱 메인 진입점
import { GameManager } from './gameManager.js';
import { UIManager } from './uiManager.js';
import { SettingsManager } from './settingsManager.js';
import { TutorialManager } from './tutorialManager.js';

// PWA 관련 서비스 워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 상대 경로 사용으로 수정
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker 등록 성공:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker 등록 실패:', error);
            });
    });
}

// 앱 초기화 클래스
class App {
    constructor() {
        // 각 매니저 초기화
        this.settingsManager = new SettingsManager();
        this.gameManager = new GameManager();
        this.uiManager = new UIManager(this.gameManager, this.settingsManager);
        this.tutorialManager = new TutorialManager();
        
        // 앱 상태
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        
        this.initEventListeners();
        this.checkInstallability();
        this.updateOnlineStatus();
    }
    
    // 이벤트 리스너 초기화
    initEventListeners() {
        // 시작 화면 버튼
        const startGameBtn = document.getElementById('start-game');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.uiManager.showScreen('game-screen');
                this.gameManager.startNewGame();
            });
        }
        
        const openTutorialBtn = document.getElementById('open-tutorial');
        if (openTutorialBtn) {
            openTutorialBtn.addEventListener('click', () => {
                this.uiManager.showScreen('tutorial-screen');
            });
        }
        
        const openSettingsBtn = document.getElementById('open-settings');
        if (openSettingsBtn) {
            openSettingsBtn.addEventListener('click', () => {
                this.uiManager.showScreen('settings-screen');
            });
        }
        
        // 게임 화면 버튼
        const backToMenuBtn = document.getElementById('back-to-menu');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                if (confirm('게임을 종료하시겠습니까? 현재 게임은 저장되지 않습니다.')) {
                    this.uiManager.showScreen('start-screen');
                }
            });
        }
        
        const gameHelpBtn = document.getElementById('game-help');
        if (gameHelpBtn) {
            gameHelpBtn.addEventListener('click', () => {
                this.tutorialManager.showContextHelp(this.gameManager.getCurrentState());
            });
        }
        
        // 고/스톱 다이얼로그 버튼
        const goBtn = document.getElementById('go-btn');
        if (goBtn) {
            goBtn.addEventListener('click', () => {
                this.gameManager.selectGoStop('go');
            });
        }
        
        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.gameManager.selectGoStop('stop');
            });
        }
        
        // 결과 화면 버튼
        const playAgainBtn = document.getElementById('play-again');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.uiManager.showScreen('game-screen');
                this.gameManager.startNewGame();
            });
        }
        
        const returnToMenuBtn = document.getElementById('return-to-menu');
        if (returnToMenuBtn) {
            returnToMenuBtn.addEventListener('click', () => {
                this.uiManager.showScreen('start-screen');
            });
        }
        
        const shareResultBtn = document.getElementById('share-result');
        if (shareResultBtn) {
            shareResultBtn.addEventListener('click', () => {
                this.shareGameResult();
            });
        }
        
        // 튜토리얼 화면 버튼
        const closeTutorialBtn = document.getElementById('close-tutorial');
        if (closeTutorialBtn) {
            closeTutorialBtn.addEventListener('click', () => {
                this.uiManager.showScreen('start-screen');
            });
        }
        
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.tutorialManager.prevStep();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.tutorialManager.nextStep();
            });
        }
        
        // 튜토리얼 단계 선택 도트
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const step = e.target.dataset.step;
                this.tutorialManager.goToStep(Number(step));
            });
        });
        
        // 설정 화면 버튼
        const closeSettingsBtn = document.getElementById('close-settings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                this.uiManager.showScreen('start-screen');
                this.settingsManager.saveSettings();
            });
        }
        
        // 설정 변경 이벤트
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.settingsManager.updateSetting('difficulty', e.target.value);
            });
        }
        
        const textSizeSelect = document.getElementById('text-size');
        if (textSizeSelect) {
            textSizeSelect.addEventListener('change', (e) => {
                this.settingsManager.updateSetting('textSize', e.target.value);
                this.applyTextSize(e.target.value);
            });
        }
        
        const soundEffectToggle = document.getElementById('sound-effect');
        if (soundEffectToggle) {
            soundEffectToggle.addEventListener('change', (e) => {
                this.settingsManager.updateSetting('soundEffect', e.target.checked);
            });
        }
        
        const vibrationToggle = document.getElementById('vibration');
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                this.settingsManager.updateSetting('vibration', e.target.checked);
            });
        }
        
        const highContrastToggle = document.getElementById('high-contrast');
        if (highContrastToggle) {
            highContrastToggle.addEventListener('change', (e) => {
                this.settingsManager.updateSetting('highContrast', e.target.checked);
                this.applyHighContrast(e.target.checked);
            });
        }
        
        const tutorialResetBtn = document.getElementById('tutorial-reset');
        if (tutorialResetBtn) {
            tutorialResetBtn.addEventListener('click', () => {
                this.tutorialManager.resetTutorial();
                alert('튜토리얼이 초기화되었습니다. 다음 게임부터 다시 보게 됩니다.');
            });
        }
        
        const clearDataBtn = document.getElementById('clear-data');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('모든 게임 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                    this.settingsManager.clearAllData();
                    alert('모든 데이터가 초기화되었습니다.');
                    window.location.reload();
                }
            });
        }
        
        // 설치 배너 관련
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
        }
        
        const closeInstallBannerBtn = document.getElementById('close-install-banner');
        if (closeInstallBannerBtn) {
            closeInstallBannerBtn.addEventListener('click', () => {
                const installBanner = document.getElementById('install-banner');
                if (installBanner) {
                    installBanner.classList.add('hidden');
                }
                localStorage.setItem('installBannerClosed', 'true');
            });
        }
        
        // 온라인 상태 변경 감지
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateOnlineStatus();
        });
        
        // PWA 설치 이벤트
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });
    }
    
    // PWA 설치 가능 여부 확인
    checkInstallability() {
        // 이미 설치되었거나 설치 배너를 닫은 경우 표시하지 않음
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
        const isBannerClosed = localStorage.getItem('installBannerClosed') === 'true';
        
        const installBanner = document.getElementById('install-banner');
        if (installBanner && (isInstalled || isBannerClosed)) {
            installBanner.classList.add('hidden');
        }
    }
    
    // 설치 배너 표시
    showInstallBanner() {
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
        const isBannerClosed = localStorage.getItem('installBannerClosed') === 'true';
        const installBanner = document.getElementById('install-banner');
        
        if (installBanner && !isInstalled && !isBannerClosed && this.deferredPrompt) {
            installBanner.classList.remove('hidden');
        }
    }
    
    // 앱 설치
    installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('사용자가 앱 설치를 수락했습니다.');
                const installBanner = document.getElementById('install-banner');
                if (installBanner) {
                    installBanner.classList.add('hidden');
                }
            }
            this.deferredPrompt = null;
        });
    }
    
    // 온라인 상태 업데이트
    updateOnlineStatus() {
        const statusEl = document.getElementById('connection-status');
        if (!statusEl) return;
        
        if (this.isOnline) {
            statusEl.textContent = '온라인';
            statusEl.classList.remove('offline');
            statusEl.classList.add('online');
        } else {
            statusEl.textContent = '오프라인';
            statusEl.classList.remove('online');
            statusEl.classList.add('offline');
        }
    }
    
    // 게임 결과 공유
    shareGameResult() {
        const result = this.gameManager.getGameResult();
        
        if (navigator.share) {
            navigator.share({
                title: '실버 맞고 게임 결과',
                text: `실버 맞고에서 ${result.isWin ? '승리' : '패배'}했습니다! 최종 점수: ${result.score}점`,
                url: window.location.href
            })
            .catch(error => console.log('공유하기 실패:', error));
        } else {
            alert('이 브라우저에서는 공유 기능을 지원하지 않습니다.');
        }
    }
    
    // 글자 크기 적용
    applyTextSize(size) {
        document.body.classList.remove('text-normal', 'text-large', 'text-extra-large');
        document.body.classList.add(`text-${size}`);
    }
    
    // 고대비 모드 적용
    applyHighContrast(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});
