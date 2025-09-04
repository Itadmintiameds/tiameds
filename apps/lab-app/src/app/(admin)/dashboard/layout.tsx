"use client";
import { getUsersLab } from "@/../services/labServices";
import { useLabs, saveLabsToStorage, getLabsFromStorage } from '@/context/LabContext';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../../context/userStore";
import SideBar from "../component/LayoutComponent/SideBar";
import TopNav from "../component/LayoutComponent/TopNav";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuthStore();
  const { labs, setLabs, currentLab, setCurrentLab, refreshlab } = useLabs();
  const router = useRouter();

  // Keyboard shortcut handler for sidebar toggle (Ctrl + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl + B is pressed
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault(); // Prevent default browser behavior
        setIsOpen(prev => !prev);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        // Check local storage first
        const storedData = getLabsFromStorage();

        if (storedData && storedData.labs && storedData.currentLabIndex !== undefined) {
          setLabs(storedData.labs);
          setCurrentLab(storedData.labs[storedData.currentLabIndex]);
        }

        // Always fetch fresh data but don't wait for it
        const data = await getUsersLab();
        setLabs(data);

        if (data.length > 0) {
          // Only set new lab if there wasn't one stored
          if (!storedData) {
            setCurrentLab(data[0]);
            saveLabsToStorage(data, 0);
          } else {
            // Update labs array but keep current index if it exists
            const currentIndex = storedData.currentLabIndex !== undefined ? storedData.currentLabIndex : 0;
            saveLabsToStorage(data, currentIndex < data.length ? currentIndex : 0);
          }
        }
      } catch (error) {
        toast.error("Failed to fetch labs", { position: "top-right", autoClose: 2000 });
      }
    };
    fetchLabs();
  }, [setLabs, setCurrentLab, refreshlab]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabName = event.target.value;
    const selectedLabIndex = labs.findIndex((lab) => lab.name === selectedLabName);
    if (selectedLabIndex !== -1) {
      const selectedLab = labs[selectedLabIndex];
      alert("Are you sure you want to switch to " + selectedLab.name);
      setCurrentLab(selectedLab);
      // Update localStorage with new current lab index
      saveLabsToStorage(labs, selectedLabIndex);
      toast.success(`Switched to ${selectedLab.name}`, { position: "top-right", autoClose: 2000 });
    }
  };
  if (labs == null) {
    router.push('/create-lab');
  }

  return (
    <div className="flex h-screen overflow-hidden"> {/* Added overflow-hidden to prevent scrolling */}
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className={`flex-1 ml-20 transition-all duration-400 ${isOpen ? "ml-64" : "ml-20"} overflow-hidden`}> {/* Added overflow-hidden */}
        {/* Top Navigation Bar */}
        {user && (
          <TopNav
            user={user}
            labs={labs}
            currentLab={currentLab}
            handleChange={handleChange}
          />
        )}

        <div className="p-6 overflow-y-auto overflow-x-hidden" style={{ maxHeight: "calc(100vh - 64px)" }}> {/* Added overflow-x-hidden */}
          <div className="relative isolate bg-white h-full"> {/* Changed h-screen to h-full */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              />
            </div>
            <div className="relative z-10 mx-auto max-w-full"> {/* Added max-w-full */}
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;