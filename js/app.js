/**
 * VivuPlan - Core Application Controller
 * Quản lý trạng thái, Render Dashboard, Chi tiết Lộ trình, Modal, Budget & LocalStorage
 */

const App = (function () {
    // State của ứng dụng
    const STORAGE_KEY = 'vivuplan_trips_data';
    const STORAGE_USERS_KEY = 'vivuplan_users_data';
    const STORAGE_CURRENT_USER_KEY = 'vivuplan_current_user';
    let trips = [];
    let users = [];
    let currentUser = null;
    let dashboardFilter = 'all'; // 'all' hoặc 'my'
    let currentTripId = null;
    let currentDayIndex = 0;

    // DOM Elements
    const elements = {};

    // Khởi tạo ứng dụng
    function init() {
        cacheDomElements();
        loadUsersFromStorage();
        loadCurrentUserFromStorage();
        loadTripsFromStorage();
        bindEvents();
        renderAuthUI();

        // Mặc định mở dashboard hoặc chuyến đi đầu tiên nếu có hash
        const urlParams = new URLSearchParams(window.location.search);
        const tripParam = urlParams.get('trip');

        if (tripParam && trips.some(t => t.id === tripParam)) {
            openTripDetail(tripParam);
        } else {
            showDashboard();
        }

        // Tạo icon Lucide
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // Cache các element DOM thường dùng
    function cacheDomElements() {
        elements.navLogo = document.getElementById('navLogo');
        elements.btnNavHome = document.getElementById('btnNavHome');
        elements.btnOpenAIModal = document.getElementById('btnOpenAIModal');
        elements.btnNewTrip = document.getElementById('btnNewTrip');
        elements.btnHeroAI = document.getElementById('btnHeroAI');
        elements.btnHeroNew = document.getElementById('btnHeroNew');
        elements.btnMoreOptions = document.getElementById('btnMoreOptions');
        elements.dropdownMenu = document.getElementById('dropdownMenu');
        elements.btnExportData = document.getElementById('btnExportData');
        elements.fileImportInput = document.getElementById('fileImportInput');
        elements.btnResetDemoData = document.getElementById('btnResetDemoData');

        elements.viewDashboard = document.getElementById('viewDashboard');
        elements.viewTripDetail = document.getElementById('viewTripDetail');
        elements.tripsGrid = document.getElementById('tripsGrid');
        elements.inputSearchTrips = document.getElementById('inputSearchTrips');

        // Stats
        elements.statTotalTrips = document.getElementById('statTotalTrips');
        elements.statTotalPlaces = document.getElementById('statTotalPlaces');
        elements.statTotalDays = document.getElementById('statTotalDays');
        elements.statTotalBudget = document.getElementById('statTotalBudget');
        elements.badgeTripCount = document.getElementById('badgeTripCount');

        // Detail View elements
        elements.btnBackToDashboard = document.getElementById('btnBackToDashboard');
        elements.btnEditCurrentTrip = document.getElementById('btnEditCurrentTrip');
        elements.btnPrintItinerary = document.getElementById('btnPrintItinerary');
        elements.detailCoverImage = document.getElementById('detailCoverImage');
        elements.detailTitle = document.getElementById('detailTitle');
        elements.detailDestination = document.getElementById('detailDestination');
        elements.detailDates = document.getElementById('detailDates');
        elements.detailDurationBadge = document.getElementById('detailDurationBadge');
        elements.detailDesc = document.getElementById('detailDesc');

        // Day elements
        elements.dayTabsContainer = document.getElementById('dayTabsContainer');
        elements.btnAddDay = document.getElementById('btnAddDay');
        elements.btnDeleteCurrentDay = document.getElementById('btnDeleteCurrentDay');
        elements.currentDayTitle = document.getElementById('currentDayTitle');
        elements.currentDayDateText = document.getElementById('currentDayDateText');
        elements.currentDayActivitiesCount = document.getElementById('currentDayActivitiesCount');
        elements.currentDayCostTotal = document.getElementById('currentDayCostTotal');
        elements.activitiesTimelineList = document.getElementById('activitiesTimelineList');
        elements.btnOpenAddActivityModal = document.getElementById('btnOpenAddActivityModal');

        // Widgets
        elements.budgetPercentText = document.getElementById('budgetPercentText');
        elements.budgetProgressBar = document.getElementById('budgetProgressBar');
        elements.budgetUsedText = document.getElementById('budgetUsedText');
        elements.budgetTotalText = document.getElementById('budgetTotalText');
        elements.budgetCategoryBadges = document.getElementById('budgetCategoryBadges');

        elements.widgetWeatherBox = document.getElementById('widgetWeatherBox');
        elements.weatherTempBadge = document.getElementById('weatherTempBadge');
        elements.weatherNoteText = document.getElementById('weatherNoteText');

        elements.packingCountText = document.getElementById('packingCountText');
        elements.packingListContainer = document.getElementById('packingListContainer');
        elements.inputNewPackingItem = document.getElementById('inputNewPackingItem');
        elements.btnQuickAddPacking = document.getElementById('btnQuickAddPacking');

        // Routing Distance & Travel Time & Gantt
        elements.currentDayDistanceText = document.getElementById('currentDayDistanceText');
        elements.currentDayTravelText = document.getElementById('currentDayTravelText');
        elements.btnViewTimeline = document.getElementById('btnViewTimeline');
        elements.btnViewGantt = document.getElementById('btnViewGantt');
        elements.ganttChartContainer = document.getElementById('ganttChartContainer');
        elements.ganttTimelineCanvas = document.getElementById('ganttTimelineCanvas');
        elements.dragDropHintBanner = document.getElementById('dragDropHintBanner');

        // AI Constraints & Modals
        elements.modalAI = document.getElementById('modalAI');
        elements.formAIGenerate = document.getElementById('formAIGenerate');
        elements.aiSelectStartPoint = document.getElementById('aiSelectStartPoint');
        elements.aiCustomStartWrapper = document.getElementById('aiCustomStartWrapper');
        elements.aiCustomStartInput = document.getElementById('aiCustomStartInput');
        elements.aiSelectDestination = document.getElementById('aiSelectDestination');
        elements.aiCustomDestWrapper = document.getElementById('aiCustomDestWrapper');
        elements.aiCustomDestInput = document.getElementById('aiCustomDestInput');
        elements.aiSelectSeason = document.getElementById('aiSelectSeason');
        elements.aiSliderNature = document.getElementById('aiSliderNature');
        elements.aiSliderHistory = document.getElementById('aiSliderHistory');
        elements.aiSliderFood = document.getElementById('aiSliderFood');
        elements.aiSliderCheckin = document.getElementById('aiSliderCheckin');
        elements.labelWeightNature = document.getElementById('labelWeightNature');
        elements.labelWeightHistory = document.getElementById('labelWeightHistory');
        elements.labelWeightFood = document.getElementById('labelWeightFood');
        elements.labelWeightCheckin = document.getElementById('labelWeightCheckin');
        elements.btnPresetPromptStyle = document.getElementById('btnPresetPromptStyle');

        // AI Loading Modal
        elements.modalAILoading = document.getElementById('modalAILoading');
        elements.aiLiveTerminalLogs = document.getElementById('aiLiveTerminalLogs');

        elements.modalTrip = document.getElementById('modalTrip');
        elements.formTrip = document.getElementById('formTrip');

        elements.modalActivity = document.getElementById('modalActivity');
        elements.formActivity = document.getElementById('formActivity');
        elements.btnPickOnMap = document.getElementById('btnPickOnMap');

        // Google Maps Controls
        elements.btnOpenGoogleDirections = document.getElementById('btnOpenGoogleDirections');
        elements.mapTypeSwitcher = document.getElementById('mapTypeSwitcher');

        // Authentication & User Profile Elements
        elements.authContainer = document.getElementById('authContainer');
        elements.authLoggedOutView = document.getElementById('authLoggedOutView');
        elements.authLoggedInView = document.getElementById('authLoggedInView');
        elements.btnOpenAuthModal = document.getElementById('btnOpenAuthModal');
        elements.btnUserMenu = document.getElementById('btnUserMenu');
        elements.userDropdownMenu = document.getElementById('userDropdownMenu');
        elements.userAvatarImg = document.getElementById('userAvatarImg');
        elements.userDisplayName = document.getElementById('userDisplayName');
        elements.userMenuAvatar = document.getElementById('userMenuAvatar');
        elements.userMenuName = document.getElementById('userMenuName');
        elements.userMenuEmail = document.getElementById('userMenuEmail');
        elements.userStyleBadge = document.getElementById('userStyleBadge');
        elements.btnMenuMyTrips = document.getElementById('btnMenuMyTrips');
        elements.btnMenuAllTrips = document.getElementById('btnMenuAllTrips');
        elements.btnLogout = document.getElementById('btnLogout');
        elements.btnMenuAdmin = document.getElementById('btnMenuAdmin');

        // Modal Auth
        elements.modalAuth = document.getElementById('modalAuth');
        elements.tabBtnLogin = document.getElementById('tabBtnLogin');
        elements.tabBtnRegister = document.getElementById('tabBtnRegister');
        elements.formLogin = document.getElementById('formLogin');
        elements.formRegister = document.getElementById('formRegister');
        elements.loginEmail = document.getElementById('loginEmail');
        elements.loginPassword = document.getElementById('loginPassword');
        elements.btnToggleLoginPassword = document.getElementById('btnToggleLoginPassword');
        elements.loginRememberMe = document.getElementById('loginRememberMe');
        elements.btnQuickDemoAdmin = document.getElementById('btnQuickDemoAdmin');
        elements.btnQuickDemoUser = document.getElementById('btnQuickDemoUser');
        elements.btnSwitchToRegister = document.getElementById('btnSwitchToRegister');
        elements.btnSwitchToLogin = document.getElementById('btnSwitchToLogin');
        elements.btnForgotPwd = document.getElementById('btnForgotPwd');

        elements.regFullName = document.getElementById('regFullName');
        elements.regEmail = document.getElementById('regEmail');
        elements.regPassword = document.getElementById('regPassword');
        elements.regPasswordConfirm = document.getElementById('regPasswordConfirm');
        elements.regPreferredStyle = document.getElementById('regPreferredStyle');

        // Dashboard Filter Tabs
        elements.btnFilterAllTrips = document.getElementById('btnFilterAllTrips');
        elements.btnFilterMyTrips = document.getElementById('btnFilterMyTrips');
        elements.tripsSectionTitle = document.getElementById('tripsSectionTitle');
    }

    // Đọc danh sách người dùng từ LocalStorage
    function loadUsersFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_USERS_KEY);
            if (saved) {
                users = JSON.parse(saved);
            } else {
                users = typeof INITIAL_USERS !== 'undefined' ? [...INITIAL_USERS] : [];
                saveUsersToStorage();
            }
        } catch (e) {
            console.error('Lỗi khi đọc users từ LocalStorage:', e);
            users = typeof INITIAL_USERS !== 'undefined' ? [...INITIAL_USERS] : [];
        }
    }

    // Lưu danh sách người dùng vào LocalStorage
    function saveUsersToStorage() {
        try {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        } catch (e) {
            console.error('Lỗi khi lưu users vào LocalStorage:', e);
        }
    }

    // Đọc thông tin người dùng đang đăng nhập từ LocalStorage
    function loadCurrentUserFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
            if (saved) {
                currentUser = JSON.parse(saved);
            } else {
                currentUser = null;
            }
        } catch (e) {
            console.error('Lỗi khi đọc current user:', e);
            currentUser = null;
        }
    }

    // Lưu thông tin người dùng đang đăng nhập vào LocalStorage
    function saveCurrentUserToStorage(user) {
        try {
            if (user) {
                localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
            } else {
                localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
            }
        } catch (e) {
            console.error('Lỗi khi lưu current user:', e);
        }
    }

    // Đọc dữ liệu từ LocalStorage
    function loadTripsFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                trips = JSON.parse(saved);
            } else {
                trips = [...INITIAL_TRIPS];
                saveTripsToStorage();
            }
        } catch (e) {
            console.error('Lỗi khi đọc LocalStorage:', e);
            trips = [...INITIAL_TRIPS];
        }
    }

    // Ghi dữ liệu vào LocalStorage
    function saveTripsToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
            Api.scheduleSync(trips, currentUser);
        } catch (e) {
            console.error('Lỗi khi lưu LocalStorage:', e);
            showToast('Không thể lưu vào bộ nhớ trình duyệt', 'error');
        }
    }

    // Gắn sự kiện (Event Listeners)
    function bindEvents() {
        // Điều hướng Dashboard / Home
        elements.navLogo.addEventListener('click', showDashboard);
        elements.btnNavHome.addEventListener('click', showDashboard);
        elements.btnBackToDashboard.addEventListener('click', showDashboard);

        // Nút mở Modal AI
        elements.btnOpenAIModal.addEventListener('click', () => openAIModal());
        elements.btnHeroAI.addEventListener('click', () => openAIModal());

        // Nút mở Modal Tạo chuyến đi mới
        elements.btnNewTrip.addEventListener('click', () => openTripModal());
        elements.btnHeroNew.addEventListener('click', () => openTripModal());
        elements.btnEditCurrentTrip.addEventListener('click', () => {
            const current = getCurrentTrip();
            if (current) openTripModal(current);
        });

        // Dropdown menu
        elements.btnMoreOptions.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.dropdownMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            elements.dropdownMenu.classList.add('hidden');
        });

        // Export JSON
        elements.btnExportData.addEventListener('click', exportTripsToJson);

        // Import JSON
        elements.fileImportInput.addEventListener('change', handleImportJson);

        // Reset Demo Data
        elements.btnResetDemoData.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn khôi phục 3 chuyến đi mẫu ban đầu? Các thay đổi tùy chỉnh sẽ được thiết lập lại.')) {
                trips = JSON.parse(JSON.stringify(INITIAL_TRIPS));
                saveTripsToStorage();
                showDashboard();
                showToast('Đã khôi phục dữ liệu chuyến đi mẫu!', 'success');
            }
        });

        // Tìm kiếm chuyến đi
        elements.inputSearchTrips.addEventListener('input', (e) => {
            renderTripsGrid(e.target.value.trim().toLowerCase());
        });

        // In hoặc lưu PDF
        elements.btnPrintItinerary.addEventListener('click', () => {
            window.print();
        });

        // Thêm ngày & Xóa ngày
        elements.btnAddDay.addEventListener('click', handleAddNewDay);
        elements.btnDeleteCurrentDay.addEventListener('click', handleDeleteCurrentDay);

        // Thêm điểm đến mới
        elements.btnOpenAddActivityModal.addEventListener('click', () => openActivityModal());

        // Chọn tọa độ từ bản đồ
        elements.btnPickOnMap.addEventListener('click', startMapLocationPicker);

        // Chuyển đổi lớp bản đồ Google Maps (Đường phố, Vệ tinh, Địa hình)
        if (elements.mapTypeSwitcher) {
            elements.mapTypeSwitcher.querySelectorAll('.map-type-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const layerKey = btn.getAttribute('data-layer');
                    MapModule.setMapType(layerKey);

                    elements.mapTypeSwitcher.querySelectorAll('.map-type-btn').forEach(b => {
                        b.classList.remove('active', 'bg-white', 'text-sky-700', 'shadow-xs');
                        b.classList.add('text-slate-600');
                    });
                    btn.classList.add('active', 'bg-white', 'text-sky-700', 'shadow-xs');
                    btn.classList.remove('text-slate-600');
                });
            });
        }

        // Packing Checklist
        elements.btnQuickAddPacking.addEventListener('click', handleAddPackingItem);
        elements.inputNewPackingItem.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddPackingItem();
        });

        // Xử lý chọn Điểm xuất phát (Start Point)
        if (elements.aiSelectStartPoint) {
            elements.aiSelectStartPoint.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    elements.aiCustomStartWrapper.classList.remove('hidden');
                    elements.aiCustomStartInput.required = true;
                } else {
                    elements.aiCustomStartWrapper.classList.add('hidden');
                    elements.aiCustomStartInput.required = false;
                }
            });
        }

        // Cập nhật giá trị hiển thị % cho 4 thanh trượt phong cách du lịch
        const setupSlider = (slider, label) => {
            if (slider && label) {
                slider.addEventListener('input', () => {
                    label.textContent = `${slider.value}%`;
                });
            }
        };
        setupSlider(elements.aiSliderNature, elements.labelWeightNature);
        setupSlider(elements.aiSliderHistory, elements.labelWeightHistory);
        setupSlider(elements.aiSliderFood, elements.labelWeightFood);
        setupSlider(elements.aiSliderCheckin, elements.labelWeightCheckin);

        // Nút bấm mẫu nhanh: "70% Nghỉ dưỡng/Thiên nhiên, 30% Lịch sử/Văn hóa"
        if (elements.btnPresetPromptStyle) {
            elements.btnPresetPromptStyle.addEventListener('click', () => {
                if (elements.aiSliderNature) elements.aiSliderNature.value = 70;
                if (elements.aiSliderHistory) elements.aiSliderHistory.value = 30;
                if (elements.aiSliderFood) elements.aiSliderFood.value = 35;
                if (elements.aiSliderCheckin) elements.aiSliderCheckin.value = 45;
                if (elements.labelWeightNature) elements.labelWeightNature.textContent = '70%';
                if (elements.labelWeightHistory) elements.labelWeightHistory.textContent = '30%';
                if (elements.labelWeightFood) elements.labelWeightFood.textContent = '35%';
                if (elements.labelWeightCheckin) elements.labelWeightCheckin.textContent = '45%';
                showToast('✨ Đã áp dụng mẫu: 70% Thiên nhiên, 30% Lịch sử!', 'info');
            });
        }

        // Các nút chọn nhanh ngân sách
        document.querySelectorAll('.btn-budget-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const b = btn.getAttribute('data-budget');
                if (document.getElementById('aiInputBudget')) {
                    document.getElementById('aiInputBudget').value = b;
                }
            });
        });

        // Bộ chuyển đổi chế độ xem: Timeline vs Gantt Chart
        if (elements.btnViewTimeline && elements.btnViewGantt) {
            elements.btnViewTimeline.addEventListener('click', () => {
                elements.btnViewTimeline.classList.add('bg-white', 'text-sky-700', 'shadow-xs');
                elements.btnViewTimeline.classList.remove('text-slate-600');
                elements.btnViewGantt.classList.remove('bg-white', 'text-sky-700', 'shadow-xs');
                elements.btnViewGantt.classList.add('text-slate-600');

                elements.activitiesTimelineList.classList.remove('hidden');
                if (elements.dragDropHintBanner) elements.dragDropHintBanner.classList.remove('hidden');
                if (elements.ganttChartContainer) elements.ganttChartContainer.classList.add('hidden');
            });

            elements.btnViewGantt.addEventListener('click', () => {
                elements.btnViewGantt.classList.add('bg-white', 'text-sky-700', 'shadow-xs');
                elements.btnViewGantt.classList.remove('text-slate-600');
                elements.btnViewTimeline.classList.remove('bg-white', 'text-sky-700', 'shadow-xs');
                elements.btnViewTimeline.classList.add('text-slate-600');

                elements.activitiesTimelineList.classList.add('hidden');
                if (elements.dragDropHintBanner) elements.dragDropHintBanner.classList.add('hidden');
                if (elements.ganttChartContainer) elements.ganttChartContainer.classList.remove('hidden');
                renderGanttChart();
            });
        }

        // AI Destination Select change
        elements.aiSelectDestination.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                elements.aiCustomDestWrapper.classList.remove('hidden');
                elements.aiCustomDestInput.required = true;
            } else {
                elements.aiCustomDestWrapper.classList.add('hidden');
                elements.aiCustomDestInput.required = false;
            }
        });

        // Form Submit: AI Generator
        elements.formAIGenerate.addEventListener('submit', handleAISubmit);

        // Form Submit: Trip (Create / Edit)
        elements.formTrip.addEventListener('submit', handleTripFormSubmit);

        // Form Submit: Activity (Create / Edit)
        elements.formActivity.addEventListener('submit', handleActivityFormSubmit);

        // ================= AUTHENTICATION EVENTS =================
        if (elements.btnOpenAuthModal) {
            elements.btnOpenAuthModal.addEventListener('click', () => openAuthModal('login'));
        }

        if (elements.btnUserMenu) {
            elements.btnUserMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                if (elements.userDropdownMenu) {
                    elements.userDropdownMenu.classList.toggle('hidden');
                }
            });
        }

        document.addEventListener('click', () => {
            if (elements.userDropdownMenu) {
                elements.userDropdownMenu.classList.add('hidden');
            }
        });

        if (elements.tabBtnLogin) {
            elements.tabBtnLogin.addEventListener('click', () => switchAuthTab('login'));
        }
        if (elements.tabBtnRegister) {
            elements.tabBtnRegister.addEventListener('click', () => switchAuthTab('register'));
        }
        if (elements.btnSwitchToRegister) {
            elements.btnSwitchToRegister.addEventListener('click', () => switchAuthTab('register'));
        }
        if (elements.btnSwitchToLogin) {
            elements.btnSwitchToLogin.addEventListener('click', () => switchAuthTab('login'));
        }

        if (elements.btnToggleLoginPassword) {
            elements.btnToggleLoginPassword.addEventListener('click', togglePasswordVisibility);
        }

        if (elements.btnQuickDemoAdmin) {
            elements.btnQuickDemoAdmin.addEventListener('click', () => handleQuickDemoLogin('admin@vivuplan.vn'));
        }
        if (elements.btnQuickDemoUser) {
            elements.btnQuickDemoUser.addEventListener('click', () => handleQuickDemoLogin('long@vivuplan.vn'));
        }

        if (elements.formLogin) {
            elements.formLogin.addEventListener('submit', handleLoginSubmit);
        }
        if (elements.formRegister) {
            elements.formRegister.addEventListener('submit', handleRegisterSubmit);
        }

        if (elements.btnLogout) {
            elements.btnLogout.addEventListener('click', handleLogout);
        }

        if (elements.btnForgotPwd) {
            elements.btnForgotPwd.addEventListener('click', () => {
                showToast('Mật khẩu mẫu của các tài khoản là: 123456. Bạn có thể dùng nút Đăng nhập nhanh!', 'info');
            });
        }

        // Dashboard Tabs Lọc (Tất cả vs Của tôi)
        if (elements.btnFilterAllTrips) {
            elements.btnFilterAllTrips.addEventListener('click', () => setDashboardFilter('all'));
        }
        if (elements.btnFilterMyTrips) {
            elements.btnFilterMyTrips.addEventListener('click', () => {
                if (!currentUser) {
                    openAuthModal('login');
                    showToast('Vui lòng đăng nhập để xem lịch trình của riêng bạn!', 'info');
                    return;
                }
                setDashboardFilter('my');
            });
        }
        if (elements.btnMenuMyTrips) {
            elements.btnMenuMyTrips.addEventListener('click', () => {
                setDashboardFilter('my');
                showDashboard();
                if (elements.userDropdownMenu) elements.userDropdownMenu.classList.add('hidden');
            });
        }
        if (elements.btnMenuAllTrips) {
            elements.btnMenuAllTrips.addEventListener('click', () => {
                setDashboardFilter('all');
                showDashboard();
                if (elements.userDropdownMenu) elements.userDropdownMenu.classList.add('hidden');
            });
        }

        // Đóng các Modal khi click nút X hoặc bên ngoài
        document.querySelectorAll('.modal-close-btn, .auth-modal-close-btn').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeAllModals();
            });
        });
    }

    // ================= AUTHENTICATION LOGIC =================

    // Render trạng thái giao diện theo Người dùng (Đăng nhập / Chưa đăng nhập)
    function renderAuthUI() {
        if (!elements.authLoggedOutView || !elements.authLoggedInView) return;

        if (currentUser) {
            elements.authLoggedOutView.classList.add('hidden');
            elements.authLoggedInView.classList.remove('hidden');

            const avatarUrl = currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
            if (elements.userAvatarImg) elements.userAvatarImg.src = avatarUrl;
            if (elements.userMenuAvatar) elements.userMenuAvatar.src = avatarUrl;
            if (elements.userDisplayName) elements.userDisplayName.textContent = currentUser.fullName.split(' ').pop();
            if (elements.userMenuName) elements.userMenuName.textContent = currentUser.fullName;
            if (elements.userMenuEmail) elements.userMenuEmail.textContent = currentUser.email;

            if (elements.userStyleBadge) {
                elements.userStyleBadge.textContent = currentUser.preferredStyleLabel || '🏞️ Nghỉ dưỡng';
            }
        } else {
            elements.authLoggedOutView.classList.remove('hidden');
            elements.authLoggedInView.classList.add('hidden');
            if (dashboardFilter === 'my') {
                dashboardFilter = 'all';
            }
        }
        if (elements.btnMenuAdmin) elements.btnMenuAdmin.classList.toggle('hidden', !(currentUser && currentUser.isAdmin));

        updateDashboardFilterUI();
        if (window.lucide) lucide.createIcons();
    }

    // Thiết lập bộ lọc danh sách chuyến đi trên Dashboard (all hoặc my)
    function setDashboardFilter(filter) {
        dashboardFilter = filter;
        updateDashboardFilterUI();
        renderTripsGrid(elements.inputSearchTrips ? elements.inputSearchTrips.value.trim().toLowerCase() : '');
    }

    // Cập nhật trạng thái nút bấm Tabs lọc trên Dashboard
    function updateDashboardFilterUI() {
        if (!elements.btnFilterAllTrips || !elements.btnFilterMyTrips) return;

        if (dashboardFilter === 'all') {
            elements.btnFilterAllTrips.className = 'px-3 py-1.5 rounded-lg bg-white text-sky-700 shadow-sm transition-all flex items-center gap-1.5 font-bold';
            elements.btnFilterMyTrips.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 transition-all flex items-center gap-1.5 font-medium';
            if (elements.tripsSectionTitle) elements.tripsSectionTitle.textContent = 'Tất cả lịch trình';
        } else {
            elements.btnFilterMyTrips.className = 'px-3 py-1.5 rounded-lg bg-white text-sky-700 shadow-sm transition-all flex items-center gap-1.5 font-bold';
            elements.btnFilterAllTrips.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 transition-all flex items-center gap-1.5 font-medium';
            if (elements.tripsSectionTitle) {
                elements.tripsSectionTitle.textContent = currentUser ? `Lịch trình của ${currentUser.fullName}` : 'Chuyến đi của tôi';
            }
        }
    }

    // Mở Modal Xác thực (Đăng nhập hoặc Đăng ký)
    function openAuthModal(initialTab = 'login') {
        if (!elements.modalAuth) return;
        elements.modalAuth.classList.remove('modal-hidden');
        switchAuthTab(initialTab);
        if (window.lucide) lucide.createIcons();
    }

    // Chuyển đổi qua lại giữa Tab Đăng nhập và Tab Đăng ký
    function switchAuthTab(tab) {
        if (!elements.tabBtnLogin || !elements.tabBtnRegister) return;

        const titleEl = document.getElementById('authModalTitle');
        const subTitleEl = document.getElementById('authModalSubtitle');

        if (tab === 'login') {
            elements.tabBtnLogin.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-white bg-white/20 shadow-sm flex items-center justify-center gap-1.5';
            elements.tabBtnRegister.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-sky-100 hover:text-white flex items-center justify-center gap-1.5';
            if (elements.formLogin) elements.formLogin.classList.remove('hidden');
            if (elements.formRegister) elements.formRegister.classList.add('hidden');
            if (titleEl) titleEl.textContent = 'Chào mừng trở lại VivuPlan';
            if (subTitleEl) subTitleEl.textContent = 'Đăng nhập để đồng bộ và quản lý chuyến đi của bạn';
            if (elements.loginEmail) elements.loginEmail.focus();
        } else {
            elements.tabBtnRegister.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-white bg-white/20 shadow-sm flex items-center justify-center gap-1.5';
            elements.tabBtnLogin.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-sky-100 hover:text-white flex items-center justify-center gap-1.5';
            if (elements.formLogin) elements.formLogin.classList.add('hidden');
            if (elements.formRegister) elements.formRegister.classList.remove('hidden');
            if (titleEl) titleEl.textContent = 'Tạo tài khoản VivuPlan';
            if (subTitleEl) subTitleEl.textContent = 'Trải nghiệm lập lộ trình thông minh và lưu trữ không giới hạn';
            if (elements.regFullName) elements.regFullName.focus();
        }
        if (window.lucide) lucide.createIcons();
    }

    // Ẩn / Hiện mật khẩu
    function togglePasswordVisibility() {
        if (!elements.loginPassword) return;
        const isPassword = elements.loginPassword.type === 'password';
        elements.loginPassword.type = isPassword ? 'text' : 'password';
        if (elements.btnToggleLoginPassword) {
            elements.btnToggleLoginPassword.innerHTML = isPassword ? '<i data-lucide="eye-off" class="w-4 h-4"></i>' : '<i data-lucide="eye" class="w-4 h-4"></i>';
            if (window.lucide) lucide.createIcons();
        }
    }

    // Đăng nhập lên SQL Server để có phiên làm việc (admin mới vào được trang quản trị)
    function syncLogin(user, password) {
        Api.ensureLogin(user, password).then(res => {
            if (!res || !currentUser || currentUser.email !== user.email) return;
            currentUser.isAdmin = (res.role === 'admin');
            saveCurrentUserToStorage(currentUser);
            renderAuthUI();
            Api.scheduleSync(trips, currentUser);
        });
    }

    // Xử lý Submit Form Đăng nhập
    function handleLoginSubmit(e) {
        e.preventDefault();
        const email = elements.loginEmail.value.trim().toLowerCase();
        const password = elements.loginPassword.value;

        const foundUser = users.find(u => u.email.toLowerCase() === email && u.password === password);

        if (foundUser) {
            currentUser = foundUser;
            saveCurrentUserToStorage(currentUser);
            renderAuthUI();
            closeAllModals();
            showToast(`👋 Chào mừng ${currentUser.fullName} đã đăng nhập thành công!`, 'success');
            syncLogin(currentUser, password);
            renderTripsGrid(elements.inputSearchTrips ? elements.inputSearchTrips.value.trim().toLowerCase() : '');
        } else {
            showToast('Email hoặc mật khẩu không chính xác! (Mật khẩu mẫu: 123456)', 'error');
        }
    }

    // Xử lý Đăng nhập nhanh tài khoản thử nghiệm
    function handleQuickDemoLogin(email) {
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
            currentUser = foundUser;
            saveCurrentUserToStorage(currentUser);
            renderAuthUI();
            closeAllModals();
            showToast(`⚡ Đăng nhập thành công với tài khoản ${currentUser.fullName}!`, 'success');
            syncLogin(currentUser, '123456');
            renderTripsGrid(elements.inputSearchTrips ? elements.inputSearchTrips.value.trim().toLowerCase() : '');
        } else {
            showToast('Không tìm thấy tài khoản mẫu này.', 'error');
        }
    }

    // Xử lý Submit Form Đăng ký tài khoản mới
    function handleRegisterSubmit(e) {
        e.preventDefault();
        const fullName = elements.regFullName.value.trim();
        const email = elements.regEmail.value.trim().toLowerCase();
        const password = elements.regPassword.value;
        const passwordConfirm = elements.regPasswordConfirm.value;
        const preferredStyle = elements.regPreferredStyle.value;

        if (!fullName) {
            showToast('Vui lòng nhập họ và tên!', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Mật khẩu phải chứa ít nhất 6 ký tự!', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            showToast('Mật khẩu xác nhận không trùng khớp!', 'error');
            return;
        }

        // Kiểm tra trùng email
        if (users.some(u => u.email.toLowerCase() === email)) {
            showToast('Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác!', 'error');
            return;
        }

        const styleMap = {
            nature: '🏞️ Nghỉ dưỡng & Thiên nhiên',
            history: '🏛️ Di tích & Lịch sử',
            cuisine: '🍲 Ẩm thực & Đặc sản',
            adventure: '🏄 Khám phá & Check-in'
        };

        const newUser = {
            id: 'user-' + Date.now(),
            fullName: fullName,
            email: email,
            password: password,
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
            role: 'Thành viên VivuPlan',
            preferredStyle: preferredStyle,
            preferredStyleLabel: styleMap[preferredStyle] || 'Du lịch',
            bio: 'Thành viên mới của cộng đồng du lịch VivuPlan.',
            createdAt: new Date().toISOString().split('T')[0]
        };

        users.push(newUser);
        saveUsersToStorage();

        // Tự động đăng nhập luôn sau khi đăng ký
        currentUser = newUser;
        saveCurrentUserToStorage(currentUser);

        renderAuthUI();
        closeAllModals();

        if (window.confetti) {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }

        showToast(`🎉 Chúc mừng ${fullName}! Tài khoản đã được tạo và kích hoạt thành công.`, 'success');
        syncLogin(newUser, password);
        renderTripsGrid(elements.inputSearchTrips ? elements.inputSearchTrips.value.trim().toLowerCase() : '');
    }

    // Xử lý Đăng xuất
    function handleLogout() {
        Api.logout();
        currentUser = null;
        saveCurrentUserToStorage(null);
        dashboardFilter = 'all';
        if (elements.userDropdownMenu) {
            elements.userDropdownMenu.classList.add('hidden');
        }
        renderAuthUI();
        showToast('Bạn đã đăng xuất tài khoản an toàn.', 'info');
        showDashboard();
    }

    // Lấy thông tin chuyến đi hiện tại
    function getCurrentTrip() {
        return trips.find(t => t.id === currentTripId) || null;
    }

    // Hiển thị màn hình Dashboard
    function showDashboard() {
        currentTripId = null;
        elements.viewDashboard.classList.remove('hidden');
        elements.viewTripDetail.classList.add('hidden');
        elements.btnNavHome.classList.add('hidden');

        // Cập nhật lại URL không có query param
        window.history.replaceState({}, document.title, window.location.pathname);

        updateDashboardStats();
        renderTripsGrid();

        if (window.lucide) lucide.createIcons();
    }

    // Cập nhật thống kê Dashboard
    function updateDashboardStats() {
        const totalTrips = trips.length;
        let totalPlaces = 0;
        let totalDays = 0;
        let totalBudget = 0;

        trips.forEach(t => {
            totalBudget += (t.budget || 0);
            if (t.days) {
                totalDays += t.days.length;
                t.days.forEach(d => {
                    if (d.activities) totalPlaces += d.activities.length;
                });
            }
        });

        elements.statTotalTrips.textContent = totalTrips;
        elements.statTotalPlaces.textContent = totalPlaces;
        elements.statTotalDays.textContent = totalDays;
        elements.statTotalBudget.textContent = totalBudget.toLocaleString('vi-VN') + ' đ';
        elements.badgeTripCount.textContent = totalTrips;
    }

    // Render danh sách chuyến đi ra Grid
    function renderTripsGrid(filterText = '') {
        elements.tripsGrid.innerHTML = '';

        const filtered = trips.filter(t => {
            // Lọc theo người dùng nếu đang ở tab "Của tôi"
            if (dashboardFilter === 'my' && currentUser) {
                if (t.userId !== currentUser.id) return false;
            }

            if (!filterText) return true;
            return t.title.toLowerCase().includes(filterText) ||
                   t.destination.toLowerCase().includes(filterText);
        });

        // Cập nhật số lượng hiển thị trên badge
        if (elements.badgeTripCount) {
            elements.badgeTripCount.textContent = filtered.length;
        }

        if (filtered.length === 0) {
            const isMyTab = (dashboardFilter === 'my');
            const emptyTitle = isMyTab ? 'Bạn chưa có chuyến đi nào riêng' : 'Không tìm thấy chuyến đi nào';
            const emptyDesc = isMyTab 
                ? 'Hãy tự tạo kế hoạch mới hoặc dùng tính năng AI Tạo Lịch Trình để thêm chuyến đi vào tài khoản của bạn!' 
                : 'Hãy thử tìm từ khóa khác hoặc bấm nút "Tạo chuyến mới" để bắt đầu chuyến đi tuyệt vời.';

            elements.tripsGrid.innerHTML = `
                <div class="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
                    <div class="w-16 h-16 mx-auto rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
                        <i data-lucide="compass" class="w-8 h-8"></i>
                    </div>
                    <p class="text-base font-bold text-slate-700">${emptyTitle}</p>
                    <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">${emptyDesc}</p>
                    <div class="flex items-center justify-center gap-3 pt-2">
                        <button type="button" id="btnEmptyCreateTrip" class="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-all flex items-center gap-1.5 active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Tạo chuyến mới
                        </button>
                        <button type="button" id="btnEmptyAITrip" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-1.5 active:scale-95">
                            <i data-lucide="sparkles" class="w-4 h-4"></i> AI Gợi ý
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('btnEmptyCreateTrip')?.addEventListener('click', () => openTripModal());
            document.getElementById('btnEmptyAITrip')?.addEventListener('click', () => openAIModal());
            if (window.lucide) lucide.createIcons();
            return;
        }

        filtered.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1';

            const daysCount = trip.days ? trip.days.length : 0;
            const nightsCount = daysCount > 1 ? daysCount - 1 : 0;
            const durationLabel = `${daysCount}N${nightsCount}Đ`;

            let placesCount = 0;
            let totalSpent = 0;
            if (trip.days) {
                trip.days.forEach(d => {
                    if (d.activities) {
                        placesCount += d.activities.length;
                        d.activities.forEach(a => totalSpent += (a.cost || 0));
                    }
                });
            }

            const cover = trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
            const creator = users.find(u => u.id === trip.userId);
            const isOwner = currentUser && trip.userId === currentUser.id;

            card.innerHTML = `
                <div class="relative h-48 w-full overflow-hidden cursor-pointer" data-action="view" data-id="${trip.id}">
                    <img src="${cover}" alt="${trip.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    
                    <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
                        ${durationLabel}
                    </span>

                    <div class="absolute bottom-3 left-4 right-4 text-white">
                        <span class="text-xs text-amber-300 font-semibold flex items-center gap-1">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${trip.destination}
                        </span>
                        <h3 class="text-lg font-bold truncate mt-0.5 leading-snug">${trip.title}</h3>
                    </div>
                </div>

                <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-xs text-slate-500">
                            <span class="flex items-center gap-1">
                                <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i> ${formatDateRange(trip.startDate, trip.endDate)}
                            </span>
                            <span class="font-semibold text-slate-700">${placesCount} địa điểm</span>
                        </div>
                        <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${trip.description || 'Chưa có mô tả chi tiết cho chuyến đi này.'}</p>
                    </div>

                    <!-- Creator Info Pill & Ownership -->
                    <div class="flex items-center justify-between pt-1">
                        <div class="flex items-center gap-1.5">
                            <img src="${creator ? creator.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}" class="w-5 h-5 rounded-full object-cover border border-slate-200">
                            <span class="text-[11px] font-semibold text-slate-600 truncate max-w-[140px]">${creator ? creator.fullName : 'Thành viên'}</span>
                        </div>
                        ${isOwner ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1"><i data-lucide="check" class="w-2.5 h-2.5"></i> Của bạn</span>' : ''}
                    </div>

                    <div class="pt-3 border-t border-slate-100 space-y-3">
                        <div class="flex items-center justify-between text-xs">
                            <span class="text-slate-400">Ngân sách:</span>
                            <span class="font-bold text-slate-800">${(trip.budget || 0).toLocaleString('vi-VN')} đ</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <button class="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                    data-action="view" data-id="${trip.id}">
                                <i data-lucide="compass" class="w-3.5 h-3.5"></i> Xem lộ trình
                            </button>
                            <button class="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors" 
                                    title="Chỉnh sửa chuyến đi" data-action="edit" data-id="${trip.id}">
                                <i data-lucide="edit-2" class="w-4 h-4"></i>
                            </button>
                            <button class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" 
                                    title="Xóa chuyến đi" data-action="delete" data-id="${trip.id}">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Gắn event cho card
            card.querySelectorAll('[data-action="view"]').forEach(el => {
                el.addEventListener('click', () => openTripDetail(trip.id));
            });

            card.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
                e.stopPropagation();
                openTripModal(trip);
            });

            card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Bạn có chắc chắn muốn xóa chuyến đi "${trip.title}" không?`)) {
                    trips = trips.filter(t => t.id !== trip.id);
                    Api.deleteTrip(trip.id);
                    saveTripsToStorage();
                    updateDashboardStats();
                    renderTripsGrid(elements.inputSearchTrips.value.trim().toLowerCase());
                    showToast('Đã xóa chuyến đi thành công', 'info');
                }
            });

            elements.tripsGrid.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();
    }

    // Mở màn hình Chi tiết chuyến đi
    function openTripDetail(tripId) {
        currentTripId = tripId;
        currentDayIndex = 0;
        const trip = getCurrentTrip();

        if (!trip) {
            showDashboard();
            return;
        }

        elements.viewDashboard.classList.add('hidden');
        elements.viewTripDetail.classList.remove('hidden');
        elements.btnNavHome.classList.remove('hidden');

        // Cuộn lên đầu trang
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Cập nhật banner
        elements.detailCoverImage.src = trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
        elements.detailTitle.textContent = trip.title;
        elements.detailDestination.textContent = trip.destination;
        elements.detailDates.textContent = formatDateRange(trip.startDate, trip.endDate);
        elements.detailDesc.textContent = trip.description || 'Chuyến đi khám phá trải nghiệm đáng nhớ.';

        const daysCount = trip.days ? trip.days.length : 1;
        elements.detailDurationBadge.textContent = `${daysCount}N${daysCount > 1 ? daysCount - 1 : 1}Đ`;

        // Khởi tạo hoặc cập nhật bản đồ Leaflet
        const destKey = trip.destinationKey;
        const knownDest = POPULAR_DESTINATIONS[destKey];
        const center = knownDest ? knownDest.center : [16.0544, 108.2022];
        const zoom = knownDest ? knownDest.zoom : 12;

        MapModule.initMap('tripMap', center, zoom);

        // Render Tabs và nội dung ngày
        renderDayTabs();
        renderCurrentDayContent();
        renderWidgets();

        if (window.lucide) lucide.createIcons();
    }

    // Render danh sách các Tab Ngày
    function renderDayTabs() {
        const trip = getCurrentTrip();
        if (!trip || !trip.days) return;

        elements.dayTabsContainer.innerHTML = '';

        trip.days.forEach((day, index) => {
            const btn = document.createElement('button');
            const isActive = index === currentDayIndex;

            btn.className = `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`;

            btn.innerHTML = `
                <span>Ngày ${day.dayNumber}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}">
                    ${day.activities ? day.activities.length : 0}
                </span>
            `;

            btn.addEventListener('click', () => {
                currentDayIndex = index;
                renderDayTabs();
                renderCurrentDayContent();
            });

            elements.dayTabsContainer.appendChild(btn);
        });
    }

    // Render nội dung Ngày đang chọn (Timeline & Map)
    function renderCurrentDayContent() {
        const trip = getCurrentTrip();
        if (!trip || !trip.days || !trip.days[currentDayIndex]) return;

        const currentDay = trip.days[currentDayIndex];
        const activities = currentDay.activities || [];

        // Tiêu đề & tóm tắt ngày
        elements.currentDayTitle.textContent = `Ngày ${currentDay.dayNumber}: ${currentDay.title || 'Lộ trình khám phá'}`;
        elements.currentDayDateText.textContent = formatDate(currentDay.date);
        elements.currentDayActivitiesCount.textContent = `${activities.length} điểm đến trong ngày`;

        // Tính chi phí ngày này
        const dayCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);
        elements.currentDayCostTotal.textContent = dayCost.toLocaleString('vi-VN') + ' đ';

        // Cập nhật khoảng cách & thời gian di chuyển trong ngày
        if (elements.currentDayDistanceText) {
            elements.currentDayDistanceText.textContent = `${currentDay.totalDistanceKm || 0} km`;
        }
        if (elements.currentDayTravelText) {
            elements.currentDayTravelText.textContent = `${currentDay.totalTravelMinutes || 0} phút`;
        }

        // Render danh sách Timeline cards
        elements.activitiesTimelineList.innerHTML = '';

        if (activities.length === 0) {
            elements.activitiesTimelineList.innerHTML = `
                <div class="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                    <i data-lucide="map-pin-off" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
                    <p class="text-sm font-semibold text-slate-600">Chưa có điểm dừng nào trong ngày này</p>
                    <p class="text-xs text-slate-400 mt-1">Bấm nút "Thêm điểm đến vào ngày này" bên dưới để bắt đầu lên lịch trình.</p>
                </div>
            `;
        } else {
            activities.forEach((act, idx) => {
                const cat = CATEGORIES[act.category] || CATEGORIES.sightseeing;
                const orderNum = idx + 1;

                const card = document.createElement('div');
                card.id = `act-card-${act.id}`;
                card.setAttribute('data-id', act.id);
                card.className = 'timeline-item bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm transition-all hover:shadow-md hover:border-sky-300';

                card.innerHTML = `
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-2.5">
                            <!-- Drag Handle -->
                            <div class="drag-handle p-1.5 text-slate-300 hover:text-sky-600 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors" title="Kéo thả để đổi thứ tự">
                                <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                            </div>

                            <!-- Order Badge -->
                            <div class="w-10 h-10 rounded-xl text-white font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm text-sm"
                                 style="background-color: ${cat.color};">
                                ${orderNum}
                            </div>

                            <div class="space-y-1">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i> ${act.time || 'Linh hoạt'}
                                    </span>
                                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cat.badgeClass}">
                                        ${cat.label}
                                    </span>
                                    ${act.distanceFromPrevKm ? `
                                        <span class="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60 flex items-center gap-1" title="Khoảng cách từ điểm trước">
                                            <i data-lucide="car" class="w-3 h-3 text-sky-500"></i> ${act.distanceFromPrevKm} km (~${act.travelMinutesFromPrev}p)
                                        </span>
                                    ` : ''}
                                    ${act.cost ? `<span class="text-xs font-bold text-emerald-600">💰 ${act.cost.toLocaleString('vi-VN')} đ</span>` : ''}
                                </div>
                                <h4 class="text-sm font-bold text-slate-800 leading-snug">${act.title}</h4>
                                ${act.address ? `<p class="text-xs text-slate-500 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i> ${act.address}</p>` : ''}
                                ${act.note ? `<div class="mt-2 text-xs text-slate-600 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 flex items-start gap-1.5"><i data-lucide="lightbulb" class="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5"></i> <span>${act.note}</span></div>` : ''}
                            </div>
                        </div>

                        <!-- Card Action Buttons -->
                        <div class="flex items-center gap-1 flex-shrink-0 no-print">
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title + ' ' + (act.address || ''))}${act.lat && act.lng ? `+${act.lat},${act.lng}` : ''}" 
                               target="_blank" rel="noopener noreferrer" 
                               class="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" 
                               title="Mở địa điểm này trên Google Maps">
                                <i data-lucide="map-pin" class="w-4 h-4"></i>
                            </a>
                            ${act.lat && act.lng ? `
                                <button class="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Xem trên bản đồ" data-action="locate" data-id="${act.id}">
                                    <i data-lucide="navigation" class="w-4 h-4"></i>
                                </button>
                            ` : ''}
                            <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Di chuyển lên" data-action="up" data-id="${act.id}">
                                <i data-lucide="chevron-up" class="w-4 h-4"></i>
                            </button>
                            <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Di chuyển xuống" data-action="down" data-id="${act.id}">
                                <i data-lucide="chevron-down" class="w-4 h-4"></i>
                            </button>
                            <button class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa" data-action="edit" data-id="${act.id}">
                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                            </button>
                            <button class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa" data-action="delete" data-id="${act.id}">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                `;

                // Gắn sự kiện các nút
                const btnLocate = card.querySelector('[data-action="locate"]');
                if (btnLocate) {
                    btnLocate.addEventListener('click', () => {
                        MapModule.focusLocation(act.lat, act.lng);
                    });
                }

                card.querySelector('[data-action="up"]').addEventListener('click', () => moveActivity(idx, -1));
                card.querySelector('[data-action="down"]').addEventListener('click', () => moveActivity(idx, 1));
                card.querySelector('[data-action="edit"]').addEventListener('click', () => openActivityModal(act));
                card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteActivity(act.id));

                elements.activitiesTimelineList.appendChild(card);
            });
        }

        // Kích hoạt Sortable Drag & Drop
        initSortableTimeline();

        // Render Gantt chart nếu đang mở
        renderGanttChart();

        // Cập nhật nút chỉ đường lộ trình trên Google Maps
        if (elements.btnOpenGoogleDirections) {
            elements.btnOpenGoogleDirections.href = MapModule.getGoogleMapsDirectionsUrl(activities);
        }

        // Render điểm đến trên Map
        const destKey = trip.destinationKey;
        const knownDest = POPULAR_DESTINATIONS[destKey];
        const center = knownDest ? knownDest.center : [16.0544, 108.2022];
        MapModule.renderActivitiesOnMap(activities, center);

        if (window.lucide) lucide.createIcons();
    }

    // Di chuyển thứ tự địa điểm lên hoặc xuống
    function moveActivity(index, direction) {
        const trip = getCurrentTrip();
        const activities = trip.days[currentDayIndex].activities;
        const newIndex = index + direction;

        if (newIndex >= 0 && newIndex < activities.length) {
            const temp = activities[index];
            activities[index] = activities[newIndex];
            activities[newIndex] = temp;

            saveTripsToStorage();
            renderCurrentDayContent();
            showToast('Đã đổi thứ tự điểm đến', 'info');
        }
    }

    // Xóa một địa điểm
    function deleteActivity(actId) {
        if (confirm('Bạn có chắc muốn xóa điểm dừng này?')) {
            const trip = getCurrentTrip();
            trip.days[currentDayIndex].activities = trip.days[currentDayIndex].activities.filter(a => a.id !== actId);

            saveTripsToStorage();
            renderCurrentDayContent();
            renderWidgets();
            showToast('Đã xóa điểm dừng', 'info');
        }
    }

    // Render các widget bên cột phải: Weather, Budget Tracker, Packing List
    function renderWidgets() {
        const trip = getCurrentTrip();
        if (!trip) return;

        // 1. Weather Widget
        const knownDest = POPULAR_DESTINATIONS[trip.destinationKey];
        if (knownDest && knownDest.weather) {
            elements.widgetWeatherBox.classList.remove('hidden');
            elements.weatherTempBadge.textContent = knownDest.weather.temp;
            elements.weatherNoteText.textContent = knownDest.weather.note;
        } else {
            elements.weatherTempBadge.textContent = '26°C';
            elements.weatherNoteText.textContent = `Thời tiết tại ${trip.destination} rất thuận lợi để trải nghiệm các hoạt động du lịch.`;
        }

        // 2. Budget Tracker
        let totalCost = 0;
        const categorySpend = {};

        if (trip.days) {
            trip.days.forEach(d => {
                if (d.activities) {
                    d.activities.forEach(a => {
                        const cost = a.cost || 0;
                        totalCost += cost;
                        const catKey = a.category || 'other';
                        categorySpend[catKey] = (categorySpend[catKey] || 0) + cost;
                    });
                }
            });
        }

        const budget = trip.budget || 0;
        const percent = budget > 0 ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0;

        elements.budgetUsedText.textContent = totalCost.toLocaleString('vi-VN') + ' đ';
        elements.budgetTotalText.textContent = budget.toLocaleString('vi-VN') + ' đ';
        elements.budgetPercentText.textContent = `${percent}%`;
        elements.budgetProgressBar.style.width = `${percent}%`;

        // Màu thanh tiến độ
        if (percent > 100) {
            elements.budgetProgressBar.className = 'bg-rose-500 h-full rounded-full transition-all duration-500';
            elements.budgetPercentText.className = 'text-xs font-bold text-rose-600';
        } else if (percent > 80) {
            elements.budgetProgressBar.className = 'bg-amber-500 h-full rounded-full transition-all duration-500';
            elements.budgetPercentText.className = 'text-xs font-bold text-amber-600';
        } else {
            elements.budgetProgressBar.className = 'bg-emerald-500 h-full rounded-full transition-all duration-500';
            elements.budgetPercentText.className = 'text-xs font-bold text-emerald-600';
        }

        // Phân bổ danh mục chi tiêu
        elements.budgetCategoryBadges.innerHTML = '';
        Object.keys(categorySpend).forEach(catId => {
            const cat = CATEGORIES[catId] || { label: 'Khác', color: '#64748b' };
            const amount = categorySpend[catId];
            const badge = document.createElement('span');
            badge.className = 'px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium';
            badge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full mr-1" style="background-color: ${cat.color}"></span>${cat.label}: <b>${amount.toLocaleString('vi-VN')} đ</b>`;
            elements.budgetCategoryBadges.appendChild(badge);
        });

        // 3. Packing List
        renderPackingList();
    }

    // Render Packing Checklist
    function renderPackingList() {
        const trip = getCurrentTrip();
        if (!trip) return;

        if (!trip.packingList) trip.packingList = [];

        const items = trip.packingList;
        const doneCount = items.filter(i => i.done).length;
        elements.packingCountText.textContent = `${doneCount}/${items.length}`;

        elements.packingListContainer.innerHTML = '';

        if (items.length === 0) {
            elements.packingListContainer.innerHTML = `<p class="text-xs text-slate-400 italic">Chưa có món đồ nào được ghi vào checklist.</p>`;
            return;
        }

        items.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 group';

            div.innerHTML = `
                <label class="flex items-center gap-2 cursor-pointer flex-1">
                    <input type="checkbox" ${item.done ? 'checked' : ''} class="rounded text-sky-600 focus:ring-sky-500">
                    <span class="${item.done ? 'line-through text-slate-400' : 'text-slate-700'}">${item.text}</span>
                </label>
                <button class="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-opacity" title="Xóa">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
            `;

            // Checkbox change
            div.querySelector('input').addEventListener('change', (e) => {
                item.done = e.target.checked;
                saveTripsToStorage();
                renderPackingList();
            });

            // Delete item
            div.querySelector('button').addEventListener('click', () => {
                trip.packingList.splice(idx, 1);
                saveTripsToStorage();
                renderPackingList();
            });

            elements.packingListContainer.appendChild(div);
        });

        if (window.lucide) lucide.createIcons();
    }

    // Thêm món đồ vào Packing Checklist
    function handleAddPackingItem() {
        const text = elements.inputNewPackingItem.value.trim();
        if (!text) return;

        const trip = getCurrentTrip();
        if (!trip) return;

        if (!trip.packingList) trip.packingList = [];
        trip.packingList.push({
            id: 'p-' + Date.now(),
            text: text,
            done: false
        });

        elements.inputNewPackingItem.value = '';
        saveTripsToStorage();
        renderPackingList();
        showToast('Đã thêm vào checklist hành lý', 'success');
    }

    // Thêm ngày mới vào chuyến đi
    function handleAddNewDay() {
        const trip = getCurrentTrip();
        if (!trip) return;

        const days = trip.days || [];
        const nextDayNum = days.length + 1;

        // Tính ngày tiếp theo
        let nextDateStr = new Date().toISOString().split('T')[0];
        if (days.length > 0) {
            const lastDay = days[days.length - 1];
            const d = new Date(lastDay.date || trip.startDate);
            d.setDate(d.getDate() + 1);
            nextDateStr = d.toISOString().split('T')[0];
        }

        days.push({
            dayNumber: nextDayNum,
            date: nextDateStr,
            title: `Trải nghiệm ngày ${nextDayNum}`,
            activities: []
        });

        trip.days = days;
        saveTripsToStorage();
        currentDayIndex = days.length - 1;
        renderDayTabs();
        renderCurrentDayContent();
        showToast(`Đã thêm Ngày ${nextDayNum} vào lộ trình!`, 'success');
    }

    // Xóa ngày hiện tại
    function handleDeleteCurrentDay() {
        const trip = getCurrentTrip();
        if (!trip || !trip.days || trip.days.length <= 1) {
            showToast('Chuyến đi phải có ít nhất 1 ngày!', 'error');
            return;
        }

        if (confirm(`Bạn có chắc muốn xóa Ngày ${currentDayIndex + 1}? Mọi điểm đến trong ngày này sẽ bị mất.`)) {
            trip.days.splice(currentDayIndex, 1);

            // Đánh lại số thứ tự ngày
            trip.days.forEach((d, idx) => {
                d.dayNumber = idx + 1;
            });

            if (currentDayIndex >= trip.days.length) {
                currentDayIndex = trip.days.length - 1;
            }

            saveTripsToStorage();
            renderDayTabs();
            renderCurrentDayContent();
            renderWidgets();
            showToast('Đã xóa ngày thành công', 'info');
        }
    }

    // ================= MODAL HANDLERS =================

    // Mở Modal AI
    function openAIModal() {
        elements.modalAI.classList.remove('modal-hidden');
        // Mặc định ngày khởi hành là tuần sau
        const d = new Date();
        d.setDate(d.getDate() + 7);
        document.getElementById('aiInputStartDate').value = d.toISOString().split('T')[0];
        if (window.lucide) lucide.createIcons();
    }

    // ================= DRAG & DROP & GANTT CHART =================

    let sortableTimeline = null;
    function initSortableTimeline() {
        const list = document.getElementById('activitiesTimelineList');
        if (!list || typeof Sortable === 'undefined') return;

        if (sortableTimeline) {
            sortableTimeline.destroy();
            sortableTimeline = null;
        }

        sortableTimeline = new Sortable(list, {
            animation: 200,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: function (evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex === newIndex) return;

                const trip = getCurrentTrip();
                if (!trip || !trip.days || !trip.days[currentDayIndex]) return;

                const activities = trip.days[currentDayIndex].activities;
                const movedItem = activities.splice(oldIndex, 1)[0];
                activities.splice(newIndex, 0, movedItem);

                // Tự động tính toán lại thời gian & quãng đường sau khi kéo thả đổi chỗ
                const startCoord = (currentDayIndex === 0 && trip.startCoords) ? trip.startCoords : null;
                AIEngine.recalculateDaySchedule(trip.days[currentDayIndex], startCoord);

                saveTripsToStorage();
                renderCurrentDayContent();
                renderWidgets();
                showToast('⚡ Đã đổi chỗ điểm đến! Tự động tính toán lại thời gian & lộ trình.', 'success');
            }
        });
    }

    // Render biểu đồ Gantt Chart phân bổ thời gian
    function renderGanttChart() {
        const canvas = document.getElementById('ganttTimelineCanvas');
        if (!canvas) return;

        const trip = getCurrentTrip();
        if (!trip || !trip.days || !trip.days[currentDayIndex]) return;

        const activities = trip.days[currentDayIndex].activities || [];
        canvas.innerHTML = '';

        if (activities.length === 0) {
            canvas.innerHTML = `<p class="text-xs text-slate-400 italic py-4 text-center">Chưa có hoạt động nào trong ngày này để hiển thị Gantt chart.</p>`;
            return;
        }

        // Khoảng thời gian từ 07:00 (420p) đến 22:00 (1320p)
        const startM = 7 * 60;
        const endM = 22 * 60;
        const totalM = endM - startM;

        // Header timeline các mốc giờ
        const header = document.createElement('div');
        header.className = 'border-b border-slate-200 pb-1 text-[10px] text-slate-400 font-bold';
        header.style.display = 'grid';
        header.style.gridTemplateColumns = 'repeat(15, 1fr)';
        for (let h = 7; h <= 21; h++) {
            const d = document.createElement('div');
            d.className = 'text-center border-r border-slate-100 last:border-0';
            d.textContent = `${h}:00`;
            header.appendChild(d);
        }
        canvas.appendChild(header);

        // Render từng hoạt động thành thanh ngang
        activities.forEach((act, idx) => {
            const cat = CATEGORIES[act.category] || CATEGORIES.sightseeing;
            const row = document.createElement('div');
            row.className = 'relative h-10 w-full bg-slate-50/80 rounded-xl overflow-hidden flex items-center p-1 border border-slate-100';

            let sMin = act.startMinutes || (480 + idx * 120);
            let eMin = act.endMinutes || (sMin + (act.durationMinutes || 90));

            const leftPercent = Math.max(0, Math.min(100, ((sMin - startM) / totalM) * 100));
            const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((eMin - sMin) / totalM) * 100));

            const bar = document.createElement('div');
            bar.className = 'gantt-block absolute h-8 rounded-lg flex items-center px-2.5 text-white font-bold text-xs truncate shadow-xs';
            bar.style.left = `${leftPercent}%`;
            bar.style.width = `${widthPercent}%`;
            bar.style.backgroundColor = cat.color;
            bar.title = `${act.time}: ${act.title}`;

            bar.innerHTML = `
                <span class="mr-1.5 opacity-90 text-[10px]">#${idx + 1}</span>
                <span class="truncate">${act.title}</span>
                <span class="ml-auto text-[10px] font-normal opacity-90 pl-1 hidden sm:inline">(${act.durationMinutes || 90}p)</span>
            `;

            row.appendChild(bar);
            canvas.appendChild(row);
        });
    }

    // ================= MODAL HANDLERS =================

    // Mở Modal AI
    function openAIModal() {
        elements.modalAI.classList.remove('modal-hidden');
        // Mặc định ngày khởi hành là tuần sau
        const d = new Date();
        d.setDate(d.getDate() + 7);
        document.getElementById('aiInputStartDate').value = d.toISOString().split('T')[0];
        if (window.lucide) lucide.createIcons();
    }

    // Xử lý tạo lộ trình AI với 4 giai đoạn và màn hình chờ Loading
    function handleAISubmit(e) {
        e.preventDefault();

        const startPointId = elements.aiSelectStartPoint ? elements.aiSelectStartPoint.value : 'vinh_station';
        const customStartName = elements.aiCustomStartInput ? elements.aiCustomStartInput.value.trim() : '';
        const destKey = elements.aiSelectDestination ? elements.aiSelectDestination.value : 'nghean';
        const daysCount = parseInt(document.getElementById('aiSelectDays').value) || 3;
        const maxBudget = parseInt(document.getElementById('aiInputBudget').value) || 3000000;
        const season = elements.aiSelectSeason ? elements.aiSelectSeason.value : 'summer';
        const startDate = document.getElementById('aiInputStartDate').value;

        const styleWeights = {
            natureRelax: parseInt(elements.aiSliderNature ? elements.aiSliderNature.value : 70) || 70,
            historyCulture: parseInt(elements.aiSliderHistory ? elements.aiSliderHistory.value : 30) || 30,
            foodie: parseInt(elements.aiSliderFood ? elements.aiSliderFood.value : 35) || 35,
            checkin: parseInt(elements.aiSliderCheckin ? elements.aiSliderCheckin.value : 45) || 45
        };

        // Đóng modal Bước 1 và mở modal Bước 2: Hệ thống xử lý (Loading Stage)
        elements.modalAI.classList.add('modal-hidden');
        if (elements.modalAILoading) elements.modalAILoading.classList.remove('modal-hidden');

        // Helper cập nhật trạng thái các giai đoạn
        const resetStage = (id, text) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.className = 'stage-item flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all';
            const icon = el.querySelector('.stage-icon');
            if (icon) {
                icon.className = 'stage-icon w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs';
                icon.textContent = id.replace('stageItem', '');
            }
            const status = el.querySelector('.stage-status');
            if (status) {
                status.className = 'stage-status text-[10px] text-slate-400 font-semibold';
                status.textContent = text || 'Chờ xử lý';
            }
        };

        const setStageRunning = (id, logMsg) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.className = 'stage-item flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 transition-all animate-pulse';
            const icon = el.querySelector('.stage-icon');
            if (icon) {
                icon.className = 'stage-icon w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs';
                icon.innerHTML = '<span class="inline-block animate-spin">⟳</span>';
            }
            const status = el.querySelector('.stage-status');
            if (status) {
                status.className = 'stage-status text-[10px] text-amber-600 font-bold';
                status.textContent = 'Đang tính toán...';
            }
            addTerminalLog(logMsg);
        };

        const setStageDone = (id, statusText, logMsg) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.className = 'stage-item flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 transition-all';
            const icon = el.querySelector('.stage-icon');
            if (icon) {
                icon.className = 'stage-icon w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs';
                icon.innerHTML = '✓';
            }
            const status = el.querySelector('.stage-status');
            if (status) {
                status.className = 'stage-status text-[10px] text-emerald-600 font-bold';
                status.textContent = statusText || 'Hoàn tất';
            }
            if (logMsg) addTerminalLog(logMsg);
        };

        const addTerminalLog = (msg) => {
            if (elements.aiLiveTerminalLogs) {
                const line = document.createElement('div');
                line.textContent = `> ${msg}`;
                elements.aiLiveTerminalLogs.appendChild(line);
                elements.aiLiveTerminalLogs.scrollTop = elements.aiLiveTerminalLogs.scrollHeight;
            }
        };

        if (elements.aiLiveTerminalLogs) elements.aiLiveTerminalLogs.innerHTML = '';
        resetStage('stageItem1');
        resetStage('stageItem2');
        resetStage('stageItem3');
        resetStage('stageItem4');

        // Thực thi mô phỏng tuần tự 4 giai đoạn với AI Engine thực tế
        setStageRunning('stageItem1', `Khởi động Giai đoạn 1: Lọc dữ liệu thô (Filtering). Ngân sách: ${maxBudget.toLocaleString('vi-VN')} đ, mùa: ${season}...`);

        setTimeout(() => {
            setStageDone('stageItem1', 'Hoàn tất lọc thô', `Đã loại bỏ resort 5 sao đắt đỏ và điều chỉnh trọng số mùa ${season}.`);
            setStageRunning('stageItem2', `Khởi động Giai đoạn 2: Phân cụm không gian K-Means với K = ${daysCount} ngày...`);

            setTimeout(() => {
                setStageDone('stageItem2', `Gom xong ${daysCount} cụm`, `K-Means gom thành ${daysCount} cụm địa lý, triệt tiêu việc chạy ngược chiều.`);
                setStageRunning('stageItem3', `Khởi động Giai đoạn 3: Xếp hạng cá nhân hóa (Collaborative Filtering) theo tỷ lệ ${styleWeights.natureRelax}% Thiên nhiên, ${styleWeights.historyCulture}% Lịch sử...`);

                setTimeout(() => {
                    setStageDone('stageItem3', 'Xếp hạng hoàn tất', `Lọc cộng tác tính điểm vector phong cách & rating thành công.`);
                    setStageRunning('stageItem4', `Khởi động Giai đoạn 4: Giải bài toán TSP tìm đường ngắn nhất & ma trận khoảng cách...`);

                    setTimeout(() => {
                        setStageDone('stageItem4', 'Tối ưu lộ trình xong', `Đã tối ưu ma trận khoảng cách và sắp xếp khung giờ chuẩn xác.`);

                        // Chạy thuật toán tối ưu hóa tổng hợp
                        const newTrip = AIEngine.runCompleteAIOptimization({
                            startPointId,
                            customStartName,
                            destinationKey: destKey,
                            daysCount,
                            maxBudget,
                            styleWeights,
                            season,
                            startDate
                        });

                        setTimeout(() => {
                            newTrip.userId = currentUser ? currentUser.id : 'user-admin';
                            trips.unshift(newTrip);
                            saveTripsToStorage();

                            if (elements.modalAILoading) {
                                elements.modalAILoading.classList.add('modal-hidden');
                            }

                            if (window.confetti) {
                                confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
                            }

                            showToast('✨ Lộ trình du lịch AI tối ưu đã sẵn sàng!', 'success');
                            openTripDetail(newTrip.id);
                        }, 500);

                    }, 600);
                }, 600);
            }, 600);
        }, 600);
    }

    // Mở Modal Chuyến đi (Tạo mới / Sửa)
    function openTripModal(tripToEdit = null) {
        elements.modalTrip.classList.remove('modal-hidden');

        const titleEl = document.getElementById('modalTripHeaderTitle');
        const idInput = document.getElementById('inputTripId');
        const titleInput = document.getElementById('inputTripTitle');
        const destInput = document.getElementById('inputTripDest');
        const startInput = document.getElementById('inputTripStartDate');
        const endInput = document.getElementById('inputTripEndDate');
        const budgetInput = document.getElementById('inputTripBudget');
        const coverInput = document.getElementById('inputTripCoverImage');
        const descInput = document.getElementById('inputTripDescription');

        if (tripToEdit) {
            titleEl.textContent = 'Chỉnh Sửa Chuyến Đi';
            idInput.value = tripToEdit.id;
            titleInput.value = tripToEdit.title;
            destInput.value = tripToEdit.destination;
            startInput.value = tripToEdit.startDate;
            endInput.value = tripToEdit.endDate;
            budgetInput.value = tripToEdit.budget || '';
            coverInput.value = tripToEdit.coverImage || '';
            descInput.value = tripToEdit.description || '';
        } else {
            titleEl.textContent = 'Tạo Chuyến Đi Mới';
            idInput.value = '';
            titleInput.value = '';
            destInput.value = '';
            const today = new Date();
            startInput.value = today.toISOString().split('T')[0];
            const next3Days = new Date();
            next3Days.setDate(today.getDate() + 2);
            endInput.value = next3Days.toISOString().split('T')[0];
            budgetInput.value = '3000000';
            coverInput.value = '';
            descInput.value = '';
        }

        if (window.lucide) lucide.createIcons();
    }

    // Submit lưu chuyến đi
    function handleTripFormSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('inputTripId').value;
        const title = document.getElementById('inputTripTitle').value.trim();
        const dest = document.getElementById('inputTripDest').value.trim();
        const start = document.getElementById('inputTripStartDate').value;
        const end = document.getElementById('inputTripEndDate').value;
        const budget = parseInt(document.getElementById('inputTripBudget').value) || 0;
        let cover = document.getElementById('inputTripCoverImage').value.trim();
        const desc = document.getElementById('inputTripDescription').value.trim();

        if (!cover) {
            cover = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
        }

        if (id) {
            // Sửa
            const trip = trips.find(t => t.id === id);
            if (trip) {
                trip.title = title;
                trip.destination = dest;
                trip.startDate = start;
                trip.endDate = end;
                trip.budget = budget;
                trip.coverImage = cover;
                trip.description = desc;
                saveTripsToStorage();
                showToast('Đã cập nhật thông tin chuyến đi', 'success');
                if (currentTripId === id) openTripDetail(id);
                else showDashboard();
            }
        } else {
            // Tạo mới
            const newTripId = 'trip-' + Date.now();
            const newTrip = {
                id: newTripId,
                userId: currentUser ? currentUser.id : 'user-admin',
                title: title,
                destination: dest,
                destinationKey: 'custom',
                startDate: start,
                endDate: end,
                budget: budget,
                coverImage: cover,
                description: desc,
                packingList: [
                    { id: 'p1', text: 'CCCD / Hộ chiếu bản gốc', done: true },
                    { id: 'p2', text: 'Sạc điện thoại & sạc dự phòng', done: false },
                    { id: 'p3', text: 'Trang phục & đồ vệ sinh cá nhân', done: false }
                ],
                days: [
                    {
                        dayNumber: 1,
                        date: start,
                        title: 'Khởi hành & Nhận phòng',
                        activities: []
                    }
                ]
            };

            trips.unshift(newTrip);
            saveTripsToStorage();
            showToast('Đã tạo chuyến đi mới thành công!', 'success');
            openTripDetail(newTripId);
        }

        closeAllModals();
    }

    // Mở Modal Thêm / Sửa Địa điểm
    function openActivityModal(activityToEdit = null) {
        elements.modalActivity.classList.remove('modal-hidden');

        const titleEl = document.getElementById('modalActivityHeaderTitle');
        const idInput = document.getElementById('inputActivityId');
        const titleInput = document.getElementById('inputActivityTitle');
        const timeInput = document.getElementById('inputActivityTime');
        const catSelect = document.getElementById('selectActivityCategory');
        const costInput = document.getElementById('inputActivityCost');
        const addressInput = document.getElementById('inputActivityAddress');
        const latInput = document.getElementById('inputActivityLat');
        const lngInput = document.getElementById('inputActivityLng');
        const noteInput = document.getElementById('inputActivityNote');

        if (activityToEdit) {
            titleEl.textContent = 'Chỉnh Sửa Địa Điểm';
            idInput.value = activityToEdit.id;
            titleInput.value = activityToEdit.title;
            timeInput.value = activityToEdit.time || '';
            catSelect.value = activityToEdit.category || 'sightseeing';
            costInput.value = activityToEdit.cost || '';
            addressInput.value = activityToEdit.address || '';
            latInput.value = activityToEdit.lat || '';
            lngInput.value = activityToEdit.lng || '';
            noteInput.value = activityToEdit.note || '';
        } else {
            titleEl.textContent = 'Thêm Điểm Dừng Mới';
            idInput.value = '';
            titleInput.value = '';
            timeInput.value = '09:00 - 11:00';
            catSelect.value = 'sightseeing';
            costInput.value = '';
            addressInput.value = '';

            // Tự gợi ý tọa độ trung tâm điểm đến nếu có
            const trip = getCurrentTrip();
            const knownDest = POPULAR_DESTINATIONS[trip ? trip.destinationKey : null];
            if (knownDest) {
                latInput.value = knownDest.center[0].toFixed(4);
                lngInput.value = knownDest.center[1].toFixed(4);
            } else {
                latInput.value = '';
                lngInput.value = '';
            }
            noteInput.value = '';
        }

        if (window.lucide) lucide.createIcons();
    }

    // Bật chế độ chọn tọa độ trực tiếp từ Leaflet map
    function startMapLocationPicker() {
        elements.modalActivity.classList.add('modal-hidden');
        showToast('📍 Hãy nhấp chuột vào vị trí bất kỳ trên bản đồ để lấy tọa độ!', 'info');

        MapModule.enableLocationPicker((lat, lng) => {
            document.getElementById('inputActivityLat').value = lat.toFixed(5);
            document.getElementById('inputActivityLng').value = lng.toFixed(5);
            MapModule.disableLocationPicker();

            // Mở lại modal
            elements.modalActivity.classList.remove('modal-hidden');
            showToast(`Đã lấy tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
        });
    }

    // Submit lưu địa điểm
    function handleActivityFormSubmit(e) {
        e.preventDefault();

        const trip = getCurrentTrip();
        if (!trip || !trip.days[currentDayIndex]) return;

        const currentDay = trip.days[currentDayIndex];
        if (!currentDay.activities) currentDay.activities = [];

        const id = document.getElementById('inputActivityId').value;
        const title = document.getElementById('inputActivityTitle').value.trim();
        const time = document.getElementById('inputActivityTime').value.trim();
        const category = document.getElementById('selectActivityCategory').value;
        const cost = parseInt(document.getElementById('inputActivityCost').value) || 0;
        const address = document.getElementById('inputActivityAddress').value.trim();
        const lat = parseFloat(document.getElementById('inputActivityLat').value) || null;
        const lng = parseFloat(document.getElementById('inputActivityLng').value) || null;
        const note = document.getElementById('inputActivityNote').value.trim();

        if (id) {
            // Sửa
            const act = currentDay.activities.find(a => a.id === id);
            if (act) {
                act.title = title;
                act.time = time;
                act.category = category;
                act.cost = cost;
                act.address = address;
                act.lat = lat;
                act.lng = lng;
                act.note = note;
                showToast('Đã cập nhật điểm đến', 'success');
            }
        } else {
            // Tạo mới
            const newAct = {
                id: 'act-' + Date.now(),
                title: title,
                time: time,
                category: category,
                cost: cost,
                address: address,
                lat: lat,
                lng: lng,
                note: note
            };
            currentDay.activities.push(newAct);
            showToast('Đã thêm điểm dừng mới vào lộ trình!', 'success');
        }

        saveTripsToStorage();
        renderCurrentDayContent();
        renderWidgets();
        closeAllModals();
    }

    // Đóng toàn bộ Modals
    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.add('modal-hidden');
        });
        MapModule.disableLocationPicker();
    }

    // Sao lưu dữ liệu ra file JSON
    function exportTripsToJson() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trips, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `vivuplan-backup-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Đã xuất file sao lưu JSON thành công!', 'success');
    }

    // Nhập dữ liệu từ file JSON
    function handleImportJson(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    trips = importedData;
                    saveTripsToStorage();
                    showDashboard();
                    showToast('Đã khôi phục dữ liệu từ file thành công!', 'success');
                } else {
                    showToast('Định dạng file không đúng chuẩn danh sách chuyến đi!', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Không thể đọc dữ liệu từ file!', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    // Toast Notification helper
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        let bgClass = 'bg-slate-800 text-white';
        let iconName = 'info';

        if (type === 'success') {
            bgClass = 'bg-emerald-600 text-white';
            iconName = 'check-circle';
        } else if (type === 'error') {
            bgClass = 'bg-rose-600 text-white';
            iconName = 'alert-triangle';
        }

        toast.className = `toast px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ${bgClass}`;
        toast.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i> <span>${message}</span>`;

        container.appendChild(toast);
        if (window.lucide) lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // Helper: Định dạng ngày hiển thị (dd/mm/yyyy)
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const parts = dateString.split('-');
            if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
            const d = new Date(dateString);
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        } catch {
            return dateString;
        }
    }

    // Helper: Định dạng khoảng thời gian (Từ ngày - Đến ngày)
    function formatDateRange(startDate, endDate) {
        if (!startDate) return 'Linh hoạt';
        if (!endDate || startDate === endDate) return formatDate(startDate);
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }

    return {
        init,
        openTripDetail,
        showDashboard
    };
})();

// Khởi chạy khi tài liệu tải xong
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
