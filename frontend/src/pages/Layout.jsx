import Sidebar, { SidebarItem } from '../components/Sidebar'
import {
  LifeBuoy,
  Package,
  UserCircle,
  LayoutDashboard,
  Settings,
  UserRoundPen,
  Award,
  ShieldCheck
} from 'lucide-react'
const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar className="flex w-1/4">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Tổng quan"
          to={'/'}
          active={location.pathname === '/'}
        />
        <SidebarItem
          icon={<Award size={20} />}
          text="Chứng chỉ"
          to={'/certificates'}
          active={location.pathname === '/certificates'}
        />
        <SidebarItem
          icon={<ShieldCheck size={20} />}
          text="Xác minh"
          to={'/verify-certificates'}
          active={location.pathname === '/verify-certificates'}
        />
        <SidebarItem
          to={'/users'}
          icon={<UserCircle size={20} />}
          text="Người dùng"
          active={location.pathname === '/users'}
        />
        <hr className="my-3" />
        <SidebarItem
          icon={<UserRoundPen size={20} />}
          text="Hồ sơ"
          to={'/profile'}
          active={location.pathname === '/profile'}
        />
        <SidebarItem icon={<Settings size={20} />} text="Cài đặt" />
      </Sidebar>
      <div className="w-3/4">{children}</div>
    </div>
  )
}

export default Layout
