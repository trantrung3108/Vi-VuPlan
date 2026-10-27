/**
 * VivuPlan - Dữ liệu mẫu và cơ sở dữ liệu các điểm đến du lịch Việt Nam
 */

// Danh mục hoạt động du lịch
const CATEGORIES = {
    food: { id: 'food', label: 'Ăn uống / Cà phê', color: '#f97316', icon: 'utensils', badgeClass: 'bg-orange-100 text-orange-700 border-orange-200' },
    sightseeing: { id: 'sightseeing', label: 'Tham quan / Danh lam', color: '#0284c7', icon: 'camera', badgeClass: 'bg-sky-100 text-sky-700 border-sky-200' },
    hotel: { id: 'hotel', label: 'Khách sạn / Lưu trú', color: '#8b5cf6', icon: 'bed', badgeClass: 'bg-purple-100 text-purple-700 border-purple-200' },
    activity: { id: 'activity', label: 'Hoạt động / Check-in', color: '#10b981', icon: 'sparkles', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    transport: { id: 'transport', label: 'Di chuyển / Vé xe', color: '#64748b', icon: 'car', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
    shopping: { id: 'shopping', label: 'Mua sắm / Chợ', color: '#ec4899', icon: 'shopping-bag', badgeClass: 'bg-pink-100 text-pink-700 border-pink-200' }
};

// Danh sách các điểm xuất phát phổ biến (Start Points)
const STARTING_POINTS = [
    { id: 'vinh_station', name: 'Ga Vinh (Nghệ An)', lat: 18.6795, lng: 105.6706, city: 'Nghệ An' },
    { id: 'vinh_airport', name: 'Sân bay Quốc tế Vinh', lat: 18.7276, lng: 105.6707, city: 'Nghệ An' },
    { id: 'vinh_bus', name: 'Bến xe Vinh Mới', lat: 18.7188, lng: 105.6482, city: 'Nghệ An' },
    { id: 'hanoi_station', name: 'Ga Hà Nội', lat: 21.0245, lng: 105.8412, city: 'Hà Nội' },
    { id: 'noibai_airport', name: 'Sân bay Nội Bài', lat: 21.2187, lng: 105.8042, city: 'Hà Nội' },
    { id: 'danang_station', name: 'Ga Đà Nẵng', lat: 16.0682, lng: 108.2144, city: 'Đà Nẵng' },
    { id: 'danang_airport', name: 'Sân bay Quốc tế Đà Nẵng', lat: 16.0538, lng: 108.1993, city: 'Đà Nẵng' },
    { id: 'dalat_bus', name: 'Bến xe Liên Tỉnh Đà Lạt', lat: 11.9284, lng: 108.4442, city: 'Đà Lạt' },
    { id: 'saigon_airport', name: 'Sân bay Tân Sơn Nhất (TP.HCM)', lat: 10.8185, lng: 106.6588, city: 'TP.HCM' },
    { id: 'phuquoc_airport', name: 'Sân bay Quốc tế Phú Quốc', lat: 10.1689, lng: 103.9931, city: 'Phú Quốc' }
];

// Cơ sở dữ liệu các điểm đến nổi tiếng tại Việt Nam (kèm tọa độ GPS thật để hiển thị map và thuật toán AI)
const POPULAR_DESTINATIONS = {
    nghean: {
        name: 'Nghệ An (Vinh - Nam Đàn - Cửa Lò)',
        center: [18.7300, 105.6500],
        zoom: 11,
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        weather: { temp: '25°C - 31°C', note: 'Nắng ấm miền Trung, gió biển Cửa Lò dễ chịu' },
        defaultStartPoint: { name: 'Ga Vinh', lat: 18.6795, lng: 105.6706 },
        places: [
            {
                id: 'na-1',
                name: 'Khu di tích Kim Liên (Nam Đàn - Quê Bác)',
                category: 'sightseeing',
                lat: 18.6976,
                lng: 105.5492,
                cost: 0,
                rating: 4.9,
                popularity: 99,
                style: { natureRelax: 0.2, historyCulture: 0.95, foodie: 0.1, checkin: 0.6 },
                season: ['all'],
                isResort5Star: false,
                openTime: '07:30',
                closeTime: '17:00',
                durationMinutes: 120,
                note: 'Tham quan làng Sen, làng Hoàng Trù và nghe thuyết minh về tuổi thơ của Chủ tịch Hồ Chí Minh.'
            },
            {
                id: 'na-2',
                name: 'Nhà hàng Dê Cầu Đòn Nam Đàn',
                category: 'food',
                lat: 18.6912,
                lng: 105.5410,
                cost: 180000,
                rating: 4.7,
                popularity: 88,
                style: { natureRelax: 0.1, historyCulture: 0.2, foodie: 0.95, checkin: 0.3 },
                season: ['all'],
                isResort5Star: false,
                openTime: '10:30',
                closeTime: '21:00',
                durationMinutes: 75,
                note: 'Ăn trưa đặc sản thịt dê Cầu Đòn nướng tảng thơm lừng, xào lăn, cháo dê Nam Đàn.'
            },
            {
                id: 'na-3',
                name: 'Bãi biển Cửa Lò & Nhận phòng khách sạn',
                category: 'hotel',
                lat: 18.8078,
                lng: 105.7289,
                cost: 650000,
                rating: 4.6,
                popularity: 95,
                style: { natureRelax: 0.88, historyCulture: 0.1, foodie: 0.6, checkin: 0.8 },
                season: ['summer'],
                isResort5Star: false,
                openTime: '14:00',
                closeTime: '23:59',
                durationMinutes: 60,
                note: 'Chiều di chuyển về Cửa Lò nhận phòng nghỉ ngơi, tắm biển bãi tắm chính nước trong cát mịn.'
            },
            {
                id: 'na-4',
                name: 'Đảo Lan Châu & Thưởng thức Hải sản Cửa Lò',
                category: 'food',
                lat: 18.8236,
                lng: 105.7175,
                cost: 250000,
                rating: 4.8,
                popularity: 93,
                style: { natureRelax: 0.8, historyCulture: 0.2, foodie: 0.9, checkin: 0.85 },
                season: ['summer'],
                isResort5Star: false,
                openTime: '16:00',
                closeTime: '22:00',
                durationMinutes: 120,
                note: 'Ngắm hoàng hôn trên đảo Lan Châu, thưởng thức mực nhảy hấp sả, tôm cua ghẹ tươi rói.'
            },
            {
                id: 'na-5',
                name: 'Đồi Chè Thanh Chương (Đảo Chè)',
                category: 'activity',
                lat: 18.7490,
                lng: 105.2891,
                cost: 100000,
                rating: 4.8,
                popularity: 94,
                style: { natureRelax: 0.95, historyCulture: 0.1, foodie: 0.2, checkin: 0.95 },
                season: ['all'],
                isResort5Star: false,
                openTime: '07:00',
                closeTime: '17:30',
                durationMinutes: 150,
                note: 'Đi thuyền trên đập nước ngắm các ốc đảo chè xanh bạt ngàn tuyệt đẹp giữa hồ.'
            },
            {
                id: 'na-6',
                name: 'Khu sinh thái Mường Thanh Diễn Lâm (Safari)',
                category: 'activity',
                lat: 19.0435,
                lng: 105.4746,
                cost: 250000,
                rating: 4.7,
                popularity: 90,
                style: { natureRelax: 0.9, historyCulture: 0.1, foodie: 0.4, checkin: 0.85 },
                season: ['all'],
                isResort5Star: false,
                openTime: '08:00',
                closeTime: '17:00',
                durationMinutes: 180,
                note: 'Khám phá vườn thú hoang dã safari lớn nhất miền Bắc, công viên nước và khu tắm bùn khoáng.'
            },
            {
                id: 'na-7',
                name: 'Đền thờ Vua Quang Trung (Núi Dũng Quyết)',
                category: 'sightseeing',
                lat: 18.6477,
                lng: 105.6983,
                cost: 0,
                rating: 4.7,
                popularity: 86,
                style: { natureRelax: 0.5, historyCulture: 0.92, foodie: 0.1, checkin: 0.75 },
                season: ['all'],
                isResort5Star: false,
                openTime: '07:00',
                closeTime: '17:30',
                durationMinutes: 90,
                note: 'Di tích Phượng Hoàng Trung Đô, đứng trên đỉnh núi ngắm toàn cảnh sông Lam núi Hồng và TP. Vinh.'
            },
            {
                id: 'na-8',
                name: 'Súp Lươn & Cháo Lươn Bà Liễu TP. Vinh',
                category: 'food',
                lat: 18.6728,
                lng: 105.6811,
                cost: 55000,
                rating: 4.9,
                popularity: 98,
                style: { natureRelax: 0.1, historyCulture: 0.3, foodie: 0.99, checkin: 0.4 },
                season: ['all'],
                isResort5Star: false,
                openTime: '06:00',
                closeTime: '21:00',
                durationMinutes: 45,
                note: 'Thưởng thức súp lươn cay nồng chuẩn vị xứ Nghệ ăn kèm bánh mì giòn hoặc bánh mướt nóng.'
            },
            {
                id: 'na-9',
                name: 'Mộ Bà Hoàng Thị Loan (Thân mẫu Bác Hồ)',
                category: 'sightseeing',
                lat: 18.6835,
                lng: 105.5841,
                cost: 0,
                rating: 4.8,
                popularity: 88,
                style: { natureRelax: 0.4, historyCulture: 0.9, foodie: 0.1, checkin: 0.5 },
                season: ['all'],
                isResort5Star: false,
                openTime: '07:30',
                closeTime: '17:00',
                durationMinutes: 60,
                note: 'Khu lăng mộ nằm trên lưng chừng núi Động Tranh uy nghiêm, thanh tịnh.'
            },
            {
                id: 'na-10',
                name: 'Vinpearl Discovery Cửa Hội (Resort 5 sao)',
                category: 'hotel',
                lat: 18.7842,
                lng: 105.7483,
                cost: 2500000,
                rating: 4.8,
                popularity: 91,
                style: { natureRelax: 0.98, historyCulture: 0.1, foodie: 0.5, checkin: 0.9 },
                season: ['summer'],
                isResort5Star: true,
                openTime: '14:00',
                closeTime: '23:59',
                durationMinutes: 60,
                note: 'Khu nghỉ dưỡng 5 sao cao cấp ven biển Cửa Hội (bị lọc bỏ nếu người dùng chọn ngân sách thấp).'
            }
        ]
    },
    dalat: {
        name: 'Đà Lạt',
        center: [11.9404, 108.4583],
        zoom: 13,
        coverImage: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=1200&q=80',
        weather: { temp: '16°C - 24°C', note: 'Se lạnh buổi sáng & tối, có nắng nhẹ ban ngày' },
        defaultStartPoint: { name: 'Bến xe Liên Tỉnh Đà Lạt', lat: 11.9284, lng: 108.4442 },
        places: [
            { id: 'dl-1', name: 'Quảng trường Lâm Viên', category: 'sightseeing', lat: 11.9366, lng: 108.4452, cost: 0, rating: 4.7, popularity: 96, style: { natureRelax: 0.5, historyCulture: 0.3, foodie: 0.2, checkin: 0.95 }, season: ['all'], openTime: '06:00', closeTime: '22:00', durationMinutes: 90, note: 'Check-in nụ hoa Atiso và hoa dã quỳ khổng lồ bên hồ Xuân Hương.' },
            { id: 'dl-2', name: 'Ga Đà Lạt', category: 'sightseeing', lat: 11.9419, lng: 108.4549, cost: 50000, rating: 4.6, popularity: 93, style: { natureRelax: 0.2, historyCulture: 0.9, foodie: 0.1, checkin: 0.9 }, season: ['all'], openTime: '07:30', closeTime: '17:00', durationMinutes: 60, note: 'Nhà ga cổ kính nhất Đông Dương với đầu máy xe lửa hơi nước cổ.' },
            { id: 'dl-3', name: 'Tiệm Cà Phê Túi Mơ To', category: 'food', lat: 11.9542, lng: 108.4821, cost: 75000, rating: 4.8, popularity: 95, style: { natureRelax: 0.85, historyCulture: 0.1, foodie: 0.85, checkin: 0.98 }, season: ['all'], openTime: '07:00', closeTime: '21:30', durationMinutes: 90, note: 'Vườn cúc họa mi và view thung lũng lồng kính siêu đẹp.' },
            { id: 'dl-4', name: 'Chợ Đêm Đà Lạt', category: 'shopping', lat: 11.9427, lng: 108.4373, cost: 150000, rating: 4.5, popularity: 98, style: { natureRelax: 0.1, historyCulture: 0.3, foodie: 0.95, checkin: 0.8 }, season: ['all'], openTime: '18:00', closeTime: '23:30', durationMinutes: 120, note: 'Thưởng thức bánh tráng nướng, sữa đậu nành nóng, mua đặc sản mứt dâu tây.' },
            { id: 'dl-5', name: 'Đồi Chè Cầu Đất (Săn Mây)', category: 'activity', lat: 11.8596, lng: 108.5714, cost: 100000, rating: 4.9, popularity: 97, style: { natureRelax: 0.98, historyCulture: 0.1, foodie: 0.3, checkin: 0.99 }, season: ['all'], openTime: '05:00', closeTime: '17:00', durationMinutes: 150, note: 'Khởi hành sớm để ngắm biển mây bồng bềnh và đồi chè xanh mướt.' },
            { id: 'dl-6', name: 'Thác Datanla (Trượt máng)', category: 'activity', lat: 11.9029, lng: 108.4497, cost: 250000, rating: 4.7, popularity: 92, style: { natureRelax: 0.8, historyCulture: 0.1, foodie: 0.1, checkin: 0.85 }, season: ['all'], openTime: '07:30', closeTime: '17:00', durationMinutes: 120, note: 'Trải nghiệm máng trượt xuyên rừng thông dài nhất Đông Nam Á.' },
            { id: 'dl-7', name: 'Bánh Mì Xíu Mại Hoàng Diệu', category: 'food', lat: 11.9458, lng: 108.4312, cost: 35000, rating: 4.8, popularity: 94, style: { natureRelax: 0.1, historyCulture: 0.2, foodie: 0.98, checkin: 0.4 }, season: ['all'], openTime: '06:00', closeTime: '11:00', durationMinutes: 45, note: 'Ăn sáng bánh mì xíu mại chén nóng hổi đặc sản phố núi.' },
            { id: 'dl-8', name: 'Lẩu Bò Quán Gỗ (Ba Toa)', category: 'food', lat: 11.9392, lng: 108.4311, cost: 200000, rating: 4.7, popularity: 96, style: { natureRelax: 0.1, historyCulture: 0.2, foodie: 0.97, checkin: 0.5 }, season: ['all'], openTime: '10:00', closeTime: '22:00', durationMinutes: 75, note: 'Lẩu bò đậm đà, quán gỗ xưa nổi tiếng đông khách.' },
            { id: 'dl-9', name: 'Khu du lịch Langbiang', category: 'sightseeing', lat: 12.0465, lng: 108.4358, cost: 150000, rating: 4.6, popularity: 89, style: { natureRelax: 0.9, historyCulture: 0.4, foodie: 0.2, checkin: 0.8 }, season: ['all'], openTime: '07:00', closeTime: '17:00', durationMinutes: 150, note: 'Lên đỉnh radar ngắm toàn cảnh thung lũng Đà Lạt và Suối Vàng Suối Bạc.' }
        ]
    },
    danang: {
        name: 'Đà Nẵng & Hội An',
        center: [16.0544, 108.2022],
        zoom: 12,
        coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
        weather: { temp: '26°C - 32°C', note: 'Nắng ấm, biển trong xanh tuyệt đẹp' },
        defaultStartPoint: { name: 'Ga Đà Nẵng', lat: 16.0682, lng: 108.2144 },
        places: [
            { id: 'dn-1', name: 'Bán Đảo Sơn Trà & Chùa Linh Ứng', category: 'sightseeing', lat: 16.1002, lng: 108.2774, cost: 0, rating: 4.8, popularity: 97, style: { natureRelax: 0.7, historyCulture: 0.85, foodie: 0.1, checkin: 0.85 }, season: ['all'], openTime: '06:00', closeTime: '18:00', durationMinutes: 120, note: 'Tượng Phật Bà Quan Âm cao 67m hướng ra biển lớn bình yên.' },
            { id: 'dn-2', name: 'Bãi Biển Mỹ Khê', category: 'activity', lat: 16.0592, lng: 108.2464, cost: 0, rating: 4.9, popularity: 99, style: { natureRelax: 0.95, historyCulture: 0.1, foodie: 0.4, checkin: 0.9 }, season: ['summer'], openTime: '05:00', closeTime: '22:00', durationMinutes: 120, note: 'Một trong những bãi biển quyến rũ nhất hành tinh.' },
            { id: 'dn-3', name: 'Cầu Rồng & Cầu Tình Yêu', category: 'sightseeing', lat: 16.0611, lng: 108.2268, cost: 0, rating: 4.8, popularity: 98, style: { natureRelax: 0.4, historyCulture: 0.3, foodie: 0.3, checkin: 0.95 }, season: ['all'], openTime: '00:00', closeTime: '23:59', durationMinutes: 90, note: 'Xem rồng phun lửa và nước vào 21:00 thứ 7, chủ nhật.' },
            { id: 'dn-4', name: 'Bà Nà Hills (Cầu Vàng)', category: 'activity', lat: 15.9988, lng: 107.9961, cost: 950000, rating: 4.9, popularity: 99, style: { natureRelax: 0.8, historyCulture: 0.3, foodie: 0.5, checkin: 0.99 }, season: ['all'], openTime: '08:00', closeTime: '17:30', durationMinutes: 300, note: 'Check-in bàn tay khổng lồ và Làng Pháp trên đỉnh núi.' },
            { id: 'dn-5', name: 'Phố Cổ Hội An', category: 'sightseeing', lat: 15.8801, lng: 108.3275, cost: 120000, rating: 4.9, popularity: 100, style: { natureRelax: 0.5, historyCulture: 0.98, foodie: 0.9, checkin: 0.98 }, season: ['all'], openTime: '07:00', closeTime: '22:00', durationMinutes: 180, note: 'Đi bộ ngắm phố cổ, thả hoa đăng lung linh trên sông Hoài.' },
            { id: 'dn-6', name: 'Bánh Mì Phượng Hội An', category: 'food', lat: 15.8779, lng: 108.3323, cost: 40000, rating: 4.7, popularity: 95, style: { natureRelax: 0.1, historyCulture: 0.3, foodie: 0.98, checkin: 0.6 }, season: ['all'], openTime: '06:30', closeTime: '21:30', durationMinutes: 45, note: 'Bánh mì trứ danh thế giới với nước sốt pate đặc biệt.' },
            { id: 'dn-7', name: 'Mì Quảng Bà Mua', category: 'food', lat: 16.0573, lng: 108.2185, cost: 50000, rating: 4.8, popularity: 92, style: { natureRelax: 0.1, historyCulture: 0.3, foodie: 0.96, checkin: 0.4 }, season: ['all'], openTime: '06:30', closeTime: '22:00', durationMinutes: 45, note: 'Mì Quảng ếch, tôm thịt chuẩn vị miền Trung.' },
            { id: 'dn-8', name: 'Chợ Hàn Đà Nẵng', category: 'shopping', lat: 16.0694, lng: 108.2241, cost: 200000, rating: 4.6, popularity: 91, style: { natureRelax: 0.1, historyCulture: 0.4, foodie: 0.85, checkin: 0.5 }, season: ['all'], openTime: '06:00', closeTime: '19:00', durationMinutes: 90, note: 'Mua quà lưu niệm, hải sản khô, chả bò Đà Nẵng.' }
        ]
    },
    phuquoc: {
        name: 'Phú Quốc',
        center: [10.2289, 103.9572],
        zoom: 11,
        coverImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
        weather: { temp: '27°C - 31°C', note: 'Gió biển mát mẻ, hoàng hôn rực rỡ' },
        defaultStartPoint: { name: 'Sân bay Quốc tế Phú Quốc', lat: 10.1689, lng: 103.9931 },
        places: [
            { id: 'pq-1', name: 'Grand World Phú Quốc', category: 'sightseeing', lat: 10.3279, lng: 103.8569, cost: 0, rating: 4.7, popularity: 96, style: { natureRelax: 0.4, historyCulture: 0.5, foodie: 0.6, checkin: 0.98 }, season: ['all'], openTime: '08:00', closeTime: '23:00', durationMinutes: 180, note: 'Thành phố không ngủ, kênh đào Venice và show Tinh hoa Việt Nam.' },
            { id: 'pq-2', name: 'Sunset Sanato Beach Club', category: 'activity', lat: 10.1554, lng: 103.9745, cost: 100000, rating: 4.7, popularity: 95, style: { natureRelax: 0.9, historyCulture: 0.1, foodie: 0.5, checkin: 0.99 }, season: ['summer'], openTime: '08:00', closeTime: '20:00', durationMinutes: 120, note: 'Nơi ngắm hoàng hôn đẹp nhất đảo Ngọc với các biểu tượng sống ảo.' },
            { id: 'pq-3', name: 'Bãi Sao Phú Quốc', category: 'activity', lat: 10.0537, lng: 104.0326, cost: 0, rating: 4.8, popularity: 98, style: { natureRelax: 0.96, historyCulture: 0.1, foodie: 0.3, checkin: 0.92 }, season: ['summer'], openTime: '07:00', closeTime: '18:00', durationMinutes: 150, note: 'Bãi cát trắng mịn như kem và làn nước trong vắt.' },
            { id: 'pq-4', name: 'Cáp Treo Hòn Thơm', category: 'activity', lat: 10.0264, lng: 104.0152, cost: 650000, rating: 4.9, popularity: 98, style: { natureRelax: 0.85, historyCulture: 0.1, foodie: 0.4, checkin: 0.95 }, season: ['all'], openTime: '08:30', closeTime: '17:00', durationMinutes: 240, note: 'Cáp treo 3 dây vượt biển dài nhất thế giới.' },
            { id: 'pq-5', name: 'Chợ Đêm Phú Quốc', category: 'food', lat: 10.2173, lng: 103.9612, cost: 300000, rating: 4.6, popularity: 97, style: { natureRelax: 0.2, historyCulture: 0.2, foodie: 0.98, checkin: 0.7 }, season: ['all'], openTime: '17:30', closeTime: '23:30', durationMinutes: 120, note: 'Thưởng thức nhum nướng mỡ hành, ghẹ Hàm Ninh, kem cuộn.' },
            { id: 'pq-6', name: 'Bún Quậy Kiến Xây', category: 'food', lat: 10.2188, lng: 103.9634, cost: 60000, rating: 4.8, popularity: 94, style: { natureRelax: 0.1, historyCulture: 0.2, foodie: 0.97, checkin: 0.5 }, season: ['all'], openTime: '07:00', closeTime: '22:00', durationMinutes: 45, note: 'Tự pha nước chấm theo khẩu vị, hải sản tươi rói quậy trực tiếp.' }
        ]
    },
    hanoi: {
        name: 'Hà Nội & Ninh Bình',
        center: [21.0285, 105.8542],
        zoom: 12,
        coverImage: 'https://images.unsplash.com/photo-1509067232490-674519fbe3d2?auto=format&fit=crop&w=1200&q=80',
        weather: { temp: '22°C - 28°C', note: 'Mùa thu se lạnh, hương hoa sữa thơm nồng' },
        defaultStartPoint: { name: 'Ga Hà Nội', lat: 21.0245, lng: 105.8412 },
        places: [
            { id: 'hn-1', name: 'Hồ Hoàn Kiếm & Đền Ngọc Sơn', category: 'sightseeing', lat: 21.0287, lng: 105.8523, cost: 30000, rating: 4.8, popularity: 99, style: { natureRelax: 0.5, historyCulture: 0.95, foodie: 0.3, checkin: 0.85 }, season: ['all'], openTime: '07:00', closeTime: '18:00', durationMinutes: 90, note: 'Trái tim thủ đô, dạo quanh hồ và cầu Thê Húc cong cong.' },
            { id: 'hn-2', name: 'Phố Cổ Hà Nội (36 Phố Phường)', category: 'shopping', lat: 21.0353, lng: 105.8504, cost: 100000, rating: 4.8, popularity: 98, style: { natureRelax: 0.2, historyCulture: 0.92, foodie: 0.95, checkin: 0.9 }, season: ['all'], openTime: '06:00', closeTime: '23:00', durationMinutes: 150, note: 'Ngắm nhà cổ, trải nghiệm ngõ nhỏ phố nhỏ rộn ràng.' },
            { id: 'hn-3', name: 'Phở Gia Truyền Bát Đàn', category: 'food', lat: 21.0345, lng: 105.8466, cost: 60000, rating: 4.7, popularity: 96, style: { natureRelax: 0.1, historyCulture: 0.4, foodie: 0.99, checkin: 0.5 }, season: ['all'], openTime: '06:00', closeTime: '10:00', durationMinutes: 45, note: 'Phở bò gia truyền thơm lừng chuẩn phong vị Hà Thành.' },
            { id: 'hn-4', name: 'Cafe Trứng Giảng 39 Nguyễn Hữu Huân', category: 'food', lat: 21.0328, lng: 105.8546, cost: 40000, rating: 4.8, popularity: 97, style: { natureRelax: 0.4, historyCulture: 0.5, foodie: 0.97, checkin: 0.7 }, season: ['all'], openTime: '07:00', closeTime: '22:00', durationMinutes: 60, note: 'Món cafe trứng béo ngậy nức tiếng từ năm 1946.' },
            { id: 'hn-5', name: 'Tràng An - Ninh Bình', category: 'activity', lat: 20.2526, lng: 105.9082, cost: 250000, rating: 4.9, popularity: 99, style: { natureRelax: 0.98, historyCulture: 0.8, foodie: 0.2, checkin: 0.95 }, season: ['all'], openTime: '07:00', closeTime: '16:30', durationMinutes: 200, note: 'Đi thuyền khám phá hang động và di sản thế giới UNESCO.' },
            { id: 'hn-6', name: 'Hang Múa Ninh Bình', category: 'sightseeing', lat: 20.2319, lng: 105.9388, cost: 100000, rating: 4.8, popularity: 96, style: { natureRelax: 0.9, historyCulture: 0.3, foodie: 0.1, checkin: 0.99 }, season: ['all'], openTime: '06:00', closeTime: '18:00', durationMinutes: 120, note: 'Leo 500 bậc đá lên Vạn Lý Trường Thành thu nhỏ ngắm Tam Cốc.' }
        ]
    }
};

// Danh sách người dùng mẫu ban đầu (Preloaded Users - Hệ thống Đăng nhập / Đăng ký)
const INITIAL_USERS = [
    {
        id: 'user-admin',
        fullName: 'Nguyễn Hải Nam',
        email: 'admin@vivuplan.vn',
        password: '123456',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: 'Travel Blogger & Chuyên gia Lộ trình',
        preferredStyle: 'nature',
        preferredStyleLabel: 'Nghỉ dưỡng & Thiên nhiên',
        bio: 'Đam mê khám phá các cung đường Việt Nam và chia sẻ kinh nghiệm du lịch thực tế.',
        createdAt: '2026-01-15'
    },
    {
        id: 'user-thao',
        fullName: 'Lê Phương Thảo',
        email: 'thao@vivuplan.vn',
        password: '123456',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        role: 'Food Reviewer Xứ Nghệ',
        preferredStyle: 'cuisine',
        preferredStyleLabel: 'Ẩm thực & Đặc sản',
        bio: 'Yêu thích tìm kiếm những quán ăn bản địa chuẩn vị và văn hóa ẩm thực truyền thống.',
        createdAt: '2026-03-20'
    },
    {
        id: 'user-long',
        fullName: 'Trần Hoàng Long',
        email: 'long@vivuplan.vn',
        password: '123456',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        role: 'Phượt thủ Khám phá & Check-in',
        preferredStyle: 'adventure',
        preferredStyleLabel: 'Khám phá & Check-in',
        bio: 'Thích những chuyến đi bất ngờ, săn mây đồi núi và các điểm đến còn hoang sơ.',
        createdAt: '2026-05-10'
    }
];

// Dữ liệu chuyến đi mẫu ban đầu (Preloaded Trips)
const INITIAL_TRIPS = [
    {
        id: 'trip-nghean-2026',
        userId: 'user-admin',
        title: 'Nghệ An 3N2Đ - Quê Bác, Cửa Lò & Đồi Chè Thanh Chương',
        destination: 'Nghệ An (Vinh - Nam Đàn - Cửa Lò)',
        destinationKey: 'nghean',
        startPoint: 'Ga Vinh (Nghệ An)',
        startCoords: [18.6795, 105.6706],
        startDate: '2026-10-24',
        endDate: '2026-10-26',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        budget: 3000000,
        styleWeights: { natureRelax: 0.7, historyCulture: 0.3, foodie: 0.4, checkin: 0.5 },
        description: 'Lộ trình tối ưu hóa bằng thuật toán AI (K-Means & TSP): Ngày 1 tham quan Khu di tích Kim Liên Nam Đàn, ăn trưa đặc sản và về Cửa Lò nhận phòng; Ngày 2 khám phá Đồi chè Thanh Chương; Ngày 3 viếng Đền Vua Quang Trung & thưởng thức súp lươn.',
        totalDistanceKm: 135.4,
        totalTravelMinutes: 220,
        packingList: [
            { id: 'p-na1', text: 'CCCD / Giấy tờ tùy thân bản gốc', done: true },
            { id: 'p-na2', text: 'Trang phục lịch sự viếng Khu di tích Kim Liên', done: true },
            { id: 'p-na3', text: 'Đồ bơi & kính râm đi biển Cửa Lò', done: false },
            { id: 'p-na4', text: 'Mũ rộng vành & kem chống nắng', done: false },
            { id: 'p-na5', text: 'Sạc dự phòng & máy ảnh chụp đồi chè', done: true }
        ],
        days: [
            {
                dayNumber: 1,
                date: '2026-10-24',
                title: 'Khu Di Tích Kim Liên & Biển Cửa Lò',
                totalDistanceKm: 42.8,
                totalTravelMinutes: 72,
                clusterName: 'Cụm 1: Nam Đàn & Cửa Lò',
                activities: [
                    {
                        id: 'act-na-1-1',
                        time: '08:00 - 08:45',
                        title: 'Xuất phát từ Ga Vinh đi Nam Đàn',
                        category: 'transport',
                        address: 'Ga Vinh, Đường Lệ Ninh, TP. Vinh',
                        lat: 18.6795,
                        lng: 105.6706,
                        cost: 50000,
                        durationMinutes: 45,
                        note: 'Xe đón đoàn tại Ga Vinh, di chuyển theo Quốc lộ 46A về quê Bác.'
                    },
                    {
                        id: 'act-na-1-2',
                        time: '08:45 - 11:30',
                        title: 'Sáng tham quan Khu di tích Kim Liên (Nam Đàn)',
                        category: 'sightseeing',
                        address: 'Xã Kim Liên, Huyện Nam Đàn, Nghệ An',
                        lat: 18.6976,
                        lng: 105.5492,
                        cost: 0,
                        durationMinutes: 165,
                        note: 'Thăm làng Sen quê nội, làng Hoàng Trù quê ngoại và nghe thuyết minh xúc động về thời niên thiếu của Bác.'
                    },
                    {
                        id: 'act-na-1-3',
                        time: '11:45 - 13:15',
                        title: 'Trưa ăn tại nhà hàng gần đó (Dê Cầu Đòn Nam Đàn)',
                        category: 'food',
                        address: 'Xã Nam Thái, Huyện Nam Đàn, Nghệ An',
                        lat: 18.6912,
                        lng: 105.5410,
                        cost: 180000,
                        durationMinutes: 90,
                        note: 'Thưởng thức thịt dê nướng tảng, cháo dê thơm nức mũi chuẩn hương vị ẩm thực xứ Nghệ.'
                    },
                    {
                        id: 'act-na-1-4',
                        time: '14:00 - 16:30',
                        title: 'Chiều di chuyển về Cửa Lò nhận phòng khách sạn',
                        category: 'hotel',
                        address: 'Đường Bình Minh, Thị xã Cửa Lò, Nghệ An',
                        lat: 18.8078,
                        lng: 105.7289,
                        cost: 650000,
                        durationMinutes: 150,
                        note: 'Nhận phòng khách sạn mặt biển Cửa Lò, nghỉ ngơi lấy lại sức và tắm biển chiều lộng gió.'
                    },
                    {
                        id: 'act-na-1-5',
                        time: '18:00 - 21:00',
                        title: 'Ăn tối hải sản & Dạo biển Đảo Lan Châu',
                        category: 'food',
                        address: 'Phường Thu Thủy, Thị xã Cửa Lò, Nghệ An',
                        lat: 18.8236,
                        lng: 105.7175,
                        cost: 250000,
                        durationMinutes: 180,
                        note: 'Thưởng thức mực nhảy Cửa Lò hấp xả, ngắm ngọn hải đăng Lan Châu lung linh về đêm.'
                    }
                ]
            },
            {
                dayNumber: 2,
                date: '2026-10-25',
                title: 'Khám phá Đảo Chè Thanh Chương Xanh Mướt',
                totalDistanceKm: 58.2,
                totalTravelMinutes: 95,
                clusterName: 'Cụm 2: Tây Nam Nghệ An',
                activities: [
                    {
                        id: 'act-na-2-1',
                        time: '07:30 - 09:30',
                        title: 'Di chuyển từ Cửa Lò đi Đảo Chè Thanh Chương',
                        category: 'transport',
                        address: 'Xã Thanh An, Huyện Thanh Chương, Nghệ An',
                        lat: 18.7490,
                        lng: 105.2891,
                        cost: 120000,
                        durationMinutes: 120,
                        note: 'Ngắm nhìn cảnh quan thanh bình miền sơn cước xứ Nghệ dọc đường đi.'
                    },
                    {
                        id: 'act-na-2-2',
                        time: '09:30 - 12:00',
                        title: 'Đi thuyền du ngoạn ốc đảo chè Thanh Chương',
                        category: 'activity',
                        address: 'Đập Cầu Cau, Thanh Chương',
                        lat: 18.7510,
                        lng: 105.2915,
                        cost: 100000,
                        durationMinutes: 150,
                        note: 'Chụp ảnh sống ảo giữa các đồi chè hình con ốc nhấp nhô trên mặt hồ xanh biếc.'
                    },
                    {
                        id: 'act-na-2-3',
                        time: '12:30 - 14:00',
                        title: 'Ăn trưa cơm quê gà đồi Thanh Chương nướng muối ớt',
                        category: 'food',
                        address: 'Quán ven hồ Đảo Chè, Thanh Chương',
                        lat: 18.7480,
                        lng: 105.2870,
                        cost: 160000,
                        durationMinutes: 90,
                        note: 'Gà đồi thả tự nhiên thịt chắc ngọt ăn kèm xôi nếp dẻo thơm.'
                    },
                    {
                        id: 'act-na-2-4',
                        time: '15:30 - 17:30',
                        title: 'Viếng Khu di tích Mộ Bà Hoàng Thị Loan',
                        category: 'sightseeing',
                        address: 'Núi Động Tranh, Nam Đàn',
                        lat: 18.6835,
                        lng: 105.5841,
                        cost: 0,
                        durationMinutes: 120,
                        note: 'Leo bậc đá viếng mộ thân mẫu Bác Hồ giữa rừng thông ngút ngàn tĩnh lặng.'
                    }
                ]
            },
            {
                dayNumber: 3,
                date: '2026-10-26',
                title: 'Đền Thờ Vua Quang Trung, Súp Lươn & Tạm Biệt Vinh',
                totalDistanceKm: 34.4,
                totalTravelMinutes: 53,
                clusterName: 'Cụm 3: Trung tâm Thành phố Vinh',
                activities: [
                    {
                        id: 'act-na-3-1',
                        time: '07:30 - 08:30',
                        title: 'Ăn sáng Súp Lươn Bà Liễu nức tiếng TP. Vinh',
                        category: 'food',
                        address: '87 Mai Hắc Đế, Phường Quán Bàu, TP. Vinh',
                        lat: 18.6728,
                        lng: 105.6811,
                        cost: 55000,
                        durationMinutes: 60,
                        note: 'Món súp lươn đậm đà, vị cay the nồng ấm xua tan sương sớm, ăn kèm bánh mì giòn rụm.'
                    },
                    {
                        id: 'act-na-3-2',
                        time: '09:00 - 11:30',
                        title: 'Viếng Đền thờ Vua Quang Trung (Núi Dũng Quyết)',
                        category: 'sightseeing',
                        address: 'Phường Trung Đô, TP. Vinh',
                        lat: 18.6477,
                        lng: 105.6983,
                        cost: 0,
                        durationMinutes: 150,
                        note: 'Ngắm nhìn toàn cảnh thành phố Vinh, dòng sông Lam thơ mộng uốn lượn ôm lấy chân núi.'
                    },
                    {
                        id: 'act-na-3-3',
                        time: '11:45 - 13:30',
                        title: 'Mua đặc sản Chợ Vinh & Tạm biệt hành trình tại Ga Vinh',
                        category: 'shopping',
                        address: 'Đường Cao Thắng, Phường Hồng Sơn, TP. Vinh',
                        lat: 18.6654,
                        lng: 105.6791,
                        cost: 200000,
                        durationMinutes: 105,
                        note: 'Mua kẹo cu đơ, cam Xã Đoài, tương Nam Đàn làm quà và di chuyển ra Ga Vinh lên tàu về.'
                    }
                ]
            }
        ]
    },
    {
        id: 'trip-dalat-2026',
        userId: 'user-long',
        title: 'Đà Lạt 3N2Đ - Chữa Lành & Săn Mây',
        destination: 'Đà Lạt, Lâm Đồng',
        destinationKey: 'dalat',
        startDate: '2026-10-24',
        endDate: '2026-10-26',
        coverImage: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=1200&q=80',
        budget: 3500000,
        description: 'Chuyến đi thư giãn cuối tuần, hít thở không khí trong lành rừng thông, săn mây Cầu Đất và check-in cafe view thung lũng.',
        totalDistanceKm: 78.5,
        totalTravelMinutes: 130,
        packingList: [
            { id: 'p1', text: 'CCCD / Hộ chiếu bản gốc', done: true },
            { id: 'p2', text: 'Áo len mỏng, áo khoác ấm cho buổi tối', done: true },
            { id: 'p3', text: 'Máy ảnh / Sạc dự phòng', done: false },
            { id: 'p4', text: 'Thuốc say xe / Cảm sốt cơ bản', done: false },
            { id: 'p5', text: 'Giày sneaker êm chân đi bộ', done: true }
        ],
        days: [
            {
                dayNumber: 1,
                date: '2026-10-24',
                title: 'Check-in & Dạo quanh phố núi',
                totalDistanceKm: 22.4,
                totalTravelMinutes: 45,
                activities: [
                    {
                        id: 'act-1-1',
                        time: '08:00 - 09:00',
                        title: 'Ăn sáng Bánh Mì Xíu Mại Hoàng Diệu',
                        category: 'food',
                        address: '26 Hoàng Diệu, Phường 5, TP. Đà Lạt',
                        lat: 11.9458,
                        lng: 108.4312,
                        cost: 40000,
                        note: 'Nên gọi thêm ly sữa đậu nành nóng uống kèm rất ấm bụng.'
                    },
                    {
                        id: 'act-1-2',
                        time: '09:30 - 11:30',
                        title: 'Check-in Quảng trường Lâm Viên & Hồ Xuân Hương',
                        category: 'sightseeing',
                        address: 'Đường Trần Quốc Toản, Phường 10, Đà Lạt',
                        lat: 11.9366,
                        lng: 108.4452,
                        cost: 0,
                        note: 'Chụp hình với nụ hoa Atiso kính màu và đi dạo quanh hồ.'
                    },
                    {
                        id: 'act-1-3',
                        time: '12:00 - 13:30',
                        title: 'Ăn trưa Lẩu Bò Quán Gỗ (Ba Toa)',
                        category: 'food',
                        address: '1/29 Hoàng Diệu, Phường 5, Đà Lạt',
                        lat: 11.9392,
                        lng: 108.4311,
                        cost: 220000,
                        note: 'Lẩu bò nhiều thịt, chấm chao sa tế siêu ngon cay nhẹ.'
                    },
                    {
                        id: 'act-1-4',
                        time: '14:30 - 17:00',
                        title: 'Thưởng thức trà chiều tại Tiệm Cà Phê Túi Mơ To',
                        category: 'food',
                        address: 'Hẻm 31 Sào Nam, Phường 11, Đà Lạt',
                        lat: 11.9542,
                        lng: 108.4821,
                        cost: 80000,
                        note: 'Ngắm hoàng hôn thung lũng lồng kính và chụp ảnh vườn cúc họa mi.'
                    },
                    {
                        id: 'act-1-5',
                        time: '18:30 - 21:30',
                        title: 'Khám phá Chợ Đêm Đà Lạt (Chợ Âm Phủ)',
                        category: 'shopping',
                        address: 'Nguyễn Thị Minh Khai, Phường 1, Đà Lạt',
                        lat: 11.9427,
                        lng: 108.4373,
                        cost: 150000,
                        note: 'Ăn bánh tráng nướng, uống sữa đậu, mua dâu tây tươi và mứt.'
                    }
                ]
            },
            {
                dayNumber: 2,
                date: '2026-10-25',
                title: 'Săn mây Cầu Đất & Trượt máng Datanla',
                totalDistanceKm: 38.6,
                totalTravelMinutes: 65,
                activities: [
                    {
                        id: 'act-2-1',
                        time: '05:00 - 08:30',
                        title: 'Đồi Chè Cầu Đất & Thảm gỗ săn mây',
                        category: 'activity',
                        address: 'Thôn Cầu Đất, Xã Xuân Trường, Đà Lạt',
                        lat: 11.8596,
                        lng: 108.5714,
                        cost: 120000,
                        note: 'Khởi hành từ 4:30 sáng, chuẩn bị áo ấm vì sáng sớm rất lạnh và gió.'
                    },
                    {
                        id: 'act-2-2',
                        time: '09:30 - 11:30',
                        title: 'Thăm Ga Đà Lạt cổ kính',
                        category: 'sightseeing',
                        address: 'Quang Trung, Phường 9, Đà Lạt',
                        lat: 11.9419,
                        lng: 108.4549,
                        cost: 50000,
                        note: 'Kiến trúc hình 3 chóp núi Langbiang, đầu máy xe lửa hơi nước cổ.'
                    },
                    {
                        id: 'act-2-3',
                        time: '13:30 - 16:30',
                        title: 'Trải nghiệm máng trượt Thác Datanla',
                        category: 'activity',
                        address: 'Đèo Prenn, Phường 3, Đà Lạt',
                        lat: 11.9029,
                        lng: 108.4497,
                        cost: 250000,
                        note: 'Máng trượt dài 2.400m cực kỳ đã và an toàn qua rừng thông.'
                    },
                    {
                        id: 'act-2-4',
                        time: '18:00 - 20:30',
                        title: 'Ăn tối Gà Nướng Cơm Lam & Lẩu Gà Lá É',
                        category: 'food',
                        address: 'Số 5 đường 3 Tháng 4, Đà Lạt',
                        lat: 11.9320,
                        lng: 108.4410,
                        cost: 200000,
                        note: 'Lá é thơm nồng cay nhẹ, gà thả vườn chắc thịt nướng than hoa.'
                    }
                ]
            },
            {
                dayNumber: 3,
                date: '2026-10-26',
                title: 'Chinh phục Đỉnh Langbiang & Mua quà',
                totalDistanceKm: 17.5,
                totalTravelMinutes: 30,
                activities: [
                    {
                        id: 'act-3-1',
                        time: '08:00 - 11:30',
                        title: 'Khám phá Đỉnh Núi Langbiang',
                        category: 'sightseeing',
                        address: 'Thị trấn Lạc Dương, Huyện Lạc Dương',
                        lat: 12.0465,
                        lng: 108.4358,
                        cost: 160000,
                        note: 'Đi xe Jeep địa hình lên đỉnh Radar ngắm toàn cảnh Đà Lạt.'
                    },
                    {
                        id: 'act-3-2',
                        time: '12:30 - 14:00',
                        title: 'Ăn trưa Nem Nướng Bà Hùng',
                        category: 'food',
                        address: '328 Phan Đình Phùng, Phường 2, Đà Lạt',
                        lat: 11.9482,
                        lng: 108.4350,
                        cost: 65000,
                        note: 'Nước chấm tương đậu phộng gia truyền đặc sánh ngon khó cưỡng.'
                    },
                    {
                        id: 'act-3-3',
                        time: '14:30 - 16:00',
                        title: 'Mua đặc sản L’angfarm & Chuẩn bị về',
                        category: 'shopping',
                        address: 'Vòng xoay Chợ Đà Lạt',
                        lat: 11.9421,
                        lng: 108.4365,
                        cost: 300000,
                        note: 'Mua hồng treo gió, mứt dâu tây, trà atiso làm quà cho người thân.'
                    }
                ]
            }
        ]
    }
];
