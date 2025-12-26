# Streams Management Page

## Overview
The Streams Management page allows admins to view, manage, and delete live streams from the Budvizion platform. This page follows the same architecture and patterns as the Users management page.

## Features

### 1. Stream List Display
- **Server-side pagination**: Efficiently handles large numbers of streams
- **Responsive table layout**: Shows all important stream information
- **Status indicators**: 
  - 🔴 LIVE - Stream is currently live
  - ⚫ Offline - Stream is not currently live

### 2. Stream Information Displayed
- **Title**: Name of the stream
- **Channel**: Channel identifier
- **Streamer Information**: 
  - Streamer name
  - Username
  - Email
- **Status**: Live/Offline status with visual indicator
- **Duration**: Stream duration in hours, minutes, and seconds
- **Products**: Associated products with count and preview
- **Thumbnail**: Stream thumbnail image preview
- **Created Date**: Date and time when the stream was created

### 3. Actions Available
- **View**: Click eye icon to view detailed stream information on a dedicated page
- **Delete**: Permanently delete a stream with confirmation modal

### 4. Loading States
- Initial load spinner
- Pagination loading state
- Error handling with user-friendly messages
- Success messages after delete operation

### 5. Thumbnail Display (Fixed)
- **Full URL Resolution**: Images displayed with proper absolute URLs
- **Error Handling**: Placeholder SVG shown if image fails to load
- **Responsive Design**: Thumbnails scale properly on all devices
- **Hover Tooltip**: Shows stream title on hover

## File Structure

```
src/pages/Streams/
├── stream-list.tsx        # Main stream list component
├── stream-detail.tsx      # Stream detail/view page
├── README.md             # This file
└── [stream images shown via thumbnail field]
```

## Component Architecture

### Stream-List Component
- **State Management**: Uses React hooks for state management
- **Data Fetching**: Integrates with apiService for backend communication
- **UI Components**: Uses Reactstrap components for UI
- **Error Handling**: Comprehensive error handling and user feedback
- **Image URL Helper**: Uses `getFullImageUrl()` to construct proper image URLs

### Stream-Detail Component (NEW)
- **Detailed View**: Shows complete stream information
- **Product Showcase**: Displays all products associated with the stream
- **Streamer Info**: Shows complete streamer information and contact details
- **Image Handling**: Proper image loading with fallbacks
- **Responsive Layout**: Two-column layout on desktop, stacked on mobile

### Key States
```typescript
- streams: Array of Stream objects
- loading: Initial page load state
- paginationLoading: Pagination action state
- error: Error message display
- successMessage: Success notification display
- pagination: Pagination metadata
- deleteModal: Delete confirmation modal state
- selectedStream: Currently selected stream for deletion
- deleteLoading: Delete operation in progress
```

## API Integration

### Endpoints Used

1. **Get All Streams** (with pagination)
   ```
   GET /api/v1/stream-info?page=1&limit=10
   ```
   - Query Parameters:
     - `page`: Current page number (default: 1)
     - `limit`: Records per page (default: 10)

2. **Delete Stream**
   ```
   DELETE /api/v1/stream-info/:id
   ```
   - Path Parameters:
     - `id`: Stream ID to delete

3. **Get Stream by ID** (For future implementation)
   ```
   GET /api/v1/stream-info/:id
   ```

### Response Format

#### Get All Streams Response
```json
{
  "success": true,
  "message": "Streams retrieved successfully",
  "status": 200,
  "data": {
    "streams": [
      {
        "id": 1,
        "title": "Summer Fashion Show",
        "channel": "fashion-channel",
        "userId": 5,
        "cityId": 3,
        "duration": 3600,
        "isLive": true,
        "thumbnail": "/uploads/streams/thumbnails/thumb.jpg",
        "createdAt": "2024-12-20T10:30:00Z",
        "updatedAt": "2024-12-20T10:30:00Z",
        "products": [
          {
            "id": 1,
            "name": "Summer Dress",
            "price": 49.99,
            "link": "https://example.com/dress"
          }
        ],
        "user": {
          "id": 5,
          "firstName": "Sarah",
          "lastName": "Johnson",
          "userName": "sarah_j",
          "email": "sarah@example.com"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

#### Delete Stream Response
```json
{
  "success": true,
  "message": "Stream deleted successfully",
  "status": 200,
  "data": null
}
```

## How to Use

### 1. Access the Page
- Navigate to `/streams` route in the admin dashboard
- The Streams menu item is available in the sidebar

### 2. View Streams
- Streams are automatically loaded when the page opens
- Use pagination controls to navigate through pages
- Adjust page size using the page size dropdown

### 3. Delete a Stream
1. Click the trash icon (🗑️) in the Actions column
2. Confirm the deletion in the modal dialog
3. The stream will be deleted and the list will refresh
4. Success message will display for 5 seconds

### 4. View Stream Details (Future)
- Click the eye icon (👁️) to view detailed information
- Currently implemented as a placeholder

## Styling & UI

### Colors & Badges
- **Status**: 
  - Live streams: Green (success) badge
  - Offline streams: Gray (secondary) badge
- **Products**: Blue (info) badge
- **Buttons**:
  - View: Info button outline
  - Delete: Danger button outline

### Responsive Design
- Table adapts to different screen sizes
- Pagination controls are responsive
- Mobile-friendly layout

## Error Handling

The component includes robust error handling:

1. **API Errors**: Displays error messages from the server
2. **Network Errors**: Shows user-friendly error messages
3. **Data Loading Errors**: Provides fallback UI

### Error States
- Error banner with icon and message
- Empty state when no streams found
- Loading spinners during async operations

## Future Enhancements

1. **Edit Stream**: Implement edit functionality for stream details
2. **Search & Filter**: Add search and filtering capabilities
3. **Bulk Actions**: Allow bulk delete or bulk status changes
4. **Stream Statistics**: Show analytics for streams (views, duration, etc.)
5. **Product Management**: Edit stream products directly from the detail page
6. **Advanced Filtering**: Filter by status, date range, streamer, city, etc.
7. **Export**: Export stream data to CSV/Excel
8. **Live Updates**: Real-time stream status updates using WebSocket

## Code Examples

### Using the Stream List Component

```jsx
import StreamList from '../pages/Streams/stream-list';

// In your route configuration
{ path: "/streams", component: <StreamList /> }
```

### Extending the Component

To add a view/edit feature:

```typescript
const handleEdit = (stream: Stream) => {
  navigate(`/streams/${stream.id}/edit`);
};

const handleView = (stream: Stream) => {
  navigate(`/streams/${stream.id}`);
};
```

## Testing

### Mock Data
For testing without a backend, you can modify the `fetchStreams` function to return mock data:

```typescript
const mockResponse = {
  status: 200,
  data: {
    streams: [
      {
        id: 1,
        title: "Test Stream",
        channel: "test-channel",
        userId: 1,
        cityId: 1,
        duration: 3600,
        isLive: true,
        thumbnail: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        products: [],
        user: {
          id: 1,
          firstName: "Test",
          lastName: "User",
          userName: "testuser",
          email: "test@example.com"
        }
      }
    ],
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  }
};
```

## Dependencies

- **React**: UI library
- **Reactstrap**: Bootstrap components for React
- **React Router**: Navigation
- **Axios**: HTTP client
- **API Service**: Custom api helper

## Performance Considerations

1. **Pagination**: Uses server-side pagination to limit data transfer
2. **Lazy Loading**: Route is lazy loaded
3. **Memoization**: Table columns are memoized to prevent unnecessary re-renders
4. **Optimistic Updates**: Shows success immediately after delete

## Troubleshooting

### Streams not loading
- Check if the API endpoint is accessible
- Verify authentication token is valid
- Check browser console for error messages

### Delete not working
- Ensure you have delete permission
- Check API response for validation errors
- Verify stream ID is correct

### Pagination issues
- Check if limit/page parameters are valid
- Verify backend supports pagination
- Clear browser cache if needed

## Related Files

- [API Constants](../helpers/constants.ts) - API endpoint definitions
- [API Service](../helpers/api.ts) - API integration functions
- [Routes](../routes/index.jsx) - Route configuration
- [Sidebar Navigation](../components/VerticalLayout/SidebarContent.jsx) - Menu configuration
