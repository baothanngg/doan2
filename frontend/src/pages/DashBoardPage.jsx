import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import MUIDataTable from 'mui-datatables'

const DashBoardPage = () => {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalUsers: 0,
    newCertificates: 0
  })
  const [newCertificates, setNewCertificates] = useState([])
  const { token } = useAuthStore()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (response.ok) {
          setStats(result)
        } else {
          console.error('Lỗi khi lấy dữ liệu thống kê:', result.message)
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error)
      }
    }

    const fetchNewCertificates = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/new-certificates',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        )
        const result = await response.json()
        if (response.ok) {
          setNewCertificates(result.data)
        } else {
          console.error(
            'Lỗi khi lấy danh sách chứng chỉ mới cấp:',
            result.message
          )
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chứng chỉ mới cấp:', error)
      }
    }
    fetchStats()
    fetchNewCertificates()
  }, [token])

  const columns = [
    { name: 'id', label: 'ID' },
    { name: 'recipientName', label: 'Tên người nhận' },
    { name: 'courseName', label: 'Tên Chứng chỉ' },
    { name: 'issueDate', label: 'Ngày Cấp' },
    {
      name: 'viewLink',
      label: 'Xem Chứng chỉ',
      options: {
        filter: false,
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
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      {/* Thống kê tổng quan */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Tổng số Chứng chỉ</h2>
          <p className="text-2xl font-bold">{stats.totalCertificates}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Tổng số tài khoản</h2>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">
            Chứng chỉ Mới Cấp <span className="font-thin">(trong ngày)</span>
          </h2>
          <p className="text-2xl font-bold">{stats.newCertificates}</p>
        </div>
      </section>

      {/* Danh sách chứng chỉ */}
      <section className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <MUIDataTable
          title={'Danh Sách Chứng Chỉ Mới Cấp'}
          data={newCertificates}
          columns={columns}
          options={options}
        />
      </section>

      {/* Các hành động khác */}
      <section className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Hành động</h2>
        <div className="flex space-x-4">
          <Link
            to={'/certificates'}
            className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded"
          >
            Thêm Chứng chỉ mới
          </Link>
          <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded">
            Xuất Báo Cáo
          </button>
        </div>
      </section>
    </div>
  )
}

export default DashBoardPage
