import { ethers } from 'ethers'
import 'dotenv/config'

const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'certificateId',
        type: 'bytes32'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'recipientName',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'courseName',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'courseCode',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'issueDate',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'ipfsCID',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'issuer',
        type: 'address'
      }
    ],
    name: 'CertificateAdded',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recipientName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'courseName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'courseCode',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'issueDate',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'ipfsCID',
        type: 'string'
      }
    ],
    name: 'addCertificate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'certificateIds',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    name: 'certificateIdsByCourseCode',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    name: 'certificates',
    outputs: [
      {
        internalType: 'string',
        name: 'recipientName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'courseName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'courseCode',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'issueDate',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'ipfsCID',
        type: 'string'
      },
      {
        internalType: 'address',
        name: 'issuer',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getAllCertificateIds',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'courseCode',
        type: 'string'
      }
    ],
    name: 'getIpfsCIDByCourseCode',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'ipfsCID',
        type: 'string'
      }
    ],
    name: 'verifyCertificateByCID',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'recipientName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'courseName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'courseCode',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'issueDate',
        type: 'uint256'
      }
    ],
    name: 'verifyCertificateByInfo',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

const CONTRACT_ADDRESS = '0x66E6BC965C4424A7A18629D47AD453f6F8958665'
const RPC_URL = process.env.RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

export const getContract = async () => {
  if (!RPC_URL || !PRIVATE_KEY) {
    console.error('RPC_URL hoặc PRIVATE_KEY chưa được cấu hình!')
    return
  }

  // Tạo provider để kết nối đến blockchain
  const provider = new ethers.JsonRpcProvider(RPC_URL)

  // Tạo ví từ khóa riêng và kết nối với provider
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

  // Kết nối với smart contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet)
  return contract
}
