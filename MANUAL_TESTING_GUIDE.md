# 🧪 4Paws Manual Testing Guide

## Phase 2: Animals CRUD Testing

### ✅ **Test 1: Animals List Page**
**URL:** `http://localhost:3000/animals`

**Expected Results:**
- [ ] Page loads with 50 animals displayed in grid
- [ ] Shows "50 of 50 animals in care" in subtitle
- [ ] Each animal card shows: name, breed, gender, status badge, microchip_id, intake_date
- [ ] Status badges are color-coded (green=available, yellow=fostered, orange=hold)

**Test Search:**
- [ ] Type "Buddy" in search box → Should show only Buddy
- [ ] Type "Luna" in search box → Should show only Luna
- [ ] Type "550e8400" in search box → Should show animals with that microchip ID
- [ ] Clear search → Should show all animals again

**Test Filters:**
- [ ] Select "Dogs" from species filter → Should show only dogs
- [ ] Select "Cats" from species filter → Should show only cats
- [ ] Select "Available" from status filter → Should show only available animals
- [ ] Select "Fostered" from status filter → Should show only fostered animals
- [ ] Combine search + filters → Should work together

### ✅ **Test 2: Animal Detail Page**
**URL:** `http://localhost:3000/animals/550e8400-e29b-41d4-a716-446655440001`

**Expected Results:**
- [ ] Page loads with animal details
- [ ] Shows animal name, breed, gender in header
- [ ] Photo section shows placeholder (no real photos yet)
- [ ] Status badge displays correctly
- [ ] Details tab shows: breed, color, gender, intake date, microchip
- [ ] Medical, Applications, History tabs show placeholder content

**Test Navigation:**
- [ ] Click "Back to Animals" → Should return to animals list
- [ ] Click on animal card from list → Should navigate to detail page

### ✅ **Test 3: Delete Functionality**
**On Animal Detail Page:**

**Expected Results:**
- [ ] Click delete button (trash icon)
- [ ] Confirmation dialog appears: "Are you sure you want to delete [Animal Name]?"
- [ ] Click "OK" → Animal status changes to 'deleted'
- [ ] Success toast appears: "Animal deleted"
- [ ] Redirects back to animals list
- [ ] Animal no longer appears in list (filtered out)

### ✅ **Test 4: Error Handling**
**Test with invalid animal ID:**
**URL:** `http://localhost:3000/animals/invalid-id`

**Expected Results:**
- [ ] Shows "Animal not found" page
- [ ] Displays error message
- [ ] "Back to Animals" button works

### ✅ **Test 5: Loading States**
**Expected Results:**
- [ ] Initial page load shows loading spinner
- [ ] Data loads and spinner disappears
- [ ] No flickering or layout shifts

## 🎯 **Success Criteria:**
- [ ] All 5 test categories pass
- [ ] No console errors
- [ ] Smooth navigation between pages
- [ ] Search and filters work correctly
- [ ] Delete functionality works with confirmation
- [ ] Error states display properly

## 🐛 **Known Issues to Fix:**
- [ ] Add Create Animal form
- [ ] Add Edit Animal form
- [ ] Add form validation
- [ ] Add photo upload functionality

## 📝 **Notes:**
- Server runs on `http://localhost:3000/`
- Test with different animal IDs from the seed data
- Check browser console for any JavaScript errors
- All functionality should work without page refreshes
