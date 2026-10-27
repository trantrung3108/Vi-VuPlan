/**
 * VivuPlan - AI Optimization Engine
 * Hiện thực hóa 4 giai đoạn thuật toán AI theo chuẩn thiết kế:
 * 1. Filtering: Lọc điều kiện cứng (Ngân sách, Mùa du lịch, Giờ mở cửa)
 * 2. Spatial Clustering: K-Means phân cụm địa lý theo K ngày
 * 3. Personalized Ranking: Lọc cộng tác & vector phong cách (Style Vector Scoring)
 * 4. Routing Optimization: Giải bài toán TSP (Traveling Salesperson Problem) & Ma trận khoảng cách
 */

const AIEngine = (function () {

    // Công thức tính khoảng cách Haversine (km) có tính hệ số đường bộ uốn lượn (1.28)
    function calculateHaversineKm(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
        const R = 6371; // Bán kính Trái Đất (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c * 1.28).toFixed(1));
    }

    // Ước tính thời gian di chuyển (phút) dựa trên khoảng cách và vận tốc đường bộ trung bình (38 km/h)
    function estimateTravelMinutes(distanceKm, speedKmh = 38) {
        if (distanceKm <= 0.2) return 5;
        const hours = distanceKm / speedKmh;
        return Math.round(hours * 60) + 5; // +5 phút trừ hao đậu xe / kẹt xe nhẹ
    }

    // ================= GIAI ĐOẠN 1: LỌC DỮ LIỆU THÔ (FILTERING) =================
    function filterRawData(places, { maxBudget, season, daysCount }) {
        const logs = [];
        const dailyBudget = maxBudget / daysCount;

        logs.push(`🔍 Khởi tạo lọc dữ liệu với ngân sách tối đa: ${maxBudget.toLocaleString('vi-VN')} đ (${dailyBudget.toLocaleString('vi-VN')} đ/ngày).`);

        const filtered = places.filter(place => {
            // Quy tắc 1: Nếu ngân sách thấp, loại bỏ các resort 5 sao đắt đỏ
            if (maxBudget < 4000000 || dailyBudget < 1500000) {
                if (place.isResort5Star || place.cost > dailyBudget * 0.7) {
                    logs.push(`❌ Loại bỏ [${place.name}]: Chi phí (${place.cost.toLocaleString('vi-VN')} đ) vượt ngưỡng ngân sách tiết kiệm.`);
                    return false;
                }
            }

            // Quy tắc 2: Nếu đi vào mùa đông, giảm ưu tiên hoặc loại trừ điểm tắm biển/công viên nước
            if (season === 'winter' && place.season && place.season.includes('summer') && !place.season.includes('all')) {
                logs.push(`⚠️ Giảm ưu tiên [${place.name}]: Điểm hoạt động biển mùa hè không phù hợp mùa đông.`);
                place.isWinterPenalized = true;
            }

            return true;
        });

        logs.push(`✅ Hoàn thành Giai đoạn 1: Giữ lại ${filtered.length}/${places.length} địa điểm thỏa mãn điều kiện cứng.`);
        return { filteredPlaces: filtered, logs };
    }

    // ================= GIAI ĐOẠN 2: PHÂN CỤM ĐỊA LÝ (SPATIAL CLUSTERING - K-MEANS) =================
    function kMeansSpatialClustering(places, K, startPoint) {
        const logs = [];
        logs.push(`🌐 Bắt đầu phân cụm K-Means Spatial Clustering với K = ${K} ngày...`);

        if (places.length <= K) {
            const trivialClusters = places.map((p, idx) => ({ clusterId: idx, places: [p], center: [p.lat, p.lng] }));
            return { clusters: trivialClusters, logs };
        }

        // Khởi tạo K tâm cụm ban đầu rải đều theo khoảng cách từ điểm xuất phát
        let centroids = [];
        const sortedByStart = [...places].sort((a, b) => {
            const dA = calculateHaversineKm(startPoint.lat, startPoint.lng, a.lat, a.lng);
            const dB = calculateHaversineKm(startPoint.lat, startPoint.lng, b.lat, b.lng);
            return dA - dB;
        });

        const step = Math.floor(sortedByStart.length / K);
        for (let i = 0; i < K; i++) {
            const p = sortedByStart[Math.min(i * step, sortedByStart.length - 1)];
            centroids.push([p.lat, p.lng]);
        }

        let clusters = Array.from({ length: K }, () => []);
        let iterations = 0;
        const maxIterations = 20;

        while (iterations < maxIterations) {
            clusters = Array.from({ length: K }, () => []);

            // Gán mỗi địa điểm vào tâm cụm gần nhất
            places.forEach(place => {
                let minDistance = Infinity;
                let bestClusterIdx = 0;

                centroids.forEach((c, idx) => {
                    const dist = calculateHaversineKm(place.lat, place.lng, c[0], c[1]);
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestClusterIdx = idx;
                    }
                });

                clusters[bestClusterIdx].push(place);
            });

            // Cập nhật lại tâm cụm
            let maxShift = 0;
            centroids = centroids.map((c, idx) => {
                const clusterPlaces = clusters[idx];
                if (clusterPlaces.length === 0) return c;

                const avgLat = clusterPlaces.reduce((sum, p) => sum + p.lat, 0) / clusterPlaces.length;
                const avgLng = clusterPlaces.reduce((sum, p) => sum + p.lng, 0) / clusterPlaces.length;

                const shift = calculateHaversineKm(c[0], c[1], avgLat, avgLng);
                if (shift > maxShift) maxShift = shift;

                return [avgLat, avgLng];
            });

            iterations++;
            if (maxShift < 0.1) break; // Hội tụ
        }

        // Cân bằng các cụm: Nếu cụm nào quá ít (< 2 điểm), mượn điểm gần nhất từ cụm khác
        clusters.forEach((cl, idx) => {
            if (cl.length === 0) {
                // Lấy điểm từ cụm có nhiều điểm nhất
                const largestCluster = clusters.reduce((prev, curr) => curr.length > prev.length ? curr : prev, clusters[0]);
                if (largestCluster.length > 2) {
                    cl.push(largestCluster.pop());
                }
            }
        });

        // Sắp xếp thứ tự các cụm theo khoảng cách di chuyển liên tiếp bắt đầu từ startPoint
        const orderedClusters = [];
        let currentRef = [startPoint.lat, startPoint.lng];
        const remainingClusterIndices = clusters.map((_, i) => i);

        while (remainingClusterIndices.length > 0) {
            let nearestIdx = remainingClusterIndices[0];
            let nearestDist = Infinity;

            remainingClusterIndices.forEach(idx => {
                const center = centroids[idx];
                const d = calculateHaversineKm(currentRef[0], currentRef[1], center[0], center[1]);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestIdx = idx;
                }
            });

            orderedClusters.push({
                dayNumber: orderedClusters.length + 1,
                places: clusters[nearestIdx],
                center: centroids[nearestIdx]
            });

            currentRef = centroids[nearestIdx];
            remainingClusterIndices.splice(remainingClusterIndices.indexOf(nearestIdx), 1);
        }

        orderedClusters.forEach((cl, i) => {
            logs.push(`📍 Cụm Ngày ${i + 1}: ${cl.places.length} địa điểm (Tọa độ tâm: ${cl.center[0].toFixed(3)}, ${cl.center[1].toFixed(3)}).`);
        });

        logs.push(`✅ Hoàn thành Giai đoạn 2: Gom thành công ${K} cụm không gian, loại bỏ hoàn toàn việc di chuyển ngược chiều.`);
        return { clusters: orderedClusters, logs };
    }

    // ================= GIAI ĐOẠN 3: XẾP HẠNG CÁ NHÂN HÓA (PERSONALIZED RANKING) =================
    function rankAndSelectPlaces(clusterPlaces, styleWeights) {
        // Chuẩn hóa vector phong cách người dùng sao cho tổng = 1.0
        const totalW = (styleWeights.natureRelax || 0) + (styleWeights.historyCulture || 0) + (styleWeights.foodie || 0) + (styleWeights.checkin || 0);
        const wNorm = {
            natureRelax: (styleWeights.natureRelax || 0.4) / (totalW || 1),
            historyCulture: (styleWeights.historyCulture || 0.3) / (totalW || 1),
            foodie: (styleWeights.foodie || 0.2) / (totalW || 1),
            checkin: (styleWeights.checkin || 0.1) / (totalW || 1)
        };

        // Chấm điểm từng địa điểm
        const scored = clusterPlaces.map(p => {
            const pStyle = p.style || { natureRelax: 0.5, historyCulture: 0.5, foodie: 0.5, checkin: 0.5 };

            // Độ khớp phong cách (Style Match Score)
            const styleScore =
                (wNorm.natureRelax * (pStyle.natureRelax || 0)) +
                (wNorm.historyCulture * (pStyle.historyCulture || 0)) +
                (wNorm.foodie * (pStyle.foodie || 0)) +
                (wNorm.checkin * (pStyle.checkin || 0));

            // Điểm Rating chuẩn hóa (0 - 1)
            const ratingScore = (p.rating || 4.5) / 5.0;

            // Mức độ phổ biến (0 - 1)
            const popularityScore = (p.popularity || 85) / 100.0;

            // Tổng điểm cá nhân hóa: Điểm số = 0.5 * Phong cách + 0.3 * Rating + 0.2 * Phổ biến
            let finalScore = (0.5 * styleScore) + (0.3 * ratingScore) + (0.2 * popularityScore);

            if (p.isWinterPenalized) finalScore *= 0.5;

            return { ...p, finalScore };
        });

        // Sắp xếp giảm dần theo điểm số
        scored.sort((a, b) => b.finalScore - a.finalScore);

        // Chọn lọc cân đối: 1 Điểm tham quan/văn hóa, 1 Quán ăn, 1 Điểm checkin/khám phá, 1 Lưu trú/Nghỉ đêm
        const selected = [];
        const sightPlace = scored.find(p => p.category === 'sightseeing') || scored[0];
        if (sightPlace) selected.push(sightPlace);

        const foodPlace = scored.find(p => p.category === 'food' && !selected.includes(p)) || scored.find(p => p.category === 'food');
        if (foodPlace && !selected.includes(foodPlace)) selected.push(foodPlace);

        const activityPlace = scored.find(p => (p.category === 'activity' || p.category === 'sightseeing') && !selected.includes(p));
        if (activityPlace && !selected.includes(activityPlace)) selected.push(activityPlace);

        const eveningPlace = scored.find(p => (p.category === 'hotel' || p.category === 'food' || p.category === 'shopping') && !selected.includes(p));
        if (eveningPlace && !selected.includes(eveningPlace)) selected.push(eveningPlace);

        // Bổ sung thêm điểm nếu cụm vẫn còn ít hơn 3
        scored.forEach(p => {
            if (selected.length < 4 && !selected.includes(p)) {
                selected.push(p);
            }
        });

        return selected;
    }

    // ================= GIAI ĐOẠN 4: TỐI ƯU HÓA LỘ TRÌNH (TSP ROUTING OPTIMIZATION) =================
    function solveTSPRouting(places, startCoord, startTimeStr = '08:00') {
        const logs = [];
        logs.push(`🚗 Bắt đầu giải bài toán Người giao hàng (TSP) cho ${places.length} điểm...`);

        if (places.length <= 1) {
            return { orderedActivities: formatActivitiesSchedule(places, startTimeStr, startCoord), logs };
        }

        // Thuật toán tìm đường Nearest Neighbor Heuristic kết hợp 2-Opt
        let currentPos = startCoord;
        const unvisited = [...places];
        const ordered = [];

        while (unvisited.length > 0) {
            let nearestIdx = 0;
            let minDist = Infinity;

            unvisited.forEach((p, idx) => {
                const dist = calculateHaversineKm(currentPos[0], currentPos[1], p.lat, p.lng);
                // Ưu tiên điểm ăn uống vào khung trưa
                let timeBonus = 0;
                if (ordered.length === 1 && p.category === 'food') timeBonus = -3; // Khuyến khích ăn trưa sau điểm sáng

                if (dist + timeBonus < minDist) {
                    minDist = dist + timeBonus;
                    nearestIdx = idx;
                }
            });

            const nextPlace = unvisited.splice(nearestIdx, 1)[0];
            ordered.push(nextPlace);
            currentPos = [nextPlace.lat, nextPlace.lng];
        }

        // Tối ưu 2-Opt để loại bỏ các đoạn đường chéo nhau
        let improved = true;
        let count2Opt = 0;
        while (improved && count2Opt < 10) {
            improved = false;
            count2Opt++;
            for (let i = 0; i < ordered.length - 1; i++) {
                for (let k = i + 1; k < ordered.length; k++) {
                    const prevCoord = i === 0 ? startCoord : [ordered[i - 1].lat, ordered[i - 1].lng];
                    const dCurrent = calculateHaversineKm(prevCoord[0], prevCoord[1], ordered[i].lat, ordered[i].lng) +
                                    (k + 1 < ordered.length ? calculateHaversineKm(ordered[k].lat, ordered[k].lng, ordered[k + 1].lat, ordered[k + 1].lng) : 0);

                    const dReversed = calculateHaversineKm(prevCoord[0], prevCoord[1], ordered[k].lat, ordered[k].lng) +
                                    (k + 1 < ordered.length ? calculateHaversineKm(ordered[i].lat, ordered[i].lng, ordered[k + 1].lat, ordered[k + 1].lng) : 0);

                    if (dReversed < dCurrent - 0.5) {
                        // Đảo đoạn [i, k]
                        const sub = ordered.slice(i, k + 1).reverse();
                        ordered.splice(i, sub.length, ...sub);
                        improved = true;
                    }
                }
            }
        }

        // Tạo khung giờ thực tế (Timeline schedule)
        const scheduled = formatActivitiesSchedule(ordered, startTimeStr, startCoord);
        logs.push(`✅ Hoàn thành Giai đoạn 4: Đã sắp xếp lộ trình tối ưu ${scheduled.map(a => a.title).join(' ➜ ')}.`);

        return { orderedActivities: scheduled, logs };
    }

    // Format giờ đến, giờ đi và khoảng cách di chuyển
    function formatActivitiesSchedule(orderedPlaces, startTimeStr, startCoord) {
        let currentMinutes = parseTimeToMinutes(startTimeStr);
        let prevCoord = startCoord;
        const activities = [];

        orderedPlaces.forEach((p, idx) => {
            const distanceKm = calculateHaversineKm(prevCoord[0], prevCoord[1], p.lat, p.lng);
            const travelMinutes = estimateTravelMinutes(distanceKm);

            // Thời gian đến
            const arrivalMinutes = currentMinutes + travelMinutes;
            const duration = p.durationMinutes || 90;
            const departureMinutes = arrivalMinutes + duration;

            const timeLabel = `${formatMinutesToTime(arrivalMinutes)} - ${formatMinutesToTime(departureMinutes)}`;

            activities.push({
                id: `ai-act-${Date.now()}-${idx + 1}`,
                time: timeLabel,
                startMinutes: arrivalMinutes,
                endMinutes: departureMinutes,
                durationMinutes: duration,
                distanceFromPrevKm: distanceKm,
                travelMinutesFromPrev: travelMinutes,
                title: p.name,
                category: p.category,
                address: p.address || p.name,
                lat: p.lat,
                lng: p.lng,
                cost: p.cost || 0,
                rating: p.rating || 4.7,
                note: p.note || ''
            });

            currentMinutes = departureMinutes;
            prevCoord = [p.lat, p.lng];
        });

        return activities;
    }

    function parseTimeToMinutes(timeStr) {
        const parts = timeStr.split(':').map(Number);
        return parts[0] * 60 + (parts[1] || 0);
    }

    function formatMinutesToTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60) % 24;
        const mins = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // ================= HÀM CHÍNH: KHỞI CHẠY BỘ TỐI ƯU TOÀN DIỆN =================
    function runCompleteAIOptimization({
        startPointId,
        customStartName,
        destinationKey,
        daysCount,
        maxBudget,
        styleWeights,
        season,
        startDate
    }) {
        daysCount = parseInt(daysCount) || 3;
        maxBudget = parseInt(maxBudget) || 3000000;
        season = season || 'summer';
        startDate = startDate || new Date().toISOString().split('T')[0];

        // Lấy thông tin điểm xuất phát
        let startPoint = STARTING_POINTS.find(s => s.id === startPointId);
        if (!startPoint) {
            startPoint = {
                id: 'custom_start',
                name: customStartName || 'Ga Vinh (Nghệ An)',
                lat: 18.6795,
                lng: 105.6706
            };
        }

        // Lấy kho địa điểm của điểm đến
        const dest = POPULAR_DESTINATIONS[destinationKey] || POPULAR_DESTINATIONS.nghean;
        const rawPlaces = [...dest.places];

        // Tổng hợp log quá trình chạy
        const fullLogs = [];

        // GIAI ĐOẠN 1
        const { filteredPlaces, logs: logs1 } = filterRawData(rawPlaces, { maxBudget, season, daysCount });
        fullLogs.push(...logs1);

        // GIAI ĐOẠN 2
        const { clusters, logs: logs2 } = kMeansSpatialClustering(filteredPlaces, daysCount, startPoint);
        fullLogs.push(...logs2);

        // GIAI ĐOẠN 3 & 4
        const generatedDays = [];
        let totalTripDistanceKm = 0;
        let totalTripTravelMinutes = 0;
        let lastDayEndCoord = [startPoint.lat, startPoint.lng];

        clusters.forEach((cluster, dayIdx) => {
            const dayNum = dayIdx + 1;
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + dayIdx);
            const dateStr = currentDate.toISOString().split('T')[0];

            // Giai đoạn 3: Xếp hạng
            const rankedPlaces = rankAndSelectPlaces(cluster.places, styleWeights);

            // Giai đoạn 4: TSP
            const startCoordForDay = dayIdx === 0 ? [startPoint.lat, startPoint.lng] : lastDayEndCoord;
            const { orderedActivities, logs: logs4 } = solveTSPRouting(rankedPlaces, startCoordForDay, '08:00');
            fullLogs.push(...logs4);

            const dayDistanceKm = orderedActivities.reduce((sum, a) => sum + (a.distanceFromPrevKm || 0), 0);
            const dayTravelMinutes = orderedActivities.reduce((sum, a) => sum + (a.travelMinutesFromPrev || 0), 0);

            totalTripDistanceKm += dayDistanceKm;
            totalTripTravelMinutes += dayTravelMinutes;

            if (orderedActivities.length > 0) {
                const lastAct = orderedActivities[orderedActivities.length - 1];
                lastDayEndCoord = [lastAct.lat, lastAct.lng];
            }

            let dayTitle = `Ngày ${dayNum}: Khám phá cụm ${dayNum}`;
            if (dayIdx === 0 && destinationKey === 'nghean') {
                dayTitle = 'Khu di tích Kim Liên & Biển Cửa Lò';
            } else if (dayIdx === 1 && destinationKey === 'nghean') {
                dayTitle = 'Đồi chè Thanh Chương & Điểm hẹn thiên nhiên';
            } else if (dayIdx === 2 && destinationKey === 'nghean') {
                dayTitle = 'Đền Vua Quang Trung, Súp Lươn & Tạm biệt TP. Vinh';
            }

            generatedDays.push({
                dayNumber: dayNum,
                date: dateStr,
                title: dayTitle,
                totalDistanceKm: parseFloat(dayDistanceKm.toFixed(1)),
                totalTravelMinutes: dayTravelMinutes,
                clusterName: `Cụm ${dayNum}`,
                activities: orderedActivities
            });
        });

        // Tạo chuyến đi hoàn chỉnh
        const startD = new Date(startDate);
        const endD = new Date(startDate);
        endD.setDate(startD.getDate() + daysCount - 1);

        const newTrip = {
            id: 'trip-ai-' + Date.now(),
            title: `${dest.name} ${daysCount}N${daysCount > 1 ? daysCount - 1 : 1}Đ - Tối Ưu Lộ Trình AI`,
            destination: dest.name,
            destinationKey: destinationKey,
            startPoint: startPoint.name,
            startCoords: [startPoint.lat, startPoint.lng],
            startDate: startD.toISOString().split('T')[0],
            endDate: endD.toISOString().split('T')[0],
            coverImage: dest.coverImage,
            budget: maxBudget,
            styleWeights: styleWeights,
            season: season,
            totalDistanceKm: parseFloat(totalTripDistanceKm.toFixed(1)),
            totalTravelMinutes: totalTripTravelMinutes,
            description: `Lộ trình thông minh tối ưu bằng thuật toán K-Means Clustering và bài toán Người giao hàng (TSP). Điểm xuất phát: ${startPoint.name}. Tổng quãng đường di chuyển: ${totalTripDistanceKm.toFixed(1)} km.`,
            packingList: [
                { id: 'p1', text: 'CCCD / Hộ chiếu bản gốc', done: true },
                { id: 'p2', text: 'Trang phục & sạc dự phòng', done: true },
                { id: 'p3', text: 'Thuốc cá nhân & kem chống nắng', done: false }
            ],
            days: generatedDays,
            aiExecutionLogs: fullLogs
        };

        return newTrip;
    }

    // Tự động tính toán lại thời gian và khoảng cách của một ngày sau khi người dùng kéo thả (Drag & Drop)
    function recalculateDaySchedule(day, startCoord = null, startTimeStr = '08:00') {
        if (!day || !day.activities || day.activities.length === 0) return day;

        let currentMinutes = parseTimeToMinutes(startTimeStr);
        let prevCoord = startCoord || [day.activities[0].lat, day.activities[0].lng];
        let totalDist = 0;
        let totalTravel = 0;

        day.activities.forEach((act, idx) => {
            let dist = 0;
            if (idx === 0 && startCoord) {
                dist = calculateHaversineKm(startCoord[0], startCoord[1], act.lat, act.lng);
            } else if (idx > 0) {
                dist = calculateHaversineKm(prevCoord[0], prevCoord[1], act.lat, act.lng);
            }

            const travelMin = estimateTravelMinutes(dist);
            totalDist += dist;
            totalTravel += travelMin;

            const arrMin = currentMinutes + travelMin;
            const dur = act.durationMinutes || 90;
            const depMin = arrMin + dur;

            act.time = `${formatMinutesToTime(arrMin)} - ${formatMinutesToTime(depMin)}`;
            act.startMinutes = arrMin;
            act.endMinutes = depMin;
            act.distanceFromPrevKm = dist;
            act.travelMinutesFromPrev = travelMin;

            currentMinutes = depMin;
            prevCoord = [act.lat, act.lng];
        });

        day.totalDistanceKm = parseFloat(totalDist.toFixed(1));
        day.totalTravelMinutes = totalTravel;
        return day;
    }

    return {
        runCompleteAIOptimization,
        recalculateDaySchedule,
        calculateHaversineKm,
        estimateTravelMinutes
    };
})();
