import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Complete game state for a user
 */
export interface GameState {
  /** Unique user identifier */
  userId: string;
  /** Current coin count */
  coins: number;
  /** User's upgrade levels */
  upgrades: {
    /** Auto-miner upgrade level (0-4) */
    autoMiner: number;
    /** Super-click upgrade level (0-4) */
    superClick: number;
  };
  /** Timestamp of last activity */
  lastActivityAt: string;
  /** Timestamp of last click action */
  lastClickAt: string | null;
}

/**
 * Response from user registration
 */
export interface RegisterResponse {
  /** Newly created user ID */
  userId: string;
}

/**
 * Result from collecting idle coins
 */
export interface CollectResult {
  /** Updated coin count */
  coins: number;
  /** Number of coins collected */
  collected: number;
  /** Complete updated game state */
  state: GameState;
}

/**
 * Request payload for purchasing upgrades
 */
export interface PurchaseRequest {
  /** Type of upgrade to purchase */
  upgrade: 'autoMiner' | 'superClick';
}

/**
 * Game API client for backend communication
 */
export const gameApi = {
  /**
   * Register a new player
   * @returns Promise resolving to user registration response
   */
  register: async (): Promise<RegisterResponse> => {
    const response = await api.post('/register');
    return response.data;
  },

  /**
   * Get current game state with idle coins automatically applied
   * @param userId - User identifier
   * @returns Promise resolving to current game state
   */
  getState: async (userId: string): Promise<GameState> => {
    const response = await api.get(`/state?userId=${userId}`);
    return response.data;
  },

  /**
   * Mine coins with click action
   * @param userId - User identifier
   * @returns Promise resolving to updated game state
   */
  mine: async (userId: string): Promise<GameState> => {
    const response = await api.post(`/mine?userId=${userId}`);
    return response.data;
  },

  /**
   * Purchase an upgrade if user has sufficient coins
   * @param userId - User identifier
   * @param upgrade - Type of upgrade to purchase
   * @returns Promise resolving to updated game state
   */
  purchase: async (userId: string, upgrade: 'autoMiner' | 'superClick'): Promise<GameState> => {
    const response = await api.post(`/purchase?userId=${userId}`, { upgrade });
    return response.data;
  },

  /**
   * Collect passive income from auto-miner
   * @param userId - User identifier
   * @returns Promise resolving to collection result
   */
  collect: async (userId: string): Promise<CollectResult> => {
    const response = await api.post(`/collect?userId=${userId}`);
    return response.data;
  },
};

// Upgrade costs (matching backend config)
export const UPGRADE_COSTS = {
  autoMiner: [10, 20, 40, 80],
  superClick: [5, 10, 20, 40],
};

// Auto-miner intervals (matching backend config)
export const AUTO_MINER_INTERVALS = [0, 20000, 15000, 10000, 5000]; // Level 0-4 in ms

// Upgrade effects descriptions
export const UPGRADE_EFFECTS = {
  autoMiner: [
    'Generates 1 coin/20s',
    'Generates 1 coin/15s', 
    'Generates 1 coin/10s',
    'Generates 1 coin/5s'
  ],
  superClick: [
    '2 coins per click',
    '3 coins per click',
    '4 coins per click', 
    '5 coins per click'
  ]
};
