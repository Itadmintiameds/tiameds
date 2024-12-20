import React from 'react'

import { Insurance } from '@/types/insurance/insurance'

interface AddInsuranceProps {
  insurance: Insurance
  handleAddInsurance: (insurance: Insurance) => void
}

const AddInsurance = ({ insurance, handleAddInsurance }: AddInsuranceProps) => {      
  return (
    <div>AddInsurance</div>
  )
}

export default AddInsurance