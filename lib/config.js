import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';

const CONFIG_DIR = join(homedir(), '.things-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * Ensures the config directory exists
 */
function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Loads the configuration from the config file
 * @returns {Object} Configuration object
 */
export function loadConfig() {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return {};
    }
    const configData = readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading config:', error.message);
    return {};
  }
}

/**
 * Saves the configuration to the config file
 * @param {Object} config - Configuration object to save
 */
export function saveConfig(config) {
  try {
    ensureConfigDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving config:', error.message);
    throw error;
  }
}

/**
 * Gets the Things auth token from config
 * @returns {string|null} Auth token or null if not set
 */
export function getAuthToken() {
  const config = loadConfig();
  return config.authToken || null;
}

/**
 * Sets the Things auth token in config
 * @param {string} token - Auth token to save
 */
export function setAuthToken(token) {
  const config = loadConfig();
  config.authToken = token;
  saveConfig(config);
}

/**
 * Gets the config file path for display to user
 * @returns {string} Path to config file
 */
export function getConfigPath() {
  return CONFIG_FILE;
}