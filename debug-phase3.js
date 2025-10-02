/**
 * PHASE 3 DEBUGGING & TESTING SCRIPT
 * 
 * PURPOSE:
 * Systematically test all Phase 3 Medical Workflow components
 * and identify any issues that need to be fixed.
 * 
 * TESTING AREAS:
 * 1. Task Assignment System
 * 2. Status Workflow Management  
 * 3. Task Templates System
 * 4. Medical Task Creation
 * 5. Medical Task List
 * 6. Medical Task Editing
 * 7. Dashboard Integration
 * 8. Error Handling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  phase: "Phase 3: Medical Workflow",
  status: "Testing in progress...",
  tests: [],
  issues: [],
  recommendations: []
};

// ============================================================================
// TEST 1: COMPONENT FILE VALIDATION
// ============================================================================

function testComponentFiles() {
  console.log("🔍 Testing Component Files...");
  
  const components = [
    'apps/4paws-web/src/components/ui/task-assignment.tsx',
    'apps/4paws-web/src/components/ui/task-status.tsx', 
    'apps/4paws-web/src/components/ui/task-templates.tsx'
  ];
  
  const results = [];
  
  components.forEach(component => {
    const fullPath = path.join(__dirname, component);
    const exists = fs.existsSync(fullPath);
    const content = exists ? fs.readFileSync(fullPath, 'utf8') : '';
    
    const test = {
      component: component,
      exists: exists,
      hasExports: content.includes('export default'),
      hasImports: content.includes('import'),
      hasTypeScript: content.includes('interface') || content.includes('type'),
      hasReact: content.includes('React') || content.includes('useState'),
      size: content.length,
      issues: []
    };
    
    // Check for common issues
    if (!exists) {
      test.issues.push('File does not exist');
    } else {
      if (!content.includes('export default')) {
        test.issues.push('Missing default export');
      }
      if (!content.includes('import')) {
        test.issues.push('Missing imports');
      }
      if (content.length < 100) {
        test.issues.push('File seems too small');
      }
      if (content.includes('TODO') || content.includes('FIXME')) {
        test.issues.push('Contains TODO/FIXME comments');
      }
    }
    
    results.push(test);
  });
  
  return results;
}

// ============================================================================
// TEST 2: MEDICAL PAGES INTEGRATION
// ============================================================================

function testMedicalPagesIntegration() {
  console.log("🔍 Testing Medical Pages Integration...");
  
  const pages = [
    'apps/4paws-web/src/pages/medical/create.tsx',
    'apps/4paws-web/src/pages/medical/edit.tsx',
    'apps/4paws-web/src/pages/medical/index.tsx'
  ];
  
  const results = [];
  
  pages.forEach(page => {
    const fullPath = path.join(__dirname, page);
    const exists = fs.existsSync(fullPath);
    const content = exists ? fs.readFileSync(fullPath, 'utf8') : '';
    
    const test = {
      page: page,
      exists: exists,
      hasTaskAssignment: content.includes('TaskAssignment'),
      hasTaskStatus: content.includes('TaskStatus'),
      hasTaskTemplates: content.includes('TaskTemplates'),
      hasWorkflowImports: content.includes('task-assignment') || content.includes('task-status'),
      hasStatusManagement: content.includes('status') && content.includes('assigned'),
      issues: []
    };
    
    if (!exists) {
      test.issues.push('File does not exist');
    } else {
      if (!test.hasTaskAssignment && page.includes('create')) {
        test.issues.push('Missing TaskAssignment component');
      }
      if (!test.hasTaskStatus && page.includes('create')) {
        test.issues.push('Missing TaskStatus component');
      }
      if (!test.hasTaskTemplates && page.includes('create')) {
        test.issues.push('Missing TaskTemplates component');
      }
    }
    
    results.push(test);
  });
  
  return results;
}

// ============================================================================
// TEST 3: DEPENDENCY VALIDATION
// ============================================================================

function testDependencies() {
  console.log("🔍 Testing Dependencies...");
  
  const packageJsonPath = path.join(__dirname, 'apps/4paws-web/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = [
    'react-dropzone',
    '@tanstack/react-query',
    'react-hook-form',
    'zod',
    'lucide-react'
  ];
  
  const results = {
    packageJson: packageJson,
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
    missing: [],
    issues: []
  };
  
  requiredDeps.forEach(dep => {
    if (!results.dependencies[dep] && !results.devDependencies[dep]) {
      results.missing.push(dep);
      results.issues.push(`Missing dependency: ${dep}`);
    }
  });
  
  return results;
}

// ============================================================================
// TEST 4: API INTEGRATION VALIDATION
// ============================================================================

function testApiIntegration() {
  console.log("🔍 Testing API Integration...");
  
  const apiPath = path.join(__dirname, 'apps/4paws-web/src/lib/api.ts');
  const exists = fs.existsSync(apiPath);
  const content = exists ? fs.readFileSync(apiPath, 'utf8') : '';
  
  const test = {
    file: 'apps/4paws-web/src/lib/api.ts',
    exists: exists,
    hasMedicalApi: content.includes('medicalApi'),
    hasCreateTask: content.includes('createTask'),
    hasUpdateTask: content.includes('updateTask'),
    hasGetTasks: content.includes('getTasks'),
    hasSupabaseIntegration: content.includes('supabase'),
    issues: []
  };
  
  if (!exists) {
    test.issues.push('API file does not exist');
  } else {
    if (!test.hasMedicalApi) {
      test.issues.push('Missing medicalApi object');
    }
    if (!test.hasCreateTask) {
      test.issues.push('Missing createTask function');
    }
    if (!test.hasUpdateTask) {
      test.issues.push('Missing updateTask function');
    }
    if (!test.hasGetTasks) {
      test.issues.push('Missing getTasks function');
    }
  }
  
  return test;
}

// ============================================================================
// TEST 5: ROUTING VALIDATION
// ============================================================================

function testRouting() {
  console.log("🔍 Testing Routing...");
  
  const appPath = path.join(__dirname, 'apps/4paws-web/src/App.tsx');
  const exists = fs.existsSync(appPath);
  const content = exists ? fs.readFileSync(appPath, 'utf8') : '';
  
  const test = {
    file: 'apps/4paws-web/src/App.tsx',
    exists: exists,
    hasMedicalRoutes: content.includes('/medical'),
    hasCreateRoute: content.includes('/medical/create'),
    hasEditRoute: content.includes('/medical/:id/edit'),
    hasWouter: content.includes('wouter'),
    hasRouteComponents: content.includes('CreateMedicalTask') && content.includes('EditMedicalTask'),
    issues: []
  };
  
  if (!exists) {
    test.issues.push('App.tsx does not exist');
  } else {
    if (!test.hasMedicalRoutes) {
      test.issues.push('Missing medical routes');
    }
    if (!test.hasCreateRoute) {
      test.issues.push('Missing create route');
    }
    if (!test.hasEditRoute) {
      test.issues.push('Missing edit route');
    }
  }
  
  return test;
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests() {
  console.log("🚀 Starting Phase 3 Debugging & Testing...\n");
  
  // Run all tests
  const componentTests = testComponentFiles();
  const pageTests = testMedicalPagesIntegration();
  const dependencyTests = testDependencies();
  const apiTests = testApiIntegration();
  const routingTests = testRouting();
  
  // Store results
  testResults.tests = [
    { name: "Component Files", results: componentTests },
    { name: "Page Integration", results: pageTests },
    { name: "Dependencies", results: dependencyTests },
    { name: "API Integration", results: apiTests },
    { name: "Routing", results: routingTests }
  ];
  
  // Analyze results
  let totalIssues = 0;
  let criticalIssues = 0;
  
  testResults.tests.forEach(test => {
    if (test.name === "Component Files") {
      test.results.forEach(result => {
        totalIssues += result.issues.length;
        if (result.issues.some(issue => issue.includes('does not exist'))) {
          criticalIssues++;
        }
      });
    } else if (test.name === "Dependencies") {
      totalIssues += test.results.issues.length;
      if (test.results.missing.length > 0) {
        criticalIssues += test.results.missing.length;
      }
    } else {
      totalIssues += test.results.issues.length;
      if (test.results.issues.some(issue => issue.includes('does not exist'))) {
        criticalIssues++;
      }
    }
  });
  
  // Generate recommendations
  if (criticalIssues > 0) {
    testResults.recommendations.push("Fix critical issues first (missing files, dependencies)");
  }
  if (totalIssues > 0) {
    testResults.recommendations.push("Address all identified issues before testing");
  }
  if (totalIssues === 0) {
    testResults.recommendations.push("All tests passed! Ready for manual testing");
  }
  
  testResults.status = criticalIssues > 0 ? "Critical issues found" : 
                     totalIssues > 0 ? "Issues found" : "All tests passed";
  
  return testResults;
}

// ============================================================================
// GENERATE REPORT
// ============================================================================

function generateReport() {
  const results = runAllTests();
  
  console.log("\n" + "=".repeat(80));
  console.log("📊 PHASE 3 DEBUGGING & TESTING REPORT");
  console.log("=".repeat(80));
  console.log(`Timestamp: ${results.timestamp}`);
  console.log(`Phase: ${results.phase}`);
  console.log(`Status: ${results.status}`);
  console.log("\n");
  
  // Component Files Test
  console.log("🔧 COMPONENT FILES TEST:");
  console.log("-".repeat(40));
  results.tests[0].results.forEach(test => {
    console.log(`📁 ${test.component}`);
    console.log(`   Exists: ${test.exists ? '✅' : '❌'}`);
    console.log(`   Has Exports: ${test.hasExports ? '✅' : '❌'}`);
    console.log(`   Has Imports: ${test.hasImports ? '✅' : '❌'}`);
    console.log(`   Has TypeScript: ${test.hasTypeScript ? '✅' : '❌'}`);
    console.log(`   Has React: ${test.hasReact ? '✅' : '❌'}`);
    console.log(`   Size: ${test.size} characters`);
    if (test.issues.length > 0) {
      console.log(`   Issues: ${test.issues.join(', ')}`);
    }
    console.log("");
  });
  
  // Dependencies Test
  console.log("📦 DEPENDENCIES TEST:");
  console.log("-".repeat(40));
  const depTest = results.tests[2].results;
  console.log(`Package.json exists: ${depTest.packageJson ? '✅' : '❌'}`);
  console.log(`Dependencies count: ${Object.keys(depTest.dependencies).length}`);
  console.log(`Dev dependencies count: ${Object.keys(depTest.devDependencies).length}`);
  if (depTest.missing.length > 0) {
    console.log(`Missing dependencies: ${depTest.missing.join(', ')}`);
  } else {
    console.log("All required dependencies present ✅");
  }
  console.log("");
  
  // API Integration Test
  console.log("🔌 API INTEGRATION TEST:");
  console.log("-".repeat(40));
  const apiTest = results.tests[3].results;
  console.log(`API file exists: ${apiTest.exists ? '✅' : '❌'}`);
  console.log(`Has medicalApi: ${apiTest.hasMedicalApi ? '✅' : '❌'}`);
  console.log(`Has createTask: ${apiTest.hasCreateTask ? '✅' : '❌'}`);
  console.log(`Has updateTask: ${apiTest.hasUpdateTask ? '✅' : '❌'}`);
  console.log(`Has getTasks: ${apiTest.hasGetTasks ? '✅' : '❌'}`);
  console.log(`Has Supabase: ${apiTest.hasSupabaseIntegration ? '✅' : '❌'}`);
  if (apiTest.issues.length > 0) {
    console.log(`Issues: ${apiTest.issues.join(', ')}`);
  }
  console.log("");
  
  // Routing Test
  console.log("🛣️  ROUTING TEST:");
  console.log("-".repeat(40));
  const routeTest = results.tests[4].results;
  console.log(`App.tsx exists: ${routeTest.exists ? '✅' : '❌'}`);
  console.log(`Has medical routes: ${routeTest.hasMedicalRoutes ? '✅' : '❌'}`);
  console.log(`Has create route: ${routeTest.hasCreateRoute ? '✅' : '❌'}`);
  console.log(`Has edit route: ${routeTest.hasEditRoute ? '✅' : '❌'}`);
  console.log(`Has Wouter: ${routeTest.hasWouter ? '✅' : '❌'}`);
  if (routeTest.issues.length > 0) {
    console.log(`Issues: ${routeTest.issues.join(', ')}`);
  }
  console.log("");
  
  // Recommendations
  console.log("💡 RECOMMENDATIONS:");
  console.log("-".repeat(40));
  results.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  console.log("");
  
  // Summary
  console.log("📋 SUMMARY:");
  console.log("-".repeat(40));
  console.log(`Total issues found: ${results.tests.reduce((sum, test) => {
    if (test.name === "Component Files") {
      return sum + test.results.reduce((s, r) => s + r.issues.length, 0);
    } else if (test.name === "Dependencies") {
      return sum + test.results.issues.length;
    } else {
      return sum + test.results.issues.length;
    }
  }, 0)}`);
  console.log(`Critical issues: ${results.tests.reduce((sum, test) => {
    if (test.name === "Component Files") {
      return sum + test.results.filter(r => r.issues.some(i => i.includes('does not exist'))).length;
    } else if (test.name === "Dependencies") {
      return sum + test.results.missing.length;
    } else {
      return sum + test.results.issues.filter(i => i.includes('does not exist')).length;
    }
  }, 0)}`);
  console.log(`Status: ${results.status}`);
  console.log("");
  
  return results;
}

// Run the tests
generateReport();

export { generateReport, runAllTests };
