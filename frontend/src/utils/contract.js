import { BrowserProvider, Contract } from 'ethers'

const ABI = [
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

const CONTRACT_ADDRESS = '0x490a57b0e1244d3D29da5881da4D6B27FAF1b691'

export const getContract = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Yêu cầu người dùng kết nối MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Kết nối với smart contract
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer)
      return contract
    } catch (error) {
      console.error('Lỗi khi kết nối với MetaMask:', error)
    }
  } else {
    console.error('Vui lòng cài đặt MetaMask để sử dụng ứng dụng này!')
  }
}

// Hàm mới để tự động gửi giao dịch
export const sendTransaction = async (to, value, data) => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Yêu cầu người dùng kết nối MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      // Gửi giao dịch trực tiếp
      const transactionParameters = {
        to: to, // Địa chỉ người nhận
        from: window.ethereum.selectedAddress, // Địa chỉ người gửi (địa chỉ đã kết nối MetaMask)
        value: value, // Giá trị giao dịch (số lượng Wei)
        data: data // Dữ liệu giao dịch (nếu có)
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      })

      console.log('Giao dịch đã được gửi:', txHash)
      return txHash
    } catch (error) {
      console.error('Lỗi khi gửi giao dịch:', error)
    }
  } else {
    console.error('Vui lòng cài đặt MetaMask để sử dụng ứng dụng này!')
  }
}
