# LogiFlow API Documentation for GPT Assistant Integration

## Overview
This document provides the API endpoints for integrating with the LogiFlow logistics dashboard from external systems like GPT assistants.

## Base URL
When deployed: `https://your-replit-app.replit.app`
Development: `http://localhost:5000`

## External API Endpoints

### 1. Create Customer Load
**POST** `/api/external/customer-loads`

Creates a new customer load entry in the dashboard.

**Request Body:**
```json
{
  "customerName": "ABC Corp",
  "location": "New York",
  "priority": "High",
  "deliveryDate": "2025-07-10",
  "startTime": "09:00",
  "endTime": "17:00",
  "remark": "Urgent delivery",
  "algoAssignedResource": "TRK-001",
  "humanReservedResource": ""
}
```

**Required Fields:**
- `customerName` (string): Name of the customer
- `priority` (string): Must be "High", "Medium", or "Low"

**Optional Fields:**
- `location` (string): Pickup/delivery location
- `deliveryDate` (string): Date in YYYY-MM-DD format
- `startTime` (string): Start time in HH:MM format
- `endTime` (string): End time in HH:MM format
- `remark` (string): Additional notes
- `algoAssignedResource` (string): Truck plate number assigned by algorithm
- `humanReservedResource` (string): Truck plate number reserved by human

**Response:**
```json
{
  "success": true,
  "message": "Customer load created successfully",
  "data": {
    "id": 1,
    "slNo": "001",
    "customerName": "ABC Corp",
    "location": "New York",
    "priority": "High",
    "deliveryDate": "2025-07-10",
    "startTime": "09:00",
    "endTime": "17:00",
    "remark": "Urgent delivery",
    "algoAssignedResource": "TRK-001",
    "humanReservedResource": "",
    "deliveryStatus": "pending",
    "createdAt": "2025-07-08T20:11:30.000Z"
  }
}
```

### 2. Update Delivery Status
**PUT** `/api/external/customer-loads/:id/status`

Updates the delivery status and times for a specific load.

**Request Body:**
```json
{
  "deliveryStatus": "in-progress",
  "startTime": "09:30",
  "endTime": "16:45"
}
```

**Required Fields:**
- `deliveryStatus` (string): Must be "pending", "in-progress", "completed", or "cancelled"

**Optional Fields:**
- `startTime` (string): Updated start time in HH:MM format
- `endTime` (string): Updated end time in HH:MM format

### 3. Get All Customer Loads
**GET** `/api/external/customer-loads`

Retrieves all customer loads from the dashboard.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slNo": "001",
      "customerName": "ABC Corp",
      "location": "New York",
      "priority": "High",
      "deliveryDate": "2025-07-10",
      "startTime": "09:00",
      "endTime": "17:00",
      "remark": "Urgent delivery",
      "algoAssignedResource": "TRK-001",
      "humanReservedResource": "",
      "deliveryStatus": "pending",
      "createdAt": "2025-07-08T20:11:30.000Z"
    }
  ]
}
```

## Example Usage for GPT Assistant Actions

### Action 1: Add Customer Load
```json
{
  "name": "add_customer_load",
  "description": "Add a new customer load to the logistics dashboard",
  "parameters": {
    "type": "object",
    "properties": {
      "customerName": {"type": "string", "description": "Customer name"},
      "location": {"type": "string", "description": "Pickup/delivery location"},
      "priority": {"type": "string", "enum": ["High", "Medium", "Low"]},
      "deliveryDate": {"type": "string", "format": "date"},
      "startTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"},
      "endTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"},
      "remark": {"type": "string"},
      "algoAssignedResource": {"type": "string"},
      "humanReservedResource": {"type": "string"}
    },
    "required": ["customerName", "priority"]
  }
}
```

### Action 2: Update Delivery Status
```json
{
  "name": "update_delivery_status",
  "description": "Update the delivery status of a customer load",
  "parameters": {
    "type": "object",
    "properties": {
      "id": {"type": "integer", "description": "Load ID"},
      "deliveryStatus": {"type": "string", "enum": ["pending", "in-progress", "completed", "cancelled"]},
      "startTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"},
      "endTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"}
    },
    "required": ["id", "deliveryStatus"]
  }
}
```

## Natural Language Processing Examples

Your GPT assistant can process natural language input like:

- "Add customer John Doe with high priority and assign TRK-005"
- "Update Global Logistics to medium priority"
- "Reserve TRK-008 for urgent delivery tomorrow"
- "Mark load 3 as completed at 4:30 PM"
- "Set delivery date for ABC Corp to July 15th"

The assistant should parse these commands and make the appropriate API calls to update the dashboard.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `404`: Resource not found
- `500`: Internal server error

Error responses include:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Available Trucks

The system currently has these truck plates available:
- TRK-001 (available)
- TRK-005 (available)
- TRK-007 (busy)
- TRK-008 (available)
- TRK-012 (maintenance)