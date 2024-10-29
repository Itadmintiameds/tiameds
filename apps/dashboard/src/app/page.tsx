import React from 'react'
import Table from "./components/Table"  
import Layout from './components/Layout'

const page = () => {
  return (
    <Layout>
      <Table />
      <h1 className="text-base font-semibold leading-6 text-gray-900">Users</h1>  
    </Layout>
  )   
   
   
}

export default page