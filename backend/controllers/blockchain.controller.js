import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Chuyển đổi import.meta.url thành __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nodes = [
  {
    id: 1,
    name: 'Node 1',
    datadir: 'D:/blockchain/test/node1',
    port: 30306,
    httpPort: 8545,
    enode:
      'enode://2d7bf01dfb81c715515dd7aa8202ef95c1bf44561ba1d66f4aedb73a749946a7fb8720f7e4c1875e56dca6aa3f3d86e44a57ee24b87d7916efaff7d5ef2ef0e9@192.168.1.6:30326',
    account: '0x6863e7e69898b2b8ef7a61f973133defc0b3f662',
    passwordFile: 'D:/blockchain/test/node1/password.txt'
  },
  {
    id: 2,
    name: 'Node 2',
    datadir: path.resolve(__dirname, '../../test/node2'),
    port: 30316,
    httpPort: 8547,
    enode:
      'enode://2d7bf01dfb81c715515dd7aa8202ef95c1bf44561ba1d66f4aedb73a749946a7fb8720f7e4c1875e56dca6aa3f3d86e44a57ee24b87d7916efaff7d5ef2ef0e9@192.168.1.6:30326',
    account: '0x59b1e78d129cf129b3753120178c11b0172257a1',
    passwordFile: path.resolve(__dirname, '../../test/node2/password.txt')
  }
]

export const startNode = (req, res) => {
  const { nodeId } = req.params
  const node = nodes.find((n) => n.id === parseInt(nodeId, 10))
  if (!node) {
    return res.status(404).send(`Node ${nodeId} không tồn tại`)
  }

  // Tạo lệnh khởi động geth
  const cmd = [
    `geth`,
    `--datadir "${node.datadir}"`,
    `--port ${node.port}`,
    `--bootnodes "${node.enode}"`,
    `--networkid 2024`,
    `--unlock "${node.account}"`,
    `--password "${node.passwordFile}"`,
    `--mine`,
    `--miner.threads 1`,
    `--miner.etherbase "${node.account}"`,
    `--http`,
    `--http.addr "0.0.0.0"`,
    `--http.port ${node.httpPort}`,
    `--http.api "admin,eth,net,web3,clique"`,
    `--ipcdisable`,
    `--allow-insecure-unlock`,
    `--syncmode full`,
    `console`
  ].join(' ')

  // Sử dụng Git Bash làm shell
  const gitBashPath = 'C:/Program Files/Git/bin/bash.exe'

  // Thực thi lệnh từ thư mục D:/blockchain/test
  exec(
    cmd,
    { cwd: path.resolve(__dirname, '../../test'), shell: true },
    (error, stdout, stderr) => {
      console.log('Lệnh đã chạy:', cmd)
      if (error) {
        console.error('Chi tiết lỗi:', error.message, stderr)
        return res.status(500).send(`Lỗi khi bật Node ${nodeId}: ${stderr}`)
      }
      console.log('Kết quả STDOUT:', stdout)
      res.send(`Node ${nodeId} đã được bật`)
    }
  )
}

export const stopNode = (req, res) => {
  const { nodeId } = req.params
  const node = nodes.find((n) => n.id === parseInt(nodeId, 10))
  if (!node) {
    return res.status(404).send(`Node ${nodeId} không tồn tại`)
  }

  const pidFile = `${node.datadir}/geth.pid`
  if (!fs.existsSync(pidFile)) {
    return res.status(400).send(`Node ${nodeId} đã tắt`)
  }

  const pid = fs.readFileSync(pidFile, 'utf-8').trim()
  exec(`kill ${pid}`, (error) => {
    if (error) {
      return res
        .status(500)
        .send(`Lỗi khi tắt Node ${nodeId}: ${error.message}`)
    }
    fs.unlinkSync(pidFile)
    res.send(`Node ${nodeId} đã được tắt`)
  })
}

export const getNodeStatus = (req, res) => {
  const status = nodes.map((node) => {
    const pidFile = `${node.datadir}/geth.pid`
    const isRunning =
      fs.existsSync(pidFile) && fs.readFileSync(pidFile, 'utf-8').trim()
    return {
      id: node.id,
      name: node.name,
      status: isRunning ? 'online' : 'offline'
    }
  })
  res.json(status)
}

export const getBlocksWithTransactions = async (req, res) => {
  try {
    const latestBlockNumber = await web3.eth.getBlockNumber()
    const blocks = []
    for (let i = latestBlockNumber; i >= 0; i--) {
      const block = await web3.eth.getBlock(i, true)
      if (block.transactions.length > 0) {
        blocks.push({
          number: block.number,
          miner: block.miner,
          timestamp: block.timestamp,
          transactions: block.transactions
        })
      }
      if (blocks.length >= 10) break
    }
    res.json(blocks)
  } catch (error) {
    res.status(500).send(`Lỗi khi lấy block: ${error.message}`)
  }
}
