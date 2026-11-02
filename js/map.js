/**
 * VivuPlan - Google Maps & Leaflet Interactive Map Module
 * Tích hợp bản đồ Google Maps (Đường phố, Vệ tinh, Địa hình)
 * Quản lý hiển thị marker đánh số, đường nối lộ trình polyline, click chọn tọa độ và link Google Maps
 */

const MapModule = (function () {
    let map = null;
    let baseLayer = null;
    let markersLayer = null;
    let routePolyline = null;
    let pickLocationCallback = null;
    let tempPickerMarker = null;
    let currentMapType = 'googleRoad';

    // Cấu hình các lớp bản đồ Google Maps (Độ nét cao, không bị chặn 403, có tiếng Việt chuẩn)
    const MAP_LAYERS = {
        googleRoad: {
            name: 'Google Maps Đường Phố',
            url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            options: {
                subdomains: ['0', '1', '2', '3'],
                maxZoom: 20,
                attribution: '&copy; Google Maps'
            }
        },
        googleHybrid: {
            name: 'Google Maps Vệ Tinh (Hybrid)',
            url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            options: {
                subdomains: ['0', '1', '2', '3'],
                maxZoom: 20,
                attribution: '&copy; Google Maps Vệ Tinh'
            }
        },
        googleTerrain: {
            name: 'Google Maps Địa Hình',
            url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
            options: {
                subdomains: ['0', '1', '2', '3'],
                maxZoom: 20,
                attribution: '&copy; Google Maps Địa Hình'
            }
        }
    };

    // Khởi tạo bản đồ với lớp Google Maps
    function initMap(containerId = 'tripMap', center = [16.0544, 108.2022], zoom = 6) {
        if (map) {
            map.remove();
            map = null;
        }

        const mapContainer = document.getElementById(containerId);
        if (!mapContainer) return;

        // Khởi tạo Leaflet Map
        map = L.map(containerId, {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView(center, zoom);

        // Áp dụng lớp Google Maps mặc định
        setMapType(currentMapType);

        markersLayer = L.layerGroup().addTo(map);

        // Sự kiện click trên map (cho tính năng chọn tọa độ khi thêm địa điểm mới)
        map.on('click', function (e) {
            if (pickLocationCallback) {
                const { lat, lng } = e.latlng;
                setPickerMarker(lat, lng);
                pickLocationCallback(lat, lng);
            }
        });

        // Đảm bảo map render chuẩn khi resize container
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 300);
    }

    // Chuyển đổi giữa các loại bản đồ Google Maps (Đường phố, Vệ tinh, Địa hình)
    function setMapType(typeKey) {
        if (!map) return;
        const layerConfig = MAP_LAYERS[typeKey] || MAP_LAYERS.googleRoad;
        currentMapType = typeKey;

        if (baseLayer) {
            map.removeLayer(baseLayer);
        }

        baseLayer = L.tileLayer(layerConfig.url, layerConfig.options).addTo(map);

        // Đưa markersLayer lên trên
        if (markersLayer) {
            markersLayer.bringToFront();
        }
    }

    // Đặt marker tạm thời khi người dùng click chọn điểm trên map trong modal
    function setPickerMarker(lat, lng) {
        if (!map) return;
        if (tempPickerMarker) {
            markersLayer.removeLayer(tempPickerMarker);
        }

        const customIcon = L.divIcon({
            className: 'custom-picker-pin',
            html: `<div class="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        tempPickerMarker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);
    }

    // Kích hoạt chế độ click bản đồ để chọn tọa độ
    function enableLocationPicker(callback) {
        pickLocationCallback = callback;
        if (map) {
            map.getContainer().style.cursor = 'crosshair';
        }
    }

    // Tắt chế độ click chọn tọa độ
    function disableLocationPicker() {
        pickLocationCallback = null;
        if (tempPickerMarker && markersLayer) {
            markersLayer.removeLayer(tempPickerMarker);
            tempPickerMarker = null;
        }
        if (map) {
            map.getContainer().style.cursor = '';
        }
    }

    // Cập nhật các điểm đến trên bản đồ cho ngày đang chọn
    function renderActivitiesOnMap(activities = [], destinationCenter = null) {
        if (!map || !markersLayer) return;

        // Xóa các marker và polyline cũ
        markersLayer.clearLayers();
        if (routePolyline) {
            map.removeLayer(routePolyline);
            routePolyline = null;
        }

        const validCoords = [];
        const markersMap = {};

        activities.forEach((act, index) => {
            if (act.lat && act.lng) {
                const lat = parseFloat(act.lat);
                const lng = parseFloat(act.lng);

                if (!isNaN(lat) && !isNaN(lng)) {
                    const point = [lat, lng];
                    validCoords.push(point);

                    // Phân loại màu sắc
                    const cat = CATEGORIES[act.category] || CATEGORIES.sightseeing;
                    const orderNum = index + 1;

                    // Tạo DivIcon đánh số thứ tự đẹp mắt
                    const iconHtml = `
                        <div class="relative group cursor-pointer transition-transform duration-200 hover:scale-125">
                            <div class="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center shadow-md border-2 border-white text-sm"
                                 style="background-color: ${cat.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                                ${orderNum}
                            </div>
                            <div class="w-2.5 h-2.5 bg-gray-900 mx-auto -mt-1 rotate-45 transform"></div>
                        </div>
                    `;

                    const customIcon = L.divIcon({
                        className: 'map-route-marker',
                        html: iconHtml,
                        iconSize: [36, 42],
                        iconAnchor: [18, 42],
                        popupAnchor: [0, -42]
                    });

                    // Link mở trực tiếp địa điểm này trên Google Maps
                    const gmapsDirectUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title)}+${lat},${lng}`;

                    const popupContent = `
                        <div class="p-2 min-w-[210px]">
                            <div class="flex items-center gap-1.5 mb-1">
                                <span class="px-2 py-0.5 text-xs font-semibold rounded-full" style="background-color: ${cat.color}20; color: ${cat.color};">
                                    #${orderNum} - ${cat.label}
                                </span>
                            </div>
                            <h4 class="font-bold text-gray-900 text-sm mb-1">${act.title}</h4>
                            <p class="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <span>🕒 ${act.time || 'Linh hoạt'}</span>
                            </p>
                            ${act.cost ? `<p class="text-xs font-semibold text-emerald-600 mb-1">💰 ${act.cost.toLocaleString('vi-VN')} đ</p>` : ''}
                            ${act.note ? `<p class="text-xs text-gray-600 italic bg-gray-50 p-1.5 rounded mb-2">${act.note}</p>` : ''}
                            <a href="${gmapsDirectUrl}" target="_blank" rel="noopener noreferrer" 
                               class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline pt-1 border-t border-gray-100 w-full">
                                <span>🗺️ Mở trên Google Maps</span>
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                        </div>
                    `;

                    const marker = L.marker(point, { icon: customIcon })
                        .bindPopup(popupContent)
                        .addTo(markersLayer);

                    marker.on('click', () => {
                        highlightTimelineCard(act.id);
                    });

                    markersMap[act.id] = marker;
                }
            }
        });

        // Vẽ đường nối lộ trình giữa các điểm (Polyline)
        if (validCoords.length > 1) {
            routePolyline = L.polyline(validCoords, {
                color: '#2563eb',
                weight: 4,
                opacity: 0.9,
                dashArray: '8, 8',
                lineJoin: 'round'
            }).addTo(map);
        }

        // Tự động căn chỉnh tầm nhìn (zoom) để thấy toàn bộ các điểm
        if (validCoords.length > 0) {
            const bounds = L.latLngBounds(validCoords);
            map.fitBounds(bounds, {
                padding: [45, 45],
                maxZoom: 15,
                animate: true
            });
        } else if (destinationCenter) {
            map.setView(destinationCenter, 12, { animate: true });
        }
    }

    // Focus vào một địa điểm cụ thể trên bản đồ
    function focusLocation(lat, lng, zoom = 15) {
        if (!map) return;
        map.setView([lat, lng], zoom, {
            animate: true,
            duration: 0.8
        });
    }

    // Highlight card tương ứng khi click marker
    function highlightTimelineCard(activityId) {
        const card = document.getElementById(`act-card-${activityId}`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50/50');
            setTimeout(() => {
                card.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50/50');
            }, 1800);
        }
    }

    // Tạo link chỉ đường toàn bộ các điểm trong ngày trên Google Maps
    function getGoogleMapsDirectionsUrl(activities = []) {
        const validActivities = activities.filter(a => a.lat && a.lng && !isNaN(a.lat) && !isNaN(a.lng));
        if (validActivities.length === 0) return 'https://www.google.com/maps';

        if (validActivities.length === 1) {
            const a = validActivities[0];
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.title)}+${a.lat},${a.lng}`;
        }

        const origin = validActivities[0];
        const destination = validActivities[validActivities.length - 1];
        const waypoints = validActivities.slice(1, validActivities.length - 1);

        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;

        if (waypoints.length > 0) {
            const waypointsStr = waypoints.map(w => `${w.lat},${w.lng}`).join('|');
            url += `&waypoints=${waypointsStr}`;
        }

        url += '&travelmode=driving';
        return url;
    }

    // Refresh kích thước bản đồ
    function invalidateSize() {
        if (map) {
            map.invalidateSize();
        }
    }

    return {
        initMap,
        setMapType,
        renderActivitiesOnMap,
        focusLocation,
        enableLocationPicker,
        disableLocationPicker,
        setPickerMarker,
        getGoogleMapsDirectionsUrl,
        invalidateSize
    };
})();
