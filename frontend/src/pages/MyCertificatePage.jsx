import React, { useEffect, useState } from 'react'
import MUIDataTable from 'mui-datatables'
import { useAuthStore } from '../store/authStore'

const MyCertificatePage = () => {
  const [certificates, setCertificates] = useState([])
  const { user, token } = useAuthStore()

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/user-certificates',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        )
        if (response.status === 401) {
          throw new Error('Unauthorized')
        }
        const result = await response.json()
        setCertificates(result.data)
      } catch (error) {
        console.error('Lỗi khi tải danh sách chứng chỉ:', error)
      }
    }
    fetchCertificates()
  }, [token])

  const columns = [
    { name: 'id', label: 'ID', options: { display: 'excluded' } },
    { name: 'name', label: 'Tên Người Nhận' },
    { name: 'certificate', label: 'Tên Chứng Chỉ' },
    { name: 'issuedDate', label: 'Ngày Cấp' },
    {
      name: 'ipfsLink',
      label: 'Xem Chứng Chỉ',
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
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Chứng Chỉ Của Tôi</h2>
      <MUIDataTable
        title={'Danh Sách Chứng Chỉ'}
        data={certificates}
        columns={columns}
        options={options}
      />
    </div>
  )
}

export default MyCertificatePage
