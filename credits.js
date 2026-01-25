// Credits Module
// AI Travel Planner - 크레딧 시스템 관련 함수

// API 베이스 URL
const getApiBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://${window.location.host}`;
    }
    return 'https://ai-travel-planner-ivory-nu.vercel.app';
};

// 인증 토큰 가져오기
const getAuthToken = async () => {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    return session?.access_token || null;
};

const Credits = {
    // 현재 크레딧 잔액 (캐시)
    _balance: null,
    _lastFetched: null,
    _cacheTimeout: 30000, // 30초 캐시

    /**
     * 크레딧 잔액 조회
     * @param {boolean} forceRefresh - 캐시 무시하고 새로 조회
     * @returns {Promise<{balance: number, total_purchased: number, total_used: number} | null>}
     */
    async getBalance(forceRefresh = false) {
        // 캐시 확인
        if (!forceRefresh && this._balance !== null && this._lastFetched) {
            const elapsed = Date.now() - this._lastFetched;
            if (elapsed < this._cacheTimeout) {
                return this._balance;
            }
        }

        try {
            const token = await getAuthToken();
            if (!token) {
                console.log('ℹ️ 로그인되지 않음 - 크레딧 조회 스킵');
                return null;
            }

            const response = await fetch(`${getApiBaseUrl()}/api/credits?action=balance`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || '크레딧 조회 실패');
            }

            this._balance = result.data;
            this._lastFetched = Date.now();

            return result.data;
        } catch (error) {
            console.error('크레딧 조회 오류:', error);
            return null;
        }
    },

    /**
     * 현재 잔액만 반환 (숫자)
     * @returns {Promise<number>}
     */
    async getCurrentBalance() {
        const data = await this.getBalance();
        return data?.balance || 0;
    },

    /**
     * 크레딧 거래 내역 조회
     * @param {number} limit - 조회 개수
     * @returns {Promise<Array>}
     */
    async getTransactions(limit = 20) {
        try {
            const token = await getAuthToken();
            if (!token) return [];

            const response = await fetch(
                `${getApiBaseUrl()}/api/credits?action=transactions&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || '거래 내역 조회 실패');
            }

            return result.data.transactions;
        } catch (error) {
            console.error('거래 내역 조회 오류:', error);
            return [];
        }
    },

    /**
     * 크레딧 패키지 목록 조회 (인증 불필요)
     * @returns {Promise<Array>}
     */
    async getPackages() {
        try {
            const response = await fetch(`${getApiBaseUrl()}/api/credits?action=packages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || '패키지 조회 실패');
            }

            return result.data.packages;
        } catch (error) {
            console.error('패키지 조회 오류:', error);
            return [];
        }
    },

    /**
     * 크레딧 충분한지 확인
     * @param {number} required - 필요한 크레딧 양
     * @returns {Promise<boolean>}
     */
    async hasEnoughCredits(required = 1) {
        const balance = await this.getCurrentBalance();
        return balance >= required;
    },

    /**
     * 래피드 결제 페이지로 이동
     * @param {string} packageId - 패키지 ID
     * @param {string} latpeedProductUrl - 래피드 상품 URL
     */
    async purchaseCredits(packageId, latpeedProductUrl) {
        if (!latpeedProductUrl) {
            console.error('래피드 상품 URL이 설정되지 않았습니다.');
            alert('결제 페이지를 불러올 수 없습니다. 관리자에게 문의하세요.');
            return;
        }

        // 현재 사용자 ID를 URL 파라미터로 전달
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        const userId = session?.user?.id;
        const userEmail = session?.user?.email;

        // 래피드 결제 페이지로 이동 (custom_fields로 user_id 전달)
        const purchaseUrl = new URL(latpeedProductUrl);
        if (userId) {
            purchaseUrl.searchParams.set('user_id', userId);
        }
        if (userEmail) {
            purchaseUrl.searchParams.set('email', userEmail);
        }

        window.open(purchaseUrl.toString(), '_blank');
    },

    /**
     * 캐시 초기화
     */
    clearCache() {
        this._balance = null;
        this._lastFetched = null;
    },

    /**
     * 잔액 업데이트 (API 응답에서 새 잔액 받았을 때)
     * @param {number} newBalance - 새 잔액
     */
    updateBalance(newBalance) {
        if (this._balance) {
            this._balance.balance = newBalance;
        } else {
            this._balance = { balance: newBalance, total_purchased: 0, total_used: 0 };
        }
        this._lastFetched = Date.now();
    }
};

// Credits를 전역으로 노출
window.Credits = Credits;

console.log('✅ Credits module loaded');
