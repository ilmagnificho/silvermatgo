// service-worker.js - 오프라인 지원 및 PWA 기능
const CACHE_NAME = 'silver-matgo-v1';

// 캐시할 항목 목록
const CACHE_ASSETS = [
    '/', // 기본 페이지
    '/index.html',
    '/styles.css',
    '/scripts/app.js',
    '/scripts/gameManager.js',
    '/scripts/uiManager.js',
    '/scripts/cardDeck.js',
    '/scripts/aiPlayer.js',
    '/scripts/settingsManager.js',
    '/scripts/soundManager.js',
    '/scripts/tutorialManager.js',
    '/manifest.json',
    '/offline.html',
    '/images/logo.svg',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png',
    '/images/tutorial/basic-rules.svg',
    '/images/tutorial/card-selection.svg',
    '/images/tutorial/scoring.svg',
    '/images/tutorial/special-rules.svg',
    '/sounds/card_select.mp3',
    '/sounds/card_match.mp3',
    '/sounds/card_place.mp3',
    '/sounds/go_stop.mp3',
    '/sounds/win.mp3',
    '/sounds/lose.mp3',
    '/sounds/special.mp3'
];

// 서비스 워커 설치 및 캐시 설정
self.addEventListener('install', (event) => {
    console.log('서비스 워커 설치 중...');
    
    // waitUntil()은 비동기 작업이 완료될 때까지 서비스 워커 설치 지연
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('파일 캐싱 중...');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => self.skipWaiting()) // 기존 서비스 워커 즉시 활성화
            .catch(error => console.error('캐시 실패:', error))
    );
});

// 활성화 및 이전 캐시 정리
self.addEventListener('activate', (event) => {
    console.log('서비스 워커 활성화 중...');
    
    // 이전 버전의 캐시 삭제
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('이전 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim(); // 모든 클라이언트에 대한 제어권 획득
});

// 네트워크 요청 인터셉트 및 캐시 사용
self.addEventListener('fetch', (event) => {
    // 데이터 API 또는 동적 요청은 네트워크 우선 전략 사용
    if (event.request.url.includes('/api/') || 
        event.request.method !== 'GET') {
        event.respondWith(networkFirst(event.request));
    } else {
        // 정적 리소스는 캐시 우선 전략 사용
        event.respondWith(cacheFirst(event.request));
    }
});

// 캐시 우선, 네트워크 폴백 전략
async function cacheFirst(request) {
    try {
        // 캐시에서 응답 시도
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 캐시에 없으면 네트워크 요청
        const networkResponse = await fetch(request);
        
        // 유효한 응답인 경우 캐시에 저장
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('캐시 우선 전략 실패:', error);
        
        // 오프라인 폴백 페이지 (옵션)
        if (request.mode === 'navigate') {
            const cache = await caches.open(CACHE_NAME);
            return cache.match('/offline.html');
        }
        
        return new Response('네트워크 오류 발생', { status: 408, headers: { 'Content-Type': 'text/plain' } });
    }
}

// 네트워크 우선, 캐시 폴백 전략
async function networkFirst(request) {
    try {
        // 네트워크 요청 시도
        const networkResponse = await fetch(request);
        
        // 유효한 응답인 경우 캐시에 저장
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('네트워크 우선 전략 실패:', error);
        
        // 캐시에서 폴백 응답 시도
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 오프라인 폴백 페이지 (옵션)
        if (request.mode === 'navigate') {
            const cache = await caches.open(CACHE_NAME);
            return cache.match('/offline.html');
        }
        
        return new Response('네트워크 오류 발생', { status: 408, headers: { 'Content-Type': 'text/plain' } });
    }
}
