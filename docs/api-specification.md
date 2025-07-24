# API 응답 형태 명세

## 종목 정보 API

**GET** `/api/stocks/{stockCode}`

```json
{
  "name": "삼성전자",
  "currentPrice": 67000,
  "basePrice": 66700,
  "dayHigh": 67700,
  "dayLow": 66300,
  "change": 300,
  "changeRate": 0.45
}
```

## 호가 정보 API

**GET** `/api/stocks/{stockCode}/orderbook`

```json
{
  "askPrices": [
    { "price": 68000, "volume": 242760 },
    { "price": 67900, "volume": 199270 }
  ],
  "bidPrices": [
    { "price": 67000, "volume": 198542 },
    { "price": 66900, "volume": 234567 }
  ]
}
```

## 체결 강도 API

**GET** `/api/stocks/{stockCode}/volume-strength`

```json
{
  "volumePower": 125.4
}
```

## 실시간 거래 내역 API

**GET** `/api/stocks/{stockCode}/trades?limit=5`

```json
{
  "trades": [
    {
      "price": 66700,
      "volume": 150,
      "type": "buy",
      "time": "15:29:45"
    }
  ]
}
```

## 사용자 계좌 정보 API

**GET** `/api/users/{userId}/account`

```json
{
  "availableAmount": 2500000,
  "totalAssets": 5000000
}
```

## 사용자 보유 주식 API

**GET** `/api/users/{userId}/holdings`

```json
{
  "avgPrice": 66500,
  "quantity": 50,
  "totalValue": 3325000
}
```

## 대기 주문 API

**GET** `/api/users/{userId}/orders/pending`

```json
{
  "orders": [
    {
      "id": 1,
      "type": "buy",
      "quantity": 10,
      "price": 66800,
      "orderTime": "2025-01-21T09:30:00Z"
    }
  ]
}
```

## 주문 제출 API

**POST** `/api/orders`

**Request Body:**

```json
{
  "stockCode": "SAMSUNG",
  "userId": "user123",
  "type": "buy",
  "orderType": "limit",
  "price": 67000,
  "quantity": 10
}
```

**Response:**

```json
{
  "orderId": 12345,
  "status": "submitted",
  "message": "주문이 성공적으로 제출되었습니다."
}
```

## 주문 취소 API

**DELETE** `/api/orders/{orderId}`

```json
{
  "status": "cancelled",
  "message": "주문이 취소되었습니다."
}
```

## 시장 상태 API

**GET** `/api/market/status`

```json
{
  "status": "정규장",
  "openTime": "09:00",
  "closeTime": "15:30"
}
```
