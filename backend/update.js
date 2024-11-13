import mongoose from 'mongoose'
import { User } from './models/user.model.js' // Đảm bảo đường dẫn đúng

const MONGO_URI =
  'mongodb+srv://baothanngg:ZG4SYEuRkrZF7iRw@cluster0.6tlqz.mongodb.net/demo?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const updateRoles = async () => {
  try {
    // Cập nhật tài khoản cụ thể thành admin
    await User.updateOne({ email: 'baothanngg@gmail.com' }, { role: 'admin' })

    // Cập nhật tất cả các tài khoản khác thành user nếu chưa có trường role
    await User.updateMany({ role: { $exists: false } }, { role: 'user' })

    console.log('Cập nhật vai trò thành công')
    mongoose.connection.close()
  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò:', error)
    mongoose.connection.close()
  }
}

updateRoles()
