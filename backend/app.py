"""
VivuPlan - FastAPI Backend API Server
Cung cấp các API RESTful cho Frontend / Web Client (PHP, Java, Node.js, HTML/JS):
  1. POST /api/optimize-itinerary : Chạy toàn bộ 4 giai đoạn AI tạo lịch trình
  2. POST /api/recalculate : Tự động tính lại thời gian và quãng đường khi Drag & Drop
  3. GET  /api/places : Truy vấn danh sách địa điểm (có hỗ trợ filter)
  4. GET  /api/health : Kiểm tra tình trạng server
"""

import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_engine import VivuPlanAIEngine

app = FastAPI(
    title="VivuPlan AI Itinerary API",
    description="API tối ưu hóa lịch trình du lịch thông minh đa mục tiêu với K-Means, Lọc cộng tác và TSP",
    version="2.0.0"
)

# Kích hoạt CORS để cho phép Frontend gọi API trực tiếp
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_engine = VivuPlanAIEngine()

# ================= DỮ LIỆU ĐỊA ĐIỂM NGHỆ AN MẪU =================
MOCK_PLACES = [
    {
        "id": "kim-lien",
        "destination_id": "nghean",
        "category_id": "culture",
        "name": "Khu di tích Kim Liên",
        "address": "Xã Kim Liên, Huyện Nam Đàn, Nghệ An",
        "lat": 18.7012,
        "lng": 105.5562,
        "cost": 30000,
        "is_resort_5star": False,
        "season_suitability": "all",
        "open_time": "07:30",
        "close_time": "17:30",
        "duration_minutes": 120,
        "rating": 4.9,
        "popularity": 0.98,
        "style_nature": 0.2,
        "style_history": 0.95,
        "style_cuisine": 0.1,
        "style_adventure": 0.2,
        "image_url": "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "de-cau-don",
        "destination_id": "nghean",
        "category_id": "food",
        "name": "Nhà hàng Dê Cầu Đòn Nam Đàn",
        "address": "Quốc lộ 46A, Nam Đàn, Nghệ An",
        "lat": 18.7035,
        "lng": 105.5684,
        "cost": 180000,
        "is_resort_5star": False,
        "season_suitability": "all",
        "open_time": "10:30",
        "close_time": "21:00",
        "duration_minutes": 75,
        "rating": 4.7,
        "popularity": 0.85,
        "style_nature": 0.1,
        "style_history": 0.4,
        "style_cuisine": 0.95,
        "style_adventure": 0.2,
        "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "chua-dai-tue",
        "destination_id": "nghean",
        "category_id": "culture",
        "name": "Chùa Đại Tuệ",
        "address": "Dãy núi Đại Huệ, Nam Anh, Nam Đàn",
        "lat": 18.7351,
        "lng": 105.5342,
        "cost": 20000,
        "is_resort_5star": False,
        "season_suitability": "all",
        "open_time": "06:00",
        "close_time": "18:30",
        "duration_minutes": 90,
        "rating": 4.8,
        "popularity": 0.82,
        "style_nature": 0.6,
        "style_history": 0.85,
        "style_cuisine": 0.1,
        "style_adventure": 0.4,
        "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "cua-lo-hotel",
        "destination_id": "nghean",
        "category_id": "hotel",
        "name": "Khách sạn Biển Cửa Lò (3 sao)",
        "address": "Đường Bình Minh, Thị xã Cửa Lò, Nghệ An",
        "lat": 18.7963,
        "lng": 105.7289,
        "cost": 450000,
        "is_resort_5star": False,
        "season_suitability": "all",
        "open_time": "14:00",
        "close_time": "23:59",
        "duration_minutes": 60,
        "rating": 4.6,
        "popularity": 0.90,
        "style_nature": 0.8,
        "style_history": 0.1,
        "style_cuisine": 0.2,
        "style_adventure": 0.3,
        "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "lan-chau",
        "destination_id": "nghean",
        "category_id": "nature",
        "name": "Đảo Lan Châu & Bãi biển Cửa Lò",
        "address": "Phía bắc bãi biển Cửa Lò, Nghệ An",
        "lat": 18.8123,
        "lng": 105.7335,
        "cost": 50000,
        "is_resort_5star": False,
        "season_suitability": "summer",
        "open_time": "06:00",
        "close_time": "19:00",
        "duration_minutes": 120,
        "rating": 4.7,
        "popularity": 0.92,
        "style_nature": 0.95,
        "style_history": 0.2,
        "style_cuisine": 0.4,
        "style_adventure": 0.6,
        "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "vinpearl-cua-hoi",
        "destination_id": "nghean",
        "category_id": "hotel",
        "name": "Vinpearl Cửa Hội Resort (5 sao)",
        "address": "Bình Minh, Hải Hòa, Cửa Lò",
        "lat": 18.7612,
        "lng": 105.7481,
        "cost": 1800000,
        "is_resort_5star": True,
        "season_suitability": "summer",
        "open_time": "06:00",
        "close_time": "22:00",
        "duration_minutes": 180,
        "rating": 4.9,
        "popularity": 0.95,
        "style_nature": 0.95,
        "style_history": 0.1,
        "style_cuisine": 0.7,
        "style_adventure": 0.5,
        "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "thanh-chuong-tea",
        "destination_id": "nghean",
        "category_id": "nature",
        "name": "Đảo Chè Thanh Chương",
        "address": "Xã Thanh An, Huyện Thanh Chương, Nghệ An",
        "lat": 18.7123,
        "lng": 105.2891,
        "cost": 120000,
        "is_resort_5star": False,
        "season_suitability": "all",
        "open_time": "07:00",
        "close_time": "17:30",
        "duration_minutes": 150,
        "rating": 4.8,
        "popularity": 0.91,
        "style_nature": 0.95,
        "style_history": 0.1,
        "style_cuisine": 0.2,
        "style_adventure": 0.7,
        "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "sup-luon-ba-lieu",
        "destination_id": "nghean",
        "category_id": "food",
        "name": "Súp Lươn & Cháo Lươn Xứ Nghệ",
        "address": "87 Mai Hắc Đế, TP. Vinh, Nghệ An",
        "lat": 18.6882,
        "lng": 105.6723,
        "cost": 60000,
        "is_resort_5star": False,
        "season_suitability": "all",
        "open_time": "06:30",
        "close_time": "20:30",
        "duration_minutes": 50,
        "rating": 4.8,
        "popularity": 0.94,
        "style_nature": 0.1,
        "style_history": 0.3,
        "style_cuisine": 0.98,
        "style_adventure": 0.2,
        "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "quang-trung-temple",
        "destination_id": "nghean",
        "category_id": "culture",
        "name": "Đền thờ Vua Quang Trung (Núi Quyết)",
        "address": "Dũng Quyết, Trung Đô, TP. Vinh, Nghệ An",
        "lat": 18.6492,
        "lng": 105.6881,
        "cost": 20000,
        "is_resort_5star": False,
        "season_suitability": "all",
        "open_time": "07:00",
        "close_time": "18:00",
        "duration_minutes": 90,
        "rating": 4.6,
        "popularity": 0.78,
        "style_nature": 0.7,
        "style_history": 0.88,
        "style_cuisine": 0.1,
        "style_adventure": 0.4,
        "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "muong-thanh-safari",
        "destination_id": "nghean",
        "category_id": "nature",
        "name": "Khu sinh thái Mường Thanh Diễn Lâm (Safari)",
        "address": "Xã Diễn Lâm, Huyện Diễn Châu, Nghệ An",
        "lat": 19.0125,
        "lng": 105.5123,
        "cost": 250000,
        "is_resort_5star": False,
        "season_suitability": "all",
        "open_time": "08:00",
        "close_time": "17:30",
        "duration_minutes": 180,
        "rating": 4.7,
        "popularity": 0.89,
        "style_nature": 0.9,
        "style_history": 0.1,
        "style_cuisine": 0.4,
        "style_adventure": 0.8,
        "image_url": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80"
    }
]

# ================= PYDANTIC SCHEMAS =================

class StartPointInput(BaseModel):
    name: str = Field(default="Ga Vinh (Nghệ An)")
    lat: float = Field(default=18.6835)
    lng: float = Field(default=105.6669)

class TravelStyleInput(BaseModel):
    nature: float = Field(default=0.7, description="70% Nghỉ dưỡng / Thiên nhiên")
    history: float = Field(default=0.3, description="30% Lịch sử / Văn hóa")
    cuisine: float = Field(default=0.0, description="0% Ẩm thực")
    adventure: float = Field(default=0.0, description="0% Khám phá")

class OptimizeItineraryRequest(BaseModel):
    start_point: StartPointInput = Field(default_factory=StartPointInput)
    destination: str = Field(default="nghean", description="Mã điểm đến (e.g. nghean, dalat)")
    days: int = Field(default=3, ge=1, le=14, description="Số ngày đi (ví dụ: 3 ngày 2 đêm)")
    max_budget: int = Field(default=3000000, description="Ngân sách tối đa (VNĐ)")
    season: str = Field(default="summer", description="summer / winter")
    travel_style: TravelStyleInput = Field(default_factory=TravelStyleInput)

class RecalculateRequest(BaseModel):
    items: List[Dict[str, Any]]
    start_point: StartPointInput
    start_time: str = Field(default="08:00")

# ================= ENDPOINTS =================

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "version": "2.0.0",
        "engine": "VivuPlan Multi-Stage AI Core",
        "stages": [
            "1. Filtering (Hard Constraints & Budget/Season)",
            "2. Spatial Clustering (K-Means coordinates)",
            "3. Personalized Ranking (Style Vector & Collaborative Filtering)",
            "4. Routing Optimization (TSP Solver with 2-Opt & Distance Matrix)"
        ]
    }

@app.get("/api/places")
def get_places(destination_id: Optional[str] = "nghean", category_id: Optional[str] = None):
    results = [p for p in MOCK_PLACES if p["destination_id"] == destination_id]
    if category_id:
        results = [p for p in results if p["category_id"] == category_id]
    return {"total": len(results), "places": results}

@app.post("/api/optimize-itinerary")
def optimize_itinerary(req: OptimizeItineraryRequest):
    """
    Endpoint chính: Chạy toàn bộ 4 giai đoạn AI thuật toán theo luồng Backend Core
    """
    places = [p for p in MOCK_PLACES if p["destination_id"] == req.destination]
    if not places:
        places = MOCK_PLACES

    start_dict = {"name": req.start_point.name, "lat": req.start_point.lat, "lng": req.start_point.lng}
    style_dict = {
        "nature": req.travel_style.nature,
        "history": req.travel_style.history,
        "cuisine": req.travel_style.cuisine,
        "adventure": req.travel_style.adventure
    }

    result = ai_engine.run_optimization_pipeline(
        all_places=places,
        start_point=start_dict,
        days_count=req.days,
        max_budget=req.max_budget,
        travel_style=style_dict,
        season=req.season
    )

    return {
        "success": True,
        "meta": {
            "destination": req.destination,
            "days": req.days,
            "max_budget": req.max_budget,
            "start_point": req.start_point.name,
            "travel_style": style_dict
        },
        "data": result
    }

@app.post("/api/recalculate")
def recalculate_timeline(req: RecalculateRequest):
    """
    Endpoint phụ vụ Drag & Drop: Tự động tính toán lại thời gian khi người dùng đổi chỗ các điểm
    """
    start_coord = (req.start_point.lat, req.start_point.lng)
    result = ai_engine.calculate_day_schedule(req.items, start_coord, req.start_time)
    return {
        "success": True,
        "data": result
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
