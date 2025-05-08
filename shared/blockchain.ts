import { z } from "zod";

/**
 * Blockchain record schema for transactions
 */
export const blockchainRecordSchema = z.object({
  id: z.number().optional(),
  txHash: z.string().min(1, "Transaction hash is required"),
  entityType: z.enum(["project", "credit", "verification", "adjustment"]),
  entityId: z.string().min(1, "Entity ID is required"),
  action: z.enum(["created", "updated", "transferred", "retired", "adjusted"]),
  data: z.record(z.string(), z.any()).optional(),
  timestamp: z.date().or(z.string()).optional(),
  blockNumber: z.number().optional(),
  chainId: z.number().optional(),
  network: z.string().optional(),
});

export type BlockchainRecord = z.infer<typeof blockchainRecordSchema>;
export type InsertBlockchainRecord = Omit<BlockchainRecord, "id"> & { id?: number };

/**
 * Blockchain configuration schema
 */
export const blockchainConfigSchema = z.object({
  id: z.number().optional(),
  enabled: z.boolean().default(false),
  provider: z.string().optional(),
  apiKey: z.string().optional(),
  chainId: z.number().optional(),
  contractAddress: z.string().optional(),
  privateKey: z.string().optional(),
  gasPrice: z.number().optional(),
  gasLimit: z.number().optional(),
});

export type BlockchainConfig = z.infer<typeof blockchainConfigSchema>;
export type InsertBlockchainConfig = Omit<BlockchainConfig, "id"> & { id?: number };

export const createInsertBlockchainRecordSchema = blockchainRecordSchema.omit({ id: true });
export const createInsertBlockchainConfigSchema = blockchainConfigSchema.omit({ id: true });