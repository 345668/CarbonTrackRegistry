// Sample blockchain record data
export const sampleRecords = [
  {
    id: 1,
    txHash: '0x2d9bf5b54cc8b4d9c5a13cab127a35c7b9c2d9a8b5e6f7g8h9i0j1k2l3m4n5o6',
    entityType: 'credit',
    entityId: 'VCS-001-2023-1001',
    action: 'created',
    data: { quantity: 5000, vintage: '2023', project: 'Rainforest Conservation' },
    timestamp: '2023-07-10T14:30:00Z',
    blockNumber: 15240978,
    chainId: 1,
    network: 'Ethereum Mainnet'
  },
  {
    id: 2,
    txHash: '0x7a6b5c4d3e2f1g0h9i8j7k6l5m4n3o2p1q0r9s8t7u6v5w4x3y2z1a2b3c4d5e',
    entityType: 'credit',
    entityId: 'GS-002-2023-3842',
    action: 'transferred',
    data: { from: 'Project Developer', to: 'Carbon Broker', quantity: 3500 },
    timestamp: '2023-08-15T10:45:00Z',
    blockNumber: 15982345,
    chainId: 1,
    network: 'Ethereum Mainnet'
  },
  {
    id: 3,
    txHash: '0xf1e2d3c4b5a6978695a4b3c2d1e0f9g8h7i6j5k4l3m2n1o0p9q8r7s6t5u4v3',
    entityType: 'adjustment',
    entityId: '1',
    action: 'adjusted',
    data: { hostCountry: 'Brazil', recipientCountry: 'Switzerland', quantity: 5000 },
    timestamp: '2023-07-15T09:20:00Z',
    blockNumber: 15265432,
    chainId: 1,
    network: 'Ethereum Mainnet'
  },
  {
    id: 4,
    txHash: '0x9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t9u8v7w6x5y4z3a2b1c0d9',
    entityType: 'credit',
    entityId: 'CDM-003-2023-5472',
    action: 'retired',
    data: { retiredBy: 'Green Corp Inc.', purpose: 'Corporate Carbon Neutrality 2023' },
    timestamp: '2023-09-20T16:15:00Z',
    blockNumber: 16345678,
    chainId: 1,
    network: 'Ethereum Mainnet'
  }
];

// Sample corresponding adjustment data
export const sampleAdjustments = [
  {
    id: 1,
    creditId: 1,
    creditSerialNumber: 'VCS-001-2023-1001',
    hostCountry: 'Brazil',
    recipientCountry: 'Switzerland',
    adjustmentType: 'ITMO',
    adjustmentQuantity: 5000,
    adjustmentStatus: 'approved',
    adjustmentDate: '2023-07-15',
    authorizedBy: 'UNFCCC',
    verifiedBy: 'Gold Standard',
    ndcTarget: 'Reforestation & Afforestation',
    mitigationOutcomeType: 'Removal',
    createdAt: '2023-07-10',
  },
  {
    id: 2,
    creditId: 2,
    creditSerialNumber: 'GS-002-2023-3842',
    hostCountry: 'Colombia',
    recipientCountry: 'Norway',
    adjustmentType: 'ITMO',
    adjustmentQuantity: 3500,
    adjustmentStatus: 'pending',
    adjustmentDate: '2023-08-20',
    authorizedBy: 'National Authority',
    ndcTarget: 'Renewable Energy - Solar',
    mitigationOutcomeType: 'Avoidance',
    createdAt: '2023-08-15',
  },
  {
    id: 3,
    creditId: 3,
    creditSerialNumber: 'CDM-003-2023-5472',
    hostCountry: 'Kenya',
    recipientCountry: 'Japan',
    adjustmentType: 'CORSIA',
    adjustmentQuantity: 2500,
    adjustmentStatus: 'approved',
    adjustmentDate: '2023-09-12',
    authorizedBy: 'UNFCCC',
    verifiedBy: 'Verra',
    ndcTarget: 'Clean Cookstoves Program',
    mitigationOutcomeType: 'Reduction',
    createdAt: '2023-09-05',
  }
];