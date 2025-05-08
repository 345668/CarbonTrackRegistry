import { storage } from "../storage";
import { 
  InsertBlockchainRecord,
  BlockchainRecord,
  BlockchainConfig
} from "@shared/schema";
import crypto from "crypto";

/**
 * Service for interacting with blockchain functionality
 */
export class BlockchainService {
  private config: BlockchainConfig | undefined;
  
  constructor() {
    // Initialize config in constructor
    this.initConfig();
  }
  
  /**
   * Initialize blockchain configuration
   */
  private async initConfig(): Promise<void> {
    try {
      this.config = await storage.getBlockchainConfig();
      
      // If no config exists, create default config
      if (!this.config) {
        this.config = await storage.updateBlockchainConfig({
          enabled: false,
          provider: "mock", // Default to mock provider
          chainId: 1,       // Default chain ID (Ethereum mainnet)
        });
      }
    } catch (error) {
      console.error("Failed to initialize blockchain configuration:", error);
    }
  }
  
  /**
   * Get the current blockchain configuration
   */
  async getConfig(): Promise<BlockchainConfig | undefined> {
    if (!this.config) {
      await this.initConfig();
    }
    return this.config;
  }
  
  /**
   * Update blockchain configuration
   */
  async updateConfig(config: Partial<BlockchainConfig>): Promise<BlockchainConfig> {
    this.config = await storage.updateBlockchainConfig(config);
    return this.config;
  }
  
  /**
   * Check if blockchain integration is enabled
   */
  async isEnabled(): Promise<boolean> {
    const config = await this.getConfig();
    return config?.enabled || false;
  }
  
  /**
   * Creates a mock transaction hash for testing
   */
  private generateMockTxHash(): string {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }
  
  /**
   * Records a blockchain transaction
   * If blockchain integration is disabled, generates a mock transaction
   */
  async recordTransaction(
    entityType: "project" | "credit" | "verification" | "adjustment",
    entityId: string,
    action: "created" | "updated" | "transferred" | "retired" | "adjusted",
    data?: Record<string, any>
  ): Promise<BlockchainRecord> {
    const isEnabled = await this.isEnabled();
    let txHash: string;
    let blockNumber: number | undefined;
    let chainId: number | undefined;
    let network: string | undefined;
    
    if (isEnabled && this.config) {
      // In a real implementation, this would interact with an actual blockchain
      // using a library like ethers.js or web3.js
      
      // For now, we'll just generate mock data
      txHash = this.generateMockTxHash();
      blockNumber = Math.floor(Math.random() * 1000000);
      chainId = this.config.chainId ?? 1;
      network = this.getNetworkName(chainId);
    } else {
      // Create a mock transaction
      txHash = this.generateMockTxHash();
      blockNumber = 0; // Mock block number
      chainId = 0;     // Mock chain ID
      network = "mock";
    }
    
    // Create the blockchain record
    const record: InsertBlockchainRecord = {
      txHash,
      entityType,
      entityId,
      action,
      data,
      blockNumber,
      chainId,
      network,
    };
    
    // Store the record
    return await storage.createBlockchainRecord(record);
  }
  
  /**
   * Verify a blockchain transaction by its hash
   */
  async verifyTransaction(txHash: string): Promise<BlockchainRecord | undefined> {
    // In a real implementation, this would verify the transaction on the blockchain
    
    // For now, we'll just check if the transaction exists in our database
    return await storage.getBlockchainRecordByTxHash(txHash);
  }
  
  /**
   * Get blockchain records for an entity
   */
  async getRecordsForEntity(entityType: string, entityId: string): Promise<BlockchainRecord[]> {
    return await storage.getBlockchainRecordsByEntity(entityType, entityId);
  }
  
  /**
   * Get recent blockchain records with optional limit
   */
  async getRecentRecords(limit: number = 10): Promise<BlockchainRecord[]> {
    return await storage.listBlockchainRecords(limit);
  }
  
  /**
   * Helper to get network name from chain ID
   */
  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: "ethereum-mainnet",
      3: "ropsten",
      4: "rinkeby",
      5: "goerli",
      42: "kovan",
      137: "polygon-mainnet",
      80001: "polygon-mumbai",
      56: "binance-smart-chain",
      97: "binance-smart-chain-testnet",
      43114: "avalanche",
      43113: "avalanche-fuji-testnet",
    };
    
    return networks[chainId] || `chain-${chainId}`;
  }
}

// Create singleton instance
export const blockchainService = new BlockchainService();