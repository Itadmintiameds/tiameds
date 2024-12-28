import React,{useState,useEffect, use} from 'react'
import { useLabs } from '@/context/LabContext';
import {getAllVisits} from '@/../services/patientServices';


const VisitingList = () => {
    const [visits, setVisits] = useState([])
    const { currentLab } = useLabs();
    useEffect(() => {
        const labs = currentLab;
        
        const fetchVisits = async () => {
            try {
                if (labs?.id !== undefined) {
                    const response = await getAllVisits(labs.id);
                    setVisits(response);
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchVisits()
    }, [currentLab])

    console.log(visits)


  return (
    <div>VisitingList</div>
  )
}

export default VisitingList