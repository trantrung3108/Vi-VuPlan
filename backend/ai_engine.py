"""
VivuPlan - AI Optimization Engine (Python Backend Core)
Hiện thực hóa 4 giai đoạn thuật toán AI:
  1. Giai đoạn 1: Lọc dữ liệu thô (Filtering - Hard Constraints)
  2. Giai đoạn 2: Phân cụm địa lý (Spatial Clustering - K-Means)
  3. Giai đoạn 3: Xếp hạng cá nhân hóa (Personalized Ranking - Collaborative Filtering & Style Vector)
  4. Giai đoạn 4: Giải bài toán tìm đường (Routing Optimization - TSP & Distance Matrix)
"""

import math
from typing import List, Dict, Any, Tuple


class VivuPlanAIEngine:
    def __init__(self, avg_speed_kmh: float = 38.0, road_factor: float = 1.28):
        self.avg_speed_kmh = avg_speed_kmh
        self.road_factor = road_factor

    # ================= CÁC HÀM TOÁN HỌC CƠ BẢN =================

    def haversine_distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Tính khoảng cách Haversine giữa 2 tọa độ (kinh độ, vĩ độ)
        Nhân với hệ số đường bộ uốn lượn (1.28) để phản ánh thực tế giao thông Việt Nam
        """
        if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
            return 0.0
        R = 6371.0  # Bán kính Trái Đất (km)
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2.0) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        distance = R * c * self.road_factor
        return round(distance, 1)

    def estimate_travel_minutes(self, distance_km: float) -> int:
        """
        Ước tính thời gian di chuyển (phút) = (Quãng đường / Vận tốc trung bình) * 60 + 5 phút trừ hao
        """
        if distance_km <= 0.2:
            return 5
        hours = distance_km / self.avg_speed_kmh
        return int(round(hours * 60.0)) + 5

    def format_minutes_to_time(self, total_minutes: int) -> str:
        """Chuyển số phút từ 00:00 thành định dạng HH:MM"""
        hours = (total_minutes // 60) % 24
        mins = total_minutes % 60
        return f"{hours:02d}:{mins:02d}"

    def parse_time_to_minutes(self, time_str: str) -> int:
        """Chuyển chuỗi HH:MM hoặc HH:MM:SS thành số phút trong ngày"""
        parts = time_str.split(":")
        h = int(parts[0]) if len(parts) > 0 else 8
        m = int(parts[1]) if len(parts) > 1 else 0
        return h * 60 + m

    # ================= GIAI ĐOẠN 1: LỌC DỮ LIỆU THÔ (FILTERING) =================

    def filter_raw_data(
        self,
        places: List[Dict[str, Any]],
        max_budget: int,
        days_count: int,
        season: str = "summer"
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Giai đoạn 1: Lọc dữ liệu thô
        - Loại bỏ các resort 5 sao đắt đỏ nếu người dùng có ngân sách tiết kiệm
        - Giảm ưu tiên hoặc loại bỏ các bãi biển / công viên nước nếu đi vào mùa đông
        - Kiểm tra các ràng buộc cứng
        """
        logs = []
        daily_budget = max_budget / max(1, days_count)
        logs.append(f"🔍 [Giai đoạn 1 - Filtering]: Ngân sách tối đa {max_budget:,.0f} đ ({daily_budget:,.0f} đ/ngày), Mùa: {season}.")

        filtered = []
        for place in places:
            cost = place.get("cost", 0)
            is_resort = place.get("is_resort_5star", False)
            suitability = place.get("season_suitability", "all")

            # Quy tắc ngân sách: Ngân sách tổng < 4.000.000 đ hoặc trung bình ngày < 1.500.000 đ
            if max_budget < 4000000 or daily_budget < 1500000:
                if is_resort or cost > daily_budget * 0.7:
                    logs.append(f"❌ Loại bỏ [{place.get('name')}]: Chi phí ({cost:,.0f} đ) hoặc resort 5 sao vượt ngưỡng ngân sách tiết kiệm.")
                    continue

            # Quy tắc mùa: Đi vào mùa đông thì giảm trọng số hoặc gắn cờ
            p_copy = dict(place)
            if season == "winter" and "summer" in suitability and "all" not in suitability:
                logs.append(f"⚠️ Cảnh báo mùa [{place.get('name')}]: Hoạt động biển hè không tối ưu cho mùa đông.")
                p_copy["is_winter_penalized"] = True

            filtered.append(p_copy)

        logs.append(f"✅ Hoàn thành Giai đoạn 1: Giữ lại {len(filtered)}/{len(places)} địa điểm phù hợp điều kiện cứng.")
        return filtered, logs

    # ================= GIAI ĐOẠN 2: PHÂN CỤM ĐỊA LÝ (SPATIAL CLUSTERING - K-MEANS) =================

    def spatial_clustering_kmeans(
        self,
        places: List[Dict[str, Any]],
        k_days: int,
        start_coord: Tuple[float, float]
    ) -> Tuple[List[List[Dict[str, Any]]], List[str]]:
        """
        Giai đoạn 2: Phân cụm địa lý K-Means
        Gom các điểm đến thành K cụm (K = số ngày).
        Mỗi ngày người dùng chỉ di chuyển trong phạm vi 1 cụm duy nhất để tránh chạy ngược chiều Bắc - Nam.
        Sắp xếp thứ tự các cụm theo khoảng cách tiếp cận từ Điểm xuất phát.
        """
        logs = []
        logs.append(f"🌐 [Giai đoạn 2 - K-Means]: Bắt đầu phân {len(places)} địa điểm thành K = {k_days} cụm địa lý...")

        if len(places) <= k_days:
            logs.append(f"ℹ️ Số lượng địa điểm ({len(places)}) <= số ngày ({k_days}), phân bố 1 cụm mỗi điểm.")
            return [[p] for p in places], logs

        # Sắp xếp các điểm theo khoảng cách từ điểm xuất phát để khởi tạo K centroids trải đều
        start_lat, start_lng = start_coord
        sorted_by_start = sorted(
            places,
            key=lambda p: self.haversine_distance_km(start_lat, start_lng, p["lat"], p["lng"])
        )

        step = len(sorted_by_start) // k_days
        centroids = []
        for i in range(k_days):
            idx = min(i * step, len(sorted_by_start) - 1)
            centroids.append([sorted_by_start[idx]["lat"], sorted_by_start[idx]["lng"]])

        # Thuật toán K-Means lặp 20 lần
        clusters = [[] for _ in range(k_days)]
        for _ in range(20):
            clusters = [[] for _ in range(k_days)]
            for place in places:
                min_dist = float("inf")
                best_k = 0
                for k_idx, c in enumerate(centroids):
                    d = self.haversine_distance_km(place["lat"], place["lng"], c[0], c[1])
                    if d < min_dist:
                        min_dist = d
                        best_k = k_idx
                clusters[best_k].append(place)

            # Cập nhật tọa độ tâm cụm (Centroid Update)
            has_moved = False
            for k_idx in range(k_days):
                if not clusters[k_idx]:
                    continue
                avg_lat = sum(p["lat"] for p in clusters[k_idx]) / len(clusters[k_idx])
                avg_lng = sum(p["lng"] for p in clusters[k_idx]) / len(clusters[k_idx])
                if abs(centroids[k_idx][0] - avg_lat) > 1e-4 or abs(centroids[k_idx][1] - avg_lng) > 1e-4:
                    centroids[k_idx] = [avg_lat, avg_lng]
                    has_moved = True

            if not has_moved:
                break

        # Sắp xếp thứ tự các cụm: Cụm gần điểm xuất phát nhất sẽ được ưu tiên đi vào Ngày 1
        cluster_info = []
        for idx, cl in enumerate(clusters):
            if cl:
                c_lat = sum(p["lat"] for p in cl) / len(cl)
                c_lng = sum(p["lng"] for p in cl) / len(cl)
            else:
                c_lat, c_lng = start_lat, start_lng
            dist_to_start = self.haversine_distance_km(start_lat, start_lng, c_lat, c_lng)
            cluster_info.append({"index": idx, "places": cl, "center": (c_lat, c_lng), "dist_to_start": dist_to_start})

        # Sort clusters by proximity to starting point
        cluster_info.sort(key=lambda x: x["dist_to_start"])
        ordered_clusters = [ci["places"] for ci in cluster_info]

        for i, ci in enumerate(cluster_info):
            logs.append(f"📍 Cụm Ngày {i+1}: {len(ci['places'])} điểm đến (Cách điểm xuất phát ~{ci['dist_to_start']} km).")

        return ordered_clusters, logs

    # ================= GIAI ĐOẠN 3: XẾP HẠNG CÁ NHÂN HÓA (PERSONALIZED RANKING) =================

    def calculate_style_score(self, place: Dict[str, Any], user_style: Dict[str, float]) -> float:
        """
        Tính độ tương đồng Cosine Similarity giữa Vector sở thích người dùng và Vector của địa điểm
        Vector: [nature, history, cuisine, adventure]
        """
        u_nature = user_style.get("nature", 0.0)
        u_history = user_style.get("history", 0.0)
        u_cuisine = user_style.get("cuisine", 0.0)
        u_adventure = user_style.get("adventure", 0.0)

        p_nature = place.get("style_nature", 0.2)
        p_history = place.get("style_history", 0.2)
        p_cuisine = place.get("style_cuisine", 0.2)
        p_adventure = place.get("style_adventure", 0.2)

        # Dot product
        dot = (u_nature * p_nature + u_history * p_history +
               u_cuisine * p_cuisine + u_adventure * p_adventure)

        u_norm = math.sqrt(u_nature**2 + u_history**2 + u_cuisine**2 + u_adventure**2) or 1.0
        p_norm = math.sqrt(p_nature**2 + p_history**2 + p_cuisine**2 + p_adventure**2) or 1.0

        similarity = dot / (u_norm * p_norm)
        return round(similarity, 3)

    def personalized_ranking(
        self,
        cluster_places: List[Dict[str, Any]],
        user_style: Dict[str, float],
        target_count: int = 3
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Giai đoạn 3: Xếp hạng cá nhân hóa (Collaborative Filtering & Multi-Criteria Scoring)
        Công thức điểm số tổng hợp:
          Score = (0.50 * StyleMatch) + (0.30 * NormalizedRating) + (0.20 * Popularity)
        """
        logs = []
        if not cluster_places:
            return [], logs

        scored_places = []
        for p in cluster_places:
            style_match = self.calculate_style_score(p, user_style)
            norm_rating = p.get("rating", 4.5) / 5.0
            popularity = p.get("popularity", 0.8)

            score = 0.50 * style_match + 0.30 * norm_rating + 0.20 * popularity

            if p.get("is_winter_penalized"):
                score *= 0.65

            p_scored = dict(p)
            p_scored["ai_score"] = round(score, 3)
            p_scored["style_match"] = style_match
            scored_places.append(p_scored)

        # Sắp xếp điểm số giảm dần
        scored_places.sort(key=lambda x: x["ai_score"], reverse=True)

        # Chiến lược cân đối cấu trúc ngày: 1 Điểm tham quan chính, 1 Ẩm thực (trưa), 1 Nghỉ dưỡng/Check-in
        selected = []
        culture_nature = [p for p in scored_places if p.get("category_id") in ["culture", "nature"]]
        food_places = [p for p in scored_places if p.get("category_id") == "food"]
        hotels = [p for p in scored_places if p.get("category_id") in ["hotel", "entertainment"]]

        # 1. Điểm tham quan buổi sáng
        if culture_nature:
            selected.append(culture_nature[0])

        # 2. Điểm ăn trưa
        if food_places:
            selected.append(food_places[0])
        elif len(culture_nature) > 1:
            selected.append(culture_nature[1])

        # 3. Điểm buổi chiều / nhận phòng
        if hotels:
            selected.append(hotels[0])
        else:
            remaining = [p for p in scored_places if p not in selected]
            if remaining:
                selected.append(remaining[0])

        # Nếu còn thiếu, thêm các điểm có điểm số cao nhất chưa chọn
        for p in scored_places:
            if len(selected) >= target_count:
                break
            if p not in selected:
                selected.append(p)

        logs.append(f"⭐ [Giai đoạn 3 - Ranking]: Đã chấm điểm {len(cluster_places)} điểm và tuyển chọn top {len(selected)} điểm tối ưu.")
        return selected, logs

    # ================= GIAI ĐOẠN 4: GIẢI BÀI TOÁN TÌM ĐƯỜNG (ROUTING OPTIMIZATION - TSP) =================

    def build_distance_matrix(
        self,
        nodes: List[Dict[str, Any]]
    ) -> List[List[float]]:
        """
        Xây dựng Ma trận Khoảng cách (Distance Matrix) giữa tất cả các điểm
        Có thể kết nối API Google Maps Distance Matrix hoặc OSRM.
        Hiện tại dùng Haversine x 1.28 có độ chính xác cao đối với bản đồ giao thông.
        """
        n = len(nodes)
        matrix = [[0.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j:
                    matrix[i][j] = self.haversine_distance_km(
                        nodes[i]["lat"], nodes[i]["lng"],
                        nodes[j]["lat"], nodes[j]["lng"]
                    )
        return matrix

    def solve_tsp_2opt(
        self,
        start_coord: Tuple[float, float],
        places: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], float]:
        """
        Giải biến thể Bài toán Người giao hàng (TSP) bằng thuật toán Heuristic:
        1. Nearest Neighbor (Khởi tạo chu trình ban đầu xuất phát từ start_coord)
        2. 2-Opt Local Search (Tối ưu hóa các đoạn giao cắt)
        """
        if not places:
            return [], 0.0

        all_nodes = [{"id": "start", "name": "Điểm xuất phát", "lat": start_coord[0], "lng": start_coord[1]}] + places
        dist_matrix = self.build_distance_matrix(all_nodes)

        # 1. Nearest Neighbor bắt đầu từ node 0
        unvisited = set(range(1, len(all_nodes)))
        current = 0
        route = [current]

        while unvisited:
            next_node = min(unvisited, key=lambda node: dist_matrix[current][node])
            route.append(next_node)
            unvisited.remove(next_node)
            current = next_node

        # 2. Cải tiến với 2-Opt
        def route_length(r: List[int]) -> float:
            return sum(dist_matrix[r[i]][r[i + 1]] for i in range(len(r) - 1))

        improved = True
        best_route = list(route)
        best_dist = route_length(best_route)

        while improved:
            improved = False
            for i in range(1, len(best_route) - 1):
                for j in range(i + 1, len(best_route)):
                    # Đảo ngược đoạn từ i đến j
                    new_route = best_route[:i] + best_route[i:j + 1][::-1] + best_route[j + 1:]
                    new_dist = route_length(new_route)
                    if new_dist < best_dist - 0.01:
                        best_route = new_route
                        best_dist = new_dist
                        improved = True
                        break
                if improved:
                    break

        ordered_places = [places[idx - 1] for idx in best_route[1:]]
        return ordered_places, round(best_dist, 2)

    def calculate_day_schedule(
        self,
        ordered_places: List[Dict[str, Any]],
        start_coord: Tuple[float, float],
        day_start_time: str = "08:00"
    ) -> Dict[str, Any]:
        """
        Tính toán lịch trình chi tiết theo mốc thời gian:
        - Giờ đến (arrive_time), Giờ rời đi (depart_time)
        - Thời gian di chuyển từ điểm trước (travel_from_prev_minutes)
        - Quãng đường từ điểm trước (distance_from_prev_km)
        """
        current_minutes = self.parse_time_to_minutes(day_start_time)
        prev_lat, prev_lng = start_coord
        total_distance = 0.0
        total_travel_time = 0
        scheduled_items = []

        for idx, place in enumerate(ordered_places):
            dist_km = self.haversine_distance_km(prev_lat, prev_lng, place["lat"], place["lng"])
            travel_mins = self.estimate_travel_minutes(dist_km)

            total_distance += dist_km
            total_travel_time += travel_mins

            current_minutes += travel_mins
            arrive_time = self.format_minutes_to_time(current_minutes)

            duration = place.get("duration_minutes", 90)
            current_minutes += duration
            depart_time = self.format_minutes_to_time(current_minutes)

            item = dict(place)
            item.update({
                "order_index": idx,
                "arrive_time": arrive_time,
                "depart_time": depart_time,
                "duration_minutes": duration,
                "distance_from_prev_km": dist_km,
                "travel_from_prev_minutes": travel_mins
            })
            scheduled_items.append(item)
            prev_lat, prev_lng = place["lat"], place["lng"]

        return {
            "items": scheduled_items,
            "total_distance_km": round(total_distance, 1),
            "total_travel_minutes": total_travel_time
        }

    # ================= PIPELINE TỔNG HỢP (ORCHESTRATOR) =================

    def run_optimization_pipeline(
        self,
        all_places: List[Dict[str, Any]],
        start_point: Dict[str, Any],
        days_count: int = 3,
        max_budget: int = 3000000,
        travel_style: Dict[str, float] = None,
        season: str = "summer"
    ) -> Dict[str, Any]:
        """
        Thực thi toàn bộ luồng 4 giai đoạn AI:
        1. Filtering
        2. K-Means Clustering
        3. Personalized Ranking
        4. TSP Routing & Scheduling
        """
        if travel_style is None:
            travel_style = {"nature": 0.7, "history": 0.3, "cuisine": 0.0, "adventure": 0.0}

        all_logs = []
        all_logs.append("🚀 [VivuPlan AI Core] Bắt đầu tiến trình tối ưu hóa đa mục tiêu...")

        # Giai đoạn 1: Lọc dữ liệu thô
        filtered_places, f_logs = self.filter_raw_data(all_places, max_budget, days_count, season)
        all_logs.extend(f_logs)

        # Giai đoạn 2: Phân cụm địa lý theo K ngày
        start_coord = (start_point["lat"], start_point["lng"])
        clusters, c_logs = self.spatial_clustering_kmeans(filtered_places, days_count, start_coord)
        all_logs.extend(c_logs)

        # Giai đoạn 3 & 4: Xếp hạng và tìm đường cho từng ngày
        itinerary_days = []
        total_trip_cost = 0
        total_trip_distance = 0.0
        total_trip_travel_mins = 0

        current_day_start_coord = start_coord

        for day_idx in range(days_count):
            cluster_places = clusters[day_idx] if day_idx < len(clusters) else []
            all_logs.append(f"\n--- Tối ưu hóa Ngày {day_idx + 1} ---")

            # Giai đoạn 3: Xếp hạng
            selected_places, r_logs = self.personalized_ranking(cluster_places, travel_style, target_count=3)
            all_logs.extend(r_logs)

            # Giai đoạn 4: TSP Routing
            ordered_places, tsp_dist = self.solve_tsp_2opt(current_day_start_coord, selected_places)
            schedule = self.calculate_day_schedule(ordered_places, current_day_start_coord, "08:00")

            day_cost = sum(p.get("cost", 0) for p in schedule["items"])
            total_trip_cost += day_cost
            total_trip_distance += schedule["total_distance_km"]
            total_trip_travel_mins += schedule["total_travel_minutes"]

            itinerary_days.append({
                "day_number": day_idx + 1,
                "title": f"Ngày {day_idx + 1}",
                "items": schedule["items"],
                "day_cost": day_cost,
                "day_distance_km": schedule["total_distance_km"],
                "day_travel_minutes": schedule["total_travel_minutes"]
            })

            # Điểm xuất phát của ngày tiếp theo là điểm kết thúc của ngày hôm trước
            if schedule["items"]:
                last_place = schedule["items"][-1]
                current_day_start_coord = (last_place["lat"], last_place["lng"])

        all_logs.append(f"🏁 Hoàn thành toàn bộ lộ trình: {days_count} ngày, tổng chi phí {total_trip_cost:,.0f} đ, quãng đường {round(total_trip_distance, 1)} km.")

        # Sinh Google Maps Directions Link
        coords = [f"{start_coord[0]},{start_coord[1]}"]
        for day in itinerary_days:
            for item in day["items"]:
                coords.append(f"{item['lat']},{item['lng']}")
        
        origin = coords[0]
        destination = coords[-1]
        waypoints = "|".join(coords[1:-1][:10])  # Google giới hạn số lượng waypoints
        gmaps_url = f"https://www.google.com/maps/dir/?api=1&origin={origin}&destination={destination}"
        if waypoints:
            gmaps_url += f"&waypoints={waypoints}"

        return {
            "days": itinerary_days,
            "total_cost": total_trip_cost,
            "total_distance_km": round(total_trip_distance, 1),
            "total_travel_minutes": total_trip_travel_mins,
            "google_maps_link": gmaps_url,
            "logs": all_logs
        }
