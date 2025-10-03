#!/usr/bin/env node

// Quick Phase 6 Testing Script
console.log('🐾 Phase 6 Testing: People Management & Intake Workflow\n');

// Test 1: Check if frontend is accessible
console.log('1. Testing Frontend Accessibility...');
fetch('http://localhost:3000')
  .then(response => {
    if (response.ok) {
      console.log('✅ Frontend is accessible on http://localhost:3000');
      return response.text();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(html => {
    if (html.includes('4Paws') || html.includes('People') || html.includes('Intake')) {
      console.log('✅ Frontend content looks correct');
    } else {
      console.log('⚠️  Frontend content may not be loading correctly');
    }
  })
  .catch(error => {
    console.log('❌ Frontend is not accessible:', error.message);
  });

// Test 2: Check if we can access the people page
console.log('\n2. Testing People Management Page...');
fetch('http://localhost:3000/people')
  .then(response => {
    if (response.ok) {
      console.log('✅ People page is accessible');
      return response.text();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(html => {
    if (html.includes('People') || html.includes('people')) {
      console.log('✅ People page content is loading');
    } else {
      console.log('⚠️  People page content may not be loading correctly');
    }
  })
  .catch(error => {
    console.log('❌ People page is not accessible:', error.message);
  });

// Test 3: Check if we can access the intake page
console.log('\n3. Testing Intake Workflow Page...');
fetch('http://localhost:3000/intake')
  .then(response => {
    if (response.ok) {
      console.log('✅ Intake page is accessible');
      return response.text();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(html => {
    if (html.includes('Intake') || html.includes('intake') || html.includes('wizard')) {
      console.log('✅ Intake page content is loading');
    } else {
      console.log('⚠️  Intake page content may not be loading correctly');
    }
  })
  .catch(error => {
    console.log('❌ Intake page is not accessible:', error.message);
  });

// Test 4: Check if we can access the animals page (for intake workflow completion)
console.log('\n4. Testing Animals Page (for intake workflow)...');
fetch('http://localhost:3000/animals')
  .then(response => {
    if (response.ok) {
      console.log('✅ Animals page is accessible');
      return response.text();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(html => {
    if (html.includes('Animals') || html.includes('animals')) {
      console.log('✅ Animals page content is loading');
    } else {
      console.log('⚠️  Animals page content may not be loading correctly');
    }
  })
  .catch(error => {
    console.log('❌ Animals page is not accessible:', error.message);
  });

console.log('\n📋 Manual Testing Instructions:');
console.log('1. Open http://localhost:3000/people in your browser');
console.log('2. Test the People Management features:');
console.log('   - Search functionality');
console.log('   - Role-based filtering');
console.log('   - Create new person');
console.log('   - Edit existing person');
console.log('   - View person details');
console.log('   - Delete person');
console.log('\n3. Open http://localhost:3000/intake in your browser');
console.log('4. Test the Intake Workflow:');
console.log('   - Step 1: Photo upload');
console.log('   - Step 2: Basic information');
console.log('   - Step 3: Intake details');
console.log('   - Step 4: Review and submit');
console.log('\n5. Verify data persistence by refreshing pages');
console.log('\n🎯 Phase 6 Features to Test:');
console.log('- People CRUD operations');
console.log('- Role-based organization');
console.log('- Search and filtering');
console.log('- Intake workflow wizard');
console.log('- Photo upload functionality');
console.log('- Form validation');
console.log('- Data persistence');
console.log('\n✅ Ready for comprehensive testing!');
