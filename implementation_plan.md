# Store Overhaul Implementation Plan

The goal is to convert the current subscription-only store into a full-featured e-commerce store with a shopping cart, categories, and smooth navigation.

## User Review Required
> [!IMPORTANT]
> - **Navigation Structure**: A secondary navbar will be added specifically for the store page to handle category navigation (Memberships, Boosts, etc.).
> - **Cart Persistence**: The cart state will be managed via a new Context Provider. For now, it will be local state (client-side), so refreshing might clear it unless I implement `localStorage` persistence (which I will do).
> - **Checkout**: The "Go to Checkout" button will be a placeholder that navigates to `/checkout` (or similar) but the actual checkout logic is out of scope for this specific task.
> - **Single-Subscription Logic**: If a user adds a subscription (e.g., "Premium") to the cart, and then adds "Elite", the cart will update to replace "Premium" rather than adding a second subscription, to prevent logical conflicts.

## Proposed Changes

### 1. Data Models & Types
Create `types/store.ts` to define:
- `Product` interface: `id`, `name`, `description`, `price`, `category`, `type` (subscription | one-time), `priceId` (Stripe).
- `CartItem` interface.

### 2. State Management (Cart)
Create `components/providers/cart-provider.tsx`:
- Context for `cartItems`, `addToCart`, `removeFromCart`, `itemCount`, `total`.
- Logic to handle "subscription override" (remove existing sub of same category before adding new one).
- `localStorage` sync for persistence.
- **Wrap `app/layout.tsx`** with `CartProvider` so the cart is accessible globally (nav bar).

### 3. Components

#### Store Specific
- **`components/store/store-navbar.tsx`**:
    - Sticky secondary navbar.
    - Links to anchor tags (`#memberships`, `#boosts`).
    - Active state highlighting based on intersection observer (scrollspy).
- **`components/store/product-card.tsx`**:
    - Display product info.
    - "Add to Cart" button.
- **`components/store/product-section.tsx`**:
    - Container for a category of products.

#### Shared / Global Updates
- **`components/navbar-client.tsx`**:
    - Add **Cart Icon** with badge.
    - Clicking opens the **Cart Flyout**.
- **`components/cart-flyout.tsx`**:
    - Sheet/Sidebar component.
    - Lists items.
    - Trash can icon to remove.
    - "Go to Checkout" button.

### 4. Page Implementation
Refactor `app/store/page.tsx` (and `store-client.tsx`):
- Remove old 3-column layout.
- Implement the "Sectional" layout.
- Render `StoreNavbar` at the top.
- Render sections: Memberships, Boosts, Chat, Misc, Donate.
- Use `StoreClient` to handle the scroll refs and interactivity.

### 5. Mock Data
Hardcode an array of products in `lib/mock-products.ts` covering all requested categories.

## Verification Plan

### Automated Tests
- None planned for this visual/interactive feature.

### Manual Verification
1.  **Navigation**:
    - Verify secondary nav sticks.
    - Click "Boosts" -> Scrolls to Boosts section.
    - Scroll page -> "Boosts" highlights in nav.
2.  **Cart Operations**:
    - Add "Premium" -> Cart Count 1.
    - Add "Elite" -> Cart Count 1 (Replced Premium).
    - Add "XP Boost" -> Cart Count 2.
    - Remove "XP Boost" -> Cart Count 1.
    - Refresh page -> Cart persists.
3.  **UI/UX**:
    - Check mobile responsiveness.
    - Verify "Trash" icon works.
    - Verify "Go to Checkout" link is present.
