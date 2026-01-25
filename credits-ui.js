// Credits UI Module
// 크레딧 구매 모달 및 UI 관련 기능

document.addEventListener('DOMContentLoaded', function() {
    // 크레딧 구매 모달 생성
    createCreditsModal();

    // 크레딧 표시 클릭 시 모달 열기
    const creditsDisplays = document.querySelectorAll('#creditsDisplay, .credits-display-trigger');
    creditsDisplays.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openCreditsModal();
        });
    });
});

// 모달 생성
function createCreditsModal() {
    if (document.getElementById('creditsModalOverlay')) return;

    const modalHtml = `
    <div id="creditsModalOverlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] hidden flex items-center justify-center opacity-0 transition-opacity duration-300">
        <div id="creditsModalContent" class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300 mx-4">

            <!-- Close Button -->
            <button id="closeCreditsModalBtn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
                <span class="material-symbols-outlined">close</span>
            </button>

            <!-- Header -->
            <div class="px-8 pt-8 pb-4 text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full mb-4">
                    <span class="material-symbols-outlined text-3xl text-amber-600 dark:text-amber-400">toll</span>
                </div>
                <h2 class="text-2xl font-bold mb-1">크레딧 충전</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">AI 여행 계획을 생성하려면 크레딧이 필요합니다.</p>
                <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                    <span class="text-sm text-gray-500">현재 잔액:</span>
                    <span id="modalCreditsBalance" class="text-lg font-bold text-amber-600 dark:text-amber-400">-</span>
                    <span class="text-sm text-gray-500">크레딧</span>
                </div>
            </div>

            <!-- Packages -->
            <div class="p-6">
                <div id="creditsPackagesList" class="space-y-3">
                    <div class="text-center py-8 text-gray-400">
                        <span class="material-symbols-outlined animate-spin">progress_activity</span>
                        <p class="mt-2 text-sm">패키지 로딩 중...</p>
                    </div>
                </div>

                <!-- Info -->
                <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-blue-500">info</span>
                        <div class="text-sm text-blue-700 dark:text-blue-300">
                            <p class="font-semibold mb-1">크레딧 사용 안내</p>
                            <ul class="list-disc list-inside text-xs space-y-1 text-blue-600 dark:text-blue-400">
                                <li>여행 계획 1회 생성 = 1 크레딧</li>
                                <li>크레딧은 환불되지 않습니다</li>
                                <li>결제 완료 시 즉시 충전됩니다</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 닫기 버튼 이벤트
    document.getElementById('closeCreditsModalBtn').addEventListener('click', closeCreditsModal);

    // 배경 클릭 시 닫기
    document.getElementById('creditsModalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'creditsModalOverlay') {
            closeCreditsModal();
        }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCreditsModal();
        }
    });
}

// 모달 열기
async function openCreditsModal() {
    const overlay = document.getElementById('creditsModalOverlay');
    const content = document.getElementById('creditsModalContent');

    if (!overlay) return;

    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        content.classList.remove('scale-95');
    }, 10);

    // 잔액 및 패키지 로드
    await loadCreditsModalData();
}

// 모달 닫기
function closeCreditsModal() {
    const overlay = document.getElementById('creditsModalOverlay');
    const content = document.getElementById('creditsModalContent');

    if (!overlay) return;

    overlay.classList.add('opacity-0');
    content.classList.add('scale-95');

    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

// 모달 데이터 로드
async function loadCreditsModalData() {
    const balanceEl = document.getElementById('modalCreditsBalance');
    const packagesEl = document.getElementById('creditsPackagesList');

    // 잔액 로드
    if (window.Credits) {
        const balance = await window.Credits.getCurrentBalance();
        balanceEl.textContent = balance.toLocaleString();
    }

    // 패키지 로드
    try {
        const packages = await window.Credits.getPackages();

        if (packages.length === 0) {
            packagesEl.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <span class="material-symbols-outlined">error</span>
                    <p class="mt-2 text-sm">패키지를 불러올 수 없습니다.</p>
                </div>
            `;
            return;
        }

        packagesEl.innerHTML = packages
            .filter(pkg => pkg.price > 0) // 무료 패키지 제외
            .map(pkg => createPackageCard(pkg))
            .join('');

        // 구매 버튼 이벤트 연결
        packagesEl.querySelectorAll('.purchase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const packageId = btn.dataset.packageId;
                const latpeedUrl = btn.dataset.latpeedUrl;
                handlePurchase(packageId, latpeedUrl, packages.find(p => p.id === packageId));
            });
        });

    } catch (error) {
        console.error('패키지 로드 오류:', error);
        packagesEl.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <span class="material-symbols-outlined">error</span>
                <p class="mt-2 text-sm">패키지를 불러올 수 없습니다.</p>
            </div>
        `;
    }
}

// 패키지 카드 생성
function createPackageCard(pkg) {
    const priceFormatted = pkg.price.toLocaleString();
    const pricePerCredit = Math.round(pkg.price / pkg.credits);
    const isPopular = pkg.credits === 30; // 프로 패키지를 인기 상품으로

    return `
    <div class="relative p-4 border-2 ${isPopular ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'} rounded-xl hover:border-primary transition-colors">
        ${isPopular ? '<div class="absolute -top-3 left-4 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">인기</div>' : ''}
        <div class="flex items-center justify-between">
            <div>
                <h3 class="font-bold text-lg">${pkg.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">${pkg.description || ''}</p>
                <div class="mt-1 flex items-center gap-2">
                    <span class="text-2xl font-bold text-amber-600 dark:text-amber-400">${pkg.credits}</span>
                    <span class="text-sm text-gray-500">크레딧</span>
                    <span class="text-xs text-gray-400">(개당 ${pricePerCredit}원)</span>
                </div>
            </div>
            <div class="text-right">
                <div class="text-xl font-bold">${priceFormatted}원</div>
                <button class="purchase-btn mt-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                        data-package-id="${pkg.id}"
                        data-latpeed-url="${pkg.latpeed_product_id || ''}">
                    구매하기
                </button>
            </div>
        </div>
    </div>
    `;
}

// 구매 처리
async function handlePurchase(packageId, latpeedUrl, pkg) {
    // 래피드 URL이 설정되지 않은 경우
    if (!latpeedUrl) {
        // 임시: 래피드 상품 URL 직접 입력 (나중에 DB에서 관리)
        const LATPEED_PRODUCTS = {
            // 래피드에서 상품 등록 후 URL을 여기에 추가
            // 'package-uuid': 'https://latpeed.com/products/xxx'
        };

        latpeedUrl = LATPEED_PRODUCTS[packageId];

        if (!latpeedUrl) {
            alert(`래피드 상품 URL이 설정되지 않았습니다.\n\n관리자에게 문의하거나, 래피드에서 "${pkg?.name}" 상품을 등록해주세요.`);
            return;
        }
    }

    // 현재 사용자 정보
    const session = await window.supabaseClient?.auth.getSession();
    const userId = session?.data?.session?.user?.id;
    const userEmail = session?.data?.session?.user?.email;

    if (!userId) {
        alert('로그인이 필요합니다.');
        closeCreditsModal();
        if (window.openAuthModal) window.openAuthModal();
        return;
    }

    // 래피드 결제 페이지로 이동
    const purchaseUrl = new URL(latpeedUrl);
    purchaseUrl.searchParams.set('user_id', userId);
    if (userEmail) {
        purchaseUrl.searchParams.set('email', userEmail);
    }

    window.open(purchaseUrl.toString(), '_blank');

    // 결제 완료 안내
    alert('결제 페이지가 새 창에서 열렸습니다.\n결제 완료 후 자동으로 크레딧이 충전됩니다.');
}

// 전역으로 노출
window.openCreditsModal = openCreditsModal;
window.closeCreditsModal = closeCreditsModal;

console.log('✅ Credits UI module loaded');
