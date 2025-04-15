const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  auditInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  updateInterval: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  logFile: path.join(__dirname, '../security-audit.log'),
  criticalVulnerabilities: ['high', 'critical']
};

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(config.logFile, logMessage);
}

// Run npm audit and return results
function runAudit() {
  try {
    const auditOutput = execSync('npm audit --json').toString();
    return JSON.parse(auditOutput);
  } catch (error) {
    log(`Error running npm audit: ${error.message}`);
    return null;
  }
}

// Check for updates
function checkForUpdates() {
  try {
    const outdated = execSync('npm outdated --json').toString();
    return JSON.parse(outdated);
  } catch (error) {
    log(`Error checking for updates: ${error.message}`);
    return null;
  }
}

// Analyze audit results
function analyzeAuditResults(auditResults) {
  if (!auditResults) return;

  const vulnerabilities = auditResults.vulnerabilities || {};
  let criticalCount = 0;

  Object.entries(vulnerabilities).forEach(([packageName, details]) => {
    if (config.criticalVulnerabilities.includes(details.severity)) {
      criticalCount++;
      log(`CRITICAL: ${packageName} - ${details.severity} severity vulnerability found`);
      log(`  Title: ${details.title}`);
      log(`  Path: ${details.path}`);
      log(`  More info: ${details.url}`);
    }
  });

  if (criticalCount > 0) {
    log(`Found ${criticalCount} critical vulnerabilities that need immediate attention`);
  } else {
    log('No critical vulnerabilities found');
  }
}

// Main function
async function main() {
  log('Starting security check...');

  // Run audit
  log('Running npm audit...');
  const auditResults = runAudit();
  analyzeAuditResults(auditResults);

  // Check for updates
  log('Checking for package updates...');
  const updates = checkForUpdates();
  if (updates && Object.keys(updates).length > 0) {
    log('Available updates:');
    Object.entries(updates).forEach(([packageName, details]) => {
      log(`  ${packageName}: ${details.current} -> ${details.latest}`);
    });
  } else {
    log('All packages are up to date');
  }

  log('Security check completed');
}

// Run the script
main().catch(error => {
  log(`Error in security check: ${error.message}`);
  process.exit(1);
}); 