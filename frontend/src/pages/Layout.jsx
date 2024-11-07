import Sidebar, { SidebarItem } from '../components/Sidebar'
import {
  LifeBuoy,
  Receipt,
  Boxes,
  Package,
  UserCircle,
  BarChart3,
  LayoutDashboard,
  Settings
} from 'lucide-react'
const Layout = ({ children }) => {
  return (
    <div>
      <Sidebar>
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          to={'/'}
          active
        />
        <SidebarItem icon={<Receipt size={20} />} text="Certificates" />
        <SidebarItem icon={<Boxes size={20} />} text="Categories" />
        <SidebarItem icon={<Package size={20} />} text="Products" alert />
        <SidebarItem icon={<UserCircle size={20} />} text="Users" />
        <hr className="my-3" />
        <SidebarItem icon={<BarChart3 size={20} />} text="Reports" />
        <SidebarItem icon={<Settings size={20} />} text="Settings" />
        <SidebarItem icon={<LifeBuoy size={20} />} text="Help" />
      </Sidebar>
      <div>{children}</div>
    </div>
  )
}

export default Layout
