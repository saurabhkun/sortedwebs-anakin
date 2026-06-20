import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AddLinkFab from './AddLinkFab';

export default function Layout() {
  return (
    <div className="min-h-screen bg-editorial-bg flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen">
        <Outlet />
      </div>
      <AddLinkFab />
    </div>
  );
}