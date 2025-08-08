import osascript from 'node-osascript';

async function executeAppleScript(script) {
  return new Promise((resolve, reject) => {
    osascript.execute(script, (err, result, raw) => {
      if (err) {
        // Provide more helpful error messages
        let errorMessage = err.message;
        if (errorMessage.includes('not found')) {
          errorMessage = 'Item not found. Please check the name and try again.';
        } else if (errorMessage.includes('Things3') || errorMessage.includes('not running')) {
          errorMessage = 'Things 3 error. Make sure the app is running and accessible.';
        } else if (errorMessage.includes('Application isn\'t running')) {
          errorMessage = 'Things 3 is not running. Please open Things 3 and try again.';
        }
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
}

async function checkThingsRunning() {
  const script = `tell application "System Events"
    return (name of processes) contains "Things3"
  end tell`;
  
  try {
    // Use osascript directly to avoid circular dependency
    const result = await new Promise((resolve, reject) => {
      osascript.execute(script, (err, result, raw) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return result === 'true';
  } catch (error) {
    return false;
  }
}

async function launchThings() {
  const script = `tell application "Things3" to activate`;
  return executeAppleScript(script);
}

async function executeThingsUrlScheme(url) {
  const script = `open location "${url}"`;
  return executeAppleScript(script);
}

export {
  executeAppleScript,
  executeThingsUrlScheme,
  checkThingsRunning,
  launchThings
};