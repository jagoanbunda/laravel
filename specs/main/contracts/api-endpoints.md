# API Contracts: NAKES Mobile Application

## Base URL
```
/api/v1
```

## Authentication
All protected endpoints require Bearer token:
```
Authorization: Bearer {token}
```

## Standard Response Format
```json
{
    "message": "Success message",
    "data": { ... }
}
```

## Error Response Format
```json
{
    "message": "Error message",
    "errors": {
        "field": ["Error detail"]
    }
}
```

---

## 1. Authentication API

### POST /auth/register
**Description**: Register a new user  
**Auth**: None

**Request**:
```json
{
    "name": "string (required, max:255)",
    "email": "string (required, email, unique)",
    "password": "string (required, min:8)",
    "password_confirmation": "string (required)",
    "phone": "string (optional, max:20)"
}
```

**Response 201**:
```json
{
    "message": "Registrasi berhasil",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "081234567890",
        "avatar_url": null,
        "push_notifications": true,
        "weekly_report": false,
        "created_at": "2024-01-01T00:00:00.000000Z"
    },
    "token": "1|abc123..."
}
```

**Response 422** (Validation Error):
```json
{
    "message": "Email sudah terdaftar",
    "errors": {
        "email": ["Email sudah terdaftar"]
    }
}
```

---

### POST /auth/login
**Description**: Authenticate user and get token  
**Auth**: None

**Request**:
```json
{
    "email": "string (required, email)",
    "password": "string (required)",
    "revoke_others": "boolean (optional, default: false)"
}
```

**Response 200**:
```json
{
    "message": "Login berhasil",
    "user": { ... },
    "token": "1|abc123..."
}
```

**Response 422**:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["Email atau password salah."]
    }
}
```

---

### POST /auth/logout
**Description**: Revoke current token  
**Auth**: Required

**Response 200**:
```json
{
    "message": "Logout berhasil"
}
```

---

### POST /auth/refresh
**Description**: Get new token, revoke old  
**Auth**: Required

**Response 200**:
```json
{
    "message": "Token berhasil diperbarui",
    "token": "2|xyz789..."
}
```

---

### GET /auth/me
**Description**: Get current user profile  
**Auth**: Required

**Response 200**:
```json
{
    "user": { ... }
}
```

---

### PUT /auth/profile
**Description**: Update user profile  
**Auth**: Required

**Request**:
```json
{
    "name": "string (optional, max:255)",
    "phone": "string (optional, max:20)",
    "avatar_url": "string (optional, url, max:500)",
    "push_notifications": "boolean (optional)",
    "weekly_report": "boolean (optional)"
}
```

**Response 200**:
```json
{
    "message": "Profil berhasil diperbarui",
    "user": { ... }
}
```

---

## 2. Children API

### GET /children
**Description**: List user's children  
**Auth**: Required

**Query Parameters**:
- `active_only`: boolean (optional)

**Response 200**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "Budi",
            "birthday": "2023-01-15",
            "gender": "male",
            "avatar_url": null,
            "birth_weight": 3.2,
            "birth_height": 50.0,
            "is_active": true,
            "age_in_months": 12,
            "created_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

---

### POST /children
**Description**: Create a new child  
**Auth**: Required

**Request**:
```json
{
    "name": "string (required, max:255)",
    "birthday": "date (required, before_or_equal:today)",
    "gender": "string (required, in:male,female,other)",
    "avatar_url": "string (optional, url)",
    "birth_weight": "numeric (optional, 0.5-10)",
    "birth_height": "numeric (optional, 20-70)",
    "head_circumference": "numeric (optional, 20-50)",
    "is_active": "boolean (optional, default:true)"
}
```

**Response 201**:
```json
{
    "message": "Data anak berhasil ditambahkan",
    "child": { ... }
}
```

---

### GET /children/{child}
**Description**: Get child details  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "child": { ... }
}
```

**Response 403**:
```json
{
    "message": "Anda tidak memiliki akses ke data anak ini"
}
```

---

### PUT /children/{child}
**Description**: Update child  
**Auth**: Required (owner only)

**Request**: Same as POST (all fields optional)

**Response 200**:
```json
{
    "message": "Data anak berhasil diperbarui",
    "child": { ... }
}
```

---

### DELETE /children/{child}
**Description**: Soft delete child  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "message": "Data anak berhasil dihapus"
}
```

---

### GET /children/{child}/summary
**Description**: Get child summary with latest data  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "child": { ... },
    "age": {
        "months": 12,
        "days": 365
    },
    "latest_measurement": {
        "date": "2024-01-01",
        "weight": 10.5,
        "height": 75.0,
        "nutritional_status": "normal",
        "stunting_status": "normal",
        "wasting_status": "normal"
    },
    "latest_screening": {
        "date": "2024-01-01",
        "overall_status": "sesuai"
    },
    "today_nutrition": {
        "calories": 500.0,
        "protein": 20.0,
        "carbohydrate": 60.0,
        "fat": 15.0
    }
}
```

---

## 3. Anthropometry API

### GET /children/{child}/anthropometry
**Description**: List measurements  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "data": [
        {
            "id": 1,
            "measurement_date": "2024-01-01",
            "weight": 10.5,
            "height": 75.0,
            "head_circumference": 45.0,
            "nutritional_status": "normal",
            "stunting_status": "normal",
            "wasting_status": "normal"
        }
    ]
}
```

---

### POST /children/{child}/anthropometry
**Description**: Record measurement  
**Auth**: Required (owner only)

**Request**:
```json
{
    "measurement_date": "date (required, before_or_equal:today)",
    "weight": "numeric (required, 1-100)",
    "height": "numeric (required, 30-200)",
    "head_circumference": "numeric (optional, 20-60)",
    "is_lying": "boolean (optional)",
    "measurement_location": "string (optional, in:posyandu,home,clinic,hospital,other)",
    "notes": "string (optional, max:1000)"
}
```

**Response 201**:
```json
{
    "message": "Pengukuran berhasil disimpan",
    "anthropometry": { ... }
}
```

---

### GET /children/{child}/anthropometry/{id}
**Description**: Get measurement details  
**Auth**: Required (owner only)

---

### PUT /children/{child}/anthropometry/{id}
**Description**: Update measurement  
**Auth**: Required (owner only)

---

### DELETE /children/{child}/anthropometry/{id}
**Description**: Delete measurement  
**Auth**: Required (owner only)

---

### GET /children/{child}/growth-chart
**Description**: Get growth chart data  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "measurements": [...],
    "who_standards": {
        "weight_for_age": [...],
        "height_for_age": [...],
        "weight_for_height": [...]
    }
}
```

---

## 4. Foods API

### GET /foods
**Description**: List foods  
**Auth**: Required

**Query Parameters**:
- `category`: string (optional)
- `search`: string (optional)

---

### POST /foods
**Description**: Create custom food  
**Auth**: Required

**Request**:
```json
{
    "name": "string (required, max:255)",
    "category": "string (required)",
    "serving_size": "integer (optional, default:100)",
    "calories": "numeric (required)",
    "protein": "numeric (required)",
    "fat": "numeric (required)",
    "carbohydrate": "numeric (required)",
    "fiber": "numeric (optional)",
    "sugar": "numeric (optional)"
}
```

---

### GET /foods/{food}
**Description**: Get food details  
**Auth**: Required

---

### PUT /foods/{food}
**Description**: Update food (user-created only)  
**Auth**: Required (creator only)

---

### DELETE /foods/{food}
**Description**: Delete food (user-created only)  
**Auth**: Required (creator only)

---

### GET /foods-categories
**Description**: List food categories  
**Auth**: Required

**Response 200**:
```json
{
    "categories": ["Karbohidrat", "Protein", "Sayuran", "Buah", "Susu", "Snack"]
}
```

---

## 5. Food Logs API

### GET /children/{child}/food-logs
**Description**: List food logs  
**Auth**: Required (owner only)

**Query Parameters**:
- `date`: date (optional)
- `from`: date (optional)
- `to`: date (optional)

---

### POST /children/{child}/food-logs
**Description**: Create food log  
**Auth**: Required (owner only)

**Request**:
```json
{
    "log_date": "date (required)",
    "meal_time": "string (required, in:breakfast,lunch,dinner,snack)",
    "items": [
        {
            "food_id": "integer (required)",
            "quantity": "numeric (required)"
        }
    ],
    "notes": "string (optional)"
}
```

---

### GET /children/{child}/food-logs/{id}
### PUT /children/{child}/food-logs/{id}
### DELETE /children/{child}/food-logs/{id}

---

### GET /children/{child}/nutrition-summary
**Description**: Get nutrition summary  
**Auth**: Required (owner only)

**Query Parameters**:
- `date`: date (optional, default: today)
- `period`: string (optional, in:day,week,month)

**Response 200**:
```json
{
    "period": "day",
    "date": "2024-01-01",
    "totals": {
        "calories": 1500.0,
        "protein": 50.0,
        "fat": 40.0,
        "carbohydrate": 200.0
    },
    "by_meal": {
        "breakfast": { ... },
        "lunch": { ... },
        "dinner": { ... },
        "snack": { ... }
    }
}
```

---

## 6. ASQ-3 API

### Master Data

#### GET /asq3/domains
**Description**: List ASQ-3 domains  
**Auth**: Required

**Response 200**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "Komunikasi",
            "description": "Kemampuan berbahasa dan komunikasi",
            "order": 1
        }
    ]
}
```

---

#### GET /asq3/age-intervals
**Description**: List age intervals  
**Auth**: Required

**Response 200**:
```json
{
    "data": [
        {
            "id": 1,
            "label": "2 bulan",
            "min_months": 1,
            "max_months": 2
        }
    ]
}
```

---

#### GET /asq3/age-intervals/{interval}/questions
**Description**: Get questions for age interval  
**Auth**: Required

**Response 200**:
```json
{
    "data": [
        {
            "id": 1,
            "domain_id": 1,
            "question_text": "Apakah anak menoleh ke arah suara?",
            "order": 1
        }
    ]
}
```

---

#### GET /asq3/recommendations
**Description**: List recommendations  
**Auth**: Required

---

### Screenings

#### GET /children/{child}/screenings
**Description**: List screenings  
**Auth**: Required (owner only)

---

#### POST /children/{child}/screenings
**Description**: Start new screening  
**Auth**: Required (owner only)

**Request**:
```json
{
    "age_interval_id": "integer (optional, auto-detected if not provided)"
}
```

---

#### GET /children/{child}/screenings/{id}
**Description**: Get screening details  
**Auth**: Required (owner only)

---

#### PUT /children/{child}/screenings/{id}
**Description**: Update screening  
**Auth**: Required (owner only)

---

#### POST /children/{child}/screenings/{id}/answers
**Description**: Submit answers  
**Auth**: Required (owner only)

**Request**:
```json
{
    "answers": [
        {
            "question_id": 1,
            "response": "yes|sometimes|not_yet"
        }
    ]
}
```

---

#### GET /children/{child}/screenings/{id}/results
**Description**: Get screening results  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "screening": { ... },
    "results": [
        {
            "domain": "Komunikasi",
            "score": 50,
            "status": "sesuai",
            "recommendations": [...]
        }
    ],
    "overall_status": "sesuai"
}
```

---

## 7. PMT API

### GET /pmt/menus
**Description**: List PMT menus  
**Auth**: Required

**Response 200**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "Menu A",
            "description": "Menu untuk usia 6-12 bulan",
            "target_age_min": 6,
            "target_age_max": 12,
            "calories": 300,
            "protein": 10
        }
    ]
}
```

---

### GET /children/{child}/pmt-schedules
**Description**: List PMT schedules  
**Auth**: Required (owner only)

---

### POST /children/{child}/pmt-schedules
**Description**: Create PMT schedule  
**Auth**: Required (owner only)

**Request**:
```json
{
    "menu_id": "integer (required)",
    "scheduled_date": "date (required)"
}
```

---

### GET /children/{child}/pmt-progress
**Description**: Get PMT progress  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "total_scheduled": 30,
    "total_given": 25,
    "completion_rate": 83.3,
    "this_month": {
        "scheduled": 4,
        "given": 3
    }
}
```

---

### POST /pmt-schedules/{schedule}/log
**Description**: Log PMT given  
**Auth**: Required (owner only)

**Request**:
```json
{
    "given_at": "datetime (optional, default: now)",
    "given_by": "string (optional)",
    "notes": "string (optional)"
}
```

---

### PUT /pmt-schedules/{schedule}/log
**Description**: Update PMT log  
**Auth**: Required (owner only)

---

## 8. Notifications API

### GET /notifications
**Description**: List notifications  
**Auth**: Required

**Query Parameters**:
- `unread_only`: boolean (optional)

**Response 200**:
```json
{
    "data": [
        {
            "id": 1,
            "type": "screening_reminder",
            "title": "Waktunya Screening ASQ-3!",
            "body": "Anak Anda sudah waktunya melakukan screening perkembangan.",
            "data": null,
            "read_at": null,
            "created_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

---

### GET /notifications/unread-count
**Description**: Get unread count  
**Auth**: Required

**Response 200**:
```json
{
    "count": 5
}
```

---

### PUT /notifications/{notification}/read
**Description**: Mark as read  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "message": "Notifikasi ditandai sudah dibaca"
}
```

---

### POST /notifications/read-all
**Description**: Mark all as read  
**Auth**: Required

**Response 200**:
```json
{
    "message": "Semua notifikasi ditandai sudah dibaca",
    "count": 5
}
```

---

### DELETE /notifications/{notification}
**Description**: Delete notification  
**Auth**: Required (owner only)

**Response 200**:
```json
{
    "message": "Notifikasi berhasil dihapus"
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - Not allowed |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |
