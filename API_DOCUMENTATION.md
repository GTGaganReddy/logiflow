# LogiFlow API Documentation for GPT Assistant Integration

## Overview
This document provides the API endpoints for integrating with the LogiFlow logistics dashboard from external systems like GPT assistants.

## Base URL
When deployed: `https://your-replit-app.replit.app`
Development: `http://localhost:5000`

## External API Endpoints

### Customer Loads (Consolidated with Journey Milestones)

#### 1. Get All Customer Loads with Journey Milestones
**GET** `/api/external/customer-loads`

Retrieves all customer loads including their journey milestones in a single response.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slNo": "001",
      "customerName": "Global Logistics Inc",
      "algoAssignedResource": "TRK-001",
      "humanReservedResource": null,
      "priority": "high",
      "status": "assigned",
      "remark": "Urgent delivery required",
      "deliveryStartDate": "2024-01-15",
      "deliveryEndDate": "2024-01-17",
      "deliveryStartTime": "08:00",
      "deliveryEndTime": "17:00",
      "journeyMilestones": [
        {
          "id": 1,
          "customerLoadId": 1,
          "sequence": 1,
          "startingPoint": "Mumbai Warehouse",
          "endingPoint": "Delhi Distribution Center",
          "startDate": "2024-01-15",
          "endDate": "2024-01-16",
          "startTime": "08:00",
          "endTime": "20:00",
          "breakHours": 8,
          "notes": "Driver confirmed pickup scheduled"
        },
        {
          "id": 2,
          "customerLoadId": 1,
          "sequence": 2,
          "startingPoint": "Delhi Distribution Center",
          "endingPoint": "Gurgaon Customer Site",
          "startDate": "2024-01-17",
          "endDate": "2024-01-17",
          "startTime": "09:00",
          "endTime": "17:00",
          "breakHours": 2,
          "notes": "Delivery window confirmed with customer"
        }
      ]
    }
  ]
}
```

#### 2. Get Single Customer Load with Journey Milestones
**GET** `/api/external/customer-loads/:id`

Retrieves a specific customer load including its journey milestones.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slNo": "001",
    "customerName": "Global Logistics Inc",
    "algoAssignedResource": "TRK-001",
    "humanReservedResource": null,
    "priority": "high",
    "status": "assigned",
    "remark": "Urgent delivery required",
    "deliveryStartDate": "2024-01-15",
    "deliveryEndDate": "2024-01-17",
    "deliveryStartTime": "08:00",
    "deliveryEndTime": "17:00",
    "journeyMilestones": [
      {
        "id": 1,
        "customerLoadId": 1,
        "sequence": 1,
        "startingPoint": "Mumbai Warehouse",
        "endingPoint": "Delhi Distribution Center",
        "startDate": "2024-01-15",
        "endDate": "2024-01-16",
        "startTime": "08:00",
        "endTime": "20:00",
        "breakHours": 8,
        "notes": "Driver confirmed pickup scheduled"
      }
    ]
  }
}
```

#### 3. Create Customer Load with Optional Journey Milestones
**POST** `/api/external/customer-loads`

Creates a new customer load with optional journey milestones in a single request.

**Request Body:**
```json
{
  "customerName": "Blautal Maschinenbau AG",
  "algoAssignedResource": "W-792XY",
  "priority": "low",
  "deliveryStartDate": "2025-04-14",
  "deliveryStartTime": "11:36",
  "status": "pending",
  "remark": "Standard delivery",
  "deliveryStartDate": "2024-01-20",
  "deliveryEndDate": "2024-01-22",
  "deliveryStartTime": "09:00",
  "deliveryEndTime": "16:00",
  "journeyMilestones": [
    {
      "sequence": 1,
      "startingPoint": "Warehouse A",
      "endingPoint": "Customer Site",
      "startDate": "2024-01-20",
      "endDate": "2024-01-20",
      "startTime": "09:00",
      "endTime": "16:00",
      "breakHours": 1,
      "notes": "Initial pickup scheduled"
    }
  ]
}
```

**Required Fields:**
- `customerName` (string): Name of the customer

**Optional Fields:**
- `slNo` (string): Serial number for the load
- `algoAssignedResource` (string): Algorithm-assigned truck resource
- `humanReservedResource` (string): Human-reserved truck resource
- `priority` (string): Priority level ("high", "medium", "low")
- `status` (string): Current status ("pending", "assigned", "in-progress", "completed")
- `remark` (string): Additional notes or remarks
- `deliveryStartDate` (string): Start date in YYYY-MM-DD format
- `deliveryEndDate` (string): End date in YYYY-MM-DD format
- `deliveryStartTime` (string): Start time in HH:MM format
- `deliveryEndTime` (string): End time in HH:MM format
- `journeyMilestones` (array): Optional array of 1-3 journey milestone objects

**Journey Milestone Fields (all optional):**
- `sequence` (number): Order sequence of the milestone
- `startingPoint` (string): Starting location
- `endingPoint` (string): Ending location
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format
- `startTime` (string): Start time in HH:MM format
- `endTime` (string): End time in HH:MM format
- `breakHours` (number): Break hours during this milestone
- `notes` (string): Optional notes for the milestone

**Response:**
```json
{
  "success": true,
  "message": "Customer load created successfully",
  "data": {
    "id": 4,
    "slNo": "004",
    "customerName": "New Customer Ltd",
    "algoAssignedResource": "TRK-003",
    "humanReservedResource": null,
    "priority": "medium",
    "status": "pending",
    "remark": "Standard delivery",
    "deliveryStartDate": "2024-01-20",
    "deliveryEndDate": "2024-01-22",
    "deliveryStartTime": "09:00",
    "deliveryEndTime": "16:00",
    "journeyMilestones": [
      {
        "id": 3,
        "customerLoadId": 4,
        "sequence": 1,
        "startingPoint": "Warehouse A",
        "endingPoint": "Customer Site",
        "startDate": "2024-01-20",
        "endDate": "2024-01-20",
        "startTime": "09:00",
        "endTime": "16:00",
        "breakHours": 1,
        "notes": "Initial pickup scheduled"
      }
    ]
  }
}
```

#### 4. Update Customer Load with Optional Journey Milestones
**PUT** `/api/external/customer-loads/:id`

Updates an existing customer load and optionally replaces its journey milestones.

**Request Body:**
```json
{
  "status": "completed",
  "remark": "Delivery completed successfully",
  "journeyMilestones": [
    {
      "sequence": 1,
      "startingPoint": "Updated Starting Point",
      "endingPoint": "Updated Ending Point",
      "startDate": "2024-01-21",
      "endDate": "2024-01-21",
      "startTime": "10:00",
      "endTime": "17:00",
      "breakHours": 2,
      "notes": "Updated delivery schedule"
    }
  ]
}
```

**Note:** When updating, if `journeyMilestones` is provided, it will replace all existing milestones for that customer load. If you want to keep existing milestones, omit the `journeyMilestones` field.

**Response:**
```json
{
  "success": true,
  "message": "Customer load updated successfully",
  "data": {
    "id": 1,
    "slNo": "001",
    "customerName": "Global Logistics Inc",
    "status": "completed",
    "remark": "Delivery completed successfully",
    "journeyMilestones": [
      {
        "id": 4,
        "customerLoadId": 1,
        "sequence": 1,
        "startingPoint": "Updated Starting Point",
        "endingPoint": "Updated Ending Point",
        "startDate": "2024-01-21",
        "endDate": "2024-01-21",
        "startTime": "10:00",
        "endTime": "17:00",
        "breakHours": 2,
        "notes": "Updated delivery schedule"
      }
    ]
  }
}
```

### Notepad Management

#### 5. Get Notepad Content
**GET** `/api/external/notepad`

Retrieves the current content of the logistics notepad.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Current notepad content here...",
    "updatedAt": "2025-07-08T21:22:57.719Z"
  }
}
```

#### 6. Update Notepad Content
**PUT** `/api/external/notepad`

Updates the content of the logistics notepad.

**Request Body:**
```json
{
  "content": "Updated notepad content here..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notepad updated successfully",
  "data": {
    "id": 1,
    "content": "Updated notepad content here...",
    "updatedAt": "2025-07-08T21:30:15.123Z"
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

For validation errors, additional error details may be included:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "path": ["fieldName"],
      "message": "Field is required"
    }
  ]
}
```

## Internal API Endpoints (Dashboard Features)

### Journey Milestone Notes Management

#### Update Journey Milestone Notes
**PUT** `/api/journey-milestones/:id`

Updates a specific journey milestone, commonly used for adding/editing notes.

**Parameters:**
- `id` (integer): The journey milestone ID

**Request Body:**
```json
{
  "notes": "Driver reported traffic delay on A1 highway. Adjusted arrival time."
}
```

**Response:**
```json
{
  "customerLoadId": 31,
  "sequenceNumber": 1,
  "startingPoint": "St. Pölten",
  "endingPoint": "Krems",
  "startDate": "2025-07-20",
  "startTime": "07:25",
  "endDate": "2025-07-20",
  "endTime": "10:00",
  "breakTime": null,
  "status": "pending",
  "notes": "Driver reported traffic delay on A1 highway. Adjusted arrival time.",
  "id": 83
}
```

#### Get Journey Milestones for Customer Load
**GET** `/api/journey-milestones/:customerLoadId`

Retrieves all journey milestones for a specific customer load.

**Parameters:**
- `customerLoadId` (integer): The customer load ID

**Response:**
```json
[
  {
    "customerLoadId": 31,
    "sequenceNumber": 1,
    "startingPoint": "St. Pölten",
    "endingPoint": "Krems",
    "startDate": "2025-07-20",
    "startTime": "07:25",
    "endDate": "2025-07-20",
    "endTime": "10:00",
    "breakTime": null,
    "status": "pending",
    "notes": "Driver reported traffic delay",
    "id": 83
  }
]
```

## Key Features

1. **Customer Name-Based Access**: External API uses customer names as identifiers instead of database IDs
2. **Consolidated Data**: Customer loads and journey milestones are returned together in single API calls
3. **Flexible Fields**: Most fields are optional except `customerName`
4. **Journey Milestone Support**: 1-3 journey milestones can be created/updated with each customer load
5. **Inline Notes Editing**: Dashboard provides real-time editing of milestone notes with hover-to-edit functionality
6. **Consistent Response Format**: All external APIs return `{success: true/false, data: ...}` format
7. **URL Encoding Support**: Customer names with special characters are properly handled via URL encoding
5. **CORS Enabled**: All external endpoints include proper CORS headers for cross-origin access