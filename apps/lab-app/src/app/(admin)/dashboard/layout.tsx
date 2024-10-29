
import TopNav from  "../_component/Nav"

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => { 

  return (
    <div className="">
      <TopNav />
      <div className="mx-auto max-w-full px-2 lg:px-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;    
