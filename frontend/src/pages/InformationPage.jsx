import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const InformationPage = () => {
  const [transactionHash, setTransactionHash] = useState('')
  const [certificateInfo, setCertificateInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const location = useLocation()

  // Lấy transaction hash từ URL query
  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const txHash = query.get('txHash') // Lấy giá trị `txHash` từ URL
    if (txHash) {
      setTransactionHash(txHash) // Thiết lập transaction hash
    }
  }, [location])

  // Tự động fetch thông tin khi `transactionHash` được thiết lập
  useEffect(() => {
    if (transactionHash) {
      handleFetchCertificate()
    }
  }, [transactionHash])

  const handleFetchCertificate = async () => {
    if (!transactionHash.trim()) {
      setError('Vui lòng nhập Transaction Hash hợp lệ.')
      return
    }

    setLoading(true)
    setError(null)
    setCertificateInfo(null)

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/certificate/${transactionHash}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch certificate')
      }

      const data = await response.json()

      // Format issueDate to VN date format
      const formattedIssueDate = new Date(data.issueDate).toLocaleDateString(
        'vi-VN',
        { day: '2-digit', month: '2-digit', year: 'numeric' }
      )

      setCertificateInfo({ ...data, issueDate: formattedIssueDate })
    } catch (err) {
      setError('Không thể tìm thấy thông tin với transaction hash này.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-fit p-8">
      <h1 className="text-2xl font-bold mb-4">Thông tin chi ti</h1>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Tổng quan
        </Link>
        <span className="mx-2">/</span>
        <Link to="/information" className="hover:underline">
          Thông tin
        </Link>
      </nav>

      {/* Input để nhập transaction hash */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Nhập Transaction Hash:
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={transactionHash}
            onChange={(e) => setTransactionHash(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập transaction hash"
          />
        </div>
        <div className="my-2">
          <button
            onClick={handleFetchCertificate}
            className="bg-blue-500 text-white  px-2 py-2 rounded-lg hover:bg-blue-600"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && <div className="text-red-500 font-medium mb-4">{error}</div>}

      {/* Hiển thị thông tin chứng chỉ */}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        certificateInfo && (
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Thông tin chứng chỉ</h2>
            <table className="table-auto w-full text-left border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Người nhận
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {certificateInfo.recipientName}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Tên khóa học
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {certificateInfo.courseName}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Mã khóa học
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {certificateInfo.courseCode}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Ngày cấp</th>
                  <td className="border border-gray-300 px-4 py-2">
                    {certificateInfo.issueDate}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Người cấp
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {certificateInfo.issuer}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Phí giao dịch (Ether)
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {certificateInfo.transactionFeeInEther}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Số block</th>
                  <td className="border border-gray-300 px-4 py-2">
                    {certificateInfo.blockNumber}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Hiển thị hình ảnh từ IPFS */}
      {certificateInfo && certificateInfo.ipfsCID && (
        <div className="mt-4 flex flex-col items-center justify-center ">
          <h2 className="text-lg font-bold mb-2">Hình ảnh chứng chỉ</h2>
          <img
            src={`http://127.0.0.1:8080/ipfs/${certificateInfo.ipfsCID}`}
            alt="Certificate"
            width={800}
            className="max-w-full h-auto rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src = '/assets/placeholder.png'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default InformationPage
