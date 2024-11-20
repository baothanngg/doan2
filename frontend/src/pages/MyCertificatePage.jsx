import React, { useEffect, useState } from 'react'
import MUIDataTable from 'mui-datatables'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'

const MyCertificatePage = () => {
  const [certificates, setCertificates] = useState([])
  const { token } = useAuthStore()

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/user-certificates',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // Gửi token để xác thực
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch certificates')
        }

        const result = await response.json()
        setCertificates(result.data)
      } catch (error) {
        console.error('Lỗi khi tải danh sách chứng chỉ:', error)
      }
    }

    fetchCertificates()
  }, [token])

  const handleDownload = async (ipfsLink, nameCert) => {
    try {
      const response = await fetch(ipfsLink)
      if (!response.ok) {
        throw new Error('Lỗi khi tải file từ IPFS')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Tạo link tải xuống
      const a = document.createElement('a')
      a.href = url
      a.download = nameCert // Sử dụng courseCode làm tên file
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Giải phóng URL blob
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi khi tải file:', error)
    }
  }

  const columns = [
    {
      name: 'id',
      label: 'ID',
      options: {
        setCellProps: () => ({ style: { textAlign: 'center' } })
      }
    },
    {
      name: 'name',
      label: 'Tên Người Nhận',
      options: {
        setCellProps: () => ({ style: { textAlign: 'center' } })
      }
    },
    {
      name: 'certificate',
      label: 'Tên Chứng Chỉ',
      options: {
        setCellProps: () => ({ style: { textAlign: 'center' } })
      }
    },
    {
      name: 'issuedDate',
      label: 'Ngày Cấp',
      options: {
        setCellProps: () => ({ style: { textAlign: 'center' } })
      }
    },
    {
      name: 'ipfsLink',
      label: 'Xem Chứng Chỉ',
      options: {
        filter: false,
        setCellProps: () => ({ style: { textAlign: 'center' } }),
        customBodyRender: (value) => (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Xem
          </a>
        )
      }
    },
    {
      name: 'download',
      label: 'Tải Về',
      options: {
        filter: false,
        setCellProps: () => ({ style: { textAlign: 'center' } }),
        customBodyRender: (value, tableMeta) => {
          const ipfsLink = tableMeta.rowData[4]
          const nameCert = tableMeta.rowData[2]
          return (
            <button
              onClick={() => handleDownload(ipfsLink, nameCert)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Tải Về
            </button>
          )
        }
      }
    }
  ]

  const options = {
    selectableRows: 'none',
    responsive: 'standard',
    elevation: 0,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10],
    tableBodyHeight: '300px',
    tableBodyMaxHeight: '800px'
  }

  return (
    <div className="flex flex-col h-fit p-8 ">
      <h1 className="text-2xl font-bold mb-4">Cá nhân</h1>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Tổng quan
        </Link>
        <span className="mx-2">/</span>
        <Link to="/my-certificates" className="hover:underline">
          Cá nhân
        </Link>
      </nav>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Chứng Chỉ Của Tôi</h2>
        <MUIDataTable data={certificates} columns={columns} options={options} />
      </div>
    </div>
  )
}

export default MyCertificatePage
