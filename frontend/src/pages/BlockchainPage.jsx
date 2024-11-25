import React, { useState, useEffect } from 'react'
import axios from 'axios'

const BlockchainPage = () => {
  const [nodes, setNodes] = useState([]) // Danh sách node

  // Gọi API để lấy trạng thái node
  const fetchNodes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/nodes')
      setNodes(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy trạng thái node:', error.message)
    }
  }

  // Bật node
  const startNode = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/auth/nodes/${id}/start`)
      alert(`Node ${id} đã được bật`)
      fetchNodes() // Cập nhật trạng thái sau khi bật
    } catch (error) {
      alert(`Lỗi khi bật Node ${id}: ${error.message}`)
    }
  }

  // Tắt node
  const stopNode = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/auth/nodes/${id}/stop`)
      alert(`Node ${id} đã được tắt`)
      fetchNodes() // Cập nhật trạng thái sau khi tắt
    } catch (error) {
      alert(`Lỗi khi tắt Node ${id}: ${error.message}`)
    }
  }

  // Lấy trạng thái node khi load trang
  useEffect(() => {
    fetchNodes()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Quản lý Blockchain Nodes
      </h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-white shadow-md rounded-lg">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Tên Node</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr
                key={node.id}
                className={`${
                  node.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                } hover:bg-gray-100`}
              >
                <td className="border px-4 py-2 text-center">{node.id}</td>
                <td className="border px-4 py-2 text-center">{node.name}</td>
                <td className="border px-4 py-2 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-white ${
                      node.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {node.status}
                  </span>
                </td>
                <td className="border px-4 py-2 text-center">
                  {node.status === 'offline' ? (
                    <button
                      onClick={() => startNode(node.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Bật
                    </button>
                  ) : (
                    <button
                      onClick={() => stopNode(node.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Tắt
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BlockchainPage
