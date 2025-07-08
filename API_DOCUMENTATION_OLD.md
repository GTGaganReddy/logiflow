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
  "deliveryStartDate": "2025-07-09",
  "deliveryEndDate": "2025-07-11",
  "deliveryStartTime": "08:00",
  "deliveryEndTime": "18:00",
  "startTime": "09:00",
  "endTime": "17:00",
  "remark": "Urgent delivery",
  "algoAssignedResource": "TRK-001",
  "humanReservedResource": "",
  "deliveryStatus": "pending"
}
```

**Required Fields:**
- `customerName` (string): Name of the customer
- `priority` (string): Must be "High", "Medium", or "Low"

**Optional Fields:**
- `location` (string): Pickup/delivery location
- `deliveryDate` (string): Single delivery date in YYYY-MM-DD format (legacy field)
- `deliveryStartDate` (string): Delivery start date for multi-day deliveries in YYYY-MM-DD format
- `deliveryEndDate` (string): Delivery end date for multi-day deliveries in YYYY-MM-DD format
- `deliveryStartTime` (string): Delivery start time in HH:MM format
- `deliveryEndTime` (string): Delivery end time in HH:MM format
- `startTime` (string): Legacy start time in HH:MM format
- `endTime` (string): Legacy end time in HH:MM format
- `remark` (string): Additional notes or special instructions
- `algoAssignedResource` (string): Truck plate number assigned by algorithm
- `humanReservedResource` (string): Truck plate number reserved by human operator
- `deliveryStatus` (string): Initial delivery status (defaults to "pending")

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

### 4. Create Journey Milestone
**POST** `/api/external/journey-milestones`

Creates a new journey milestone for tracking progress during delivery.

**Request Body:**
```json
{
  "customerLoadId": 1,
  "sequence": 1,
  "location": "Warehouse A",
  "description": "Pickup completed",
  "expectedTime": "09:00",
  "actualTime": "09:15",
  "status": "completed",
  "isBreakTime": false,
  "breakDurationMinutes": 0
}
```

**Required Fields:**
- `customerLoadId` (number): ID of the customer load
- At least one of: `sequence`, `location`, or `description` must be provided

**Optional Fields:**
- `sequence` (number): Order sequence of the milestone (auto-generated if not provided)
- `location` (string): Location of the milestone
- `description` (string): Description of the milestone
- `expectedTime` (string): Expected time in HH:MM format
- `actualTime` (string): Actual time in HH:MM format
- `status` (string): Must be "pending", "in-progress", "completed", or "delayed" (defaults to "pending")
- `isBreakTime` (boolean): Whether this is a break milestone (defaults to false)
- `breakDurationMinutes` (number): Duration of break in minutes (defaults to 0)

**Response:**
```json
{
  "success": true,
  "message": "Journey milestone created successfully",
  "data": {
    "id": 1,
    "customerLoadId": 1,
    "sequence": 1,
    "location": "Warehouse A",
    "description": "Pickup completed",
    "expectedTime": "09:00",
    "actualTime": "09:15",
    "status": "completed",
    "isBreakTime": false,
    "breakDurationMinutes": 0,
    "createdAt": "2025-07-08T20:11:30.000Z"
  }
}
```

### 5. Get Journey Milestones for Load
**GET** `/api/external/journey-milestones/:customerLoadId`

Retrieves all journey milestones for a specific customer load.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customerLoadId": 1,
      "sequence": 1,
      "location": "Warehouse A",
      "description": "Pickup completed",
      "expectedTime": "09:00",
      "actualTime": "09:15",
      "status": "completed",
      "isBreakTime": false,
      "breakDurationMinutes": 0,
      "createdAt": "2025-07-08T20:11:30.000Z"
    }
  ]
}
```

### 6. Update Journey Milestone
**PUT** `/api/external/journey-milestones/:id`

Updates a specific journey milestone.

**Request Body:**
```json
{
  "actualTime": "09:20",
  "status": "completed",
  "description": "Pickup completed with minor delay"
}
```

**Optional Fields:**
- All fields from create milestone except `customerLoadId` and `sequence`

**Response:**
```json
{
  "success": true,
  "message": "Journey milestone updated successfully",
  "data": {
    "id": 1,
    "customerLoadId": 1,
    "sequence": 1,
    "location": "Warehouse A",
    "description": "Pickup completed with minor delay",
    "expectedTime": "09:00",
    "actualTime": "09:20",
    "status": "completed",
    "isBreakTime": false,
    "breakDurationMinutes": 0,
    "createdAt": "2025-07-08T20:11:30.000Z"
  }
}
```

### 7. Get Logistics Notepad
**GET** `/api/external/notepad`

Retrieves the current logistics notepad content.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Meeting notes:\n- Truck TRK-001 maintenance scheduled for next week\n- Priority delivery for Global Logistics Corp\n- Contact John at warehouse for special handling",
    "updatedAt": "2025-07-08T20:11:30.000Z"
  }
}
```

### 8. Update Logistics Notepad
**PUT** `/api/external/notepad`

Updates the logistics notepad content.

**Request Body:**
```json
{
  "content": "Updated meeting notes:\n- Truck TRK-001 maintenance completed\n- Priority delivery for Global Logistics Corp - COMPLETED\n- Contact John at warehouse for special handling\n- New urgent delivery scheduled for tomorrow"
}
```

**Required Fields:**
- `content` (string): The complete notepad content

**Response:**
```json
{
  "success": true,
  "message": "Notepad updated successfully",
  "data": {
    "id": 1,
    "content": "Updated meeting notes:\n- Truck TRK-001 maintenance completed\n- Priority delivery for Global Logistics Corp - COMPLETED\n- Contact John at warehouse for special handling\n- New urgent delivery scheduled for tomorrow",
    "updatedAt": "2025-07-08T21:15:45.000Z"
  }
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
      "priority": {"type": "string", "enum": ["High", "Medium", "Low"], "description": "Load priority level"},
      "deliveryDate": {"type": "string", "format": "date", "description": "Delivery date in YYYY-MM-DD format"},
      "deliveryStartDate": {"type": "string", "format": "date", "description": "Delivery start date for multi-day deliveries"},
      "deliveryEndDate": {"type": "string", "format": "date", "description": "Delivery end date for multi-day deliveries"},
      "deliveryStartTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Delivery start time in HH:MM format"},
      "deliveryEndTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Delivery end time in HH:MM format"},
      "startTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Legacy start time field"},
      "endTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Legacy end time field"},
      "remark": {"type": "string", "description": "Additional notes or remarks"},
      "algoAssignedResource": {"type": "string", "description": "Truck plate number assigned by algorithm"},
      "humanReservedResource": {"type": "string", "description": "Truck plate number reserved by human"},
      "deliveryStatus": {"type": "string", "enum": ["pending", "in-progress", "completed", "cancelled"], "description": "Current delivery status"}
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
      "deliveryStatus": {"type": "string", "enum": ["pending", "in-progress", "completed", "cancelled"], "description": "Updated delivery status"},
      "deliveryStartDate": {"type": "string", "format": "date", "description": "Updated delivery start date"},
      "deliveryEndDate": {"type": "string", "format": "date", "description": "Updated delivery end date"},
      "deliveryStartTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Updated delivery start time"},
      "deliveryEndTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Updated delivery end time"},
      "startTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Legacy start time field"},
      "endTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Legacy end time field"},
      "algoAssignedResource": {"type": "string", "description": "Updated truck assignment"},
      "humanReservedResource": {"type": "string", "description": "Updated human truck reservation"},
      "remark": {"type": "string", "description": "Updated remarks"}
    },
    "required": ["id"]
  }
}
```

### Action 3: Create Journey Milestone
```json
{
  "name": "create_journey_milestone",
  "description": "Create a new journey milestone for tracking delivery progress",
  "parameters": {
    "type": "object",
    "properties": {
      "customerLoadId": {"type": "integer", "description": "Customer load ID"},
      "sequence": {"type": "integer", "description": "Order sequence of milestone"},
      "location": {"type": "string", "description": "Milestone location"},
      "description": {"type": "string", "description": "Milestone description"},
      "expectedTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Expected time in HH:MM format"},
      "actualTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Actual time in HH:MM format"},
      "status": {"type": "string", "enum": ["pending", "in-progress", "completed", "delayed"], "description": "Milestone status"},
      "isBreakTime": {"type": "boolean", "description": "Whether this is a break milestone"},
      "breakDurationMinutes": {"type": "integer", "description": "Break duration in minutes"}
    },
    "required": ["customerLoadId"]
  }
}
```

### Action 4: Update Journey Milestone
```json
{
  "name": "update_journey_milestone",
  "description": "Update an existing journey milestone",
  "parameters": {
    "type": "object",
    "properties": {
      "id": {"type": "integer", "description": "Milestone ID"},
      "sequence": {"type": "integer", "description": "Updated order sequence"},
      "location": {"type": "string", "description": "Updated milestone location"},
      "description": {"type": "string", "description": "Updated milestone description"},
      "expectedTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Updated expected time"},
      "actualTime": {"type": "string", "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", "description": "Updated actual time"},
      "status": {"type": "string", "enum": ["pending", "in-progress", "completed", "delayed"], "description": "Updated status"},
      "isBreakTime": {"type": "boolean", "description": "Updated break time flag"},
      "breakDurationMinutes": {"type": "integer", "description": "Updated break duration"}
    },
    "required": ["id"]
  }
}
```

### Action 5: Get Logistics Notepad
```json
{
  "name": "get_logistics_notepad",
  "description": "Retrieve the current logistics notepad content",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

### Action 6: Update Logistics Notepad
```json
{
  "name": "update_logistics_notepad",
  "description": "Update the logistics notepad content",
  "parameters": {
    "type": "object",
    "properties": {
      "content": {"type": "string", "description": "Complete notepad content including notes, reminders, and operational information"}
    },
    "required": ["content"]
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
- "Add pickup milestone at Warehouse A for load 1 at 9:00 AM"
- "Update milestone 3 status to completed with actual time 2:15 PM"
- "Create break milestone for load 2 with 30 minutes duration"
- "Mark delivery milestone as delayed with actual time 6:30 PM"
- "Get the current notepad content to review operational notes"
- "Add a note about truck maintenance scheduled for next week"
- "Update notepad with today's delivery completion status"
- "Record special handling instructions for tomorrow's urgent delivery"

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