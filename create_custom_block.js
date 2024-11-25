import fs from 'fs'
import Block from 'ethereumjs-block'
import * as ethUtil from 'ethereumjs-util'
import rlp from 'rlp'

// Thông tin của khối cha (parentBlock)
const parentBlock = {
  number: 4182,
  hash: Buffer.from(
    '05c921a1e1450c89e55cffbe9e5ee7ab66274b5750df5433244994a70caa5d98',
    'hex'
  ),
  timestamp: 1732456316,
  difficulty: '0x1', // Difficulty từ khối cha
  gasLimit: '0x' + (30000000).toString(16) // Gas limit từ khối cha
  // Các trường khác nếu cần
}

// Tạo header cho khối mới
const newBlockHeader = {
  parentHash: parentBlock.hash,
  uncleHash: ethUtil.keccak256(rlp.encode([])), // Hash của mảng trống
  coinbase: Buffer.alloc(20), // Địa chỉ 0x0
  stateRoot: Buffer.alloc(32), // Giá trị mặc định
  transactionsTrie: ethUtil.keccak256(rlp.encode([])), // Hash của mảng trống
  receiptTrie: ethUtil.keccak256(rlp.encode([])), // Hash của mảng trống
  bloom: Buffer.alloc(256), // Giá trị mặc định
  difficulty: ethUtil.toBuffer(parentBlock.difficulty),
  number: ethUtil.toBuffer(parentBlock.number + 1),
  gasLimit: ethUtil.toBuffer(parentBlock.gasLimit),
  gasUsed: ethUtil.toBuffer(0),
  timestamp: ethUtil.toBuffer(parentBlock.timestamp + 1), // Tăng timestamp
  extraData: Buffer.from('Custom Block', 'utf8'), // Thay đổi extraData
  mixHash: Buffer.alloc(32), // Giá trị mặc định
  nonce: Buffer.alloc(8) // Giá trị mặc định
}

// Tạo khối mới
const block = new Block({
  header: newBlockHeader,
  transactions: [],
  uncleHeaders: []
})

// Mã hóa khối bằng RLP
const serializedBlock = '0x' + block.serialize().toString('hex')

// Ghi kết quả vào file
fs.writeFileSync('block_data.txt', serializedBlock)

console.log('Đã ghi dữ liệu khối vào file block_data.txt')
